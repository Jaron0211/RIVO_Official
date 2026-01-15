package schema

import (
	"encoding/json"
	"fmt"
	"io/fs"
	"log"
	"strings"
	"sync"
	"time"
)

// Schema represents a parsed JSON schema
// We use map[string]interface{} for flexibility as schemas can vary
type Schema map[string]interface{}

// Index represents the generated index of all schemas
type Index struct {
	Schema      string       `json:"$schema"`
	ID          string       `json:"$id"`
	Title       string       `json:"title"`
	Description string       `json:"description"`
	Version     string       `json:"version"`
	GeneratedAt time.Time    `json:"generatedAt"`
	Schemas     []IndexEntry `json:"schemas"`
}

// IndexEntry represents a single entry in the schema index
type IndexEntry struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
	Category    string `json:"category"`
	Endpoint    string `json:"endpoint,omitempty"`
	Method      string `json:"method,omitempty"`
}

// Source represents a location to load schemas from
type Source struct {
	FS           fs.FS
	RootPath     string
	ManifestFile string
}

// Service manages loading and serving of message schemas
type Service struct {
	sources        []Source
	schemas        map[string]Schema
	generatedIndex *Index
	mu             sync.RWMutex
}

// NewService creates a new Schema Service
func NewService() *Service {
	return &Service{
		sources: make([]Source, 0),
		schemas: make(map[string]Schema),
	}
}

// AddSource adds a new source to load schemas from
// rootPath should be the path within the FS where schemas are located (often just ".")
func (s *Service) AddSource(fileSystem fs.FS, rootPath string) {
	// Ensure root path ends with slash if not empty
	if rootPath != "" && !strings.HasSuffix(rootPath, "/") {
		rootPath += "/"
	}

	s.sources = append(s.sources, Source{
		FS:           fileSystem,
		RootPath:     rootPath,
		ManifestFile: "_manifest.txt",
	})
}

// GetSchema returns a specific schema by ID
func (s *Service) GetSchema(id string) (Schema, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	schema, ok := s.schemas[id]
	return schema, ok
}

// GetIndex returns the auto-generated index
func (s *Service) GetIndex() *Index {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.generatedIndex
}

// Reload clears and reloads all schemas
func (s *Service) Reload() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Clear existing
	s.schemas = make(map[string]Schema)
	s.generatedIndex = nil

	// Load manifest and schemas from all sources
	for _, source := range s.sources {
		if err := s.loadSchemasFromSource(source); err != nil {
			log.Printf("Warning: failed to load from source %s: %v", source.RootPath, err)
			continue
		}
	}

	// Generate index
	s.generateIndex()
	return nil
}

// loadSchemasFromSource reads the manifest and loads all listed schemas from a specific source
func (s *Service) loadSchemasFromSource(source Source) error {
	manifestPath := source.RootPath + source.ManifestFile
	content, err := fs.ReadFile(source.FS, manifestPath)
	if err != nil {
		// Try loading without manifest (scanning directory) if manifest missing?
		// For now, adhere to manifest requirement as per previous Java logic
		return fmt.Errorf("failed to read manifest %s: %w", manifestPath, err)
	}

	lines := strings.Split(string(content), "\n")
	for _, line := range lines {
		filename := strings.TrimSpace(line)

		// Skip empty lines and comments
		if filename == "" || strings.HasPrefix(filename, "#") {
			continue
		}

		// Ensure .json extension
		if !strings.HasSuffix(filename, ".json") {
			filename += ".json"
		}

		if err := s.loadSchemaFile(source, filename); err != nil {
			log.Printf("Failed to load schema %s: %v", filename, err)
		}
	}

	return nil
}

// loadSchemaFile loads a single schema file
func (s *Service) loadSchemaFile(source Source, filename string) error {
	filePath := source.RootPath + filename
	content, err := fs.ReadFile(source.FS, filePath)
	if err != nil {
		return fmt.Errorf("read file error: %w", err)
	}

	var schema Schema
	if err := json.Unmarshal(content, &schema); err != nil {
		return fmt.Errorf("json parse error: %w", err)
	}

	// Get schema ID from $id field, or derive from filename
	schemaID := strings.TrimSuffix(filename, ".json")
	if id, ok := schema["$id"].(string); ok && id != "" {
		schemaID = id
	}

	s.schemas[schemaID] = schema
	return nil
}

// generateIndex builds the index from loaded schemas
func (s *Service) generateIndex() {
	entries := make([]IndexEntry, 0, len(s.schemas))

	for id, schema := range s.schemas {
		entry := IndexEntry{
			ID:       id,
			Name:     id, // Default to ID
			Category: s.detectCategory(id),
		}

		// Extract metadata
		if title, ok := schema["title"].(string); ok {
			entry.Name = title
		}
		if desc, ok := schema["description"].(string); ok {
			entry.Description = desc
		}
		if cat, ok := schema["category"].(string); ok {
			entry.Category = cat
		}
		if endpoint, ok := schema["endpoint"].(string); ok {
			entry.Endpoint = endpoint
		}
		if method, ok := schema["method"].(string); ok {
			entry.Method = method
		}

		entries = append(entries, entry)
	}

	s.generatedIndex = &Index{
		Schema:      "http://json-schema.org/draft-07/schema#",
		ID:          "index",
		Title:       "KairoIO Server API Message Schemas",
		Description: "Auto-generated index of all available message schemas",
		Version:     "1.0.0",
		GeneratedAt: time.Now(),
		Schemas:     entries,
	}

	log.Printf("Generated schema index with %d entries", len(entries))
}

// detectCategory guesses the category based on schema ID
func (s *Service) detectCategory(schemaID string) string {
	id := strings.ToLower(schemaID)
	if strings.Contains(id, "robot") || strings.Contains(id, "status") || strings.Contains(id, "command") {
		return "robot"
	} else if strings.Contains(id, "login") || strings.Contains(id, "register") || strings.Contains(id, "auth") || strings.Contains(id, "code") {
		return "authentication"
	} else if strings.Contains(id, "response") || strings.Contains(id, "error") {
		return "common"
	}
	return "other"
}
