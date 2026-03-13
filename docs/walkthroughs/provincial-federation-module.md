# Provincial Federation Module — Walkthrough

## Summary

Implemented the full provincial-level federation module across backend (Go) and frontend (React/TypeScript), enabling management of CLBs, VĐVs, HLVs, reports, and statistics at the provincial level.

## Backend Changes

### Domain Layer
- [model.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/domain/federation/model.go) — 5 new structs + 5 status enums:
  - `ProvincialClub`, `ProvincialAthlete`, `ProvincialCoach`, `ProvincialReport`, `ProvincialStatistics`
  - `ClubStatus`, `AthleteStatus`, `CoachLevel`, `ReportType`, `ReportStatus`

- [service.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/domain/federation/service.go) — 4 repository interfaces + CRUD methods:
  - `ProvincialClubRepository`, `ProvincialAthleteRepository`, `ProvincialCoachRepository`, `ProvincialReportRepository`
  - 13 service methods including `GetProvincialStatistics`

### Adapter Layer
- [federation_mem_provincial.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/adapter/federation_mem_provincial.go) — In-memory repos with Vietnamese seed data:
  - 10 CLBs across Bình Dương (Tấn Long, Phong Vũ, Rồng Vàng, etc.)
  - 10 VĐVs with belt levels and achievements
  - 7 HLVs from provincial to master level
  - 3 reports (monthly, quarterly, annual)

### HTTP API
- [federation_provincial_handler.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/httpapi/federation_provincial_handler.go) — REST endpoints at `/api/v1/provincial/`:
  - `GET/POST /clubs`, `GET/DELETE /clubs/{id}`
  - `GET/POST /athletes`, `GET /athletes/{id}` (supports `?club_id=` filter)
  - `GET/POST /coaches`, `GET /coaches/{id}`
  - `GET/POST /reports`
  - `GET /stats?province_id=`

### Server Wiring
- [server.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/httpapi/server.go) — `SetProvincialRepos()` + route registration

## Frontend Changes

### Shared Types
- [common.ts](file:///d:/VCT%20PLATFORM/vct-platform/packages/shared-types/src/federation/common.ts) — 5 enums + 5 interfaces mirroring Go domain

### Feature Pages (backup mock-data versions)
| File | Purpose |
|------|---------|
| [Page_province_clubs.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/federation/Page_province_clubs.tsx) | Grid view with search, status filter |
| [Page_province_athletes.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/federation/Page_province_athletes.tsx) | Table view with gender/club filters |
| [Page_province_coaches.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/federation/Page_province_coaches.tsx) | Card grid with level filter |
| [Page_province_tournaments.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/federation/Page_province_tournaments.tsx) | List cards with status badges |
| [Page_province_reports.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/federation/Page_province_reports.tsx) | Report cards with stats grid |

### Integration
- [index.ts](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/federation/index.ts) — Barrel exports added
- [workspace-sidebar-configs.ts](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/layout/workspace-sidebar-configs.ts) — Coaches path fixed to `/province/coaches`

## Verification

- **Go build**: ✅ Passes (`go build ./...` exits 0)
- **Frontend lint**: All `Object is possibly undefined` and `Set iteration` warnings resolved
- **API alignment**: Backend endpoints match frontend's expected `/api/v1/provincial/` prefix
