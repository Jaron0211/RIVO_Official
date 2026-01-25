package config

import (
	"fmt"
	"strings"
	"time"

	"github.com/spf13/viper"
)

// Config holds all application configuration
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Auth     AuthConfig
	Email    EmailConfig
	Logging  LoggingConfig
	Features FeatureFlags
}

// ServerConfig holds HTTP server configuration
type ServerConfig struct {
	Host         string
	Port         int
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
	IdleTimeout  time.Duration
}

// DatabaseConfig holds database configuration
type DatabaseConfig struct {
	Type            string
	DSN             string
	Host            string
	Port            string
	User            string
	Password        string
	DBName          string
	MaxConnections  int
	MaxIdle         int
	ConnMaxLifetime time.Duration
}

// AuthConfig holds authentication configuration
type AuthConfig struct {
	TokenTTL     time.Duration
	PasswordCost int
}

// EmailConfig holds email service configuration
type EmailConfig struct {
	SMTPHost    string
	SMTPPort    int
	FromAddress string
	FromName    string
	Username    string
	Password    string
	CodeTTL     time.Duration
}

// LoggingConfig holds logging configuration
type LoggingConfig struct {
	Level  string
	Format string
}

// FeatureFlags holds feature toggles
type FeatureFlags struct {
	EmailVerificationRequired bool
	RobotQuotaEnabled         bool
	RateLimitingEnabled       bool
	RobotOfflineThreshold     time.Duration
}

// Load loads configuration from file and environment variables
func Load(configPath string) (*Config, error) {
	v := viper.New()

	// Set default values
	setDefaults(v)

	// Read config file if provided
	if configPath != "" {
		v.SetConfigFile(configPath)
		if err := v.ReadInConfig(); err != nil {
			return nil, fmt.Errorf("failed to read config file: %w", err)
		}
	}

	// Environment variables override config file
	v.SetEnvPrefix("KAIROIO")
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	v.AutomaticEnv()

	// Unmarshal into config struct
	var cfg Config
	if err := v.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	// Manually handle time.Duration fields (viper unmarshal doesn't handle them well)
	cfg.Server.ReadTimeout = v.GetDuration("server.read_timeout")
	cfg.Server.WriteTimeout = v.GetDuration("server.write_timeout")
	cfg.Server.IdleTimeout = v.GetDuration("server.idle_timeout")
	cfg.Database.ConnMaxLifetime = v.GetDuration("database.conn_max_lifetime")
	cfg.Auth.TokenTTL = v.GetDuration("auth.token_ttl")
	cfg.Email.CodeTTL = v.GetDuration("email.code_ttl")
	cfg.Features.RobotOfflineThreshold = v.GetDuration("features.robot_offline_threshold")

	return &cfg, nil
}

// setDefaults sets default configuration values
func setDefaults(v *viper.Viper) {
	// Server defaults
	v.SetDefault("server.host", "0.0.0.0")
	v.SetDefault("server.port", 8080)
	v.SetDefault("server.read_timeout", "15s")
	v.SetDefault("server.write_timeout", "15s")
	v.SetDefault("server.idle_timeout", "60s")

	// Database defaults
	v.SetDefault("database.type", "sqlite")
	v.SetDefault("database.dsn", "file:./data/kairoio.db?cache=shared&mode=rwc")
	v.SetDefault("database.host", "")
	v.SetDefault("database.port", "")
	v.SetDefault("database.user", "")
	v.SetDefault("database.password", "")
	v.SetDefault("database.database", "")
	v.SetDefault("database.max_connections", 25)
	v.SetDefault("database.max_idle", 5)
	v.SetDefault("database.conn_max_lifetime", "5m")

	// Auth defaults
	v.SetDefault("auth.token_ttl", "24h")
	v.SetDefault("auth.password_cost", 12)

	// Email defaults
	v.SetDefault("email.smtp_host", "smtp.gmail.com")
	v.SetDefault("email.smtp_port", 587)
	v.SetDefault("email.from_name", "KairoIO Server")
	v.SetDefault("email.code_ttl", "20m")

	// Logging defaults
	v.SetDefault("logging.level", "info")
	v.SetDefault("logging.format", "console")

	// Feature flags defaults
	v.SetDefault("features.email_verification_required", true)
	v.SetDefault("features.robot_quota_enabled", true)
	v.SetDefault("features.rate_limiting_enabled", true)
	v.SetDefault("features.robot_offline_threshold", "30s")
}
