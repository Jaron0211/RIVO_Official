package auth

import (
	"context"
	"errors"
	"net/http"
	"strings"
)

type contextKey string

const (
	AccountIDKey contextKey = "account_id"
	CertKeyKey   contextKey = "cert_key"
)

var (
	ErrUnauthorized = errors.New("unauthorized")
	ErrInvalidToken = errors.New("invalid token")
)

// Middleware provides authentication middleware
type Middleware struct {
	validateCertKey func(certKey string) (string, error)
}

// NewMiddleware creates a new authentication middleware
func NewMiddleware(validateCertKey func(certKey string) (string, error)) *Middleware {
	return &Middleware{
		validateCertKey: validateCertKey,
	}
}

// AuthRequired middleware checks for valid certification key
func (m *Middleware) AuthRequired(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get certification key from header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Missing authorization header", http.StatusUnauthorized)
			return
		}

		// Support both "Bearer <token>" and raw token formats
		certKey := authHeader
		if strings.HasPrefix(authHeader, "Bearer ") {
			certKey = strings.TrimPrefix(authHeader, "Bearer ")
		}

		// Validate certification key and get account ID
		accountID, err := m.validateCertKey(certKey)
		if err != nil {
			http.Error(w, "Invalid certification key", http.StatusUnauthorized)
			return
		}

		// Add to context
		ctx := context.WithValue(r.Context(), AccountIDKey, accountID)
		ctx = context.WithValue(ctx, CertKeyKey, certKey)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetAccountID retrieves account ID from context
func GetAccountID(ctx context.Context) (string, error) {
	accountID, ok := ctx.Value(AccountIDKey).(string)
	if !ok {
		return "", ErrUnauthorized
	}
	return accountID, nil
}

// GetCertKey retrieves certification key from context
func GetCertKey(ctx context.Context) (string, error) {
	certKey, ok := ctx.Value(CertKeyKey).(string)
	if !ok {
		return "", ErrUnauthorized
	}
	return certKey, nil
}
