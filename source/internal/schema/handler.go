package schema

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
)

// Handler handles schema API endpoints
type Handler struct {
	service *Service
}

// NewHandler creates a new Schema Handler
func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// Service returns the underlying schema service
func (h *Handler) Service() *Service {
	return h.service
}

// HandleListSchemas handles GET /api/v1/schemas
func (h *Handler) HandleListSchemas(w http.ResponseWriter, r *http.Request) {
	index := h.service.GetIndex()
	if index == nil {
		respondError(w, http.StatusServiceUnavailable, "Schema index not available")
		return
	}

	respondSuccess(w, index)
}

// HandleGetSchema handles GET /api/v1/schemas/{id}
func (h *Handler) HandleGetSchema(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		respondError(w, http.StatusBadRequest, "Schema ID is required")
		return
	}

	schema, ok := h.service.GetSchema(id)
	if !ok {
		respondError(w, http.StatusNotFound, "Schema not found")
		return
	}

	respondSuccess(w, schema)
}

// Helper functions for consistent response format (copied from api package to avoid cycle)
func respondSuccess(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    data,
	})
}

func respondError(w http.ResponseWriter, code int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": false,
		"error":   message,
	})
}
