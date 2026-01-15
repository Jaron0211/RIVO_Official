package email

import (
	"fmt"

	"gopkg.in/gomail.v2"
)

// Config holds email service configuration
type Config struct {
	SMTPHost    string
	SMTPPort    int
	Username    string
	Password    string
	FromAddress string
	FromName    string
}

// Service provides email sending functionality
type Service struct {
	config Config
}

// NewService creates a new email service
func NewService(cfg Config) *Service {
	return &Service{config: cfg}
}

// SendVerificationCode sends a verification code to an email address
func (s *Service) SendVerificationCode(to, code string) error {
	subject := "KairoIO - Email Verification Code"
	body := fmt.Sprintf(`
<html>
<body>
<h2>Email Verification</h2>
<p>Your verification code is:</p>
<h1 style="color: #4CAF50;">%s</h1>
<p>This code will expire in 20 minutes.</p>
<p>If you didn't request this code, please ignore this email.</p>
<hr>
<p style="color: #666;">KairoIO Server</p>
</body>
</html>
`, code)

	return s.send(to, subject, body)
}

// send sends an email
func (s *Service) send(to, subject, htmlBody string) error {
	m := gomail.NewMessage()
	m.SetHeader("From", m.FormatAddress(s.config.FromAddress, s.config.FromName))
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", htmlBody)

	d := gomail.NewDialer(
		s.config.SMTPHost,
		s.config.SMTPPort,
		s.config.Username,
		s.config.Password,
	)

	if err := d.DialAndSend(m); err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}

// IsConfigured checks if email service is properly configured
func (s *Service) IsConfigured() bool {
	return s.config.Username != "" && s.config.Password != ""
}
