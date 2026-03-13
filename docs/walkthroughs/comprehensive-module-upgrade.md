# Walkthrough — Comprehensive Module Upgrade

## Changes Made

### Backend Fixes (Go build ✅)

| Area | Files | Changes |
|------|-------|---------|
| Error consistency | [federation_handler.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/httpapi/federation_handler.go) | 6 default-case error responses standardized to `methodNotAllowed(w)` and `notFoundError(w, ...)` |
| Master data CRUD | [store.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/domain/federation/store.go), [service.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/domain/federation/service.go), [federation_master_handler.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/httpapi/federation_master_handler.go) | 9 interface methods, 9 store implementations, 9 service wrappers for Get/Update/Delete belts, weights, ages |
| Route wiring | [federation_handler.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/httpapi/federation_handler.go) | 3 new `/api/v1/federation/master/{type}/{id}` routes |
| Coach parity | [service.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/domain/provincial/service.go), [provincial_handler.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/httpapi/provincial_handler.go) | Added `UpdateCoach`, `ApproveCoach`, `DeactivateCoach` + handler PATCH/approve/deactivate actions |
| Athlete parity | Same files | Added `UpdateAthlete`, `DeactivateAthlete`, `ReactivateAthlete` + handler PATCH/deactivate/reactivate actions |
| Parent handler bugs | [parent_handler.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/httpapi/parent_handler.go), [parent/service.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/domain/parent/service.go) | `p.ActiveRole` → `p.User.Role`; added missing `GetLinkByID` service method |

### Frontend Fixes

| Area | File | Changes |
|------|------|---------|
| Filter logic | [Page_athlete_tournaments.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/athletes/Page_athlete_tournaments.tsx) | "Past" filter now uses `start_date < today` instead of matching `bi_tu_choi` status. Count badges visible on ALL tabs. |
| Route IDs | [route-types.ts](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/layout/route-types.ts) | Added `parent-dashboard`, `athlete-portal`, `athlete-tournaments` |
| i18n | [vi.ts](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/i18n/vi.ts) | Added 15 keys: `role.parent`, 7 parent module keys, 6 athlete module keys |

## Validation

- **Go build**: `go build ./...` passes with zero errors
- **Belt model**: Correctly uses `Level` (int) as identifier, not `ID` field
- **Filter logic**: Uses `start_date` (available on `TournamentEntry`) instead of non-existent `end_date`

## Remaining Work

Parent Dashboard rewrite (Phase 2 in task.md) — removing DEMO data, connecting to APIs, fixing hooks, adding modals.
