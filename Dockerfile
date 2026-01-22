# Dockerfile for KairoIO Server
FROM golang:1.24-alpine AS builder

WORKDIR /build

# Install dependencies
RUN apk add --no-cache git make

# Copy go mod files
COPY source/go.mod source/go.sum ./
RUN go mod download

# Copy source code
COPY source/ ./

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o kairoio-server ./cmd/kairoio-server

# Runtime image
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

# Copy binary from builder
COPY --from=builder /build/kairoio-server .

# Copy config template
COPY config.yaml.example ./config.yaml

# Create data directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 8080

# Run server
CMD ["./kairoio-server"]
