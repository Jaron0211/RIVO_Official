# KairoIO Server - 快速入門指南

## 系統需求

- Go 1.24+ (從原始碼編譯時需要)
- PostgreSQL 14+ (建議用於生產環境) 或 SQLite (開發測試用)
- Docker & Docker Compose (選用)

## 安裝方式

### 方式一：下載二進制檔案（推薦）

```bash
# 下載適合你系統的版本
wget https://github.com/Jaron0211/kairoio-server/releases/latest/download/kairoio-server-linux-amd64

# 設定執行權限
chmod +x kairoio-server-linux-amd64
mv kairoio-server-linux-amd64 kairoio-server

# 建立設定檔
cp config.yaml.example config.yaml

# 編輯設定（設定管理員帳密和資料庫連線）
vim config.yaml

# 啟動服務
./kairoio-server
```

### 方式二：使用 Docker Compose

```bash
# 複製專案
git clone https://github.com/Jaron0211/kairoio-server
cd kairoio-server

# 建立環境變數檔
cp .env.example .env
# 編輯 .env 檔案填入你的設定

# 啟動服務（包含 PostgreSQL 資料庫）
docker-compose up -d

# 查看執行日誌
docker-compose logs -f
```

### 方式三：從原始碼編譯

```bash
# 確認 Go 版本 (需要 1.24+)
go version

# 複製專案並編譯
git clone https://github.com/Jaron0211/kairoio-server
cd kairoio-server

# 使用預設設定編譯
make build

# 或自訂管理員帳密編譯
make build ADMIN_USER=myadmin ADMIN_PASS=mypassword

# 啟動服務
cd release
./kairoio-server
```

## 設定檔說明

### 最小設定 (config.yaml)

```yaml
server:
  host: "0.0.0.0"
  port: 8080
  read_timeout: 15s
  write_timeout: 15s
  idle_timeout: 60s

database:
  type: "sqlite"                    # 或 "postgres"
  dsn: "file:./data/kairoio.db"     # SQLite 檔案路徑

admin:
  username: "kairoio"               # 內建管理員帳號
  password: "kairoio"               # 內建管理員密碼

auth:
  password_cost: 12                 # bcrypt 加密強度
```

### PostgreSQL 設定

```yaml
database:
  type: "postgres"
  host: "localhost"
  port: "5432"
  user: "kairoio"
  password: "kairoio"
  database: "kairoio"
  max_connections: 25
  conn_max_lifetime: 5m
```

### 環境變數（可覆蓋 config.yaml 的設定）

```bash
export KAIROIO_SERVER_PORT=8080
export KAIROIO_DATABASE_TYPE=postgres
export KAIROIO_DATABASE_HOST=localhost
export KAIROIO_DATABASE_USER=kairoio
export KAIROIO_DATABASE_PASSWORD=secret
```

## 使用教學

### 1. 啟動伺服器

```bash
./kairoio-server
```

輸出範例：
```
KairoIO Server 1.0.0 (commit: abc1234, built: 2026-01-25_12:00:00)
Database migrations completed
Server starting on 0.0.0.0:8080
```

### 2. 登入（管理員帳號）

伺服器使用內建管理員帳號，設定在 `config.yaml` 或編譯時指定。

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "kairoio",
    "password": "kairoio"
  }'
```

回應：
```json
{
  "success": true,
  "data": {
    "message": "Login successful (Admin)",
    "account_id": "ADMIN-001",
    "certification_key": "ADMIN-CERT-KEY-PLACEHOLDER"
  }
}
```

**重要：請保存 `certification_key`，這是你後續所有 API 請求的 Bearer Token。**

### 3. 註冊機器人

```bash
TOKEN="你的-certification-key"

curl -X POST http://localhost:8080/api/v1/robots \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "robot_id": "robot_001",
    "robot_type": "mobile_robot",
    "robot_name": "巡邏機器人 1 號"
  }'
```

回應：
```json
{
  "success": true,
  "data": {
    "message": "Robot registered successfully",
    "robot_id": "robot_001"
  }
}
```

### 4. 更新機器人狀態

```bash
curl -X POST http://localhost:8080/api/v1/robots/robot_001/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": {
      "status": "active",
      "battery_level": 85,
      "global_position": {
        "latitude": 25.033,
        "longitude": 121.565
      },
      "local_position": {
        "x": 10.5,
        "y": 5.2,
        "yaw": 1.57
      },
      "sensor_overview": [
        {"sensor_id": "temp", "value": 25.5, "unit": "C"},
        {"sensor_id": "lidar", "value": 2.5, "unit": "m"}
      ]
    }
  }'
```

### 5. 取得機器人狀態

```bash
curl http://localhost:8080/api/v1/robots/robot_001/status \
  -H "Authorization: Bearer $TOKEN"
```

### 6. 列出所有機器人

```bash
curl http://localhost:8080/api/v1/robots \
  -H "Authorization: Bearer $TOKEN"
```

### 7. 取得機器人軌跡

```bash
curl "http://localhost:8080/api/v1/robots/robot_001/trajectory?start=2026-01-01T00:00:00Z&end=2026-01-31T23:59:59Z" \
  -H "Authorization: Bearer $TOKEN"
```

### 8. 提交告警

```bash
curl -X POST http://localhost:8080/api/v1/robots/robot_001/alert \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "alert_type": "low_battery",
    "severity": "warning",
    "message": "電池電量低於 20%"
  }'
