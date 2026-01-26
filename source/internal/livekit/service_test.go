package livekit

import (
	"log"
	"testing"

	"github.com/Jaron0211/kairoio-server/internal/config"
)

func TestCreateRobotToken(t *testing.T) {
	cfg := config.LiveKitConfig{
		Host:      "ws://localhost:7880",
		APIKey:    "devkey",
		APISecret: "secret",
	}
	service := NewService(cfg)

	token, err := service.CreateRobotToken("robot-123", "Test Robot")
	if err != nil {
		t.Fatalf("Failed to create robot token: %v", err)
	}

	if token == "" {
		t.Error("Expected valid token, got empty string")
	}
	log.Printf("Generated Robot Token: %s", token)
}

func TestCreateUserToken(t *testing.T) {
	cfg := config.LiveKitConfig{
		Host:      "ws://localhost:7880",
		APIKey:    "devkey",
		APISecret: "secret",
	}
	service := NewService(cfg)

	token, err := service.CreateUserToken("user-456", "robot-123")
	if err != nil {
		t.Fatalf("Failed to create user token: %v", err)
	}

	if token == "" {
		t.Error("Expected valid token, got empty string")
	}
}

func TestGetHost(t *testing.T) {
	expectedHost := "ws://example.com"
	cfg := config.LiveKitConfig{
		Host:      expectedHost,
		APIKey:    "key",
		APISecret: "secret",
	}
	service := NewService(cfg)

	if got := service.GetHost(); got != expectedHost {
		t.Errorf("GetHost() = %v, want %v", got, expectedHost)
	}
}
