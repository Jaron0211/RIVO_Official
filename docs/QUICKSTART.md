# KairoIO Server - Quick Start Guide

## Prerequisites

- Go 1.24+ (for building from source)
- PostgreSQL 14+ (recommended) or SQLite
- Docker & Docker Compose (optional)

## Installation

### Option 1: Binary Release (Recommended)

```bash
# Download binary for your system
wget https://github.com/Jaron0211/kairoio-server/releases/latest/download/kairoio-server-linux-amd64

# Make executable
chmod +x kairoio-server-linux-amd64
mv kairoio-server-linux-amd64 kairoio-server

# Create config
cp config.yaml.example config.yaml

# Edit config (set admin credentials and database)
vim config.yaml

# Run
./kairoio-server
```

### Option 2: Docker Compose

```bash
# Clone repository
git clone https://github.com/Jaron0211/kairoio-server
cd kairoio-server

# Create .env file
cp .env.example .env
# Edit .env with your credentials

# Start with Docker Compose (includes PostgreSQL)
docker-compose up -d

# View logs
docker-compose logs -f
```

### Option 3: Build from Source

```bash
# Prerequisites: Go 1.24+
go version

# Clone and build
git clone https://github.com/Jaron0211/kairoio-server
cd kairoio-server

# Build with default settings
make build

# Or build with custom admin credentials
make build ADMIN_USER=myadmin ADMIN_PASS=mypassword

# Run
cd release
./kairoio-server
```

## Configuration

### Minimal config.yaml

```yaml
server:
  host: "0.0.0.0"
  port: 8080
  read_timeout: 15s
  write_timeout: 15s
  idle_timeout: 60s

database:
  type: "sqlite"                    # or "postgres"
  dsn: "file:./data/kairoio.db"     # SQLite file path

admin:
  username: "kairoio"               # Built-in admin username
  password: "kairoio"               # Built-in admin password

auth:
  password_cost: 12                 # bcrypt cost factor
```

### PostgreSQL Configuration

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

### Environment Variables (Override config.yaml)

```bash
export KAIROIO_SERVER_PORT=8080
export KAIROIO_DATABASE_TYPE=postgres
export KAIROIO_DATABASE_HOST=localhost
export KAIROIO_DATABASE_USER=kairoio
export KAIROIO_DATABASE_PASSWORD=secret
```

## Usage

### 1. Start Server

```bash
./kairoio-server
```

Output:
```
KairoIO Server 1.0.0 (commit: abc1234, built: 2026-01-25_12:00:00)
Database migrations completed
Server starting on 0.0.0.0:8080
```

### 2. Login (Admin Account)

The server uses a built-in admin account configured in `config.yaml` or via build flags.

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "kairoio",
    "password": "kairoio"
  }'
```

Response:
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

**Save the `certification_key` - this is your Bearer token for all API requests.**

### 3. Register Robot

```bash
TOKEN="your-certification-key"

curl -X POST http://localhost:8080/api/v1/robots \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "robot_id": "robot_001",
    "robot_type": "mobile_robot",
    "robot_name": "Patrol Bot 1"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "message": "Robot registered successfully",
    "robot_id": "robot_001"
  }
}
```

### 4. Update Robot Status

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

### 5. Get Robot Status

```bash
curl http://localhost:8080/api/v1/robots/robot_001/status \
  -H "Authorization: Bearer $TOKEN"
```

### 6. List All Robots

```bash
curl http://localhost:8080/api/v1/robots \
  -H "Authorization: Bearer $TOKEN"
```

### 7. Get Robot Trajectory

```bash
curl "http://localhost:8080/api/v1/robots/robot_001/trajectory?start=2026-01-01T00:00:00Z&end=2026-01-31T23:59:59Z" \
  -H "Authorization: Bearer $TOKEN"
```

### 8. Submit Alert

```bash
curl -X POST http://localhost:8080/api/v1/robots/robot_001/alert \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "alert_type": "low_battery",
    "severity": "warning",
    "message": "Battery level below 20%"
  }'
```

### 9. List Alerts

```bash
# All alerts
curl http://localhost:8080/api/v1/alerts \
  -H "Authorization: Bearer $TOKEN"

# Filter by status and severity
curl "http://localhost:8080/api/v1/alerts?status=active&severity=warning" \
  -H "Authorization: Bearer $TOKEN"
```

### 10. Send Control Command

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

### 11. Subscribe to Logs (SSE)

```bash
curl -N http://localhost:8080/api/v1/robots/robot_001/logs/subscribe \
  -H "Authorization: Bearer $TOKEN"
```

## API Endpoints Overview

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/version` | Server version |
| GET | `/api/v1/config` | Public config |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/schemas` | List schemas |

### Robot Management (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/robots` | Register robot |
| GET | `/api/v1/robots` | List robots |
| GET | `/api/v1/robots/{id}/status` | Get status |
| POST | `/api/v1/robots/{id}/status` | Update status |
| GET | `/api/v1/robots/{id}/history` | Status history |
| GET | `/api/v1/robots/{id}/trajectory` | Movement path |
| POST | `/api/v1/robots/{id}/alert` | Submit alert |
| POST | `/api/v1/robots/{id}/logs` | Submit log |
| GET | `/api/v1/robots/{id}/logs/subscribe` | SSE logs |
| POST | `/api/v1/robots/{id}/control` | Send command |
| GET | `/api/v1/robots/{id}/token` | LiveKit token |

### Alert Management (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/alerts` | List alerts |
| POST | `/api/v1/alerts/{id}/acknowledge` | Acknowledge |
| POST | `/api/v1/alerts/{id}/resolve` | Resolve |

### Map Management (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/map/upload` | Upload map |
| GET | `/api/v1/map/latest` | Latest map |
| GET | `/api/v1/maps` | List maps |

## Health Check

```bash
curl http://localhost:8080/health
```

Response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-01-25T12:00:00Z"
  }
}
```

## Troubleshooting

### Database Connection Error

1. Check database configuration in `config.yaml`
2. For SQLite: Ensure `data/` directory exists
3. For PostgreSQL: Verify connection string and database exists
4. Server retries database connection 10 times on startup

### Permission Denied (Binary)

```bash
chmod +x kairoio-server
```

### Port Already in Use

Change port in `config.yaml` or use environment variable:
```bash
KAIROIO_SERVER_PORT=8081 ./kairoio-server
```

### Check Server Logs

The server logs all activities including:
- Database connection status
- Schema loading
- Action registry initialization
- Alert engine status
- API requests

## Production Deployment

### Systemd Service (Linux)

Create `/etc/systemd/system/kairoio.service`:

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

Enable and start:
```bash
sudo systemctl enable kairoio
sudo systemctl start kairoio
sudo systemctl status kairoio
```

### Reverse Proxy (Nginx)

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

        # SSE support
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 86400s;
    }
}
```

## Makefile Commands

```bash
make build          # Build for current platform
make build-all      # Build for all platforms
make test           # Run tests
make test-coverage  # Run tests with HTML coverage
make run            # Build and run
make dev            # Run with hot reload (requires air)
make docker         # Build Docker image
make release        # Create release package
make help           # Show all commands
```

## Documentation

- **Server Architecture**: See `docs/SERVER_ARCHITECTURE.md`
- **API Reference**: See `docs/SERVER_ARCHITECTURE.md#9-api-reference`

## Support

- GitHub Issues: https://github.com/Jaron0211/kairoio-server/issues
- Documentation: https://github.com/Jaron0211/kairoio-server/tree/main/docs