```

### 9. 查詢告警

```bash
# 查詢所有告警
curl http://localhost:8080/api/v1/alerts \
  -H "Authorization: Bearer $TOKEN"

# 篩選條件查詢
curl "http://localhost:8080/api/v1/alerts?status=active&severity=warning" \
  -H "Authorization: Bearer $TOKEN"
```

### 10. 發送控制命令

```bash
curl -X POST http://localhost:8080/api/v1/robots/robot_001/control \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "move_to",
    "parameters": {
      "x": 10.0,
      "y": 5.0
    }
  }'
```

### 11. 訂閱即時日誌 (SSE)

```bash
curl -N http://localhost:8080/api/v1/robots/robot_001/logs/subscribe \
  -H "Authorization: Bearer $TOKEN"
```

## API 端點總覽

### 公開端點
| 方法 | 端點 | 說明 |
|------|------|------|
| GET | `/health` | 健康檢查 |
| GET | `/version` | 伺服器版本 |
| GET | `/api/v1/config` | 公開設定 |
| POST | `/api/v1/auth/login` | 使用者登入 |
| GET | `/api/v1/schemas` | 列出 Schema |

### 機器人管理（需認證）
| 方法 | 端點 | 說明 |
|------|------|------|
| POST | `/api/v1/robots` | 註冊機器人 |
| GET | `/api/v1/robots` | 列出機器人 |
| GET | `/api/v1/robots/{id}/status` | 取得狀態 |
| POST | `/api/v1/robots/{id}/status` | 更新狀態 |
| GET | `/api/v1/robots/{id}/history` | 歷史狀態 |
| GET | `/api/v1/robots/{id}/trajectory` | 移動軌跡 |
| POST | `/api/v1/robots/{id}/alert` | 提交告警 |
| POST | `/api/v1/robots/{id}/logs` | 提交日誌 |
| GET | `/api/v1/robots/{id}/logs/subscribe` | SSE 訂閱 |
| POST | `/api/v1/robots/{id}/control` | 發送命令 |
| GET | `/api/v1/robots/{id}/token` | LiveKit Token |

### 告警管理（需認證）
| 方法 | 端點 | 說明 |
|------|------|------|
| GET | `/api/v1/alerts` | 列出告警 |
| POST | `/api/v1/alerts/{id}/acknowledge` | 確認告警 |
| POST | `/api/v1/alerts/{id}/resolve` | 解決告警 |

### 地圖管理（需認證）
| 方法 | 端點 | 說明 |
|------|------|------|
| POST | `/api/v1/map/upload` | 上傳地圖 |
| GET | `/api/v1/map/latest` | 最新地圖 |
| GET | `/api/v1/maps` | 列出地圖 |

## 健康檢查

```bash
curl http://localhost:8080/health
```

回應：
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-01-25T12:00:00Z"
  }
}
```

## 疑難排解

### 資料庫連線錯誤

1. 檢查 `config.yaml` 中的資料庫設定
2. SQLite：確認 `data/` 目錄存在
3. PostgreSQL：確認連線字串正確且資料庫已建立
4. 伺服器啟動時會自動重試資料庫連線 10 次

### 二進制檔案權限不足

```bash
chmod +x kairoio-server
```

### 連接埠已被使用

修改 `config.yaml` 中的連接埠，或使用環境變數：
```bash
KAIROIO_SERVER_PORT=8081 ./kairoio-server
```

### 檢視伺服器日誌

伺服器會記錄以下活動：
- 資料庫連線狀態
- Schema 載入
- Action 註冊初始化
- 告警引擎狀態
- API 請求

## 生產環境部署

### Systemd 服務（Linux）

建立 `/etc/systemd/system/kairoio.service`：

```ini
[Unit]
Description=KairoIO Server
After=network.target postgresql.service

[Service]
Type=simple
User=kairoio
WorkingDirectory=/opt/kairoio
ExecStart=/opt/kairoio/kairoio-server
Restart=always
RestartSec=10
Environment="KAIROIO_DATABASE_TYPE=postgres"
Environment="KAIROIO_DATABASE_HOST=localhost"

[Install]
WantedBy=multi-user.target
```

啟用並啟動服務：
```bash
sudo systemctl enable kairoio
sudo systemctl start kairoio
sudo systemctl status kairoio
```

### 反向代理（Nginx）

```nginx
server {
    listen 80;
    server_name api.kairoio.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # SSE 支援設定
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 86400s;
    }
}
```

## Makefile 指令

```bash
make build          # 編譯當前平台
make build-all      # 編譯所有平台
make test           # 執行測試
make test-coverage  # 測試覆蓋率報告（HTML）
make run            # 編譯並執行
make dev            # 開發模式（需安裝 air）
make docker         # 建立 Docker 映像
make release        # 建立發布套件
make help           # 顯示所有指令
```

## 相關文件

- **技術架構文件**: 參閱 [SERVER_ARCHITECTURE_ZH.md](SERVER_ARCHITECTURE_ZH.md)
- **英文快速入門**: 參閱 [QUICKSTART.md](QUICKSTART.md)

## 支援

- GitHub Issues: https://github.com/Jaron0211/kairoio-server/issues
- 技術文件: https://github.com/Jaron0211/kairoio-server/tree/main/docs
