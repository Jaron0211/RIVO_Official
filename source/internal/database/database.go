package database

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/Jaron0211/kairoio-server/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Database wraps the GORM database connection
type Database struct {
	DB *gorm.DB
}

// Config holds database configuration
type Config struct {
	Type            string // "postgres" or "sqlite"
	DSN             string // Data Source Name
	Host            string
	Port            string
	User            string
	Password        string
	DBName          string
	MaxConnections  int
	MaxIdle         int
	ConnMaxLifetime time.Duration
	LogLevel        string // "silent", "error", "warn", "info"
}

// NewDatabase creates a new database connection
func NewDatabase(cfg Config) (*Database, error) {
	var (
		db  *gorm.DB
		err error
	)

	// Configure logger
	logLevel := logger.Silent
	switch cfg.LogLevel {
	case "error":
		logLevel = logger.Error
	case "warn":
		logLevel = logger.Warn
	case "info":
		logLevel = logger.Info
	}

	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	}

	// Connect based on type
	switch cfg.Type {
	case "postgres":
		dsn := cfg.DSN
		if dsn == "" || (!strings.HasPrefix(dsn, "postgres://") && !strings.HasPrefix(dsn, "postgresql://") && !strings.Contains(dsn, "host=")) {
			// Construct DSN from components
			host := cfg.Host
			if host == "" {
				host = "localhost"
			}
			port := cfg.Port
			if port == "" {
				port = "5432"
			}
			user := cfg.User
			if user == "" {
				user = "postgres"
			}
			dbname := cfg.DBName
			if dbname == "" {
				dbname = "postgres"
			}
			dsn = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Shanghai",
				host, user, cfg.Password, dbname, port)
		}
		db, err = gorm.Open(postgres.Open(dsn), gormConfig)
	case "sqlite":
		// Ensure directory exists for sqlite
		// Standard SQLite DSN format: file:path/to/db.db?options or just path/to/db.db
		dbPath := cfg.DSN
		if strings.HasPrefix(dbPath, "file:") {
			dbPath = strings.TrimPrefix(dbPath, "file:")
		}
		if idx := strings.Index(dbPath, "?"); idx != -1 {
			dbPath = dbPath[:idx]
		}

		dbDir := filepath.Dir(dbPath)
		if dbDir != "." && dbDir != "/" {
			if err := os.MkdirAll(dbDir, 0755); err != nil {
				return nil, fmt.Errorf("failed to create database directory: %w", err)
			}
		}

		db, err = gorm.Open(sqlite.Open(cfg.DSN), gormConfig)
	default:
		return nil, fmt.Errorf("unsupported database type: %s", cfg.Type)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get database instance: %w", err)
	}

	sqlDB.SetMaxOpenConns(cfg.MaxConnections)
	sqlDB.SetMaxIdleConns(cfg.MaxIdle)
	sqlDB.SetConnMaxLifetime(cfg.ConnMaxLifetime)

	log.Printf("Database connected: type=%s", cfg.Type)

	return &Database{DB: db}, nil
}

// AutoMigrate runs database migrations
func (d *Database) AutoMigrate() error {
	return d.DB.AutoMigrate(
		&models.Account{},
		&models.Robot{},
		&models.RobotStatus{},
		&models.RobotLog{},
		&models.EmailVerificationCode{},
	)
}

// Close closes the database connection
func (d *Database) Close() error {
	sqlDB, err := d.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

// Health checks database health
func (d *Database) Health() error {
	sqlDB, err := d.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Ping()
}
