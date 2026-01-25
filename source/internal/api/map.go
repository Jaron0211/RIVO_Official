package api

import (
	"io"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/Jaron0211/kairoio-server/internal/auth"
	"github.com/Jaron0211/kairoio-server/internal/database"
	"github.com/Jaron0211/kairoio-server/internal/logger"
	"github.com/Jaron0211/kairoio-server/internal/models"
	"github.com/go-chi/chi/v5"
	"gopkg.in/yaml.v3"
)

type MapHandler struct {
	repo *database.Repository
}

func NewMapHandler(repo *database.Repository) *MapHandler {
	return &MapHandler{repo: repo}
}

// MapYAML represents the ROS map YAML structure
type MapYAML struct {
	Image          string    `yaml:"image"`
	Resolution     float64   `yaml:"resolution"`
	Origin         []float64 `yaml:"origin"`
	Negate         int       `yaml:"negate"`
	OccupiedThresh float64   `yaml:"occupied_thresh"`
	FreeThresh     float64   `yaml:"free_thresh"`
}

// UploadMap handles POST /api/v1/map/upload
func (h *MapHandler) UploadMap(w http.ResponseWriter, r *http.Request) {
	accountID, err := auth.GetAccountID(r.Context())
	if err != nil {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	// Parse multipart form
	err = r.ParseMultipartForm(10 << 20) // 10MB limit
	if err != nil {
		respondError(w, http.StatusBadRequest, "Failed to parse form")
		return
	}

	// Get YAML file
	yamlFile, _, err := r.FormFile("yaml")
	if err != nil {
		respondError(w, http.StatusBadRequest, "yaml file is required")
		return
	}
	defer yamlFile.Close()

	yamlData, err := io.ReadAll(yamlFile)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to read yaml")
		return
	}

	// Parse YAML
	var mYAML MapYAML
	if err := yaml.Unmarshal(yamlData, &mYAML); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid YAML format")
		return
	}

	// Get PGM file
	pgmFile, pgmHeader, err := r.FormFile("pgm")
	if err != nil {
		respondError(w, http.StatusBadRequest, "pgm file is required")
		return
	}
	defer pgmFile.Close()

	pgmData, err := io.ReadAll(pgmFile)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to read pgm")
		return
	}

	// Create Map model
	newMap := &models.Map{
		AccountID:      accountID,
		Name:           strings.TrimSuffix(pgmHeader.Filename, filepath.Ext(pgmHeader.Filename)),
		Resolution:     mYAML.Resolution,
		Negate:         mYAML.Negate,
		OccupiedThresh: mYAML.OccupiedThresh,
		FreeThresh:     mYAML.FreeThresh,
		PGMData:        pgmData,
		YAMLRaw:        string(yamlData),
	}

	if len(mYAML.Origin) >= 3 {
		newMap.OriginX = mYAML.Origin[0]
		newMap.OriginY = mYAML.Origin[1]
		newMap.OriginYaw = mYAML.Origin[2]
	}

	// Optional RobotID connection
	newMap.RobotID = r.FormValue("robot_id")

	if err := h.repo.SaveMap(newMap); err != nil {
		logger.Errorf("Failed to save map: %v", err)
		respondError(w, http.StatusInternalServerError, "Failed to save map")
		return
	}

	respondSuccess(w, map[string]interface{}{
		"message": "Map uploaded successfully",
		"map_id":  newMap.ID,
	})
}

// GetLatestMap handles GET /api/v1/map/latest
func (h *MapHandler) GetLatestMap(w http.ResponseWriter, r *http.Request) {
	accountID, err := auth.GetAccountID(r.Context())
	if err != nil {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	m, err := h.repo.GetLatestMapDraft(accountID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to fetch map")
		return
	}

	if m == nil {
		respondError(w, http.StatusNotFound, "No map available")
		return
	}

	respondSuccess(w, m)
}

// GetMap handles GET /api/v1/map/{id} (Metadata only)
func (h *MapHandler) GetMap(w http.ResponseWriter, r *http.Request) {
	mapID := chi.URLParam(r, "id")
	if mapID == "" {
		respondError(w, http.StatusBadRequest, "map_id is required")
		return
	}

	// Verify ownership
	accountID, err := auth.GetAccountID(r.Context())
	if err != nil {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	m, err := h.repo.GetMapByID(mapID)
	if err != nil {
		respondError(w, http.StatusNotFound, "Map not found")
		return
	}

	if m.AccountID != accountID {
		respondError(w, http.StatusForbidden, "Access denied")
		return
	}

	respondSuccess(w, m)
}

// GetMapImage handles GET /api/v1/map/{id}/image
func (h *MapHandler) GetMapImage(w http.ResponseWriter, r *http.Request) {
	mapID := chi.URLParam(r, "id")
	if mapID == "" {
		respondError(w, http.StatusBadRequest, "map_id is required")
		return
	}

	m, err := h.repo.GetMapByID(mapID)
	if err != nil {
		respondError(w, http.StatusNotFound, "Map not found")
		return
	}

	// Verify ownership
	accountID, _ := auth.GetAccountID(r.Context())
	if m.AccountID != accountID {
		respondError(w, http.StatusForbidden, "Access denied")
		return
	}

	w.Header().Set("Content-Type", "image/x-portable-graymap")
	w.Write(m.PGMData)
}

// ListMaps handles GET /api/v1/maps
func (h *MapHandler) ListMaps(w http.ResponseWriter, r *http.Request) {
	accountID, err := auth.GetAccountID(r.Context())
	if err != nil {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	maps, err := h.repo.ListMapsForAccount(accountID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to list maps")
		return
	}

	respondSuccess(w, map[string]interface{}{
		"maps":  maps,
		"count": len(maps),
	})
}

// DeleteMap handles DELETE /api/v1/map/{id}
func (h *MapHandler) DeleteMap(w http.ResponseWriter, r *http.Request) {
	mapID := chi.URLParam(r, "id")
	if mapID == "" {
		respondError(w, http.StatusBadRequest, "map_id is required")
		return
	}

	// Verify ownership
	accountID, err := auth.GetAccountID(r.Context())
	if err != nil {
		respondError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	m, err := h.repo.GetMapByID(mapID)
	if err != nil {
		respondError(w, http.StatusNotFound, "Map not found")
		return
	}

	if m.AccountID != accountID {
		respondError(w, http.StatusForbidden, "Access denied")
		return
	}

	if err := h.repo.DeleteMap(mapID); err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to delete map")
		return
	}

	respondSuccess(w, map[string]interface{}{
		"message": "Map deleted successfully",
		"map_id":  mapID,
	})
}
