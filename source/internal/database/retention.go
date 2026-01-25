package database

import (
	"context"
	"time"

	"github.com/Jaron0211/kairoio-server/internal/logger"
	"github.com/Jaron0211/kairoio-server/internal/models"
	"gorm.io/gorm"
)

// RetentionService handles automatic cleanup of old data
type RetentionService struct {
	db              *gorm.DB
	retentionPeriod time.Duration
}

// NewRetentionService creates a new retention service
func NewRetentionService(db *gorm.DB, retentionPeriod time.Duration) *RetentionService {
	if retentionPeriod == 0 {
		retentionPeriod = 30 * 24 * time.Hour // Default 30 days
	}
	return &RetentionService{
		db:              db,
		retentionPeriod: retentionPeriod,
	}
}

// Run starts the retention cleanup loop
func (s *RetentionService) Run(ctx context.Context) {
	// Run once daily
	ticker := time.NewTicker(24 * time.Hour)
	defer ticker.Stop()

	// Initial run
	s.cleanup()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			s.cleanup()
		}
	}
}

func (s *RetentionService) cleanup() {
	cutoff := time.Now().Add(-s.retentionPeriod)
	logger.Infof("Running data retention cleanup. Threshold: %v", cutoff)

	// 1. Cleanup Robot Statuses
	result := s.db.Where("timestamp < ?", cutoff).Delete(&models.RobotStatus{})
	if result.Error != nil {
		logger.Errorf("Failed to cleanup robot statuses: %v", result.Error)
	} else {
		logger.Infof("Removed %d old robot status records", result.RowsAffected)
	}

	// 2. Cleanup Robot Logs
	result = s.db.Where("timestamp < ?", cutoff).Delete(&models.RobotLog{})
	if result.Error != nil {
		logger.Errorf("Failed to cleanup robot logs: %v", result.Error)
	} else {
		logger.Infof("Removed %d old robot logs", result.RowsAffected)
	}
}
