package livekit

import (
	"time"

	"github.com/livekit/protocol/auth"

	"github.com/Jaron0211/kairoio-server/internal/config"
)

type Service struct {
	config config.LiveKitConfig
}

func NewService(cfg config.LiveKitConfig) *Service {
	return &Service{
		config: cfg,
	}
}

func (s *Service) GetHost() string {
	return s.config.Host
}

func boolPtr(b bool) *bool {
	return &b
}

func (s *Service) CreateRobotToken(robotID, robotName string) (string, error) {
	at := auth.NewAccessToken(s.config.APIKey, s.config.APISecret)

	// Robots can publish, but not subscribe (they are sources)
	grant := &auth.VideoGrant{
		RoomJoin:     true,
		Room:         robotID,
		CanPublish:   boolPtr(true),
		CanSubscribe: boolPtr(false),
	}

	at.AddGrant(grant).
		SetIdentity(robotID).
		SetName(robotName).
		SetValidFor(24 * time.Hour)

	return at.ToJWT()
}

func (s *Service) CreateUserToken(identity, robotID string) (string, error) {
	at := auth.NewAccessToken(s.config.APIKey, s.config.APISecret)

	// Users can subscribe to the robot's room
	// For now, we allow publishing too so the owner can stream from a simulator
	grant := &auth.VideoGrant{
		RoomJoin:     true,
		Room:         robotID,
		CanPublish:   boolPtr(true),
		CanSubscribe: boolPtr(true),
	}

	at.AddGrant(grant).
		SetIdentity(identity).
		SetValidFor(1 * time.Hour)

	return at.ToJWT()
}
