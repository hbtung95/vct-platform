// Package apierror provides typed, sentinel error values for the VCT
// Platform backend. All domain/store errors should use these constants
// so that HTTP handlers can map them to the correct envelope error codes
// and HTTP status codes consistently.
package apierror

import "errors"

// ═══════════════════════════════════════════════════════════════
// Sentinel Errors — Data Store
// ═══════════════════════════════════════════════════════════════

// ErrNotFound is returned when a record does not exist.
var ErrNotFound = errors.New("record not found")

// ErrEntityNotFound is returned when the entity type bucket does not exist.
var ErrEntityNotFound = errors.New("entity not found")

// ErrMissingID is returned when a required "id" field is missing.
var ErrMissingID = errors.New("missing required field: id")

// ErrInvalidID is returned when the "id" field is empty or not a string.
var ErrInvalidID = errors.New("invalid id: must be a non-empty string")

// ErrDuplicateID is returned when trying to create a record with an existing ID.
var ErrDuplicateID = errors.New("duplicate id: already exists")

// ═══════════════════════════════════════════════════════════════
// Sentinel Errors — Authentication & Authorization
// ═══════════════════════════════════════════════════════════════

// ErrUnauthorized is returned when authentication is required but missing/invalid.
var ErrUnauthorized = errors.New("authentication required")

// ErrForbidden is returned when the user lacks permission.
var ErrForbidden = errors.New("permission denied")

// ErrTokenExpired is returned when a JWT has expired.
var ErrTokenExpired = errors.New("token expired")

// ErrTokenInvalid is returned when a JWT is malformed or has invalid claims.
var ErrTokenInvalid = errors.New("token invalid")

// ═══════════════════════════════════════════════════════════════
// Sentinel Errors — Validation
// ═══════════════════════════════════════════════════════════════

// ErrValidation is returned when input fails validation.
var ErrValidation = errors.New("validation failed")

// ErrInvalidInput is returned for malformed request bodies.
var ErrInvalidInput = errors.New("invalid input")

// ═══════════════════════════════════════════════════════════════
// Sentinel Errors — Business Logic
// ═══════════════════════════════════════════════════════════════

// ErrConflict is returned for state conflicts (e.g., duplicate registration).
var ErrConflict = errors.New("resource conflict")

// ErrStateTransition is returned when a state machine rejects a transition.
var ErrStateTransition = errors.New("invalid state transition")

// ErrQuotaExceeded is returned when a quota or rate limit is hit.
var ErrQuotaExceeded = errors.New("quota exceeded")

// ═══════════════════════════════════════════════════════════════
// Error Helpers
// ═══════════════════════════════════════════════════════════════

// Is checks whether err matches target using errors.Is.
func Is(err, target error) bool {
	return errors.Is(err, target)
}

// Wrap wraps an error with additional context.
func Wrap(err error, msg string) error {
	return errors.Join(err, errors.New(msg))
}
