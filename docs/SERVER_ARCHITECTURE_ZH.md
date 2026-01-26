# KairoIO Server - 技術架構文件

以 Go 語言開發的 IoT 機器人車隊管理後端 API 伺服器。

---

## 目錄

1. [API 端點](#1-api-端點)
2. [認證系統](#2-認證系統)
3. [資料儲存架構](#3-資料儲存架構)
4. [帳號管理](#4-帳號管理)
5. [多租戶與存取控制](#5-多租戶與存取控制)
6. [即時功能](#6-即時功能)
7. [設定參考](#7-設定參考)

---

## 1. API 端點

### 基礎 URL

```
http://<伺服器位址>:8080
```

### 公開端點（無需認證）

| 方法 | 端點 | 說明 |
|------|------|------|
| `GET` | `/health` | 健康檢查 |
| `GET` | `/version` | 伺服器版本資訊 |
| `GET` | `/api/v1/config` | 公開設定 |
| `POST` | `/api/v1/auth/login` | 使用者登入 |
| `GET` | `/api/v1/schemas` | 列出 JSON Schema |
| `GET` | `/api/v1/schemas/{id}` | 取得特定 Schema |

### 受保護端點（需要 Bearer Token）

#### 機器人管理

| 方法 | 端點 | 說明 |
|------|------|------|
| `POST` | `/api/v1/robots` | 註冊新機器人 |
| `GET` | `/api/v1/robots` | 列出所有機器人 |
| `POST` | `/api/v1/robots/{robotId}/status` | 更新機器人狀態 |
| `GET` | `/api/v1/robots/{robotId}/status` | 取得最新機器人狀態 |
| `GET` | `/api/v1/robots/{robotId}/history` | 取得狀態歷史 |
| `GET` | `/api/v1/robots/{robotId}/trajectory` | 取得移動軌跡 |
| `GET` | `/api/v1/robots/{robotId}/token` | 取得 LiveKit 串流 Token |
| `POST` | `/api/v1/robots/{robotId}/logs` | 提交機器人日誌 |
| `GET` | `/api/v1/robots/{robotId}/logs/subscribe` | SSE 日誌訂閱 |
| `POST` | `/api/v1/robots/{robotId}/alert` | 提交機器人告警 |
| `POST` | `/api/v1/robots/{robotId}/control` | 發送控制命令 |
| `GET` | `/api/v1/robots/{robotId}/control/logs` | 取得動作歷史 |

#### 動作管理

| 方法 | 端點 | 說明 |
|------|------|------|
| `GET` | `/api/v1/actions` | 列出使用者的動作 |
| `GET` | `/api/v1/actions/all` | 列出所有動作 |
| `POST` | `/api/v1/actions` | 註冊自訂動作 |
| `GET` | `/api/v1/actions/{actionId}` | 取得動作詳情 |
| `PUT` | `/api/v1/actions/{actionId}` | 更新動作 |
| `DELETE` | `/api/v1/actions/{actionId}` | 刪除動作 |

#### 告警管理

| 方法 | 端點 | 說明 |
|------|------|------|
| `GET` | `/api/v1/alerts` | 列出告警（支援篩選） |
| `POST` | `/api/v1/alerts/{alertId}/acknowledge` | 確認告警 |
| `POST` | `/api/v1/alerts/{alertId}/resolve` | 解決告警 |

#### 地圖管理

| 方法 | 端點 | 說明 |
|------|------|------|
| `POST` | `/api/v1/map/upload` | 上傳 PGM + YAML 地圖 |
| `GET` | `/api/v1/map/latest` | 取得最新地圖中繼資料 |
| `GET` | `/api/v1/map/{id}/image` | 取得地圖圖片（二進制 PGM） |
| `GET` | `/api/v1/maps` | 列出所有地圖 |

---

## 2. 認證系統

### 認證流程

```
┌─────────────┐     POST /api/v1/auth/login      ┌─────────────────┐
│   客戶端    │ ──────────────────────────────▶  │      伺服器      │
│             │   {username, password}           │                 │
│             │                                  │  1. 檢查管理員   │
│             │                                  │     設定檔      │
│             │                                  │  2. 檢查資料庫  │
│             │                                  │  3. 驗證        │
│             │                                  │     bcrypt 雜湊 │
│             │  ◀──────────────────────────────│                 │
│             │   {certification_key, account_id}│                 │
└─────────────┘                                  └─────────────────┘
       │
       │ 後續所有請求都需要包含:
       │ Authorization: Bearer <certification_key>
       ▼
┌─────────────────────────────────────────────────────────────────┐
│                        認證中介層                                │
│  1. 從 "Authorization: Bearer <token>" 標頭取得 Token          │
│  2. 查詢: SELECT * FROM accounts WHERE certification_key = ?   │
│  3. 若找到 → 將 account_id 存入請求上下文                       │
│  4. 若未找到 → 回傳 401 未授權                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 登入請求/回應

**請求：**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "kairoio",
  "password": "kairoio"
}
```

**回應：**
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

### 中介層實作

**檔案：** `internal/auth/middleware.go`

```go
func (m *Middleware) AuthRequired(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // 1. 從標頭取得 Token
        authHeader := r.Header.Get("Authorization")
        certKey := strings.TrimPrefix(authHeader, "Bearer ")

        // 2. 驗證資料庫
        accountID, err := m.validateCertKey(certKey)
        if err != nil {
            http.Error(w, "Invalid certification key", 401)
            return
        }

        // 3. 存入上下文供處理器使用
        ctx := context.WithValue(r.Context(), AccountIDKey, accountID)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}
```

### 登入處理器邏輯

**檔案：** `internal/api/auth.go`

```go
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
    // 1. 先檢查內建管理員帳號（來自 config.yaml）
    if req.Username == h.adminUser && req.Password == h.adminPass {
        // 回傳管理員憑證金鑰
        return
    }

    // 2. 否則檢查資料庫帳號
    account, err := h.repo.GetAccountByEmail(req.Username)

    // 3. 使用 bcrypt 驗證密碼
    if err := auth.CheckPassword(req.Password, account.PasswordHash); err != nil {
        respondError(w, 401, "Invalid username or password")
        return
    }

    // 4. 回傳 certification_key（Bearer Token）
    respondSuccess(w, map[string]interface{}{
        "account_id":        account.ID,
        "certification_key": account.CertificationKey,
    })
}
```

### 認證摘要

| 項目 | 實作方式 |
|------|---------|
| Token 類型 | `certification_key` (UUID)，非 JWT |
| Token 儲存 | `accounts.certification_key` 欄位 |
| Token 有效期 | 永久（無過期機制） |
| 管理員帳號 | 寫死在 config.yaml，繞過資料庫 |
| 密碼雜湊 | bcrypt，可設定強度（預設：12） |

---

## 3. 資料儲存架構

### 技術堆疊

- **ORM：** GORM v1.26.0
- **資料庫：** PostgreSQL（生產環境）或 SQLite（開發環境）
- **驅動：** `gorm.io/driver/postgres` 或 `gorm.io/driver/sqlite`

### 資料庫結構

#### accounts（帳號）

| 欄位 | 類型 | 約束 | 說明 |
|------|------|------|------|
| `id` | VARCHAR | PRIMARY KEY | 格式："ACC-YYYYMMDD-HHMMSS" |
| `email` | VARCHAR | UNIQUE, NOT NULL | 使用者電子郵件 |
| `password_hash` | VARCHAR | NOT NULL | bcrypt 雜湊密碼 |
| `certification_key` | VARCHAR | UNIQUE, NOT NULL | UUID 作為 Bearer Token |
| `email_verified` | BOOLEAN | DEFAULT false | 電子郵件驗證狀態 |
| `created_at` | TIMESTAMP | | |
| `updated_at` | TIMESTAMP | | |

#### robots（機器人）

| 欄位 | 類型 | 約束 | 說明 |
|------|------|------|------|
| `id` | VARCHAR | PRIMARY KEY | 機器人識別碼（使用者定義） |
| `account_id` | VARCHAR | NOT NULL, INDEX, FK | 所屬帳號 |
| `robot_type` | VARCHAR | NOT NULL | 例如："mobile_robot", "esp32-cam" |
| `robot_name` | VARCHAR | | 人類可讀名稱 |
| `created_at` | TIMESTAMP | | |
| `updated_at` | TIMESTAMP | | |

#### robot_statuses（機器人狀態）

| 欄位 | 類型 | 約束 | 說明 |
|------|------|------|------|
| `id` | UINT | PRIMARY KEY, AUTO | |
| `robot_id` | VARCHAR | NOT NULL, INDEX, FK | |
| `account_id` | VARCHAR | NOT NULL, INDEX | |
| `status_json` | TEXT | NOT NULL | 彈性 JSON 資料 |
| `timestamp` | TIMESTAMP | INDEX | 依此排序 |

#### robot_logs（機器人日誌）

| 欄位 | 類型 | 約束 | 說明 |
|------|------|------|------|
| `id` | UINT | PRIMARY KEY, AUTO | |
| `robot_id` | VARCHAR | NOT NULL, INDEX, FK | |
| `account_id` | VARCHAR | NOT NULL, INDEX | |
| `topic` | VARCHAR | NOT NULL, INDEX | 例如："navigation", "sensor" |
| `message` | TEXT | NOT NULL | 日誌內容 |
| `level` | VARCHAR | | "info", "warn", "error" |
| `timestamp` | TIMESTAMP | INDEX | |

#### alerts（告警）

| 欄位 | 類型 | 約束 | 說明 |
|------|------|------|------|
| `id` | UUID (VARCHAR 36) | PRIMARY KEY | 自動產生 |
| `robot_id` | VARCHAR | NOT NULL, INDEX | |
| `account_id` | VARCHAR | NOT NULL, INDEX | |
| `alert_type` | VARCHAR(100) | NOT NULL | 例如："low_battery" |
| `severity` | VARCHAR(20) | NOT NULL, INDEX | info/warning/error/critical |
| `message` | TEXT | NOT NULL | |
| `metadata` | TEXT | | 選用 JSON |
| `status` | VARCHAR(20) | INDEX, DEFAULT 'active' | active/acknowledged/resolved |
| `acknowledged_at` | TIMESTAMP | NULLABLE | |
| `acknowledged_by` | VARCHAR | | |
| `resolved_at` | TIMESTAMP | NULLABLE | |
| `created_at` | TIMESTAMP | NOT NULL, INDEX | |

#### maps（地圖）

| 欄位 | 類型 | 約束 | 說明 |
|------|------|------|------|
| `id` | UUID | PRIMARY KEY | |
| `account_id` | VARCHAR | NOT NULL, INDEX | |
| `robot_id` | VARCHAR | INDEX | 選用 |
| `name` | VARCHAR(255) | | |
| `resolution` | FLOAT | | 公尺/像素 |
| `origin_x` | FLOAT | | 地圖原點 X |
| `origin_y` | FLOAT | | 地圖原點 Y |
| `origin_yaw` | FLOAT | | 地圖原點旋轉 |
| `pgm_data` | LONGBLOB | | 二進制 PGM 圖片 |
| `yaml_raw` | TEXT | | 原始 YAML 中繼資料 |
| `created_at` | TIMESTAMP | NOT NULL, INDEX | |

### 實體關聯

```
accounts (1) ──────────────────┬──── (N) robots
                               │
                               ├──── (N) alerts
                               │
                               ├──── (N) maps
                               │
                               └──── (N) actions (記憶體註冊)

robots (1) ────────────────────┬──── (N) robot_statuses
                               │
                               ├──── (N) robot_logs
                               │
                               └──── (N) alerts
```

### 狀態 JSON 結構

`robot_statuses.status_json` 欄位儲存彈性 JSON：

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

### 資料存取層

**檔案：** `internal/database/repository.go`

```go
// 帳號操作
CreateAccount(account *models.Account) error
GetAccountByID(id string) (*models.Account, error)
GetAccountByEmail(email string) (*models.Account, error)
GetAccountByCertKey(certKey string) (*models.Account, error)
UpdateAccount(account *models.Account) error

// 機器人操作
CreateRobot(robot *models.Robot) error
GetRobotByID(id string) (*models.Robot, error)
GetRobotsByAccountID(accountID string) ([]models.Robot, error)
UpdateRobot(robot *models.Robot) error
DeleteRobot(id string) error

// 機器人狀態操作
CreateRobotStatus(status *models.RobotStatus) error
GetLatestRobotStatus(robotID string) (*models.RobotStatus, error)
GetRobotStatusHistory(robotID string, limit int) ([]models.RobotStatus, error)
GetRobotStatusesByTimeRange(robotID string, start, end time.Time) ([]models.RobotStatus, error)

// 機器人日誌操作
CreateRobotLog(log *models.RobotLog) error
GetRobotLogs(robotID string, topic string, limit int) ([]models.RobotLog, error)

// 告警操作
CreateAlert(alert *models.Alert) error

// 地圖操作
SaveMap(m *models.Map) error
GetMapByID(id string) (*models.Map, error)
GetLatestMapDraft(accountID string) (*models.Map, error)
ListMapsForAccount(accountID string) ([]models.Map, error)
```

---

## 4. 帳號管理

### 帳號類型

#### 1. 管理員帳號（內建）

設定在 `config.yaml`，繞過資料庫：

```yaml
admin:
  username: "kairoio"
  password: "kairoio"
```

- 不需要資料庫記錄
- 登入時優先檢查寫死的憑證
- 回傳固定的帳號 ID 和憑證金鑰

#### 2. 資料庫帳號

透過註冊流程建立（目前停用）：

1. 透過電子郵件發送驗證碼
2. 使用者以驗證碼驗證電子郵件
3. 建立帳號：
   - ID：`"ACC-YYYYMMDD-HHMMSS"`
   - 密碼使用 bcrypt 雜湊（強度=12）
   - 產生 UUID 作為 `certification_key`

### 帳號模型

**檔案：** `internal/models/account.go`

```go
type Account struct {
    ID               string    `gorm:"primaryKey"`
    Email            string    `gorm:"uniqueIndex;not null"`
    PasswordHash     string    `gorm:"not null" json:"-"`
    CertificationKey string    `gorm:"uniqueIndex;not null"`
    EmailVerified    bool      `gorm:"default:false"`
    CreatedAt        time.Time
    UpdatedAt        time.Time

    // 關聯
    Robots []Robot `gorm:"foreignKey:AccountID"`
}
```

### 密碼處理

```go
// 雜湊密碼（註冊時）
import "golang.org/x/crypto/bcrypt"

hash, _ := bcrypt.GenerateFromPassword([]byte(password), 12)  // 強度 = 12

// 驗證密碼（登入時）
err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
```

---

## 5. 多租戶與存取控制

### 存取控制模型

所有受保護資源都以 `account_id` 為範圍：

```
account_id（來自認證上下文）
     │
     ├──▶ Robots      (robot.account_id == account_id)
     ├──▶ Statuses    (status.account_id == account_id)
     ├──▶ Logs        (log.account_id == account_id)
     ├──▶ Alerts      (alert.account_id == account_id)
     ├──▶ Maps        (map.account_id == account_id)
     └──▶ Actions     (action.account_id == account_id)
```

### 強制執行模式

每個處理器都使用此模式：

```go
func (h *Handler) SomeEndpoint(w http.ResponseWriter, r *http.Request) {
    // 1. 從認證上下文取得帳號
    accountID, err := auth.GetAccountID(r.Context())
    if err != nil {
        respondError(w, 401, "Unauthorized")
        return
    }

    // 2. 取得資源
    robot, err := h.repo.GetRobotByID(robotID)
    if err != nil {
        respondError(w, 404, "Robot not found")
        return
    }

    // 3. 驗證所有權
    if robot.AccountID != accountID {
        respondError(w, 403, "Access denied")
        return
    }

    // 4. 繼續操作
    // ...
}
```

### 查詢範圍限制

所有列表查詢都按帳號篩選：

```go
// 只列出當前使用者的機器人
func (r *Repository) GetRobotsByAccountID(accountID string) ([]models.Robot, error) {
    var robots []models.Robot
    result := r.db.Where("account_id = ?", accountID).Find(&robots)
    return robots, result.Error
}

// 列出告警時加入帳號篩選
query := h.db.Where("account_id = ?", accountID)
if robotID != "" {
    query = query.Where("robot_id = ?", robotID)
}
query.Find(&alerts)
```

---

## 6. 即時功能

### SSE（Server-Sent Events）日誌串流

**端點：** `GET /api/v1/robots/{robotId}/logs/subscribe`

```go
func (h *RobotHandler) SubscribeLogs(w http.ResponseWriter, r *http.Request) {
    // 設定 SSE 標頭
    w.Header().Set("Content-Type", "text/event-stream")
    w.Header().Set("Cache-Control", "no-cache")
    w.Header().Set("Connection", "keep-alive")
    w.Header().Set("Access-Control-Allow-Origin", "*")

    // 訂閱廣播器
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

### 日誌廣播器模式

**檔案：** `internal/api/robot.go`

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
                // 非阻塞：若訂閱者處理緩慢則跳過
            }
        }
    }
}

func (b *LogBroadcaster) Unsubscribe(robotID string, ch chan models.RobotLog) {
    b.mu.Lock()
    defer b.mu.Unlock()

    // 從訂閱者列表移除 channel
    // 關閉 channel
}
```

### 客戶端使用範例（JavaScript）

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
    console.error('SSE 連線錯誤:', error);
};
```

---

## 7. 設定參考

### config.yaml

```yaml
server:
  host: "0.0.0.0"           # 綁定位址
  port: 8080                # HTTP 連接埠
  read_timeout: 15s         # 請求讀取逾時
  write_timeout: 15s        # 回應寫入逾時
  idle_timeout: 60s         # Keep-alive 逾時

database:
  type: "sqlite"            # "sqlite" 或 "postgres"
  dsn: "kairoio.db"         # SQLite 檔案路徑
  # dsn: "host=localhost user=kairoio password=xxx dbname=kairoio port=5432 sslmode=disable"
  max_connections: 25       # 連線池大小
  conn_max_lifetime: 5m     # 連線最長存活時間

auth:
  token_ttl: 24h            # 目前未使用（靜態 cert_key）
  password_cost: 12         # bcrypt 強度（建議 10-14）

admin:
  username: "kairoio"       # 內建管理員帳號
  password: "kairoio"       # 內建管理員密碼

email:
  smtp_host: "smtp.gmail.com"
  smtp_port: 587
  from_address: "noreply@kairoio.io"
  username: ""              # SMTP 使用者名稱
  password: ""              # SMTP 密碼或應用程式密碼
  code_ttl: 20m             # 驗證碼過期時間

livekit:
  api_key: "devkey"         # LiveKit API 金鑰
  api_secret: "secret"      # LiveKit API 密鑰
  host: "http://localhost:7880"  # LiveKit 伺服器 URL

features:
  email_verification_required: true
  robot_quota_enabled: true
  rate_limiting_enabled: true
```

### 環境變數

環境變數會覆蓋 config.yaml：

```bash
# 伺服器
KAIROIO_SERVER_HOST=0.0.0.0
KAIROIO_SERVER_PORT=8080

# 資料庫
KAIROIO_DATABASE_TYPE=postgres
KAIROIO_DATABASE_DSN="host=localhost user=kairoio password=secret dbname=kairoio"

# 管理員
KAIROIO_ADMIN_USERNAME=admin
KAIROIO_ADMIN_PASSWORD=secure_password

# 電子郵件
KAIROIO_EMAIL_SMTP_HOST=smtp.gmail.com
KAIROIO_EMAIL_PASSWORD=app_password
```

---

## 附錄：API 請求/回應範例

### 註冊機器人

```http
POST /api/v1/robots
Authorization: Bearer <certification_key>
Content-Type: application/json

{
  "robot_id": "robot_001",
  "robot_type": "mobile_robot",
  "robot_name": "巡邏機器人 1 號"
}
```

**回應：**
```json
{
  "success": true,
  "data": {
    "message": "Robot registered successfully",
    "robot_id": "robot_001"
  }
}
```

### 更新機器人狀態

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

**回應：**
```json
{
  "success": true,
  "data": {
    "message": "Status updated successfully",
    "timestamp": "2026-01-25T12:00:00Z"
  }
}
```

### 取得機器人軌跡

```http
GET /api/v1/robots/robot_001/trajectory?start=2026-01-25T00:00:00Z&end=2026-01-25T23:59:59Z
Authorization: Bearer <certification_key>
```

**回應：**
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

### 提交告警

```http
POST /api/v1/robots/robot_001/alert
Authorization: Bearer <certification_key>
Content-Type: application/json

{
  "alert_type": "low_battery",
  "severity": "warning",
  "message": "電池電量低於 20%"
}
```

**回應：**
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

### 篩選列出告警

```http
GET /api/v1/alerts?robot_id=robot_001&status=active&severity=warning&limit=50
Authorization: Bearer <certification_key>
```

**回應：**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "robot_id": "robot_001",
      "alert_type": "low_battery",
      "severity": "warning",
      "message": "電池電量低於 20%",
      "status": "active",
      "created_at": "2026-01-25T12:00:00Z"
    }
  ]
}
```

---

## 摘要表

| 項目 | 實作方式 |
|------|---------|
| **程式語言** | Go 1.24 |
| **框架** | Chi Router v5.2.4 |
| **ORM** | GORM v1.26.0 |
| **資料庫** | PostgreSQL / SQLite |
| **認證方式** | Bearer Token (certification_key UUID) |
| **密碼雜湊** | bcrypt (強度=12) |
| **多租戶** | 所有資源以 account_id 為範圍 |
| **即時功能** | SSE 日誌串流 |
| **視頻串流** | LiveKit WebRTC 整合 |
