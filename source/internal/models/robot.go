package models

import (
	"time"
)

// Robot represents a registered robot
type Robot struct {
	ID        string    `gorm:"primaryKey;column:id" json:"id"`
	AccountID string    `gorm:"not null;index;column:account_id" json:"account_id"`
	RobotType string    `gorm:"not null;column:robot_type" json:"robot_type"`
	RobotName string    `gorm:"column:robot_name" json:"robot_name"`
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updated_at"`

	// Relations
	Account  *Account      `gorm:"foreignKey:AccountID" json:"account,omitempty"`
	Statuses []RobotStatus `gorm:"foreignKey:RobotID" json:"statuses,omitempty"`
}

// TableName specifies the table name for Robot
func (Robot) TableName() string {
	return "robots"
}

// RobotStatus represents a robot status update
type RobotStatus struct {
	ID         uint      `gorm:"primaryKey;autoIncrement;column:id" json:"id"`
	RobotID    string    `gorm:"not null;index;column:robot_id" json:"robot_id"`
	AccountID  string    `gorm:"not null;index;column:account_id" json:"account_id"`
	StatusJSON string    `gorm:"type:text;not null;column:status_json" json:"status_json"`
	Timestamp  time.Time `gorm:"index;column:timestamp" json:"timestamp"`

	// Relations
	Robot *Robot `gorm:"foreignKey:RobotID" json:"robot,omitempty"`
}

// TableName specifies the table name for RobotStatus
func (RobotStatus) TableName() string {
	return "robot_statuses"
}

// RobotLog represents a robot log message
type RobotLog struct {
	ID        uint      `gorm:"primaryKey;autoIncrement;column:id" json:"id"`
	RobotID   string    `gorm:"not null;index;column:robot_id" json:"robot_id"`
	AccountID string    `gorm:"not null;index;column:account_id" json:"account_id"`
	Topic     string    `gorm:"not null;index;column:topic" json:"topic"`
	Message   string    `gorm:"type:text;not null;column:message" json:"message"`
	Level     string    `gorm:"column:level" json:"level"` // info, warn, error
	Timestamp time.Time `gorm:"index;column:timestamp" json:"timestamp"`
}

// TableName specifies the table name for RobotLog
func (RobotLog) TableName() string {
	return "robot_logs"
}
