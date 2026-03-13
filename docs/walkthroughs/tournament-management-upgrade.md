# Tournament Management — Upgrade Walkthrough

## Summary
Completed comprehensive backend upgrades for the tournament management module, including infrastructure, data layer, business logic, testing, and API endpoints.

## Changes Made

### Core Infrastructure

| File | Type | Description |
|------|------|-------------|
| [workspace-resolver.ts](file:///D:/VCT%20PLATFORM/vct-platform/packages/app/features/layout/workspace-resolver.ts) | Modified | Added 7 route permission entries for tournament management pages |
| [workspace-sidebar-configs.ts](file:///D:/VCT%20PLATFORM/vct-platform/packages/app/features/layout/workspace-sidebar-configs.ts) | Modified | Added sidebar items (Dashboard, Categories, Registration, Schedule, Results) to `TOURNAMENT_SIDEBAR` and `FEDERATION_SIDEBAR` |

---

### PostgreSQL Adapter

| File | Type | Description |
|------|------|-------------|
| [tournament_mgmt_pg.go](file:///D:/VCT%20PLATFORM/vct-platform/backend/internal/adapter/tournament_mgmt_pg.go) | **New** | Full PG adapter implementing `MgmtRepository` — all CRUD for categories, registrations, athletes, schedule slots, arena assignments, results, team standings with `UPSERT` support |

---

### Domain Enhancements

| File | Type | Description |
|------|------|-------------|
| [validation.go](file:///D:/VCT%20PLATFORM/vct-platform/backend/internal/domain/tournament/validation.go) | **New** | Field-level validation for categories, registrations, athletes, schedule slots, and results. Vietnamese error messages. Content type validation, weight class requirement for đối kháng |
| [audit.go](file:///D:/VCT%20PLATFORM/vct-platform/backend/internal/domain/tournament/audit.go) | **New** | Audit trail with typed actions (create/approve/reject/finalize/export/batch), query by tournament/entity/actor |
| [export.go](file:///D:/VCT%20PLATFORM/vct-platform/backend/internal/domain/tournament/export.go) | **New** | CSV export for all 6 entity types with Vietnamese column headers and status translations |
| [batch_ops.go](file:///D:/VCT%20PLATFORM/vct-platform/backend/internal/domain/tournament/batch_ops.go) | **New** | Batch approve/reject registrations, batch record/finalize results, automatic team standings recalculation from finalized results (7/5/3 point scoring) |

---

### API Endpoints

| File | Type | Description |
|------|------|-------------|
| [tournament_mgmt_handler.go](file:///D:/VCT%20PLATFORM/vct-platform/backend/internal/httpapi/tournament_mgmt_handler.go) | Modified | Added 2 new route groups with 9 new endpoints |

**New Export Endpoints** (`GET /api/v1/tournament-mgmt/{id}/export/{entity}`):
- `categories`, `registrations`, `schedule`, `results`, `standings` → CSV download with UTF-8 BOM

**New Batch Endpoints** (`POST /api/v1/tournament-mgmt/{id}/batch/{action}`):
- `approve-registrations` — bulk approve with `{ids: [...]}`
- `reject-registrations` — bulk reject with `{ids: [...], reason: "..."}`
- `finalize-results` — bulk finalize with `{ids: [...]}`
- `recalculate-standings` — recalc all team standings from finalized results

---

### Tests

| File | Type | Description |
|------|------|-------------|
| [mgmt_test.go](file:///D:/VCT%20PLATFORM/vct-platform/backend/internal/domain/tournament/mgmt_test.go) | **New** | 20+ unit tests covering validation, CSV export, and audit trail |

## Verification

| Check | Result |
|-------|--------|
| `go build ./...` | ✅ PASS |
| `go test ./internal/domain/tournament/ -v` | ✅ All tests PASS |
| `go vet ./...` | ⚠️ Pre-existing error in `athlete_profile_handler.go` (unrelated) |
