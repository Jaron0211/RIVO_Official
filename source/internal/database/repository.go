package database

import (
	"errors"
	"strings"
	"time"

	"github.com/Jaron0211/kairoio-server/internal/models"
	"gorm.io/gorm"
)

var (
	ErrAccountNotFound     = errors.New("account not found")
	ErrAccountExists       = errors.New("account already exists")
	ErrRobotNotFound       = errors.New("robot not found")
	ErrRobotExists         = errors.New("robot already exists")
	ErrInvalidCredentials  = errors.New("invalid credentials")
	ErrVerificationExpired = errors.New("verification code expired")
)

// Repository provides database operations
type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new repository
func NewRepository(database *Database) *Repository {
	return &Repository{db: database.DB}
}

// --- Account Operations ---

// CreateAccount creates a new account
func (r *Repository) CreateAccount(account *models.Account) error {
	result := r.db.Create(account)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrDuplicatedKey) {
			return ErrAccountExists
		}
		return result.Error
	}
	return nil
}

// GetAccountByID retrieves an account by ID
func (r *Repository) GetAccountByID(id string) (*models.Account, error) {
	var account models.Account
	result := r.db.Where("id = ?", id).First(&account)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, ErrAccountNotFound
		}
		return nil, result.Error
	}
	return &account, nil
}

// GetAccountByEmail retrieves an account by email
func (r *Repository) GetAccountByEmail(email string) (*models.Account, error) {
	var account models.Account
	result := r.db.Where("email = ?", email).First(&account)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, ErrAccountNotFound
		}
		return nil, result.Error
	}
	return &account, nil
}

// GetAccountByCertKey retrieves an account by certification key
func (r *Repository) GetAccountByCertKey(certKey string) (*models.Account, error) {
	var account models.Account
	result := r.db.Where("certification_key = ?", certKey).First(&account)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, ErrAccountNotFound
		}
		return nil, result.Error
	}
	return &account, nil
}

// UpdateAccount updates an account
func (r *Repository) UpdateAccount(account *models.Account) error {
	return r.db.Save(account).Error
}

// --- Robot Operations ---

// CreateRobot creates a new robot
func (r *Repository) CreateRobot(robot *models.Robot) error {
	result := r.db.Create(robot)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrDuplicatedKey) || strings.Contains(result.Error.Error(), "duplicate key") {
			return ErrRobotExists
		}
		return result.Error
	}
	return nil
}

// GetRobotByID retrieves a robot by ID
func (r *Repository) GetRobotByID(id string) (*models.Robot, error) {
	var robot models.Robot
	result := r.db.Where("id = ?", id).First(&robot)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, ErrRobotNotFound
		}
		return nil, result.Error
	}
	return &robot, nil
}

// GetRobotsByAccountID retrieves all robots for an account
func (r *Repository) GetRobotsByAccountID(accountID string) ([]models.Robot, error) {
	var robots []models.Robot
	result := r.db.Where("account_id = ?", accountID).Find(&robots)
	if result.Error != nil {
		return nil, result.Error
	}
	return robots, nil
}

// UpdateRobot updates a robot
func (r *Repository) UpdateRobot(robot *models.Robot) error {
	return r.db.Save(robot).Error
}

// DeleteRobot deletes a robot
func (r *Repository) DeleteRobot(id string) error {
	result := r.db.Delete(&models.Robot{}, "id = ?", id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrRobotNotFound
	}
	return nil
}

// --- Robot Status Operations ---

// CreateRobotStatus creates a new robot status entry
func (r *Repository) CreateRobotStatus(status *models.RobotStatus) error {
	return r.db.Create(status).Error
}

// GetLatestRobotStatus retrieves the most recent status for a robot
func (r *Repository) GetLatestRobotStatus(robotID string) (*models.RobotStatus, error) {
	var status models.RobotStatus
	result := r.db.Where("robot_id = ?", robotID).
		Order("timestamp DESC").
		First(&status)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil // No status yet is not an error
		}
		return nil, result.Error
	}
	return &status, nil
}

// GetRobotStatusHistory retrieves status history for a robot
func (r *Repository) GetRobotStatusHistory(robotID string, limit int) ([]models.RobotStatus, error) {
	var statuses []models.RobotStatus
	result := r.db.Where("robot_id = ?", robotID).
		Order("timestamp DESC").
		Limit(limit).
		Find(&statuses)
	if result.Error != nil {
		return nil, result.Error
	}
	return statuses, nil
}

// GetRobotStatusesByTimeRange retrieves status history for a robot within a time range
func (r *Repository) GetRobotStatusesByTimeRange(robotID string, start, end time.Time) ([]models.RobotStatus, error) {
	var statuses []models.RobotStatus
	result := r.db.Where("robot_id = ? AND timestamp BETWEEN ? AND ?", robotID, start, end).
		Order("timestamp ASC").
		Find(&statuses)
	if result.Error != nil {
		return nil, result.Error
	}
	return statuses, nil
}

// --- Robot Log Operations ---

// CreateRobotLog creates a new robot log entry
func (r *Repository) CreateRobotLog(log *models.RobotLog) error {
	return r.db.Create(log).Error
}

// GetRobotLogs retrieves logs for a robot with optional filtering
func (r *Repository) GetRobotLogs(robotID string, topic string, limit int) ([]models.RobotLog, error) {
	var logs []models.RobotLog
	query := r.db.Where("robot_id = ?", robotID)
	if topic != "" {
		query = query.Where("topic = ?", topic)
	}
	result := query.Order("timestamp DESC").Limit(limit).Find(&logs)
	if result.Error != nil {
		return nil, result.Error
	}
	return logs, nil
}

// --- Email Verification Operations ---

// StoreVerificationCode stores an email verification code
func (r *Repository) StoreVerificationCode(code *models.EmailVerificationCode) error {
	// Delete any existing codes for this email
	r.db.Where("email = ?", code.Email).Delete(&models.EmailVerificationCode{})
	return r.db.Create(code).Error
}

// GetVerificationCode retrieves a verification code
func (r *Repository) GetVerificationCode(email string) (*models.EmailVerificationCode, error) {
	var code models.EmailVerificationCode
	result := r.db.Where("email = ? AND verified = ?", email, false).
		Order("created_at DESC").
		First(&code)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, result.Error
	}
	return &code, nil
}

// MarkCodeAsVerified marks a verification code as used
func (r *Repository) MarkCodeAsVerified(email string) error {
	return r.db.Model(&models.EmailVerificationCode{}).
		Where("email = ?", email).
		Update("verified", true).Error
}

// CleanupExpiredCodes removes expired verification codes
func (r *Repository) CleanupExpiredCodes() error {
	return r.db.Where("expires_at < ?", time.Now()).
		Delete(&models.EmailVerificationCode{}).Error
}
