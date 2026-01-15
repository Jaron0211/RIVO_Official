# Prompt for Next Agent: KairoIO Go Server Maintenance

## Context

You are inheriting the **KairoIO Go Server** project, a production-ready IoT platform written in Go. This is a complete rewrite from Java/Spark to provide better performance, cleaner architecture, and easier deployment.

**Project Location**: `/home/jaron0211/workspace/KairoIO_Server_Go`

## Your Role

You are responsible for:
- Maintaining and debugging the server
- Adding new features
- Fixing bugs
- Optimizing performance
- Helping with deployment issues

## Essential Information

### Quick Start

1. **Project Structure Understanding**:
   ```
   source/cmd/kairoio-server/main.go    # Entry point
   source/internal/api/                  # HTTP handlers
   source/internal/database/             # Database layer
   source/internal/models/               # Data models
   release/                              # Compiled binaries
   ```

2. **Build & Run**:
   ```bash
   cd /home/jaron0211/workspace/KairoIO_Server_Go
   make build
   cd release && ./kairoio-server-linux-amd64
   ```

3. **Test Server**:
   ```bash
   curl http://localhost:8080/health
   ```

### Architecture Overview

**Tech Stack**:
- **Language**: Go 1.21+
- **Router**: Chi (lightweight HTTP router)
- **Database**: GORM (supports PostgreSQL/SQLite)
- **Config**: Viper (file + environment variables)
- **Auth**: bcrypt password hashing + certification keys
- **Email**: gomail v2 (SMTP)

**Request Flow**:
```
Client → Chi Router → Middleware (auth, logging) → Handler → Repository → GORM → Database
```

**Database Models**:
- `accounts` - User accounts with email verification
- `robots` - Registered IoT devices
- `robot_statuses` - Time-series status data
- `email_verification_codes` - Email verification tokens

### API Endpoints

**Public** (no auth required):
```
POST /api/v1/auth/register/send-code   # Send email verification
POST /api/v1/auth/register              # Create account
POST /api/v1/auth/login                 # Login
GET  /health                            # Health check
GET  /version                           # Version info
```

**Protected** (require Authorization: Bearer <cert_key>):
```
POST /api/v1/robots                     # Register robot
GET  /api/v1/robots                     # List user's robots
POST /api/v1/robots/{id}/status         # Update robot status
GET  /api/v1/robots/{id}/status         # Get latest status
```

### Common Tasks

#### Adding New API Endpoint

1. Add handler function in `source/internal/api/robot.go` or `auth.go`
2. Register route in `source/internal/api/router.go`
3. Add repository method in `source/internal/database/repository.go` (if DB access needed)
4. Rebuild: `make build`

#### Debugging

**Enable debug logs**:
Edit `release/config.yaml`:
```yaml
logging:
  level: "debug"
```

**View logs**:
```bash
./kairoio-server 2>&1 | tee server.log
tail -f server.log
```

**Database inspection** (SQLite):
```bash
sqlite3 release/data/kairoio.db
.tables
SELECT * FROM accounts;
.quit
```

#### Common Issues

**Port 8080 already in use**:
```bash
lsof -i :8080
kill -9 <PID>
# Or change port
KAIROIO_SERVER_PORT=8081 ./kairoio-server
```

**Email not sending**:
- Check SMTP credentials in `config.yaml`
- For Gmail: Use App Password, not regular password
- Check logs for email errors

**Build errors**:
```bash
make clean
cd source && /usr/local/go/bin/go mod tidy
make build
```

### Key Files Reference

| File | Purpose | When to Edit |
|------|---------|--------------|
| `main.go` | App startup, component wiring | Rarely - only for major changes |
| `router.go` | API routes definition | Adding new endpoints |
| `auth.go` | Authentication handlers | Login/registration changes |
| `robot.go` | Robot management handlers | Robot API changes |
| `repository.go` | Database operations | New queries or DB logic |
| `models/*.go` | Data structures | Schema changes |
| `config.go` | Configuration | New config options |
| `Makefile` | Build automation | Build process changes |

