# KairoIO Go Server - Project Context Prompt

This document provides a comprehensive overview of the KairoIO Go Server project to help AI agents understand and contribute to the codebase effectively.

## Project Vision & Goals
KairoIO is a high-performance IoT platform designed to handle device registration, status monitoring, and alert management. The Go Server is a complete rewrite from a legacy Java implementation, optimized for performance, scalability, and ease of deployment.

## Technology Stack
- **Language**: Go 1.21+
- **HTTP Framework**: [chi](https://github.com/go-chi/chi) (Lightweight, idiomatic router)
- **Database (ORM)**: [GORM](https://gorm.io/) (Supports PostgreSQL for production, SQLite for development)
- **Configuration**: [Viper](https://github.com/spf13/viper) (Supports `config.yaml` and environment variables)
- **Authentication**: Custom JWT-like implementation using certification keys and Bcrypt for passwords
- **Email**: [gomail.v2](https://github.com/go-gomail/gomail) for verification codes
- **Build System**: Makefile

## Core Architecture
The project follows a modular, layered architecture:
- `source/cmd/kairoio-server/`: Entry point, wires all components together.
- `source/internal/api/`: HTTP handlers and routing logic.
- `source/internal/auth/`: Authentication and authorization logic.
- `source/internal/database/`: Repository pattern for database operations.
- `source/internal/models/`: GORM models and data structures.
- `source/internal/schema/`: **Critical Component** - Logic for loading and indexing message schemas.

## Key Feature: Custom Message System
KairoIO features a highly extensible message system based on JSON schemas:
1.  **Schema Sources**:
    *   **Core**: Located in `source/internal/api/RobotBroadcastJson/`.
    *   **Custom**: Located in `release/custom_msg/`.
2.  **Manifest Loading**: Each source requires a `_manifest.txt` file listing the schemas to boot.
3.  **Dynamic Routing**:
    *   The `Schema Service` loads these JSON files and indexes them.
    *   The `Router` (`source/internal/api/router.go`) iterates through the loaded schemas.
    *   Any schema with a `POST` method and an `endpoint` (e.g., `/api/v1/robots/{robot_id}/dht22`) that isn't already handled is dynamically registered to the `SubmitGenericMessage` handler.
4.  **Generic Handling**: `SubmitGenericMessage` in `source/internal/api/robot.go` handles incoming data for these dynamic routes, ensuring basic validation and logging.

## Authentication Flow
1.  **Registration**:
    *   `POST /api/v1/auth/register/send-code`: Sends a 6-digit code via email.
    *   `POST /api/v1/auth/register`: Takes the code, email, and password to create an account. Generates a `certification_key`.
2.  **Login**:
    *   `POST /api/v1/auth/login`: Validates credentials and returns the `certification_key`.
3.  **Protected Requests**:
    *   Most robot-related endpoints require `Authorization: Bearer <certification_key>`.

## Development & Maintenance
### Common Commands
- **Build**: `make build` (outputs to `release/`)
- **Run**: `cd release && ./kairoio-server-linux-amd64`
- **Test**: `pytest tester/test_api.py` (requires a running server)
- **View Logs**: Logs are structured and include levels (debug, info, error).

### Configuration
Edit `release/config.yaml` or use environment variables prefixed with `KAIROIO_`:
```yaml
server:
  port: 8080
database:
  type: "sqlite" # or "postgres"
  dsn: "release/data/kairoio.db"
```

## Guidelines for Other Agents
- **Dynamic Routes**: When adding new message types, add the JSON schema to `release/custom_msg` and update its `_manifest.txt`. The server will pick it up on the next restart.
- **Database Changes**: Update models in `source/internal/models/`. GORM handles auto-migration on startup.
- **API Consistency**: Follow the existing pattern of `respondSuccess` and `respondError` in handlers.
- **Code Style**: Maintain the "clean code" standard established. Use standard Go formatting.
