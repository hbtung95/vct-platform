---
name: vct-backend
description: "VCT Platform Go 1.26 backend — Clean Architecture, domain modules, HTTP API, PostgreSQL, auth, middleware, error handling, caching, event-driven, state machines, message queues, multi-tenancy, and API testing."
---

# VCT Backend — Go 1.26 Platform Engineering

> Consolidated: backend-go + error-handling + caching + event-driven + state-machine + message-queue + multi-tenancy + api-testing
> **⚠️ BẮT BUỘC (V5.0 Architecture)**: Sử dụng lệnh `node ai-tools/scripts/ast-parser.js <đường_dẫn_file>` để lấy sơ đồ X-quang của file trước khi dùng `view_file`. Tuyệt đối không đọc mù toàn bộ file code dài.
## 1. Architecture Overview

```
backend/
├── cmd/server/          # Entrypoint
├── internal/
│   ├── domain/{module}/ # Business logic (ZERO external deps)
│   │   ├── model.go     # Domain entities
│   │   ├── store.go     # Repository interface
│   │   ├── service.go   # Business logic
│   │   └── events.go    # Domain events
│   ├── adapter/{module}/
│   │   ├── handler.go   # HTTP handlers
│   │   └── dto.go       # Request/Response DTOs
│   ├── store/{module}/
│   │   └── postgres.go  # pgx/v5 implementation
│   └── platform/        # Cross-cutting concerns
│       ├── auth/        # JWT middleware
│       ├── cache/       # CachedStore wrapper
│       ├── events/      # Event bus
│       ├── queue/       # NATS message queue
│       └── middleware/   # Logging, recovery, CORS
├── migrations/          # SQL migration pairs
└── config/              # Environment config
```

## 2. Clean Architecture Rules

| Layer | Import Rules | Contains |
|-------|-------------|----------|
| `domain/` | **NO** external imports | Models, interfaces, business logic, events |
| `adapter/` | Imports `domain/` only | HTTP handlers, DTOs, validation |
| `store/` | Imports `domain/` only | PostgreSQL implementations |
| `platform/` | Cross-cutting | Auth, cache, middleware |

**Dependency Rule**: domain ← adapter, domain ← store, adapter → domain, store → domain

## 3. Code Patterns

### Handler Pattern
```go
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
    var req CreateRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        apiError(w, ErrInvalidInput)
        return
    }
    result, err := h.service.Create(r.Context(), req.ToDomain())
    if err != nil {
        apiError(w, mapDomainError(err))
        return
    }
    jsonResponse(w, http.StatusCreated, result)
}
```

### Store Pattern (pgx/v5)
```go
func (s *PostgresStore) FindByID(ctx context.Context, id uuid.UUID) (*domain.Entity, error) {
    row := s.pool.QueryRow(ctx, `SELECT id, name, status FROM entities WHERE id = $1`, id)
    var e domain.Entity
    if err := row.Scan(&e.ID, &e.Name, &e.Status); err != nil {
        if errors.Is(err, pgx.ErrNoRows) {
            return nil, domain.ErrNotFound
        }
        return nil, fmt.Errorf("find entity by id: %w", err)
    }
    return &e, nil
}
```

## 4. Error Handling

### APIError Envelope
```go
type APIError struct {
    Code    string `json:"code"`    // "ENTITY_NOT_FOUND"
    Message string `json:"message"` // User-facing (Vietnamese)
    Details any    `json:"details,omitempty"`
}
```

**Domain → HTTP mapping**: `ErrNotFound → 404` · `ErrConflict → 409` · `ErrForbidden → 403` · `ErrValidation → 400`

## 5. Caching (CachedStore)

```go
type CachedStore struct {
    inner Store       // underlying store
    cache redis.Client
    ttl   time.Duration
}
```
- Cache on reads, invalidate on writes
- TTL: 5min for lists, 15min for single entities, 1h for static data
- Skip cache: user-specific data, financial data, real-time scoring

## 6. Event-Driven Architecture

```go
// Publish domain event after state change
bus.Publish(ctx, events.AthleteRegistered{AthleteID: id, FederationID: fedID})

// Subscribe in another module
bus.Subscribe("athlete.registered", func(ctx context.Context, evt events.AthleteRegistered) {
    // React: create profile, send notification, etc.
})
```
- In-process event bus for same-service
- NATS for cross-service async messaging
- Outbox Pattern for reliable delivery

## 7. State Machine

```go
// Define valid transitions
var AthleteStateMachine = StateMachine{
    "draft":      {"submitted"},
    "submitted":  {"approved", "rejected"},
    "approved":   {"active", "suspended"},
    "suspended":  {"active", "archived"},
}

// Validate transition
if !AthleteStateMachine.CanTransition(current, next) {
    return ErrInvalidTransition
}
```

## 8. Multi-Tenancy

- Tenant isolation via `tenant_id` column on all tenant-scoped tables
- Auth middleware extracts tenant from JWT claims
- All queries MUST include `WHERE tenant_id = $N`
- Schema: `core.tenants` table with settings, plan, limits

## 9. Migration Rules

- Always create pairs: `{version}_{name}_up.sql` + `{version}_{name}_down.sql`
- Never DROP COLUMN in production without 3-phase migration
- Use `CREATE INDEX CONCURRENTLY` to avoid table locks
- Backfill data in batches (1000 rows per batch)

## 10. Testing

- Handler tests: `httptest.NewServer` + real service + mock store
- Store tests: test containers with real PostgreSQL
- Test fixtures: factories, not raw SQL
- Contract validation: response matches DTO struct

## 11. Data Analytics & Telemetry (Tracking)

- **Implementation Responsibility**: Backend engineers must instrument code using OpenTelemetry or native SDKs (e.g., segment, Datadog) to capture server-side events, latencies, and critical domain flows.
- **Traceability**: Forward correlation IDs from the Gateway/Frontend to track requests across distributed modules.
- **Metrics**: Expose Prometheus endpoints (`/metrics`) for system observability.

