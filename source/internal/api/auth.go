package api

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/Jaron0211/kairoio-server/internal/auth"
	"github.com/Jaron0211/kairoio-server/internal/database"
	"github.com/Jaron0211/kairoio-server/internal/email"
	"github.com/Jaron0211/kairoio-server/internal/models"
)

// AuthHandler handles authentication endpoints
type AuthHandler struct {
	repo         *database.Repository
	emailService *email.Service
	passwordCost int
	codeTTL      time.Duration
}

// NewAuthHandler creates a new AuthHandler
func NewAuthHandler(repo *database.Repository, emailService *email.Service, passwordCost int, codeTTL time.Duration) *AuthHandler {
	return &AuthHandler{
		repo:         repo,
		emailService: emailService,
		passwordCost: passwordCost,
		codeTTL:      codeTTL,
	}
}

// SendVerificationCodeRequest represents email verification request
type SendVerificationCodeRequest struct {
	Email string `json:"email"`
}

// RegisterRequest represents account registration request
type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Code     string `json:"code"`
}

// LoginRequest represents login request
type LoginRequest struct {
	Username string `json:"username"` // Can be email
	Password string `json:"password"`
}

// SendVerificationCode handles POST /api/v1/auth/register/send-code
func (h *AuthHandler) SendVerificationCode(w http.ResponseWriter, r *http.Request) {
	var req SendVerificationCodeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate email
	if req.Email == "" {
		respondError(w, http.StatusBadRequest, "Email is required")
		return
	}

	// Check if email already exists
	if _, err := h.repo.GetAccountByEmail(req.Email); err == nil {
		respondError(w, http.StatusConflict, "Email already registered")
		return
	}

	// Generate verification code
	code, err := auth.GenerateVerificationCode()
	if err != nil {
		log.Printf("Failed to generate code: %v", err)
		respondError(w, http.StatusInternalServerError, "Failed to generate code")
		return
	}

	// Store code
	verificationCode := &models.EmailVerificationCode{
		Email:     req.Email,
		Code:      code,
		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(h.codeTTL),
		Verified:  false,
	}
	if err := h.repo.StoreVerificationCode(verificationCode); err != nil {
		log.Printf("Failed to store code: %v", err)
		respondError(w, http.StatusInternalServerError, "Failed to store code")
		return
	}

	// Send email
	if h.emailService.IsConfigured() {
		if err := h.emailService.SendVerificationCode(req.Email, code); err != nil {
			log.Printf("Failed to send email: %v", err)
			respondError(w, http.StatusInternalServerError, "Failed to send verification email")
			return
		}
	} else {
		log.Printf("Email service not configured. Verification code: %s", code)
	}

	respondSuccess(w, map[string]interface{}{
		"message": "Verification code sent",
		"expires_in": h.codeTTL.String(),
	})
}

// Register handles POST /api/v1/auth/register
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate inputs
	if req.Email == "" || req.Password == "" || req.Code == "" {
		respondError(w, http.StatusBadRequest, "Email, password, and code are required")
		return
	}

	// Verify code
	storedCode, err := h.repo.GetVerificationCode(req.Email)
	if err != nil {
		log.Printf("Failed to get code: %v", err)
		respondError(w, http.StatusInternalServerError, "Verification failed")
		return
	}
	if storedCode == nil || storedCode.Code != req.Code {
		respondError(w, http.StatusBadRequest, "Invalid verification code")
		return
	}
	if time.Now().After(storedCode.ExpiresAt) {
		respondError(w, http.StatusBadRequest, "Verification code expired")
		return
	}

	// Hash password
	passwordHash, err := auth.HashPassword(req.Password, h.passwordCost)
	if err != nil {
		log.Printf("Failed to hash password: %v", err)
		respondError(w, http.StatusInternalServerError, "Failed to create account")
		return
	}

	// Generate certification key
	certKey, err := auth.GenerateCertificationKey()
	if err != nil {
		log.Printf("Failed to generate cert key: %v", err)
		respondError(w, http.StatusInternalServerError, "Failed to create account")
		return
	}

	// Create account
	account := &models.Account{
		ID:               generateAccountID(),
		Email:            req.Email,
		PasswordHash:     passwordHash,
		CertificationKey: certKey,
		EmailVerified:    true,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	if err := h.repo.CreateAccount(account); err != nil {
		log.Printf("Failed to create account: %v", err)
		respondError(w, http.StatusInternalServerError, "Failed to create account")
		return
	}

	// Mark code as verified
	h.repo.MarkCodeAsVerified(req.Email)

	respondSuccess(w, map[string]interface{}{
		"message":           "Account created successfully",
		"account_id":        account.ID,
		"certification_key": account.CertificationKey,
	})
}

// Login handles POST /api/v1/auth/login
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate inputs
	if req.Username == "" || req.Password == "" {
		respondError(w, http.StatusBadRequest, "Username and password are required")
		return
	}

	// Get account by email
	account, err := h.repo.GetAccountByEmail(req.Username)
	if err != nil {
		respondError(w, http.StatusUnauthorized, "Invalid username or password")
		return
	}

	// Check password
	if err := auth.CheckPassword(req.Password, account.PasswordHash); err != nil {
		respondError(w, http.StatusUnauthorized, "Invalid username or password")
		return
	}

	respondSuccess(w, map[string]interface{}{
		"message":           "Login successful",
		"account_id":        account.ID,
		"certification_key": account.CertificationKey,
	})
}

// generateAccountID generates a unique account ID
func generateAccountID() string {
	// Simple implementation - in production, use UUID
	return "ACC-" + time.Now().Format("20060102-150405")
}
