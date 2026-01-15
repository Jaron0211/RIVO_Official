package api

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/Jaron0211/kairoio-server/internal/auth"
	"github.com/Jaron0211/kairoio-server/internal/database"
	"github.com/Jaron0211/kairoio-server/internal/email"
)

// AuthHandler handles authentication endpoints
type AuthHandler struct {
	repo         *database.Repository
	emailService *email.Service
	passwordCost int
	codeTTL      time.Duration
	adminUser    string
	adminPass    string
}

// NewAuthHandler creates a new AuthHandler
func NewAuthHandler(repo *database.Repository, emailService *email.Service, passwordCost int, codeTTL time.Duration, adminUser, adminPass string) *AuthHandler {
	return &AuthHandler{
		repo:         repo,
		emailService: emailService,
		passwordCost: passwordCost,
		codeTTL:      codeTTL,
		adminUser:    adminUser,
		adminPass:    adminPass,
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

// Removed: SendVerificationCode and Register handlers as per security requirements.

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

	// Check against embedded admin account first
	if h.adminUser != "" && req.Username == h.adminUser && req.Password == h.adminPass {
		// Get or create virtual admin account in database for reference if needed
		// For simplicity, we'll try to get it, and if it doesn't exist, we'll return its ID
		// In a real product, we might want to ensure it's in DB for relational integrity
		account, err := h.repo.GetAccountByEmail("admin@kairoio.internal")
		if err != nil {
			// If not found, we still allow login but use a static ID
			respondSuccess(w, map[string]interface{}{
				"message":           "Login successful (Admin)",
				"account_id":        "ADMIN-001",
				"certification_key": "ADMIN-CERT-KEY-PLACEHOLDER", // Should be more secure in real use
			})
			return
		}

		respondSuccess(w, map[string]interface{}{
			"message":           "Login successful (Admin)",
			"account_id":        account.ID,
			"certification_key": account.CertificationKey,
		})
		return
	}

	// Regular database accounts (though registration is removed, old accounts might exist)
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
