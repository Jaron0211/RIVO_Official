# KairoIO Server - Technical Architecture Documentation

A comprehensive Go-based backend API server for IoT robot fleet management.

---

## Table of Contents

1. [API Endpoints](#1-api-endpoints)
2. [Authentication System](#2-authentication-system)
3. [Data Storage Architecture](#3-data-storage-architecture)
4. [Account Management](#4-account-management)
5. [Multi-Tenancy & Access Control](#5-multi-tenancy--access-control)
6. [Real-time Features](#6-real-time-features)
7. [Configuration Reference](#7-configuration-reference)

---

## 1. API Endpoints

### Base URL

```
http://<server>:8080
```

### Public Endpoints (No Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/version` | Server version info |
| `GET` | `/api/v1/config` | Public configuration |
| `POST` | `/api/v1/auth/login` | User login |
| `GET` | `/api/v1/schemas` | List JSON schemas |
| `GET` | `/api/v1/schemas/{id}` | Get specific schema |

### Protected Endpoints (Bearer Token Required)

#### Robot Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/robots` | Register new robot |
| `GET` | `/api/v1/robots` | List all robots |
| `POST` | `/api/v1/robots/{robotId}/status` | Update robot status |
| `GET` | `/api/v1/robots/{robotId}/status` | Get latest robot status |
| `GET` | `/api/v1/robots/{robotId}/history` | Get status history |
| `GET` | `/api/v1/robots/{robotId}/trajectory` | Get movement trajectory |
| `GET` | `/api/v1/robots/{robotId}/token` | Get LiveKit streaming token |
| `POST` | `/api/v1/robots/{robotId}/logs` | Submit robot log |
| `GET` | `/api/v1/robots/{robotId}/logs/subscribe` | SSE log subscription |
| `POST` | `/api/v1/robots/{robotId}/alert` | Submit robot alert |
| `POST` | `/api/v1/robots/{robotId}/control` | Send control command |
| `GET` | `/api/v1/robots/{robotId}/control/logs` | Get action history |

#### Action Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/actions` | List user's actions |
| `GET` | `/api/v1/actions/all` | List all actions |
| `POST` | `/api/v1/actions` | Register custom action |
| `GET` | `/api/v1/actions/{actionId}` | Get action details |
| `PUT` | `/api/v1/actions/{actionId}` | Update action |
| `DELETE` | `/api/v1/actions/{actionId}` | Delete action |

#### Alert Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/alerts` | List alerts (with filters) |
| `POST` | `/api/v1/alerts/{alertId}/acknowledge` | Acknowledge alert |
| `POST` | `/api/v1/alerts/{alertId}/resolve` | Resolve alert |

#### Map Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/map/upload` | Upload PGM + YAML map |
| `GET` | `/api/v1/map/latest` | Get latest map metadata |
| `GET` | `/api/v1/map/{id}/image` | Get map image (binary PGM) |
| `GET` | `/api/v1/maps` | List all maps |

---

## 2. Authentication System

### Authentication Flow

```
┌─────────────┐     POST /api/v1/auth/login      ┌─────────────────┐
│   Client    │ ──────────────────────────────▶  │    Server       │
│             │   {username, password}           │                 │
│             │                                  │  1. Check admin │
│             │                                  │     config      │
│             │                                  │  2. Check DB    │
│             │                                  │  3. Verify      │
│             │                                  │     bcrypt hash │
│             │  ◀──────────────────────────────│                 │
│             │   {certification_key, account_id}│                 │
└─────────────┘                                  └─────────────────┘
       │
       │ All subsequent requests include:
       │ Authorization: Bearer <certification_key>
       ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Auth Middleware                              │
│  1. Extract token from "Authorization: Bearer <token>"          │
│  2. Query: SELECT * FROM accounts WHERE certification_key = ?   │
│  3. If found → Add account_id to request context                │
│  4. If not found → Return 401 Unauthorized                      │
└─────────────────────────────────────────────────────────────────┘
```

### Login Request/Response

**Request:**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "kairoio",
  "password": "kairoio"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Login successful",
    "account_id": "ACC-20260125-120000",
    "certification_key": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
}
```

### Middleware Implementation

**File:** `internal/auth/middleware.go`

```go
func (m *Middleware) AuthRequired(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // 1. Extract token from header
        authHeader := r.Header.Get("Authorization")
        certKey := strings.TrimPrefix(authHeader, "Bearer ")

        // 2. Validate against database
        accountID, err := m.validateCertKey(certKey)
        if err != nil {
            http.Error(w, "Invalid certification key", 401)
            return
        }

        // 3. Store in context for handlers
        ctx := context.WithValue(r.Context(), AccountIDKey, accountID)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}
```

### Login Handler Logic

**File:** `internal/api/auth.go`

```go
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
    // 1. First check embedded admin account (from config.yaml)
    if req.Username == h.adminUser && req.Password == h.adminPass {
        // Return admin cert key
        return
    }

    // 2. Otherwise check database accounts
    account, err := h.repo.GetAccountByEmail(req.Username)

    // 3. Verify password using bcrypt
    if err := auth.CheckPassword(req.Password, account.PasswordHash); err != nil {
        respondError(w, 401, "Invalid username or password")
        return
    }

    // 4. Return certification_key (the bearer token)
    respondSuccess(w, map[string]interface{}{
        "account_id":        account.ID,
        "certification_key": account.CertificationKey,
    })
}
```

### Authentication Summary

| Aspect | Implementation |
|--------|---------------|
| Token Type | `certification_key` (UUID), NOT JWT |
| Token Storage | `accounts.certification_key` column |
| Token Lifetime | Permanent (no expiration) |
| Admin Account | Hardcoded in config.yaml, bypasses database |
| Password Hash | bcrypt with configurable cost (default: 12) |

---

## 3. Data Storage Architecture

### Technology Stack

- **ORM:** GORM v1.26.0
- **Databases:** PostgreSQL (production) or SQLite (development)
- **Driver:** `gorm.io/driver/postgres` or `gorm.io/driver/sqlite`

### Database Schema

#### accounts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR | PRIMARY KEY | Format: "ACC-YYYYMMDD-HHMMSS" |
| `email` | VARCHAR | UNIQUE, NOT NULL | User email address |
| `password_hash` | VARCHAR | NOT NULL | bcrypt hashed password |
| `certification_key` | VARCHAR | UNIQUE, NOT NULL | UUID used as bearer token |
| `email_verified` | BOOLEAN | DEFAULT false | Email verification status |
| `created_at` | TIMESTAMP | | |
| `updated_at` | TIMESTAMP | | |

#### robots

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR | PRIMARY KEY | Robot identifier (user-defined) |
| `account_id` | VARCHAR | NOT NULL, INDEX, FK | Owner account |
| `robot_type` | VARCHAR | NOT NULL | e.g., "mobile_robot", "esp32-cam" |
| `robot_name` | VARCHAR | | Human-readable name |
| `created_at` | TIMESTAMP | | |
| `updated_at` | TIMESTAMP | | |

#### robot_statuses

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UINT | PRIMARY KEY, AUTO | |
| `robot_id` | VARCHAR | NOT NULL, INDEX, FK | |
| `account_id` | VARCHAR | NOT NULL, INDEX | |
| `status_json` | TEXT | NOT NULL | Flexible JSON blob |
| `timestamp` | TIMESTAMP | INDEX | Ordered by this |

#### robot_logs

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UINT | PRIMARY KEY, AUTO | |
| `robot_id` | VARCHAR | NOT NULL, INDEX, FK | |
| `account_id` | VARCHAR | NOT NULL, INDEX | |
| `topic` | VARCHAR | NOT NULL, INDEX | e.g., "navigation", "sensor" |
| `message` | TEXT | NOT NULL | Log content |
| `level` | VARCHAR | | "info", "warn", "error" |
| `timestamp` | TIMESTAMP | INDEX | |

#### alerts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID (VARCHAR 36) | PRIMARY KEY | Auto-generated |
| `robot_id` | VARCHAR | NOT NULL, INDEX | |
| `account_id` | VARCHAR | NOT NULL, INDEX | |
| `alert_type` | VARCHAR(100) | NOT NULL | e.g., "low_battery" |
| `severity` | VARCHAR(20) | NOT NULL, INDEX | info/warning/error/critical |
| `message` | TEXT | NOT NULL | |
| `metadata` | TEXT | | Optional JSON |
| `status` | VARCHAR(20) | INDEX, DEFAULT 'active' | active/acknowledged/resolved |
| `acknowledged_at` | TIMESTAMP | NULLABLE | |
| `acknowledged_by` | VARCHAR | | |
| `resolved_at` | TIMESTAMP | NULLABLE | |
| `created_at` | TIMESTAMP | NOT NULL, INDEX | |

#### maps

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | |
| `account_id` | VARCHAR | NOT NULL, INDEX | |
| `robot_id` | VARCHAR | INDEX | Optional |
| `name` | VARCHAR(255) | | |
| `resolution` | FLOAT | | meters/pixel |
| `origin_x` | FLOAT | | Map origin X |
| `origin_y` | FLOAT | | Map origin Y |
| `origin_yaw` | FLOAT | | Map origin rotation |
| `pgm_data` | LONGBLOB | | Binary PGM image |
| `yaml_raw` | TEXT | | Original YAML metadata |
| `created_at` | TIMESTAMP | NOT NULL, INDEX | |

#### email_verification_codes

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `email` | VARCHAR | PRIMARY KEY | |
| `code` | VARCHAR | NOT NULL | 6-digit code |
| `created_at` | TIMESTAMP | | |
| `expires_at` | TIMESTAMP | | code_ttl from config |
| `verified` | BOOLEAN | DEFAULT false | |

### Entity Relationships

```
accounts (1) ──────────────────┬──── (N) robots
                               │
                               ├──── (N) alerts
                               │
                               ├──── (N) maps
                               │
                               └──── (N) actions (in-memory registry)

robots (1) ────────────────────┬──── (N) robot_statuses
                               │
                               ├──── (N) robot_logs
                               │
                               └──── (N) alerts
```

### Status JSON Structure

The `robot_statuses.status_json` field stores flexible JSON:

```json
{
  "status": "active",
  "mode": "auto",
  "battery_level": 85,
  "global_position": {
    "latitude": 25.0330,
    "longitude": 121.5654,
    "altitude": 0.0
  },
  "local_position": {
    "x": 10.5,
    "y": 5.2,
    "z": 0.0,
    "yaw": 1.57
  },
  "sensor_overview": [
    {"sensor_id": "temp", "sensor_type": "Temperature", "value": 25.5, "unit": "C"},
    {"sensor_id": "lidar", "sensor_type": "LaserScan", "value": 2.5, "unit": "m"}
  ],
  "laser_scan": {
    "ranges": [2.5, 2.3, 2.1],
    "angle_min": -1.57,
    "angle_max": 1.57
  }
}
```

### Repository Layer

**File:** `internal/database/repository.go`

```go
// Account Operations
CreateAccount(account *models.Account) error
GetAccountByID(id string) (*models.Account, error)
GetAccountByEmail(email string) (*models.Account, error)
GetAccountByCertKey(certKey string) (*models.Account, error)
UpdateAccount(account *models.Account) error

// Robot Operations
CreateRobot(robot *models.Robot) error
GetRobotByID(id string) (*models.Robot, error)
GetRobotsByAccountID(accountID string) ([]models.Robot, error)
UpdateRobot(robot *models.Robot) error
DeleteRobot(id string) error

// Robot Status Operations
CreateRobotStatus(status *models.RobotStatus) error
GetLatestRobotStatus(robotID string) (*models.RobotStatus, error)
GetRobotStatusHistory(robotID string, limit int) ([]models.RobotStatus, error)
GetRobotStatusesByTimeRange(robotID string, start, end time.Time) ([]models.RobotStatus, error)

// Robot Log Operations
CreateRobotLog(log *models.RobotLog) error
GetRobotLogs(robotID string, topic string, limit int) ([]models.RobotLog, error)

// Alert Operations
CreateAlert(alert *models.Alert) error

// Map Operations
SaveMap(m *models.Map) error
GetMapByID(id string) (*models.Map, error)
GetLatestMapDraft(accountID string) (*models.Map, error)
ListMapsForAccount(accountID string) ([]models.Map, error)

// Email Verification
StoreVerificationCode(code *models.EmailVerificationCode) error
GetVerificationCode(email string) (*models.EmailVerificationCode, error)
MarkCodeAsVerified(email string) error
CleanupExpiredCodes() error
```

---

## 4. Account Management

### Account Types

#### 1. Admin Account (Built-in)

Configured in `config.yaml`, bypasses database:

```yaml
admin:
  username: "kairoio"
  password: "kairoio"
```

- No database record required
- Hardcoded credentials checked first during login
- Returns static account ID and cert key

#### 2. Database Accounts

Created via registration flow (currently disabled):

1. Send verification code via email
2. User verifies email with code
3. Create account with:
   - ID: `"ACC-YYYYMMDD-HHMMSS"`
   - Password hashed with bcrypt (cost=12)
   - Generate UUID as `certification_key`

### Account Model

**File:** `internal/models/account.go`

```go
type Account struct {
    ID               string    `gorm:"primaryKey"`
    Email            string    `gorm:"uniqueIndex;not null"`
    PasswordHash     string    `gorm:"not null" json:"-"`
    CertificationKey string    `gorm:"uniqueIndex;not null"`
    EmailVerified    bool      `gorm:"default:false"`
    CreatedAt        time.Time
    UpdatedAt        time.Time

    // Relations
    Robots []Robot `gorm:"foreignKey:AccountID"`
}
```

### Password Handling

```go
// Hash password (on registration)
import "golang.org/x/crypto/bcrypt"

hash, _ := bcrypt.GenerateFromPassword([]byte(password), 12)  // cost = 12

// Check password (on login)
err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
```

---

## 5. Multi-Tenancy & Access Control

### Access Control Model

Every protected resource is scoped to `account_id`:

```
account_id (from auth context)
     │
     ├──▶ Robots      (robot.account_id == account_id)
     ├──▶ Statuses    (status.account_id == account_id)
     ├──▶ Logs        (log.account_id == account_id)
     ├──▶ Alerts      (alert.account_id == account_id)
     ├──▶ Maps        (map.account_id == account_id)
     └──▶ Actions     (action.account_id == account_id)
```

### Enforcement Pattern

Used in every handler:

```go
func (h *Handler) SomeEndpoint(w http.ResponseWriter, r *http.Request) {
    // 1. Get account from auth context
    accountID, err := auth.GetAccountID(r.Context())
    if err != nil {
        respondError(w, 401, "Unauthorized")
        return
    }

    // 2. Get resource
    robot, err := h.repo.GetRobotByID(robotID)
    if err != nil {
        respondError(w, 404, "Robot not found")
        return
    }

    // 3. Verify ownership
    if robot.AccountID != accountID {
        respondError(w, 403, "Access denied")
        return
    }

    // 4. Proceed with operation
    // ...
}
```

### Query Scoping

All list queries filter by account:

```go
// List robots for current user only
func (r *Repository) GetRobotsByAccountID(accountID string) ([]models.Robot, error) {
    var robots []models.Robot
    result := r.db.Where("account_id = ?", accountID).Find(&robots)
    return robots, result.Error
}

// List alerts with account filter
query := h.db.Where("account_id = ?", accountID)
if robotID != "" {
    query = query.Where("robot_id = ?", robotID)
}
query.Find(&alerts)
```

---

## 6. Real-time Features

### SSE (Server-Sent Events) for Log Streaming

**Endpoint:** `GET /api/v1/robots/{robotId}/logs/subscribe`

```go
func (h *RobotHandler) SubscribeLogs(w http.ResponseWriter, r *http.Request) {
    // Set SSE headers
    w.Header().Set("Content-Type", "text/event-stream")
    w.Header().Set("Cache-Control", "no-cache")
    w.Header().Set("Connection", "keep-alive")
    w.Header().Set("Access-Control-Allow-Origin", "*")

    // Subscribe to broadcaster
    ch := h.broadcaster.Subscribe(robotID)
    defer h.broadcaster.Unsubscribe(robotID, ch)

    ctx := r.Context()
    for {
        select {
        case log := <-ch:
            data, _ := json.Marshal(log)
            fmt.Fprintf(w, "data: %s\n\n", string(data))
            w.(http.Flusher).Flush()
        case <-ctx.Done():
            return
        }
    }
}
```

### LogBroadcaster Pattern

**File:** `internal/api/robot.go`

```go
type LogBroadcaster struct {
    mu          sync.RWMutex
    subscribers map[string][]chan models.RobotLog  // robotID -> channels
}

func NewLogBroadcaster() *LogBroadcaster {
    return &LogBroadcaster{
        subscribers: make(map[string][]chan models.RobotLog),
    }
}

func (b *LogBroadcaster) Subscribe(robotID string) chan models.RobotLog {
    b.mu.Lock()
    defer b.mu.Unlock()

    ch := make(chan models.RobotLog, 10)
    b.subscribers[robotID] = append(b.subscribers[robotID], ch)
    return ch
}

func (b *LogBroadcaster) Broadcast(log models.RobotLog) {
    b.mu.RLock()
    defer b.mu.RUnlock()

    if subs, ok := b.subscribers[log.RobotID]; ok {
        for _, ch := range subs {
            select {
            case ch <- log:
            default:
                // Non-blocking: skip if subscriber is slow
            }
        }
    }
}

func (b *LogBroadcaster) Unsubscribe(robotID string, ch chan models.RobotLog) {
    b.mu.Lock()
    defer b.mu.Unlock()

    // Remove channel from subscribers list
    // Close channel
}
```

### Client Usage (JavaScript)

```javascript
const eventSource = new EventSource(
    `${serverUrl}/api/v1/robots/${robotId}/logs/subscribe`,
    { headers: { 'Authorization': `Bearer ${token}` } }
);

eventSource.onmessage = (event) => {
    const log = JSON.parse(event.data);
    console.log(`[${log.level}] ${log.topic}: ${log.message}`);
};

eventSource.onerror = (error) => {
    console.error('SSE connection error:', error);
};
```

---

## 7. Configuration Reference

### config.yaml

```yaml
server:
  host: "0.0.0.0"           # Bind address
  port: 8080                # HTTP port
  read_timeout: 15s         # Request read timeout
  write_timeout: 15s        # Response write timeout
  idle_timeout: 60s         # Keep-alive timeout

database:
  type: "sqlite"            # "sqlite" or "postgres"
  dsn: "kairoio.db"         # SQLite file path
  # dsn: "host=localhost user=kairoio password=xxx dbname=kairoio port=5432 sslmode=disable"
  max_connections: 25       # Connection pool size
  conn_max_lifetime: 5m     # Connection max lifetime

auth:
  token_ttl: 24h            # Not currently used (static cert_key)
  password_cost: 12         # bcrypt cost factor (10-14 recommended)

admin:
  username: "kairoio"       # Built-in admin username
  password: "kairoio"       # Built-in admin password

email:
  smtp_host: "smtp.gmail.com"
  smtp_port: 587
  from_address: "noreply@kairoio.io"
  username: ""              # SMTP username
  password: ""              # SMTP password or app password
  code_ttl: 20m             # Verification code expiry

livekit:
  api_key: "devkey"         # LiveKit API key
  api_secret: "secret"      # LiveKit API secret
  host: "http://localhost:7880"  # LiveKit server URL

features:
  email_verification_required: true
  robot_quota_enabled: true
  rate_limiting_enabled: true
```

### Environment Variables

Environment variables override config.yaml:

```bash
# Server
KAIROIO_SERVER_HOST=0.0.0.0
KAIROIO_SERVER_PORT=8080

# Database
KAIROIO_DATABASE_TYPE=postgres
KAIROIO_DATABASE_DSN="host=localhost user=kairoio password=secret dbname=kairoio"

# Admin
KAIROIO_ADMIN_USERNAME=admin
KAIROIO_ADMIN_PASSWORD=secure_password

# Email
KAIROIO_EMAIL_SMTP_HOST=smtp.gmail.com
KAIROIO_EMAIL_PASSWORD=app_password
```

---

## Appendix: API Request/Response Examples

### Register Robot

```http
POST /api/v1/robots
Authorization: Bearer <certification_key>
Content-Type: application/json

{
  "robot_id": "robot_001",
  "robot_type": "mobile_robot",
  "robot_name": "Patrol Bot 1"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Robot registered successfully",
    "robot_id": "robot_001"
  }
}
```

### Update Robot Status

```http
POST /api/v1/robots/robot_001/status
Authorization: Bearer <certification_key>
Content-Type: application/json

{
  "status": {
    "status": "active",
    "battery_level": 85,
    "global_position": {
      "latitude": 25.0330,
      "longitude": 121.5654
    },
    "sensor_overview": [
      {"sensor_id": "temp", "value": 25.5, "unit": "C"}
    ]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Status updated successfully",
    "timestamp": "2026-01-25T12:00:00Z"
  }
}
```

### Get Robot Trajectory

```http
GET /api/v1/robots/robot_001/trajectory?start=2026-01-25T00:00:00Z&end=2026-01-25T23:59:59Z
Authorization: Bearer <certification_key>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "robot_id": "robot_001",
    "count": 100,
    "path": [
      {"x": 0.0, "y": 0.0, "lat": 25.033, "lng": 121.565, "timestamp": "2026-01-25T10:00:00Z"},
      {"x": 1.0, "y": 0.5, "lat": 25.034, "lng": 121.566, "timestamp": "2026-01-25T10:00:05Z"}
    ]
  }
}
```

### Submit Alert

```http
POST /api/v1/robots/robot_001/alert
Authorization: Bearer <certification_key>
Content-Type: application/json

{
  "alert_type": "low_battery",
  "severity": "warning",
  "message": "Battery level below 20%"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Alert received and stored",
    "alert_id": "550e8400-e29b-41d4-a716-446655440000",
    "robot_id": "robot_001"
  }
}
```

### List Alerts with Filters

```http
GET /api/v1/alerts?robot_id=robot_001&status=active&severity=warning&limit=50
Authorization: Bearer <certification_key>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "robot_id": "robot_001",
      "alert_type": "low_battery",
      "severity": "warning",
      "message": "Battery level below 20%",
      "status": "active",
      "created_at": "2026-01-25T12:00:00Z"
    }
  ]
}
```

---

## Summary Table

| Aspect | Implementation |
|--------|---------------|
| **Language** | Go 1.24 |
| **Framework** | Chi Router v5.2.4 |
| **ORM** | GORM v1.26.0 |
| **Database** | PostgreSQL / SQLite |
| **Auth Method** | Bearer token (certification_key UUID) |
| **Password Hash** | bcrypt (cost=12) |
| **Multi-tenancy** | All resources scoped by account_id |
| **Real-time** | SSE for log streaming |
| **Video Streaming** | LiveKit WebRTC integration |
