# VCT Platform — Phases 1–5 Walkthrough

## Phase 1: Ổn Định ✅
Fixed build errors (btc_handler, athlete_profile_handler), 7 duplicate route registrations, migration conflict (0041→0042 renumber).

## Phase 2: PG Adapters ✅

| File | Module | Methods |
|------|--------|---------|
| [club_pg.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/adapter/club_pg.go) | Club | 16 |
| [scoring_pg.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/adapter/scoring_pg.go) | Scoring | 5 |
| [athlete_profile_pg.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/adapter/athlete_profile_pg.go) | Athlete | 21 |

Migrations: `0043_athlete_profiles.sql`, `0044_scoring_tables.sql` (5 tables)

## Phase 3: Quality ✅

- [apierror.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/httpapi/apierror.go) — 10 error helpers, 9 error codes
- **55 domain tests** (athlete 18, btc 20, parent 17) — all pass
- **3 PG adapter test files** with compile-time interface checks
- [api_routes.md](file:///d:/VCT%20PLATFORM/vct-platform/backend/docs/api_routes.md) — 48+ routes documented

## Phase 4: Features & Polish ✅

### 4A: Worker Skeleton

| File | Description |
|------|-------------|
| [task.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/worker/task.go) | Task struct, Dispatcher with goroutine pool, retry logic |
| [tasks.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/worker/tasks.go) | 4 task handler stubs (notify, export, Elo, cleanup) |
| [main.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/cmd/worker/main.go) | Entry point with env config + graceful shutdown |
| [task_test.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/worker/task_test.go) | 10 tests (lifecycle, submit, retry, handler validation) |

### 4B: WebSocket Scoring ← Already Done
All 6 scoring mutation handlers already call `broadcastEntityChange` after success.

### 4C: Readiness Probe
[server.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/httpapi/server.go) — `/readyz` endpoint:
- DB: `PingContext` + connection pool stats (open/in_use/idle)
- Cache stats, realtime client count
- Returns 503 if DB unreachable

## Phase 5: Production Readiness ✅

| Item | Status |
|------|--------|
| Rate limiting | ✅ Already done — `middleware.go` token-bucket per IP |
| Structured logging | ✅ Already done — JSON access logs |
| CI/CD | ✅ Already exists — [ci.yml](file:///d:/VCT%20PLATFORM/vct-platform/.github/workflows/ci.yml) |
| Health check | ✅ Done in Phase 4C |

---

## Verification

```
go build ./...           ✅ Clean (server + worker + migrate)
go test ./... -count=1   ✅ All pass (exit 0)
```

All packages passed:
- `internal/adapter` — 8.5s (PG conformance tests, skipped without DB)
- `internal/auth` — 14.2s
- `internal/worker` — 2.3s (10 new tests)
- `internal/domain/athlete` — athlete tests pass
- `internal/domain/btc` — btc tests pass
- `internal/domain/parent` — parent tests pass
