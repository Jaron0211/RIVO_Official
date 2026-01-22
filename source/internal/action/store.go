package action

import (
	"encoding/json"
	"sync"
	"time"

	"gorm.io/gorm"
)

// MemoryStore provides an in-memory implementation of ActionStore
type MemoryStore struct {
	mu         sync.RWMutex
	actions    map[string]*Action
	actionLogs []*ActionLog
	logCounter uint
}

// NewMemoryStore creates a new in-memory action store
func NewMemoryStore() *MemoryStore {
	return &MemoryStore{
		actions:    make(map[string]*Action),
		actionLogs: make([]*ActionLog, 0),
	}
}

func (s *MemoryStore) SaveAction(action *Action) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.actions[action.ID] = action
	return nil
}

func (s *MemoryStore) DeleteAction(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.actions, id)
	return nil
}

func (s *MemoryStore) GetAction(id string) (*Action, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	action, exists := s.actions[id]
	if !exists {
		return nil, ErrActionNotFound
	}
	return action, nil
}

func (s *MemoryStore) GetActionsByAccount(accountID string) ([]*Action, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var result []*Action
	for _, action := range s.actions {
		if action.AccountID == accountID {
			result = append(result, action)
		}
	}
	return result, nil
}

func (s *MemoryStore) GetAllActions() ([]*Action, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]*Action, 0, len(s.actions))
	for _, action := range s.actions {
		result = append(result, action)
	}
	return result, nil
}

func (s *MemoryStore) SaveActionLog(log *ActionLog) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.logCounter++
	log.ID = s.logCounter
	s.actionLogs = append(s.actionLogs, log)
	return nil
}

func (s *MemoryStore) GetActionLogs(robotID string, limit int) ([]*ActionLog, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var result []*ActionLog
	// Iterate in reverse to get most recent first
	for i := len(s.actionLogs) - 1; i >= 0 && len(result) < limit; i-- {
		if s.actionLogs[i].RobotID == robotID {
			result = append(result, s.actionLogs[i])
		}
	}
	return result, nil
}

// DBActionModel is the GORM model for actions
type DBActionModel struct {
	ID          string `gorm:"primaryKey"`
	Name        string
	Description string
	AccountID   string `gorm:"index"`
	RobotTypes  string // JSON array
	Parameters  string // JSON object
	Metadata    string // JSON object
	WebhookURL  string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func (DBActionModel) TableName() string {
	return "actions"
}

// DBActionLogModel is the GORM model for action logs
type DBActionLogModel struct {
	ID         uint   `gorm:"primaryKey;autoIncrement"`
	ActionID   string `gorm:"index"`
	RobotID    string `gorm:"index"`
	AccountID  string `gorm:"index"`
	RequestID  string
	Parameters string // JSON
	Status     string
	Response   string // JSON
	Timestamp  time.Time `gorm:"index"`
}

func (DBActionLogModel) TableName() string {
	return "action_logs"
}

// DBStore provides a database-backed implementation of ActionStore
type DBStore struct {
	db *gorm.DB
}

// NewDBStore creates a new database-backed action store
func NewDBStore(db *gorm.DB) *DBStore {
	// Auto-migrate the tables
	db.AutoMigrate(&DBActionModel{}, &DBActionLogModel{})
	return &DBStore{db: db}
}

func (s *DBStore) SaveAction(action *Action) error {
	robotTypesJSON, _ := json.Marshal(action.RobotTypes)
	parametersJSON, _ := json.Marshal(action.Parameters)
	metadataJSON, _ := json.Marshal(action.Metadata)

	model := DBActionModel{
		ID:          action.ID,
		Name:        action.Name,
		Description: action.Description,
		AccountID:   action.AccountID,
		RobotTypes:  string(robotTypesJSON),
		Parameters:  string(parametersJSON),
		Metadata:    string(metadataJSON),
		WebhookURL:  action.WebhookURL,
		CreatedAt:   action.CreatedAt,
		UpdatedAt:   action.UpdatedAt,
	}

	return s.db.Save(&model).Error
}

func (s *DBStore) DeleteAction(id string) error {
	return s.db.Delete(&DBActionModel{}, "id = ?", id).Error
}

func (s *DBStore) GetAction(id string) (*Action, error) {
	var model DBActionModel
	if err := s.db.First(&model, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, ErrActionNotFound
		}
		return nil, err
	}
	return modelToAction(&model), nil
}

func (s *DBStore) GetActionsByAccount(accountID string) ([]*Action, error) {
	var models []DBActionModel
	if err := s.db.Find(&models, "account_id = ?", accountID).Error; err != nil {
		return nil, err
	}

	result := make([]*Action, len(models))
	for i, m := range models {
		result[i] = modelToAction(&m)
	}
	return result, nil
}

func (s *DBStore) GetAllActions() ([]*Action, error) {
	var models []DBActionModel
	if err := s.db.Find(&models).Error; err != nil {
		return nil, err
	}

	result := make([]*Action, len(models))
	for i, m := range models {
		result[i] = modelToAction(&m)
	}
	return result, nil
}

func (s *DBStore) SaveActionLog(log *ActionLog) error {
	parametersJSON, _ := json.Marshal(log.Parameters)
	responseJSON, _ := json.Marshal(log.Response)

	model := DBActionLogModel{
		ActionID:   log.ActionID,
		RobotID:    log.RobotID,
		AccountID:  log.AccountID,
		RequestID:  log.RequestID,
		Parameters: string(parametersJSON),
		Status:     log.Status,
		Response:   string(responseJSON),
		Timestamp:  log.Timestamp,
	}

	return s.db.Create(&model).Error
}

func (s *DBStore) GetActionLogs(robotID string, limit int) ([]*ActionLog, error) {
	var models []DBActionLogModel
	if err := s.db.Where("robot_id = ?", robotID).Order("timestamp DESC").Limit(limit).Find(&models).Error; err != nil {
		return nil, err
	}

	result := make([]*ActionLog, len(models))
	for i, m := range models {
		result[i] = logModelToActionLog(&m)
	}
	return result, nil
}

func modelToAction(m *DBActionModel) *Action {
	action := &Action{
		ID:          m.ID,
		Name:        m.Name,
		Description: m.Description,
		AccountID:   m.AccountID,
		WebhookURL:  m.WebhookURL,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
	}

	json.Unmarshal([]byte(m.RobotTypes), &action.RobotTypes)
	json.Unmarshal([]byte(m.Parameters), &action.Parameters)
	json.Unmarshal([]byte(m.Metadata), &action.Metadata)

	return action
}

func logModelToActionLog(m *DBActionLogModel) *ActionLog {
	log := &ActionLog{
		ID:        m.ID,
		ActionID:  m.ActionID,
		RobotID:   m.RobotID,
		AccountID: m.AccountID,
		RequestID: m.RequestID,
		Status:    m.Status,
		Timestamp: m.Timestamp,
	}

	json.Unmarshal([]byte(m.Parameters), &log.Parameters)
	json.Unmarshal([]byte(m.Response), &log.Response)

	return log
}
