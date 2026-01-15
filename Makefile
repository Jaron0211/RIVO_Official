.PHONY: build build-all test clean install docker run

# Variables
BINARY_NAME=kairoio-server
SOURCE_DIR=./source
BUILD_DIR=./release
CMD_DIR=$(SOURCE_DIR)/cmd/kairoio-server
GO=/usr/local/go/bin/go

# Version info
VERSION?=1.0.0
GIT_COMMIT=$(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BUILD_TIME=$(shell date -u '+%Y-%m-%d_%H:%M:%S')

# Linker flags
LDFLAGS=-ldflags "-X main.Version=$(VERSION) -X main.GitCommit=$(GIT_COMMIT) -X main.BuildTime=$(BUILD_TIME)"

# Build for current platform
build:
	@echo "Building $(BINARY_NAME)..."
	@cd $(SOURCE_DIR) && $(GO) build $(LDFLAGS) -o ../$(BUILD_DIR)/$(BINARY_NAME) $(CMD_DIR)
	@echo "✓ Binary built: $(BUILD_DIR)/$(BINARY_NAME)"

# Build for all platforms
build-all: clean
	@echo "Building for multiple platforms..."
	@mkdir -p $(BUILD_DIR)
	
	# Linux AMD64
	@echo "Building for Linux AMD64..."
	@cd $(SOURCE_DIR) && GOOS=linux GOARCH=amd64 $(GO) build $(LDFLAGS) -o ../$(BUILD_DIR)/$(BINARY_NAME)-linux-amd64 $(CMD_DIR)
	
	# Linux ARM64
	@echo "Building for Linux ARM64..."
	@cd $(SOURCE_DIR) && GOOS=linux GOARCH=arm64 $(GO) build $(LDFLAGS) -o ../$(BUILD_DIR)/$(BINARY_NAME)-linux-arm64 $(CMD_DIR)
	
	# macOS AMD64
	@echo "Building for macOS AMD64..."
	@cd $(SOURCE_DIR) && GOOS=darwin GOARCH=amd64 $(GO) build $(LDFLAGS) -o ../$(BUILD_DIR)/$(BINARY_NAME)-darwin-amd64 $(CMD_DIR)
	
	# macOS ARM64 (Apple Silicon)
	@echo "Building for macOS ARM64..."
	@cd $(SOURCE_DIR) && GOOS=darwin GOARCH=arm64 $(GO) build $(LDFLAGS) -o ../$(BUILD_DIR)/$(BINARY_NAME)-darwin-arm64 $(CMD_DIR)
	
	# Windows AMD64
	@echo "Building for Windows AMD64..."
	@cd $(SOURCE_DIR) && GOOS=windows GOARCH=amd64 $(GO) build $(LDFLAGS) -o ../$(BUILD_DIR)/$(BINARY_NAME)-windows-amd64.exe $(CMD_DIR)
	
	@echo "✓ All binaries built successfully!"
	@ls -lh $(BUILD_DIR)/

# Run tests
test:
	@echo "Running tests..."
	@cd $(SOURCE_DIR) && $(GO) test -v -race -coverprofile=coverage.out ./...
	@cd $(SOURCE_DIR) && $(GO) tool cover -func=coverage.out

# Run tests with coverage report
test-coverage:
	@echo "Running tests with coverage..."
	@cd $(SOURCE_DIR) && go test -v -race -coverprofile=coverage.out ./...
	@cd $(SOURCE_DIR) && go tool cover -html=coverage.out -o coverage.html
	@echo "✓ Coverage report: $(SOURCE_DIR)/coverage.html"

# Clean build artifacts
clean:
	@echo "Cleaning..."
	@rm -rf $(BUILD_DIR)/$(BINARY_NAME)*
	@rm -f $(SOURCE_DIR)/coverage.out $(SOURCE_DIR)/coverage.html
	@echo "✓ Clean complete"

# Install to GOPATH/bin
install:
	@echo "Installing $(BINARY_NAME)..."
	@cd $(SOURCE_DIR) && go install $(LDFLAGS) $(CMD_DIR)
	@echo "✓ Installed to $(shell go env GOPATH)/bin/$(BINARY_NAME)"

# Build Docker image
docker:
	@echo "Building Docker image..."
	@docker build -t kairoio-server:$(VERSION) -t kairoio-server:latest .
	@echo "✓ Docker image built: kairoio-server:$(VERSION)"

# Run locally
run: build
	@echo "Starting server..."
	@cd $(BUILD_DIR) && ./$(BINARY_NAME)

# Run with hot reload (requires air)
dev:
	@echo "Starting development server with hot reload..."
	@cd $(SOURCE_DIR) && air

# Format code
fmt:
	@echo "Formatting code..."
	@cd $(SOURCE_DIR) && go fmt ./...
	@echo "✓ Code formatted"

# Run linters
lint:
	@echo "Running linters..."
	@cd $(SOURCE_DIR) && go vet ./...
	@cd $(SOURCE_DIR) && golangci-lint run || echo "golangci-lint not installed, skipping"
	@echo "✓ Linting complete"

# Get dependencies
deps:
	@echo "Downloading dependencies..."
	@cd $(SOURCE_DIR) && go mod download
	@cd $(SOURCE_DIR) && go mod verify
	@echo "✓ Dependencies downloaded"

# Update dependencies
deps-update:
	@echo "Updating dependencies..."
	@cd $(SOURCE_DIR) && go get -u ./...
	@cd $(SOURCE_DIR) && go mod tidy
	@echo "✓ Dependencies updated"

# Generate release package
release: build-all
	@echo "Creating release package..."
	@mkdir -p $(BUILD_DIR)/release-$(VERSION)
	@cp $(BUILD_DIR)/$(BINARY_NAME)-* $(BUILD_DIR)/release-$(VERSION)/
	@cp config.yaml.example $(BUILD_DIR)/release-$(VERSION)/
	@cp .env.example $(BUILD_DIR)/release-$(VERSION)/
	@cp README.md $(BUILD_DIR)/release-$(VERSION)/
	@cd $(BUILD_DIR) && tar -czf release-$(VERSION).tar.gz release-$(VERSION)
	@echo "✓ Release package: $(BUILD_DIR)/release-$(VERSION).tar.gz"

# Show help
help:
	@echo "KairoIO Server - Makefile commands:"
	@echo ""
	@echo "  make build         - Build binary for current platform"
	@echo "  make build-all     - Build binaries for all platforms"
	@echo "  make test          - Run tests"
	@echo "  make test-coverage - Run tests with HTML coverage report"
	@echo "  make clean         - Remove build artifacts"
	@echo "  make install       - Install to GOPATH/bin"
	@echo "  make docker        - Build Docker image"
	@echo "  make run           - Build and run server"
	@echo "  make dev           - Run with hot reload (requires air)"
	@echo "  make fmt           - Format code"
	@echo "  make lint          - Run linters"
	@echo "  make deps          - Download dependencies"
	@echo "  make deps-update   - Update dependencies"
	@echo "  make release       - Create release package"
	@echo "  make help          - Show this help"