### Testing Workflow

1. **Build**: `make build`
2. **Run**: `cd release && ./kairoio-server-linux-amd64 &`
3. **Health check**: `curl http://localhost:8080/health`
4. **Register account**:
   ```bash
   # Send code
   curl -X POST http://localhost:8080/api/v1/auth/register/send-code \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com"}'
   
   # Register (use code from email or logs)
   curl -X POST http://localhost:8080/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"Test123","code":"123456"}'
   ```
5. **Test robot endpoints** (save cert_key from registration response)

### Configuration

**File**: `release/config.yaml`

**Critical settings**:
- `server.port` - HTTP port (default 8080)
- `database.type` - "postgres" or "sqlite"
- `database.dsn` - Connection string
- `email.*` - SMTP settings for verification emails

**Environment override**:
```bash
KAIROIO_SERVER_PORT=9000
KAIROIO_DATABASE_DSN="postgres://..."
KAIROIO_EMAIL_USERNAME="user@gmail.com"
```

### Git Repository

**Recent commits**:
```bash
cd /home/jaron0211/workspace/KairoIO_Server_Go
git log --oneline -10
```

**All changes are committed with detailed messages** - read git history for context on any code.

### Documentation

**Full guides available**:
- `MAINTENANCE_GUIDE.md` - **READ THIS FIRST** (comprehensive maintenance guide)
- `README.md` - Project overview
- `docs/QUICKSTART.md` - Quick start guide
- `release/README.md` - Release distribution guide

### Expected Behavior

**Healthy server**:
- Starts in < 2 seconds
- Health endpoint responds in < 10ms
- Database migrations run automatically on startup
- Logs show "Server starting on 0.0.0.0:8080"

**Normal logs**:
```
KairoIO Server 1.0.0 (commit: abc123, built: 2026-01-15)
Database migrations completed
Warning: Email service not configured (if not configured)
Server starting on 0.0.0.0:8080
```

### When Something Goes Wrong

1. **Check logs** - Most issues show clear error messages
2. **Verify config** - Syntax errors in YAML are common
3. **Test database** - Connection issues are frequent
4. **Check ports** - Port conflicts are easy to miss
5. **Read git history** - Recent changes might provide clues
6. **Reference MAINTENANCE_GUIDE.md** - Detailed debugging section

### Build Artifacts

**Binaries available** (in `release/`):
- `kairoio-server-linux-amd64` - Linux x86_64 (tested, working)
- `kairoio-server-linux-arm64` - Linux ARM (Raspberry Pi)
- `kairoio-server-darwin-amd64` - macOS Intel
- `kairoio-server-darwin-arm64` - macOS Apple Silicon
- `kairoio-server-windows-amd64.exe` - Windows

### Performance Expectations

- **Response time**: < 10ms (p95) for most endpoints
- **Memory usage**: ~50-100MB
- **Binary size**: ~15MB per platform
- **Startup time**: < 2 seconds
- **Concurrent connections**: 1000+

## Your Mission

Start by:
1. Reading `/home/jaron0211/.gemini/antigravity/brain/.../MAINTENANCE_GUIDE.md`
2. Building the project: `cd /home/jaron0211/workspace/KairoIO_Server_Go && make build`
3. Running the server: `cd release && ./kairoio-server-linux-amd64`
4. Testing health endpoint: `curl http://localhost:8080/health`
5. Reviewing the codebase structure in `source/`

**The codebase is clean, well-documented, and production-ready. All core features work. Good luck!** 🚀

---

## Quick Command Reference

```bash
# Navigate to project
cd /home/jaron0211/workspace/KairoIO_Server_Go

# Build
make build

# Run
cd release && ./kairoio-server-linux-amd64

# Test
curl http://localhost:8080/health

# View database
sqlite3 release/data/kairoio.db "SELECT * FROM accounts;"

# Stop server
pkill kairoio-server

# View logs
./kairoio-server 2>&1 | tee server.log
```

**Go binary location**: `/usr/local/go/bin/go`
