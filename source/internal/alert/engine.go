package alert

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/Jaron0211/kairoio-server/internal/logger"
	"github.com/Jaron0211/kairoio-server/internal/models"
	"gorm.io/gorm"
)

// Engine evaluates alert rules against robot statuses
type Engine struct {
	db       *gorm.DB
	interval time.Duration
}

// NewEngine creates a new alert engine
func NewEngine(db *gorm.DB, interval time.Duration) *Engine {
	if interval == 0 {
		interval = 30 * time.Second
	}
	return &Engine{
		db:       db,
		interval: interval,
	}
}

// Start runs the engine evaluation loop
func (e *Engine) Start(ctx context.Context) {
	ticker := time.NewTicker(e.interval)
	defer ticker.Stop()

	logger.Infof("Alert Engine started with interval: %v", e.interval)

	for {
		select {
		case <-ctx.Done():
			logger.Info("Alert Engine stopping...")
			return
		case <-ticker.C:
			e.evaluateAllRules()
		}
	}
}

func (e *Engine) evaluateAllRules() {
	var rules []models.AlertRule
	if err := e.db.Where("enabled = ?", true).Find(&rules).Error; err != nil {
		logger.Errorf("Failed to fetch alert rules: %v", err)
		return
	}

	for _, rule := range rules {
		e.evaluateRule(rule)
	}
}

func (e *Engine) evaluateRule(rule models.AlertRule) {
	// 1. Get robots to evaluate
	var robots []models.Robot
	query := e.db.Model(&models.Robot{})
	if rule.RobotID != nil && *rule.RobotID != "" {
		query = query.Where("robot_id = ?", *rule.RobotID)
	} else {
		query = query.Where("account_id = ?", rule.AccountID)
	}

	if err := query.Find(&robots).Error; err != nil {
		logger.Errorf("Failed to fetch robots for rule %s: %v", rule.Name, err)
		return
	}

	for _, robot := range robots {
		// 2. Get latest status
		var status models.RobotStatus
		if err := e.db.Where("robot_id = ?", robot.ID).Order("timestamp DESC").First(&status).Error; err != nil {
			if err != gorm.ErrRecordNotFound {
				logger.Errorf("Failed to fetch status for robot %s: %v", robot.ID, err)
			}
			continue
		}

		// 3. Evaluate condition
		if e.evaluateCondition(rule.Condition, status) {
			e.triggerAlert(rule, robot, status)
		}
	}
}

func (e *Engine) evaluateCondition(condition string, status models.RobotStatus) bool {
	// Parse status data
	var data map[string]interface{}
	if err := json.Unmarshal([]byte(status.StatusJSON), &data); err != nil {
		return false
	}

	// Simple condition evaluation
	// Example: "battery_level < 20"
	parts := strings.Fields(condition)
	if len(parts) == 3 {
		field := parts[0]
		op := parts[1]
		valStr := parts[2]

		// Get field value
		var actualVal float64
		if field == "battery_level" {
			if v, ok := data["battery_level"].(float64); ok {
				actualVal = v
			} else {
				return false
			}
		} else {
			// Add more fields if needed
			return false
		}

		// Parse target value
		var targetVal float64
		fmt.Sscanf(valStr, "%f", &targetVal)

		switch op {
		case "<":
			return actualVal < targetVal
		case ">":
			return actualVal > targetVal
		case "<=":
			return actualVal <= targetVal
		case ">=":
			return actualVal >= targetVal
		case "==":
			return actualVal == targetVal
		case "!=":
			return actualVal != targetVal
		}
	}

	return false
}

func (e *Engine) triggerAlert(rule models.AlertRule, robot models.Robot, status models.RobotStatus) {
	// Check cooldown
	now := time.Now()
	if rule.LastTriggeredAt != nil {
		cooldown := time.Duration(rule.CooldownMinutes) * time.Minute
		if now.Sub(*rule.LastTriggeredAt) < cooldown {
			return
		}
	}

	// Create alert
	alert := models.Alert{
		RobotID:   robot.ID,
		AccountID: rule.AccountID,
		AlertType: rule.Name,
		Severity:  rule.Severity,
		Message:   fmt.Sprintf("Rule '%s' triggered for robot %s", rule.Name, robot.RobotName),
		Status:    "active",
		CreatedAt: now,
	}

	if err := e.db.Create(&alert).Error; err != nil {
		logger.Errorf("Failed to create alert: %v", err)
		return
	}

	// Update rule last triggered
	rule.LastTriggeredAt = &now
	if err := e.db.Save(&rule).Error; err != nil {
		logger.Errorf("Failed to update rule last triggered: %v", err)
	}

	logger.Infof("Alert triggered: %s for robot %s", rule.Name, robot.ID)
}
