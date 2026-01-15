package api

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/Jaron0211/kairoio-server/internal/auth"
	"github.com/Jaron0211/kairoio-server/internal/database"
	"github.com/Jaron0211/kairoio-server/internal/models"
	"github.com/go-chi/chi/v5"
)

// RobotHandler handles robot management endpoints
type RobotHandler struct {
	repo *database.Repository
}

// NewRobotHandler creates a new RobotHandler
func NewRobotHandler(repo *database.Repository) *RobotHandler {
	return &RobotHandler{repo: repo}
}

// RegisterRobotRequest represents robot registration request
type RegisterRobotRequest struct {
	RobotID   string `json:"robot_id"`
	RobotType string `json:"robot_type"`
	RobotName string `json:"robot_name,omitempty"`
}

// UpdateStatusRequest represents status update request
type UpdateStatusRequest struct {
	Status map[string]interface{} `json:"status"`
}

// RegisterRobot handles POST /api/v1/robots
func (h *RobotHandler) RegisterRobot(w http.ResponseWriter, r *http.Request) {
	// Get account ID from context
	accountID, err := auth.GetAccountID(r.Context())
	if err != nil {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req RegisterRobotRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate inputs
	if req.RobotID == "" || req.RobotType == "" {
		respondError(w, http.StatusBadRequest, "robot_id and robot_type are required")
		return
	}

	// Validate robot type
	validTypes := map[string]bool{
		"ArduinoUno":    true,
		"ArduinoMega":   true,
		"RaspberryPi3":  true,
		"RaspberryPi4":  true,
		"ESP32":         true,
		"ESP8266":       true,
		"PatrolBot":     true,
		"CleaningRobot": true,
	}
	if !validTypes[req.RobotType] {
		respondError(w, http.StatusBadRequest, "Invalid robot type")
		return
	}

	// Create robot
	robot := &models.Robot{
		ID:        req.RobotID,
		AccountID: accountID,
		RobotType: req.RobotType,
		RobotName: req.RobotName,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := h.repo.CreateRobot(robot); err != nil {
		if err == database.ErrRobotExists {
			respondError(w, http.StatusConflict, "Robot already registered")
			return
		}
		log.Printf("Failed to create robot: %v", err)
		respondError(w, http.StatusInternalServerError, "Failed to register robot")
		return
	}

	respondSuccess(w, map[string]interface{}{
		"message":  "Robot registered successfully",
		"robot_id": robot.ID,
	})
}

// UpdateStatus handles POST /api/v1/robots/{robotId}/status
func (h *RobotHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	// Get account ID from context
	accountID, err := auth.GetAccountID(r.Context())
	if err != nil {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	robotID := chi.URLParam(r, "robotId")
	if robotID == "" {
		respondError(w, http.StatusBadRequest, "robot_id is required")
		return
	}

	// Verify robot belongs to account
	robot, err := h.repo.GetRobotByID(robotID)
	if err != nil {
		if err == database.ErrRobotNotFound {
			respondError(w, http.StatusNotFound, "Robot not found")
			return
		}
		log.Printf("Failed to get robot: %v", err)
		respondError(w, http.StatusInternalServerError, "Failed to get robot")
		return
	}

	if robot.AccountID != accountID {
		respondError(w, http.StatusForbidden, "Access denied")
		return
	}

	var req UpdateStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Convert status to JSON string
	statusJSON, err := json.Marshal(req.Status)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid status format")
		return
	}

	// Create status entry
	status := &models.RobotStatus{
		RobotID:    robotID,
		AccountID:  accountID,
		StatusJSON: string(statusJSON),
		Timestamp:  time.Now(),
	}

	if err := h.repo.CreateRobotStatus(status); err != nil {
		log.Printf("Failed to create status: %v", err)
		respondError(w, http.StatusInternalServerError, "Failed to update status")
		return
	}

	respondSuccess(w, map[string]interface{}{
		"message":   "Status updated successfully",
		"timestamp": status.Timestamp,
	})
}

// GetStatus handles GET /api/v1/robots/{robotId}/status
func (h *RobotHandler) GetStatus(w http.ResponseWriter, r *http.Request) {
	// Get account ID from context
	accountID, err := auth.GetAccountID(r.Context())
	if err != nil {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	robotID := chi.URLParam(r, "robotId")
	if robotID == "" {
		respondError(w, http.StatusBadRequest, "robot_id is required")
		return
	}

	// Verify robot belongs to account
	robot, err := h.repo.GetRobotByID(robotID)
	if err != nil {
		if err == database.ErrRobotNotFound {
			respondError(w, http.StatusNotFound, "Robot not found")
			return
		}
		log.Printf("Failed to get robot: %v", err)
		respondError(w, http.StatusInternalServerError, "Failed to get robot")
		return
	}

	if robot.AccountID != accountID {
		respondError(w, http.StatusForbidden, "Access denied")
		return
	}

	// Get latest status
	status, err := h.repo.GetLatestRobotStatus(robotID)
	if err != nil {
		log.Printf("Failed to get status: %v", err)
		respondError(w, http.StatusInternalServerError, "Failed to get status")
		return
	}

	if status == nil {
		respondSuccess(w, map[string]interface{}{
			"message": "No status available",
			"status":  nil,
		})
		return
	}

	// Parse status JSON
	var statusData map[string]interface{}
	if err := json.Unmarshal([]byte(status.StatusJSON), &statusData); err != nil {
		log.Printf("Failed to parse status: %v", err)
		respondError(w, http.StatusInternalServerError, "Failed to parse status")
		return
	}

	respondSuccess(w, map[string]interface{}{
		"robot_id":  robotID,
		"status":    statusData,
		"timestamp": status.Timestamp,
	})
}

// ListRobots handles GET /api/v1/robots
func (h *RobotHandler) ListRobots(w http.ResponseWriter, r *http.Request) {
	// Get account ID from context
	accountID, err := auth.GetAccountID(r.Context())
	if err != nil {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	// Get all robots for account
	robots, err := h.repo.GetRobotsByAccountID(accountID)
	if err != nil {
		log.Printf("Failed to get robots: %v", err)
		respondError(w, http.StatusInternalServerError, "Failed to get robots")
		return
	}

	respondSuccess(w, map[string]interface{}{
		"robots": robots,
		"count":  len(robots),
	})
}
// AlertRequest represents an alert from a robot
type AlertRequest struct {
	AlertType string `json:"alert_type"`
	Severity  string `json:"severity"`
	Message   string `json:"message"`
	Timestamp string `json:"timestamp"`
}

// SubmitAlert handles incoming robot alerts
// POST /api/v1/robots/{robotId}/alert
func (h *RobotHandler) SubmitAlert(w http.ResponseWriter, r *http.Request) {
	robotID := chi.URLParam(r, "robotId")
	if robotID == "" {
		http.Error(w, "robot_id is required", http.StatusBadRequest)
		return
	}

	var req AlertRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// In a real implementation, we would store this in the database
	// For now, we just log it and return success
	log.Printf("[ALERT] Robot %s: [%s/%s] %s", robotID, req.Severity, req.AlertType, req.Message)

	response := map[string]interface{}{
		"success": true,
		"data": map[string]interface{}{
			"status":   "received",
			"robot_id": robotID,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// SubmitGenericMessage handles custom messages defined by user schemas
// It validates that the robot_id exists and logs/stores the payload
func (h *RobotHandler) SubmitGenericMessage(w http.ResponseWriter, r *http.Request) {
	robotID := chi.URLParam(r, "robotId")
	if robotID == "" {
		http.Error(w, "robot_id is required", http.StatusBadRequest)
		return
	}

	// Read raw body
	var payload map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// In a real implementation:
	// 1. Identify which schema this is (from URL path)
	// 2. Validate payload against that specific schema
	// 3. Store in a flexible document store like MongoDB or JSONB column

	// For now, we log it as a generic event
	log.Printf("[GENERIC] Robot %s sent message to %s: %v", robotID, r.URL.Path, payload)

	response := map[string]interface{}{
		"success": true,
		"data": map[string]interface{}{
			"status":   "received",
			"robot_id": robotID,
			"path":     r.URL.Path,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
