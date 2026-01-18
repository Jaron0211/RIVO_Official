package api

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/Jaron0211/kairoio-server/internal/auth"
	"github.com/Jaron0211/kairoio-server/internal/database"
	"github.com/Jaron0211/kairoio-server/internal/schema"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

// Router creates and configures the HTTP router
func NewRouter(repo *database.Repository, authHandler *AuthHandler, robotHandler *RobotHandler, schemaHandler *schema.Handler) http.Handler {
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(ActionLogger)
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
			r.Post("/login", authHandler.Login)
		})

		// Schema routes (public)
		r.Route("/schemas", func(r chi.Router) {
			r.Get("/", schemaHandler.HandleListSchemas)
			r.Get("/{id}", schemaHandler.HandleGetSchema)
		})

		// Protected routes (auth required)
		authMiddleware := auth.NewMiddleware(func(certKey string) (string, error) {
			// Check for virtual admin key first
			if certKey == "ADMIN-CERT-KEY-PLACEHOLDER" {
				return "ADMIN-001", nil
			}

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
			r.Post("/robots/{robotId}/alert", robotHandler.SubmitAlert)

			// Dynamic Routes from Custom Schemas
			// Iterate all known schemas and register generic handlers for those we haven't covered
			// Note: In production you might want a more robust way to collision check
			// For this demo, we assume any POST to /robots/{robotId}/* that isn't status/alert is generic
			index := schemaHandler.Service().GetIndex()
			if index != nil {
				for _, entry := range index.Schemas {
					if entry.Method == "POST" && entry.Endpoint != "" {
						// Simple check: is it a robot message path?
						// Matches /api/v1/robots/{robot_id}/<custom>
						// But NOT status or alert which are already handled
						// Note: chi routing priority handles exact matches (status/alert) first usually,
						// but rigorous deduping is better.
						isHandled := entry.Endpoint == "/api/v1/robots/{robot_id}/status" ||
							entry.Endpoint == "/api/v1/robots/{robot_id}/alert" ||
							entry.Endpoint == "/api/v1/robots"

						// We need to strip /api/v1 prefix because we are inside the route group
						if !isHandled && len(entry.Endpoint) > 8 { // simplistic check
							routePath := entry.Endpoint[7:] // remove "/api/v1"
							// Normalize param names: {robot_id} -> {robotId}
							// This is a bit hacky for the demo. Ideal solution uses consistent naming.
							routePath = strings.ReplaceAll(routePath, "{robot_id}", "{robotId}")

							log.Printf("Registering dynamic route: %s %s", entry.Method, routePath)
							r.Post(routePath, robotHandler.SubmitGenericMessage)
						}
					}
				}
			}
		})
	})

	return r
}
