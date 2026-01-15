package models

import (
	"time"
)

// Account represents a user account
type Account struct {
	ID               string    `gorm:"primaryKey;column:id" json:"id"`
	Email            string    `gorm:"uniqueIndex;not null;column:email" json:"email"`
	PasswordHash     string    `gorm:"not null;column:password_hash" json:"-"`
	CertificationKey string    `gorm:"uniqueIndex;not null;column:certification_key" json:"certification_key,omitempty"`
	EmailVerified    bool      `gorm:"default:false;column:email_verified" json:"email_verified"`
	CreatedAt        time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt        time.Time `gorm:"column:updated_at" json:"updated_at"`

	// Relations
	Robots []Robot `gorm:"foreignKey:AccountID" json:"robots,omitempty"`
}

// TableName specifies the table name for Account
func (Account) TableName() string {
	return "accounts"
}

// EmailVerificationCode stores email verification codes
type EmailVerificationCode struct {
	Email     string    `gorm:"primaryKey;column:email" json:"email"`
	Code      string    `gorm:"not null;column:code" json:"code"`
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
	ExpiresAt time.Time `gorm:"column:expires_at" json:"expires_at"`
	Verified  bool      `gorm:"default:false;column:verified" json:"verified"`
}

// TableName specifies the table name for EmailVerificationCode
func (EmailVerificationCode) TableName() string {
	return "email_verification_codes"
}
