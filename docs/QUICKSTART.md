# KairoIO Server - Quick Start Guide

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

# Edit config (set database and email)
vim config.yaml

# Run
./kairoio-server
```

### Option 2: Docker

```bash
# Clone repository
git clone https://github.com/Jaron0211/kairoio-server
cd kairoio-server

# Create .env file
cp .env.example .env
# Edit .env with your credentials

# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

### Option 3: Build from Source

```bash
# Prerequisites: Go 1.21+
go version

# Clone and build
git clone https://github.com/Jaron0211/kairoio-server
cd kairoio-server
make build

# Run
cd release
./kairoio-server
```

## Configuration

### Minimal config.yaml

```yaml
server:
  port: 8080

database:
  type: "sqlite"
  dsn: "file:./data/kairoio.db"

email:
  smtp_host: "smtp.gmail.com"
  smtp_port: 587
  username: "your-email@gmail.com"
  password: "your-app-password"
  from_address: "your-email@gmail.com"
```

### Environment Variables (Override config.yaml)

```bash
export KAIROIO_SERVER_PORT=8080
export KAIROIO_EMAIL_USERNAME="your-email@gmail.com"
export KAIROIO_EMAIL_PASSWORD="your-app-password"
```

## Usage

### 1. Start Server

```bash
./kairoio-server
```

Output:
```
KairoIO Server 1.0.0
Database migrations completed
Server starting on 0.0.0.0:8080
```

### 2. Register Account

```bash
# Send verification code
curl -X POST http://localhost:8080/api/v1/auth/register/send-code \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Check your email for the 6-digit code

# Register with code
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"SecurePass123",
    "code":"123456"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "message": "Account created successfully",
    "account_id": "ACC-20260115-120000",
    "certification_key": "abc123def456..."
  }
}
```

### 3. Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username":"test@example.com",
    "password":"SecurePass123"
  }'
```

### 4. Register Robot

```bash
# Save your certification_key from registration/login
TOKEN="abc123def456..."

curl -X POST http://localhost:8080/api/v1/robots \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "robot_id":"ROBOT001",
    "robot_type":"RaspberryPi4",
    "robot_name":"My First Robot"
  }'
```

### 5. Update Robot Status

```bash
curl -X POST http://localhost:8080/api/v1/robots/ROBOT001/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": {
      "battery": 85.5,
      "temperature": 45.2,
      "gps": {"lat": 25.033, "lon": 121.565},
      "sensors": {
        "ultrasonic": 120,
        "ir": 50
      }
    }
  }'
```

### 6. Get Robot Status

```bash
curl http://localhost:8080/api/v1/robots/ROBOT001/status \
  -H "Authorization: Bearer $TOKEN"
```

### 7. List All Robots

```bash
curl http://localhost:8080/api/v1/robots \
  -H "Authorization: Bearer $TOKEN"
```

## Supported Robot Types

- `ArduinoUno`
- `ArduinoMega`
- `RaspberryPi3`
- `RaspberryPi4`
- `ESP32`
- `ESP8266`
- `PatrolBot`
- `CleaningRobot`

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
    "timestamp": "2026-01-15T21:30:00Z"
  }
}
```

## Troubleshooting

### Email Not Sending

1. Check SMTP credentials in config.yaml
2. For Gmail: Use App Password, not regular password
3. Enable less secure app access or 2FA with app password

### Database Connection Error

1. Check DSN in config.yaml
2. For SQLite: Ensure data directory exists
3. For PostgreSQL: Verify connection string and database exists

### Permission Denied (Binary)

```bash
chmod +x kairoio-server
```

### Port Already in Use

Change port in config.yaml or use environment variable:
```bash
KAIROIO_SERVER_PORT=8081 ./kairoio-server
```

## Production Deployment

### Systemd Service (Linux)

Create `/etc/systemd/system/kairoio.service`:

```ini
[Unit]
Description=KairoIO Server
After=network.target

[Service]
Type=simple
User=kairoio
WorkingDirectory=/opt/kairoio
ExecStart=/opt/kairoio/kairoio-server
Restart=always
RestartSec=10

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
    }
}
```

## API Documentation

Full API documentation: [docs/API.md](docs/API.md)

## Support

- GitHub Issues: https://github.com/Jaron0211/kairoio-server/issues
- Documentation: https://github.com/Jaron0211/kairoio-server/tree/main/docs
