package action

import (
	"encoding/json"
	"errors"
	"sync"
	"time"
)

var (
	ErrActionNotFound      = errors.New("action not found")
	ErrActionAlreadyExists = errors.New("action already exists")
	ErrInvalidAction       = errors.New("invalid action definition")
)

// Action represents a dynamically registered action definition
type Action struct {
	ID          string                 `json:"id"`
	Name        string                 `json:"name"`
	Description string                 `json:"description,omitempty"`
	AccountID   string                 `json:"account_id"`          // Owner account
	RobotTypes  []string               `json:"robot_types"`         // Which robot types support this action (empty = all)
	Parameters  map[string]ParamDef    `json:"parameters"`          // Parameter definitions for validation
	Metadata    map[string]interface{} `json:"metadata,omitempty"`  // Custom metadata
	WebhookURL  string                 `json:"webhook_url,omitempty"` // Optional webhook to call when action is invoked
	CreatedAt   time.Time              `json:"created_at"`
	UpdatedAt   time.Time              `json:"updated_at"`
}

// ParamDef defines a parameter's type and constraints
type ParamDef struct {
	Type        string      `json:"type"`                  // string, number, boolean, object, array
	Required    bool        `json:"required,omitempty"`
	Default     interface{} `json:"default,omitempty"`
	Description string      `json:"description,omitempty"`
	Min         *float64    `json:"min,omitempty"`         // For numbers
	Max         *float64    `json:"max,omitempty"`         // For numbers
	Enum        []string    `json:"enum,omitempty"`        // For strings with fixed values
}

// ActionRequest represents an incoming control request
type ActionRequest struct {
	Action     string                 `json:"action"`
	Parameters map[string]interface{} `json:"parameters,omitempty"`
	RequestID  string                 `json:"requestId,omitempty"`
	Timestamp  string                 `json:"timestamp,omitempty"`
	Priority   int                    `json:"priority,omitempty"`
	Timeout    float64                `json:"timeout,omitempty"`
}

// ActionLog stores a record of executed actions
type ActionLog struct {
	ID         uint                   `json:"id"`
	ActionID   string                 `json:"action_id"`
	RobotID    string                 `json:"robot_id"`
	AccountID  string                 `json:"account_id"`
	RequestID  string                 `json:"request_id,omitempty"`
	Parameters map[string]interface{} `json:"parameters,omitempty"`
	Status     string                 `json:"status"` // pending, success, failed
	Response   map[string]interface{} `json:"response,omitempty"`
	Timestamp  time.Time              `json:"timestamp"`
}

// Registry manages dynamic action registration and lookup
type Registry struct {
	mu      sync.RWMutex
	actions map[string]*Action           // actionID -> Action
	byAccount map[string]map[string]bool // accountID -> set of actionIDs
	store   ActionStore                  // persistence layer (optional)
}

// ActionStore interface for persistence (can be implemented with DB or in-memory)
type ActionStore interface {
	SaveAction(action *Action) error
	DeleteAction(id string) error
	GetAction(id string) (*Action, error)
	GetActionsByAccount(accountID string) ([]*Action, error)
	GetAllActions() ([]*Action, error)
	SaveActionLog(log *ActionLog) error
	GetActionLogs(robotID string, limit int) ([]*ActionLog, error)
}

// NewRegistry creates a new action registry
func NewRegistry(store ActionStore) *Registry {
	r := &Registry{
		actions:   make(map[string]*Action),
		byAccount: make(map[string]map[string]bool),
		store:     store,
	}

	// Load existing actions from store if available
	if store != nil {
		if actions, err := store.GetAllActions(); err == nil {
			for _, action := range actions {
				r.actions[action.ID] = action
				if r.byAccount[action.AccountID] == nil {
					r.byAccount[action.AccountID] = make(map[string]bool)
				}
				r.byAccount[action.AccountID][action.ID] = true
			}
		}
	}

	return r
}

