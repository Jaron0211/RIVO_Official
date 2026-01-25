package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Map represents a robot navigation map (PGM + YAML metadata)
type Map struct {
	ID        string    `gorm:"type:varchar(36);primaryKey" json:"id"`
	AccountID string    `gorm:"not null;index" json:"account_id"`
	RobotID   string    `gorm:"index" json:"robot_id,omitempty"`
	Name      string    `gorm:"size:255" json:"name"`
	
	// Map Metadata (parsed from YAML)
	Resolution     float64 `json:"resolution"`
	OriginX        float64 `json:"origin_x"`
	OriginY        float64 `json:"origin_y"`
	OriginYaw      float64 `json:"origin_yaw"`
	Negate         int     `json:"negate"`
	OccupiedThresh float64 `json:"occupied_thresh"`
	FreeThresh     float64 `json:"free_thresh"`
	
	// Map Data
	PGMData []byte    `json:"-"` // Don't include in default JSON (uses bytea for postgres, blob for sqlite)
	YAMLRaw string    `gorm:"type:text" json:"-"`
	
	CreatedAt time.Time `gorm:"not null;index" json:"created_at"`
}

// BeforeCreate hook to generate UUID
func (m *Map) BeforeCreate(tx *gorm.DB) error {
	if m.ID == "" {
		m.ID = uuid.New().String()
	}
	if m.CreatedAt.IsZero() {
		m.CreatedAt = time.Now()
	}
	return nil
}

// TableName specifies the table name for Map
func (Map) TableName() string {
	return "maps"
}
