package config

import (
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	Address            string
	AllowedOrigins     []string
	DisableAuthForData bool
	JWTSecret          string
	JWTIssuer          string
	AccessTokenTTL     time.Duration
	RefreshTokenTTL    time.Duration
	AuditLimit         int
}

func Load() Config {
	address := getEnv("VCT_BACKEND_ADDR", ":18080")
	origins := splitCSV(getEnv("VCT_CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8081,http://localhost:3101,http://127.0.0.1:3101"))
	disableAuth := strings.EqualFold(getEnv("VCT_DISABLE_AUTH_FOR_DATA", "false"), "true")

	jwtSecret := getEnv("VCT_JWT_SECRET", "change-me-before-production-vct-2026")
	jwtIssuer := getEnv("VCT_JWT_ISSUER", "vct-backend")
	accessTTL := parseDuration(getEnv("VCT_ACCESS_TTL", "15m"), 15*time.Minute)
	refreshTTL := parseDuration(getEnv("VCT_REFRESH_TTL", "168h"), 7*24*time.Hour)
	auditLimit := parseInt(getEnv("VCT_AUDIT_LIMIT", "5000"), 5000)

	return Config{
		Address:            address,
		AllowedOrigins:     origins,
		DisableAuthForData: disableAuth,
		JWTSecret:          jwtSecret,
		JWTIssuer:          jwtIssuer,
		AccessTokenTTL:     accessTTL,
		RefreshTokenTTL:    refreshTTL,
		AuditLimit:         auditLimit,
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok && strings.TrimSpace(value) != "" {
		return strings.TrimSpace(value)
	}
	return fallback
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	origins := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			origins = append(origins, trimmed)
		}
	}
	return origins
}

func parseDuration(value string, fallback time.Duration) time.Duration {
	duration, err := time.ParseDuration(value)
	if err != nil {
		return fallback
	}
	return duration
}

func parseInt(value string, fallback int) int {
	parsed, err := strconv.Atoi(strings.TrimSpace(value))
	if err != nil {
		return fallback
	}
	if parsed <= 0 {
		return fallback
	}
	return parsed
}