// Register adds a new action to the registry
func (r *Registry) Register(action *Action) error {
	if action.ID == "" || action.Name == "" {
		return ErrInvalidAction
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	if _, exists := r.actions[action.ID]; exists {
		return ErrActionAlreadyExists
	}

	now := time.Now()
	action.CreatedAt = now
	action.UpdatedAt = now

	// Persist if store available
	if r.store != nil {
		if err := r.store.SaveAction(action); err != nil {
			return err
		}
	}

	r.actions[action.ID] = action
	if r.byAccount[action.AccountID] == nil {
		r.byAccount[action.AccountID] = make(map[string]bool)
	}
	r.byAccount[action.AccountID][action.ID] = true

	return nil
}

// Update modifies an existing action
func (r *Registry) Update(action *Action) error {
	if action.ID == "" {
		return ErrInvalidAction
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	existing, exists := r.actions[action.ID]
	if !exists {
		return ErrActionNotFound
	}

	// Preserve creation time and account ownership
	action.CreatedAt = existing.CreatedAt
	action.AccountID = existing.AccountID
	action.UpdatedAt = time.Now()

	// Persist if store available
	if r.store != nil {
		if err := r.store.SaveAction(action); err != nil {
			return err
		}
	}

	r.actions[action.ID] = action
	return nil
}

// Unregister removes an action from the registry
func (r *Registry) Unregister(actionID string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	action, exists := r.actions[actionID]
	if !exists {
		return ErrActionNotFound
	}

	// Persist deletion if store available
	if r.store != nil {
		if err := r.store.DeleteAction(actionID); err != nil {
			return err
		}
	}

	delete(r.actions, actionID)
	if r.byAccount[action.AccountID] != nil {
		delete(r.byAccount[action.AccountID], actionID)
	}

	return nil
}

// Get retrieves an action by ID
func (r *Registry) Get(actionID string) (*Action, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	action, exists := r.actions[actionID]
	if !exists {
		return nil, ErrActionNotFound
	}

	return action, nil
}

// GetByAccount returns all actions owned by an account
func (r *Registry) GetByAccount(accountID string) []*Action {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var result []*Action
	if actionIDs, exists := r.byAccount[accountID]; exists {
		for id := range actionIDs {
			if action, ok := r.actions[id]; ok {
				result = append(result, action)
			}
		}
	}
	return result
}

// GetAll returns all registered actions
func (r *Registry) GetAll() []*Action {
	r.mu.RLock()
	defer r.mu.RUnlock()

	result := make([]*Action, 0, len(r.actions))
	for _, action := range r.actions {
		result = append(result, action)
	}
	return result
}

// ValidateRequest validates an action request against its definition
func (r *Registry) ValidateRequest(req *ActionRequest) (*Action, error) {
	action, err := r.Get(req.Action)
	if err != nil {
		return nil, err
	}

	// Validate required parameters
	for name, def := range action.Parameters {
		if def.Required {
			if req.Parameters == nil {
				return nil, errors.New("missing required parameter: " + name)
			}
			if _, exists := req.Parameters[name]; !exists {
				return nil, errors.New("missing required parameter: " + name)
			}
		}

		// Type validation (basic)
		if req.Parameters != nil {
			if val, exists := req.Parameters[name]; exists {
				if err := validateParamType(name, val, def); err != nil {
					return nil, err
				}
			}
		}
	}

	return action, nil
}

// validateParamType performs basic type checking
func validateParamType(name string, value interface{}, def ParamDef) error {
	switch def.Type {
	case "string":
		if _, ok := value.(string); !ok {
			return errors.New("parameter " + name + " must be a string")
		}
		if len(def.Enum) > 0 {
			strVal := value.(string)
			found := false
			for _, e := range def.Enum {
				if e == strVal {
					found = true
					break
				}
			}
			if !found {
				return errors.New("parameter " + name + " must be one of: " + joinStrings(def.Enum))
			}
		}
	case "number":
		var numVal float64
		switch v := value.(type) {
		case float64:
			numVal = v
		case int:
			numVal = float64(v)
		case json.Number:
			var err error
			numVal, err = v.Float64()
			if err != nil {
				return errors.New("parameter " + name + " must be a number")
			}
		default:
			return errors.New("parameter " + name + " must be a number")
		}
		if def.Min != nil && numVal < *def.Min {
			return errors.New("parameter " + name + " must be >= min value")
		}
		if def.Max != nil && numVal > *def.Max {
			return errors.New("parameter " + name + " must be <= max value")
		}
	case "boolean":
		if _, ok := value.(bool); !ok {
			return errors.New("parameter " + name + " must be a boolean")
		}
	// object and array types are not strictly validated for now
	}
	return nil
}

func joinStrings(strs []string) string {
	result := ""
	for i, s := range strs {
		if i > 0 {
			result += ", "
		}
		result += s
	}
	return result
}

// LogAction records an action execution
func (r *Registry) LogAction(log *ActionLog) error {
	if r.store != nil {
		return r.store.SaveActionLog(log)
	}
	return nil
}

// GetActionLogs retrieves action logs for a robot
func (r *Registry) GetActionLogs(robotID string, limit int) ([]*ActionLog, error) {
	if r.store != nil {
		return r.store.GetActionLogs(robotID, limit)
	}
	return nil, nil
}
