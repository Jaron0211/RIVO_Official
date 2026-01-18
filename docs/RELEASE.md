# KairoIO Server v1.0.0 - Release Package

## 📦 Download

Choose the binary for your operating system:

### Linux
- **AMD64**: `kairoio-server-linux-amd64` (most common, x86_64)
- **ARM64**: `kairoio-server-linux-arm64` (Raspberry Pi 4, ARM servers)

### macOS  
- **AMD64**: `kairoio-server-darwin-amd64` (Intel Macs)
- **ARM64**: `kairoio-server-darwin-arm64` (Apple Silicon M1/M2/M3)

### Windows
- **AMD64**: `kairoio-server-windows-amd64.exe`

## 🚀 Quick Start (5 minutes)

### 1. Setup

```bash
# Make executable (Linux/macOS)
chmod +x kairoio-server-*

# Copy configuration
cp config.yaml.example config.yaml

# Create data directory
mkdir -p data
```

### 2. Configure Email (Required for registration)

Edit `config.yaml`:

```yaml
email:
  smtp_host: "smtp.gmail.com"
  smtp_port: 587
  username: "your-email@gmail.com"
  password: "your-app-password"  # For Gmail: https://support.google.com/accounts/answer/185833
  from_address: "your-email@gmail.com"
```

###3. Run

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

# Should return: {"success":true,"data":{"status":"healthy",...}}
```

## 📖 Full Documentation

- **Quick Start**: See `docs/QUICKSTART.md`
- **API Reference**: See `docs/API.md`  
- **Deployment Guide**: See `docs/DEPLOYMENT.md`

## 🔧 Configuration Options

### Database

**SQLite** (default, no setup required):
```yaml
database:
  type: "sqlite"
  dsn: "file:./data/kairoio.db"
```

**PostgreSQL** (production recommended):
```yaml
database:
  type: "postgres"
  dsn: "postgres://user:pass@localhost:5432/kairoio"
```

### Environment Variables (override config.yaml)

```bash
export KAIROIO_SERVER_PORT=8080
export KAIROIO_DATABASE_DSN="postgres://..."
export KAIROIO_EMAIL_USERNAME="..."
export KAIROIO_EMAIL_PASSWORD="..."
```

## 🐳 Docker Deployment

```bash
# Using Docker Compose
docker-compose up -d

# Or manually
docker run -d \
  -p 8080:8080 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/config.yaml:/app/config.yaml \
  -e KAIROIO_EMAIL_USERNAME="..." \
  -e KAIROIO_EMAIL_PASSWORD="..." \
  kairoio-server:latest
```

## 📊 System Requirements

- **RAM**: 128MB minimum, 512MB recommended
- **Disk**: 50MB for binary, 100MB+ for database
- **OS**: Linux (any), macOS 10.13+, Windows 10+
- **Network**: Port 8080 (configurable)

## 🔐 Security Notes

- Change default passwords in `config.yaml`
- Use HTTPS in production (reverse proxy recommended)
- Backup database regularly (`data/` directory)
- Keep email credentials secure
- Use strong passwords for accounts

## 🆘 Troubleshooting

**Server won't start**:
- Check port 8080 is available: `netstat -tuln | grep 8080`
- View logs: `./kairoio-server 2>&1 | tee server.log`
- Verify config.yaml syntax

**Email not sending**:
- Test SMTP credentials with `telnet smtp.gmail.com 587`
- For Gmail: Enable "Less secure app access" or use App Password
- Check no firewall blocking outbound port 587

**Database errors**:
- Ensure `data/` directory exists and is writable
- For PostgreSQL: Verify database exists and credentials are correct

## 📞 Support

- **Issue Tracker**: https://github.com/Jaron0211/kairoio-server/issues
- **Documentation**: https://github.com/Jaron0211/kairoio-server/tree/main/docs
- **Email**: support@kairoio.com

## 📄 License

MIT License - See LICENSE file for details

---

**Version**: 1.0.0  
**Build Date**: 2026-01-15  
**Go Version**: 1.21.6
