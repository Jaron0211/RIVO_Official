# KairoIO Server v1.0.0 - Release Notes

## Download

Choose the binary for your operating system:

### Linux
- **AMD64**: `kairoio-server-linux-amd64` (most common, x86_64)
- **ARM64**: `kairoio-server-linux-arm64` (Raspberry Pi 4, ARM servers)

### macOS
- **AMD64**: `kairoio-server-darwin-amd64` (Intel Macs)
- **ARM64**: `kairoio-server-darwin-arm64` (Apple Silicon M1/M2/M3/M4)

### Windows
- **AMD64**: `kairoio-server-windows-amd64.exe`

## Quick Start

### 1. Setup

```bash
# Make executable (Linux/macOS)
chmod +x kairoio-server-*

# Copy configuration
cp config.yaml.example config.yaml

# Create data directory (for SQLite)
mkdir -p data
```

### 2. Configure Admin Account

Edit `config.yaml`:

```yaml
admin:
  username: "kairoio"      # Change this
  password: "kairoio"      # Change this

database:
  type: "sqlite"
  dsn: "file:./data/kairoio.db"
```

### 3. Run

```bash
# Linux/macOS
./kairoio-server-linux-amd64

# Windows
kairoio-server-windows-amd64.exe
```

### 4. Test

```bash
# Health check
curl http://localhost:8080/health

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"kairoio","password":"kairoio"}'
```

## Features

### Core Features
- **Robot Fleet Management**: Register, monitor, and control multiple robots
- **Real-time Status Updates**: Track robot position, battery, sensors
- **Flexible Status Schema**: Store any JSON data structure
- **Multi-tenancy**: Account-based resource isolation

### API Features
- **RESTful API**: Full CRUD operations for robots
- **SSE Log Streaming**: Real-time log subscription
- **Alert System**: Submit, acknowledge, and resolve alerts
- **Map Management**: Upload and retrieve PGM navigation maps
- **Control Actions**: Send commands with dynamic action registry
- **Trajectory Tracking**: Query historical movement paths

### Technical Features
- **Database Support**: PostgreSQL (recommended) or SQLite
- **Embedded Schemas**: JSON schemas for validation
- **LiveKit Integration**: WebRTC video streaming tokens
- **Data Retention**: Automatic cleanup of old status records (30 days)
- **Graceful Shutdown**: Clean server termination
- **Database Retry**: Auto-retry connection on startup

## Configuration Options

### Database

**SQLite** (default, no setup required):
```yaml
database:
  type: "sqlite"
  dsn: "file:./data/kairoio.db?cache=shared&mode=rwc"
```

**PostgreSQL** (production recommended):
```yaml
database:
  type: "postgres"
  host: "localhost"
  port: "5432"
  user: "kairoio"
  password: "your-password"
  database: "kairoio"
  max_connections: 25
  conn_max_lifetime: 5m
```

### Server

```yaml
server:
  host: "0.0.0.0"
  port: 8080
  read_timeout: 15s
  write_timeout: 15s
  idle_timeout: 60s
```

### Environment Variables

Override any config with environment variables:

```bash
export KAIROIO_SERVER_PORT=8080
export KAIROIO_DATABASE_TYPE=postgres
export KAIROIO_DATABASE_HOST=localhost
export KAIROIO_DATABASE_USER=kairoio
export KAIROIO_DATABASE_PASSWORD=secret
export KAIROIO_DATABASE_NAME=kairoio
```

## Build-time Configuration

Credentials can be embedded at build time:

```bash
make build \
  ADMIN_USER=myadmin \
  ADMIN_PASS=mypassword \
  DATABASE_TYPE=postgres \
  DATABASE_HOST=db.example.com \
  DATABASE_USER=kairoio \
  DATABASE_PASSWORD=secret \
  DATABASE_NAME=kairoio
```

## Docker Deployment

### Using Docker Compose

```bash
# Start server with PostgreSQL
docker-compose up -d

# View logs
docker-compose logs -f kairoio-server
```

### Manual Docker Run

```bash
docker run -d \
  -p 8080:8080 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/config.yaml:/app/config.yaml \
  -e KAIROIO_DATABASE_TYPE=sqlite \
  kairoio-server:latest
```

## API Endpoints

### Public
| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `GET /version` | Server version |
| `POST /api/v1/auth/login` | Login |
| `GET /api/v1/schemas` | List schemas |

### Protected (Bearer Token Required)
| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/robots` | Register robot |
| `GET /api/v1/robots` | List robots |
| `GET /api/v1/robots/{id}/status` | Get status |
| `POST /api/v1/robots/{id}/status` | Update status |
| `GET /api/v1/robots/{id}/history` | Status history |
| `GET /api/v1/robots/{id}/trajectory` | Movement path |
| `POST /api/v1/robots/{id}/alert` | Submit alert |
| `POST /api/v1/robots/{id}/logs` | Submit log |
| `GET /api/v1/robots/{id}/logs/subscribe` | SSE logs |
| `POST /api/v1/robots/{id}/control` | Send command |
| `GET /api/v1/robots/{id}/control/logs` | Action history |
| `GET /api/v1/robots/{id}/token` | LiveKit token |
| `GET /api/v1/alerts` | List alerts |
| `POST /api/v1/alerts/{id}/acknowledge` | Acknowledge |
| `POST /api/v1/alerts/{id}/resolve` | Resolve |
| `POST /api/v1/map/upload` | Upload map |
| `GET /api/v1/map/latest` | Latest map |
| `GET /api/v1/maps` | List maps |
| `GET /api/v1/actions` | List actions |
| `POST /api/v1/actions` | Register action |

## System Requirements

- **RAM**: 128MB minimum, 512MB recommended
- **Disk**: 50MB for binary, 100MB+ for database
- **OS**: Linux (any), macOS 10.15+, Windows 10+
- **Network**: Port 8080 (configurable)

## Security Notes

- Change default admin credentials before deployment
- Use HTTPS in production (reverse proxy recommended)
- Backup database regularly
- Use strong passwords
- Consider PostgreSQL for production workloads

## Troubleshooting

**Server won't start**:
- Check port 8080 is available: `netstat -tuln | grep 8080`
- View logs for errors
- Verify config.yaml syntax

**Database errors**:
- Ensure `data/` directory exists (SQLite)
- Verify PostgreSQL credentials and database exists
- Server retries connection 10 times on startup

**Authentication fails**:
- Check admin credentials in config.yaml
- Ensure username/password match exactly

## Documentation

- **Quick Start**: `docs/QUICKSTART.md`
- **Server Architecture**: `docs/SERVER_ARCHITECTURE.md`

## Support

- **Issue Tracker**: https://github.com/Jaron0211/kairoio-server/issues
- **Documentation**: https://github.com/Jaron0211/kairoio-server/tree/main/docs

## License

MIT License - See LICENSE file for details

---

**Version**: 1.0.0
**Build Date**: 2026-01-25
**Go Version**: 1.24.0
