package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Alert represents an alert record
type Alert struct {
	ID             string     `gorm:"type:varchar(36);primaryKey" json:"id"`
	RobotID        string     `gorm:"not null;index" json:"robot_id"`
	AccountID      string     `gorm:"not null;index" json:"account_id"`
	AlertType      string     `gorm:"not null;size:100" json:"alert_type"`
	Severity       string     `gorm:"not null;size:20;index" json:"severity"` // info, warning, error, critical
	Message        string     `gorm:"type:text;not null" json:"message"`
	Metadata       string     `gorm:"type:text" json:"metadata,omitempty"`          // JSON string
	Status         string     `gorm:"size:20;default:'active';index" json:"status"` // active, acknowledged, resolved
	AcknowledgedAt *time.Time `json:"acknowledged_at,omitempty"`
	AcknowledgedBy string     `json:"acknowledged_by,omitempty"`
	ResolvedAt     *time.Time `json:"resolved_at,omitempty"`
	CreatedAt      time.Time  `gorm:"not null;index" json:"created_at"`
}

// BeforeCreate hook to generate UUID
func (a *Alert) BeforeCreate(tx *gorm.DB) error {
	if a.ID == "" {
		a.ID = uuid.New().String()
	}
	if a.CreatedAt.IsZero() {
		a.CreatedAt = time.Now()
	}
	return nil
}

// TableName specifies the table name for Alert
func (Alert) TableName() string {
	return "alerts"
}

// AlertRule represents an alert rule configuration
type AlertRule struct {
	ID                   string     `gorm:"type:varchar(36);primaryKey" json:"id"`
	AccountID            string     `gorm:"not null;index" json:"account_id"`
	RobotID              *string    `gorm:"index" json:"robot_id,omitempty"` // NULL = global rule
	Name                 string     `gorm:"not null;size:255" json:"name"`
	Description          string     `gorm:"type:text" json:"description,omitempty"`
	Enabled              bool       `gorm:"default:true;index" json:"enabled"`
	Condition            string     `gorm:"type:text;not null" json:"condition"` // Expression like "battery_level < 20"
	Severity             string     `gorm:"not null;size:20" json:"severity"`
	NotificationChannels string     `gorm:"type:text;not null" json:"notification_channels"` // JSON string
	CooldownMinutes      int        `gorm:"default:0" json:"cooldown_minutes"`
	LastTriggeredAt      *time.Time `json:"last_triggered_at,omitempty"`
	CreatedAt            time.Time  `gorm:"not null" json:"created_at"`
	UpdatedAt            time.Time  `gorm:"not null" json:"updated_at"`
}

// BeforeCreate hook to generate UUID
func (a *AlertRule) BeforeCreate(tx *gorm.DB) error {
	if a.ID == "" {
		a.ID = uuid.New().String()
	}
	if a.CreatedAt.IsZero() {
		a.CreatedAt = time.Now()
	}
	if a.UpdatedAt.IsZero() {
		a.UpdatedAt = time.Now()
	}
	return nil
}

// BeforeUpdate hook to update timestamp
func (a *AlertRule) BeforeUpdate(tx *gorm.DB) error {
	a.UpdatedAt = time.Now()
	return nil
}

// TableName specifies the table name for AlertRule
func (AlertRule) TableName() string {
	return "alert_rules"
}

// AlertNotificationLog represents a notification attempt
type AlertNotificationLog struct {
	ID           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	AlertID      string    `gorm:"type:varchar(36);not null;index" json:"alert_id"`
	ChannelType  string    `gorm:"not null;size:50" json:"channel_type"`
	Recipient    string    `gorm:"type:text;not null" json:"recipient"`
	Status       string    `gorm:"not null;size:20" json:"status"` // sent, failed
	ErrorMessage string    `gorm:"type:text" json:"error_message,omitempty"`
	SentAt       time.Time `gorm:"not null;index" json:"sent_at"`
}

// TableName specifies the table name for AlertNotificationLog
func (AlertNotificationLog) TableName() string {
	return "alert_notification_logs"
}

// NotificationChannel represents a notification channel configuration
type NotificationChannel struct {
	ID        string    `gorm:"type:varchar(36);primaryKey" json:"id"`
	AccountID string    `gorm:"not null;index" json:"account_id"`
	Name      string    `gorm:"not null;size:255" json:"name"`
	Type      string    `gorm:"not null;size:50;index" json:"type"` // line, slack, email, telegram, webhook
	Config    string    `gorm:"type:text;not null" json:"config"`   // JSON string (encrypted credentials)
	Enabled   bool      `gorm:"default:true" json:"enabled"`
	CreatedAt time.Time `gorm:"not null" json:"created_at"`
	UpdatedAt time.Time `gorm:"not null" json:"updated_at"`
}

// BeforeCreate hook to generate UUID
func (n *NotificationChannel) BeforeCreate(tx *gorm.DB) error {
	if n.ID == "" {
		n.ID = uuid.New().String()
	}
	if n.CreatedAt.IsZero() {
		n.CreatedAt = time.Now()
	}
	if n.UpdatedAt.IsZero() {
		n.UpdatedAt = time.Now()
	}
	return nil
}

// BeforeUpdate hook to update timestamp
func (n *NotificationChannel) BeforeUpdate(tx *gorm.DB) error {
	n.UpdatedAt = time.Now()
	return nil
}

// TableName specifies the table name for NotificationChannel
func (NotificationChannel) TableName() string {
	return "notification_channels"
}
