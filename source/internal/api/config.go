package api

import (
	"net/http"

	"github.com/Jaron0211/kairoio-server/internal/config"
)

// ConfigResponse represents the public configuration exposed to the frontend
type ConfigResponse struct {
	Features struct {
		RobotOfflineThresholdSeconds float64 `json:"robot_offline_threshold_seconds"`
		EmailVerificationRequired    bool    `json:"email_verification_required"`
	} `json:"features"`
	Version string `json:"version"`
}

// ConfigHandler handles requests for server configuration
type ConfigHandler struct {
	cfg *config.Config
}

// NewConfigHandler creates a new ConfigHandler
func NewConfigHandler(cfg *config.Config) *ConfigHandler {
	return &ConfigHandler{cfg: cfg}
}

// GetConfig returns the public server configuration
func (h *ConfigHandler) GetConfig(w http.ResponseWriter, r *http.Request) {
	resp := ConfigResponse{
		Version: "1.0.0", // This could come from a global variable if available
	}
	resp.Features.RobotOfflineThresholdSeconds = h.cfg.Features.RobotOfflineThreshold.Seconds()
	resp.Features.EmailVerificationRequired = h.cfg.Features.EmailVerificationRequired

	respondSuccess(w, resp)
}
