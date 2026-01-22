package action

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"time"

	"github.com/Jaron0211/kairoio-server/internal/auth"
	"github.com/Jaron0211/kairoio-server/internal/database"
	"github.com/Jaron0211/kairoio-server/internal/logger"
	"github.com/go-chi/chi/v5"
)

// Handler handles action-related HTTP endpoints
type Handler struct {
	registry *Registry
	repo     *database.Repository
}

// NewHandler creates a new action handler
func NewHandler(registry *Registry, repo *database.Repository) *Handler {
	return &Handler{
		registry: registry,
		repo:     repo,
	}
}

// Registry returns the underlying action registry
func (h *Handler) Registry() *Registry {
	return h.registry
}

// Response helpers
func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func respondSuccess(w http.ResponseWriter, data interface{}) {
	respondJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    data,
	})
}

func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, map[string]interface{}{
		"success": false,
		"error":   message,
	})
}

// RegisterAction handles POST /api/v1/actions
// Creates a new action definition
func (h *Handler) RegisterAction(w http.ResponseWriter, r *http.Request) {
	accountID, err := auth.GetAccountID(r.Context())
	if err != nil {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var action Action
	if err := json.NewDecoder(r.Body).Decode(&action); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if action.ID == "" || action.Name == "" {
		respondError(w, http.StatusBadRequest, "id and name are required")
		return
	}

	action.AccountID = accountID

	if err := h.registry.Register(&action); err != nil {
		if err == ErrActionAlreadyExists {
			respondError(w, http.StatusConflict, "Action already exists")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to register action")
		return
	}

	logger.Infof("[ACTION] Registered new action: %s (account: %s)", action.ID, accountID)

	respondSuccess(w, map[string]interface{}{
		"message":   "Action registered successfully",
		"action_id": action.ID,
	})
}

// UpdateAction handles PUT /api/v1/actions/{actionId}
// Updates an existing action definition
func (h *Handler) UpdateAction(w http.ResponseWriter, r *http.Request) {
	accountID, err := auth.GetAccountID(r.Context())
	if err != nil {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	actionID := chi.URLParam(r, "actionId")
	if actionID == "" {
		respondError(w, http.StatusBadRequest, "action_id is required")
		return
	}

	// Check ownership
	existing, err := h.registry.Get(actionID)
	if err != nil {
		if err == ErrActionNotFound {
			respondError(w, http.StatusNotFound, "Action not found")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to get action")
		return
	}

	if existing.AccountID != accountID {
		respondError(w, http.StatusForbidden, "Access denied")
		return
	}

	var action Action
	if err := json.NewDecoder(r.Body).Decode(&action); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	action.ID = actionID
	action.AccountID = accountID

	if err := h.registry.Update(&action); err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to update action")
		return
	}

	logger.Infof("[ACTION] Updated action: %s (account: %s)", actionID, accountID)

	respondSuccess(w, map[string]interface{}{
		"message":   "Action updated successfully",
		"action_id": actionID,
	})
}

// DeleteAction handles DELETE /api/v1/actions/{actionId}
// Removes an action definition
func (h *Handler) DeleteAction(w http.ResponseWriter, r *http.Request) {
	accountID, err := auth.GetAccountID(r.Context())
	if err != nil {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	actionID := chi.URLParam(r, "actionId")
	if actionID == "" {
		respondError(w, http.StatusBadRequest, "action_id is required")
		return
	}

	// Check ownership
	existing, err := h.registry.Get(actionID)
	if err != nil {
		if err == ErrActionNotFound {
			respondError(w, http.StatusNotFound, "Action not found")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to get action")
		return
	}

	if existing.AccountID != accountID {
		respondError(w, http.StatusForbidden, "Access denied")
		return
	}

	if err := h.registry.Unregister(actionID); err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to delete action")
		return
	}

	logger.Infof("[ACTION] Deleted action: %s (account: %s)", actionID, accountID)

	respondSuccess(w, map[string]interface{}{
		"message":   "Action deleted successfully",
		"action_id": actionID,
	})
}

// GetAction handles GET /api/v1/actions/{actionId}
// Returns a specific action definition
func (h *Handler) GetAction(w http.ResponseWriter, r *http.Request) {
	accountID, err := auth.GetAccountID(r.Context())
	if err != nil {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	actionID := chi.URLParam(r, "actionId")
	if actionID == "" {
		respondError(w, http.StatusBadRequest, "action_id is required")
		return
	}

	action, err := h.registry.Get(actionID)
	if err != nil {
		if err == ErrActionNotFound {
			respondError(w, http.StatusNotFound, "Action not found")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to get action")
		return
	}

	// Only return if owned by account or action is public (empty accountID)
	if action.AccountID != "" && action.AccountID != accountID {
		respondError(w, http.StatusForbidden, "Access denied")
		return
	}

	respondSuccess(w, action)
}

// ListActions handles GET /api/v1/actions
// Returns all actions for the current account
func (h *Handler) ListActions(w http.ResponseWriter, r *http.Request) {
	accountID, err := auth.GetAccountID(r.Context())
	if err != nil {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	actions := h.registry.GetByAccount(accountID)

	respondSuccess(w, map[string]interface{}{
		"actions": actions,
		"count":   len(actions),
	})
}

// ListAllActions handles GET /api/v1/actions/all
// Returns all registered actions (admin endpoint or filtered by access)
func (h *Handler) ListAllActions(w http.ResponseWriter, r *http.Request) {
	_, err := auth.GetAccountID(r.Context())
	if err != nil {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	actions := h.registry.GetAll()

	respondSuccess(w, map[string]interface{}{
		"actions": actions,
		"count":   len(actions),
	})
}

// HandleControlInput handles POST /api/v1/robots/{robotId}/control
// Processes incoming control requests and dispatches to registered actions
func (h *Handler) HandleControlInput(w http.ResponseWriter, r *http.Request) {
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
		respondError(w, http.StatusInternalServerError, "Failed to get robot")
		return
	}

	if robot.AccountID != accountID {
		respondError(w, http.StatusForbidden, "Access denied")
		return
	}

	// Parse the control request
	var req ActionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Action == "" {
		respondError(w, http.StatusBadRequest, "action is required")
		return
	}

	// Validate against registered action
	action, err := h.registry.ValidateRequest(&req)
	if err != nil {
		if err == ErrActionNotFound {
			// Action not registered - allow passthrough with warning
			logger.Warnf("[CONTROL] Unregistered action %s from robot %s", req.Action, robotID)
		} else {
			respondError(w, http.StatusBadRequest, err.Error())
			return
		}
	}

	// Log the action
	timestamp := time.Now()
	actionLog := &ActionLog{
		ActionID:   req.Action,
		RobotID:    robotID,
		AccountID:  accountID,
		RequestID:  req.RequestID,
		Parameters: req.Parameters,
		Status:     "received",
		Timestamp:  timestamp,
	}

	if err := h.registry.LogAction(actionLog); err != nil {
		logger.Warnf("[CONTROL] Failed to log action: %v", err)
	}

	logger.Infof("[CONTROL][%s] Robot %s action: %s params: %v",
		timestamp.Format(time.RFC3339), robotID, req.Action, req.Parameters)

	// If action has a webhook, call it asynchronously
	if action != nil && action.WebhookURL != "" {
		go h.callWebhook(action.WebhookURL, robotID, &req)
	}

	respondSuccess(w, map[string]interface{}{
		"status":     "received",
		"robot_id":   robotID,
		"action":     req.Action,
		"request_id": req.RequestID,
		"timestamp":  timestamp,
	})
}

// GetActionLogs handles GET /api/v1/robots/{robotId}/control/logs
// Returns action history for a robot
func (h *Handler) GetActionLogs(w http.ResponseWriter, r *http.Request) {
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
		respondError(w, http.StatusInternalServerError, "Failed to get robot")
		return
	}

	if robot.AccountID != accountID {
		respondError(w, http.StatusForbidden, "Access denied")
		return
	}

	logs, err := h.registry.GetActionLogs(robotID, 100)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to get action logs")
		return
	}

	respondSuccess(w, map[string]interface{}{
		"robot_id": robotID,
		"logs":     logs,
		"count":    len(logs),
	})
}

// callWebhook sends the action request to the configured webhook
func (h *Handler) callWebhook(webhookURL string, robotID string, req *ActionRequest) {
	payload := map[string]interface{}{
		"robot_id":   robotID,
		"action":     req.Action,
		"parameters": req.Parameters,
		"request_id": req.RequestID,
		"timestamp":  time.Now().Format(time.RFC3339),
	}

	jsonBody, err := json.Marshal(payload)
	if err != nil {
		logger.Errorf("[WEBHOOK] Failed to marshal payload: %v", err)
		return
	}

	resp, err := http.Post(webhookURL, "application/json", bytes.NewBuffer(jsonBody))
	if err != nil {
		logger.Errorf("[WEBHOOK] Failed to call %s: %v", webhookURL, err)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	logger.Infof("[WEBHOOK] Called %s, status: %d, response: %s", webhookURL, resp.StatusCode, string(body))
}
