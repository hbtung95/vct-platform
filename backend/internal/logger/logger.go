package logger

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"time"
)

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — STRUCTURED LOGGER (slog)
// JSON in production, text in development.
// Automatically attaches request_id, user_id, method, path.
// ═══════════════════════════════════════════════════════════════

type ctxKey string

const loggerKey ctxKey = "logger"

// New creates a new logger based on environment.
// Production: JSON format  |  Development: Text format
func New(env string) *slog.Logger {
	var handler slog.Handler

	opts := &slog.HandlerOptions{
		Level:     slog.LevelInfo,
		AddSource: false,
	}

	switch env {
	case "production", "staging":
		handler = slog.NewJSONHandler(os.Stdout, opts)
	default:
		opts.Level = slog.LevelDebug
		handler = slog.NewTextHandler(os.Stdout, opts)
	}

	return slog.New(handler).With(
		slog.String("service", "vct-platform"),
		slog.String("env", env),
	)
}

// FromContext extracts the logger from context, or returns the default.
func FromContext(ctx context.Context) *slog.Logger {
	if l, ok := ctx.Value(loggerKey).(*slog.Logger); ok {
		return l
	}
	return slog.Default()
}

// WithContext stores the logger in context.
func WithContext(ctx context.Context, l *slog.Logger) context.Context {
	return context.WithValue(ctx, loggerKey, l)
}

// ── HTTP Middleware ──────────────────────────────────────────

// responseRecorder wraps ResponseWriter to capture status code.
type responseRecorder struct {
	http.ResponseWriter
	status int
	bytes  int
}

func (rr *responseRecorder) WriteHeader(code int) {
	rr.status = code
	rr.ResponseWriter.WriteHeader(code)
}

func (rr *responseRecorder) Write(b []byte) (int, error) {
	n, err := rr.ResponseWriter.Write(b)
	rr.bytes += n
	return n, err
}

// Middleware creates an HTTP logging middleware that logs every request.
func Middleware(l *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()

			// Create request-scoped logger
			reqLogger := l.With(
				slog.String("method", r.Method),
				slog.String("path", r.URL.Path),
				slog.String("remote", r.RemoteAddr),
				slog.String("request_id", r.Header.Get("X-Request-ID")),
				slog.String("user_agent", r.UserAgent()),
			)

			// Inject logger into context
			ctx := WithContext(r.Context(), reqLogger)
			r = r.WithContext(ctx)

			// Wrap response writer
			rec := &responseRecorder{ResponseWriter: w, status: http.StatusOK}

			// Execute handler
			next.ServeHTTP(rec, r)

			// Log completion
			duration := time.Since(start)
			logLevel := slog.LevelInfo
			if rec.status >= 500 {
				logLevel = slog.LevelError
			} else if rec.status >= 400 {
				logLevel = slog.LevelWarn
			}

			reqLogger.Log(r.Context(), logLevel, "request completed",
				slog.Int("status", rec.status),
				slog.Int("bytes", rec.bytes),
				slog.Duration("duration", duration),
			)
		})
	}
}
