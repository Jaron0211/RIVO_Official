package api

import (
	"net/http"
	"time"

	"github.com/Jaron0211/kairoio-server/internal/logger"
	"github.com/go-chi/chi/v5/middleware"
)

// ActionLogger is a custom middleware to log API actions to the .ACTION file
func ActionLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Create a response wrapper to capture the status code
		ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)

		next.ServeHTTP(ww, r)

		duration := time.Since(start)

		// Log the action using the logger package
		logger.Action(r.Method, r.URL.Path, r.RemoteAddr, ww.Status(), duration)
	})
}
