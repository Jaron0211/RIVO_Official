package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/Jaron0211/kairoio-server/internal/auth"
	"github.com/Jaron0211/kairoio-server/internal/logger"
	"github.com/Jaron0211/kairoio-server/internal/models"
	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

// AlertHandler handles alert-related requests
type AlertHandler struct {
	db *gorm.DB
}

// NewAlertHandler creates a new alert handler
func NewAlertHandler(db *gorm.DB) *AlertHandler {
	return &AlertHandler{db: db}
}

// ListAlerts handles GET /api/v1/alerts
func (h *AlertHandler) ListAlerts(w http.ResponseWriter, r *http.Request) {
	accountID, err := auth.GetAccountID(r.Context())
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var alerts []models.Alert
	query := h.db.Where("account_id = ?", accountID)

	// Filter by robot_id
	if robotID := r.URL.Query().Get("robot_id"); robotID != "" {
		query = query.Where("robot_id = ?", robotID)
	}

	// Filter by status
	if status := r.URL.Query().Get("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	// Filter by severity
	if severity := r.URL.Query().Get("severity"); severity != "" {
		query = query.Where("severity = ?", severity)
	}

	// Limit results
	limit := 100
	if limitParam := r.URL.Query().Get("limit"); limitParam != "" {
		if parsedLimit, err := parseInt(limitParam); err == nil && parsedLimit > 0 && parsedLimit <= 1000 {
			limit = parsedLimit
		}
	}

	// Execute query with ordering
	if err := query.Order("created_at DESC").Limit(limit).Find(&alerts).Error; err != nil {
		logger.Errorf("Failed to query alerts: %v", err)
		http.Error(w, "Failed to retrieve alerts", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    alerts,
	})
}

// AcknowledgeAlert handles POST /api/v1/alerts/{alertId}/acknowledge
func (h *AlertHandler) AcknowledgeAlert(w http.ResponseWriter, r *http.Request) {
	alertID := chi.URLParam(r, "alertId")
	accountID, err := auth.GetAccountID(r.Context())
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	if alertID == "" {
		http.Error(w, "Alert ID is required", http.StatusBadRequest)
		return
	}

	now := time.Now()
	result := h.db.Model(&models.Alert{}).
		Where("id = ? AND account_id = ?", alertID, accountID).
		Updates(map[string]interface{}{
			"status":          "acknowledged",
			"acknowledged_at": now,
			"acknowledged_by": accountID,
		})

	if result.Error != nil {
		logger.Errorf("Failed to acknowledge alert: %v", result.Error)
		http.Error(w, "Failed to acknowledge alert", http.StatusInternalServerError)
		return
	}

	if result.RowsAffected == 0 {
		http.Error(w, "Alert not found", http.StatusNotFound)
		return
	}

	logger.Infof("Alert %s acknowledged by %s", alertID, accountID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data": map[string]interface{}{
			"alert_id":        alertID,
			"status":          "acknowledged",
			"acknowledged_at": now,
		},
	})
}

// ResolveAlert handles POST /api/v1/alerts/{alertId}/resolve
func (h *AlertHandler) ResolveAlert(w http.ResponseWriter, r *http.Request) {
	alertID := chi.URLParam(r, "alertId")
	accountID, err := auth.GetAccountID(r.Context())
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	if alertID == "" {
		http.Error(w, "Alert ID is required", http.StatusBadRequest)
		return
	}

	now := time.Now()
	result := h.db.Model(&models.Alert{}).
		Where("id = ? AND account_id = ?", alertID, accountID).
		Updates(map[string]interface{}{
			"status":      "resolved",
			"resolved_at": now,
		})

	if result.Error != nil {
		logger.Errorf("Failed to resolve alert: %v", result.Error)
		http.Error(w, "Failed to resolve alert", http.StatusInternalServerError)
		return
	}

	if result.RowsAffected == 0 {
		http.Error(w, "Alert not found", http.StatusNotFound)
		return
	}

	logger.Infof("Alert %s resolved", alertID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data": map[string]interface{}{
			"alert_id":    alertID,
			"status":      "resolved",
			"resolved_at": now,
		},
	})
}

// parseInt safely parses an integer from string
func parseInt(s string) (int, error) {
	var i int
	_, err := fmt.Sscanf(s, "%d", &i)
	return i, err
}
