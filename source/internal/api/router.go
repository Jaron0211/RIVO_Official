package api

import (
	"fmt"
	"net/http"
	"time"

	"github.com/Jaron0211/kairoio-server/internal/auth"
	"github.com/Jaron0211/kairoio-server/internal/database"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

// Router creates and configures the HTTP router
func NewRouter(repo *database.Repository, authHandler *AuthHandler, robotHandler *RobotHandler) http.Handler {
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	// CORS
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			
			next.ServeHTTP(w, r)
		})
	})

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		respondSuccess(w, map[string]interface{}{
			"status":    "healthy",
			"timestamp": time.Now(),
		})
	})

	// Version info
	r.Get("/version", func(w http.ResponseWriter, r *http.Request) {
		respondSuccess(w, map[string]interface{}{
			"version": "1.0.0",
			"name":    "KairoIO Server",
		})
	})

	// API v1 routes
	r.Route("/api/v1", func(r chi.Router) {
		// Public routes (no auth required)
		r.Route("/auth", func(r chi.Router) {
			r.Post("/register/send-code", authHandler.SendVerificationCode)
			r.Post("/register", authHandler.Register)
			r.Post("/login", authHandler.Login)
		})

		// Protected routes (auth required)
		authMiddleware := auth.NewMiddleware(func(certKey string) (string, error) {
			account, err := repo.GetAccountByCertKey(certKey)
			if err != nil {
				return "", fmt.Errorf("invalid certification key")
			}
			return account.ID, nil
		})

		r.Group(func(r chi.Router) {
			r.Use(authMiddleware.AuthRequired)

			// Robot management
			r.Post("/robots", robotHandler.RegisterRobot)
			r.Get("/robots", robotHandler.ListRobots)
			r.Post("/robots/{robotId}/status", robotHandler.UpdateStatus)
			r.Get("/robots/{robotId}/status", robotHandler.GetStatus)
		})
	})

	return r
}
