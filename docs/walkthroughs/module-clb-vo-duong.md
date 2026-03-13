# Walkthrough — Module CLB & Võ Đường

## Summary

Implemented the full-stack **Club (CLB) & Martial Arts School (Võ đường)** module for the VCT Platform. This module enables internal club management with 8 functional pages covering dashboard, members, classes, training, tournaments, finance, certifications, and settings.

---

## Changes Made

### Backend (Go)

| File | Change |
|------|--------|
| [service.go](file:///D:/VCT%20PLATFORM/vct-platform/backend/internal/auth/service.go) | Added 4 club roles: `club_leader`, `club_vice_leader`, `club_secretary`, `club_accountant` with RBAC, permissions, and demo credential |
| [provincial/service.go](file:///D:/VCT%20PLATFORM/vct-platform/backend/internal/domain/provincial/service.go) | Extended `ProvincialClub` model + added `ClubClass`, `ClubMember`, `ClubFinanceEntry`, `ClubDashboardStats`, `ClubFinanceSummary` models + 3 repository interfaces |
| [club_store.go](file:///D:/VCT%20PLATFORM/vct-platform/backend/internal/domain/provincial/club_store.go) | 3 in-memory stores (`InMemClubClassStore`, `InMemClubMemberStore`, `InMemClubFinanceEntryStore`) with seed data |
| [club_service.go](file:///D:/VCT%20PLATFORM/vct-platform/backend/internal/domain/provincial/club_service.go) | ~15 service methods for club CRUD (dashboard, members, classes, finance) |
| [club_handler.go](file:///D:/VCT%20PLATFORM/vct-platform/backend/internal/httpapi/club_handler.go) | HTTP handlers for 8 club API endpoints |
| [server.go](file:///D:/VCT%20PLATFORM/vct-platform/backend/internal/httpapi/server.go) | Wired new stores and registered club routes |

### Frontend (TypeScript/React)

| File | Change |
|------|--------|
| [routes.ts](file:///D:/VCT%20PLATFORM/vct-platform/packages/app/features/layout/routes.ts) | Added `cau_lac_bo` route group with 8 club routes |
| [route-types.ts](file:///D:/VCT%20PLATFORM/vct-platform/packages/app/features/layout/route-types.ts) | Added `cau_lac_bo` to `RouteGroupId` and 8 club route IDs |
| [vi.ts](file:///D:/VCT%20PLATFORM/vct-platform/packages/app/features/i18n/vi.ts) | Vietnamese translations for route group + 8 club routes |
| [en.ts](file:///D:/VCT%20PLATFORM/vct-platform/packages/app/features/i18n/en.ts) | English translations for route group + 8 club routes |

**8 Next.js Pages** created under `apps/next/app/club/`:
- `page.tsx`, `members/page.tsx`, `classes/page.tsx`, `training/page.tsx`, `tournaments/page.tsx`, `finance/page.tsx`, `certifications/page.tsx`, `settings/page.tsx`

**8 Feature Components** created under `packages/app/features/club/`:

| Component | Description |
|-----------|-------------|
| [Page_club_dashboard.tsx](file:///D:/VCT%20PLATFORM/vct-platform/packages/app/features/club/Page_club_dashboard.tsx) | KPI stats, quick actions, pending member alerts |
| [Page_club_members.tsx](file:///D:/VCT%20PLATFORM/vct-platform/packages/app/features/club/Page_club_members.tsx) | Member table with search, filter, approve/reject |
| [Page_club_classes.tsx](file:///D:/VCT%20PLATFORM/vct-platform/packages/app/features/club/Page_club_classes.tsx) | Class cards with capacity bars, schedule, coach info |
| [Page_club_training.tsx](file:///D:/VCT%20PLATFORM/vct-platform/packages/app/features/club/Page_club_training.tsx) | Curriculum modules, progress bars, video library placeholder |
| [Page_club_tournaments.tsx](file:///D:/VCT%20PLATFORM/vct-platform/packages/app/features/club/Page_club_tournaments.tsx) | Tournament list with status badges, registration counts |
| [Page_club_finance.tsx](file:///D:/VCT%20PLATFORM/vct-platform/packages/app/features/club/Page_club_finance.tsx) | Income/expense table, financial summary KPIs |
| [Page_club_certifications.tsx](file:///D:/VCT%20PLATFORM/vct-platform/packages/app/features/club/Page_club_certifications.tsx) | Belt distribution grid, promotion history table |
| [Page_club_settings.tsx](file:///D:/VCT%20PLATFORM/vct-platform/packages/app/features/club/Page_club_settings.tsx) | Club info display, contact, facilities, action buttons |

---

## Verification Results

| Check | Result |
|-------|--------|
| Backend compiles (`go build ./...`) | ✅ Pass |
| No club-specific TypeScript errors | ✅ Pass |
| i18n translations (vi + en) | ✅ Complete |
| Live browser test | ⏸️ Blocked by port conflict (existing process on :8080 with elevated permissions) |

### Manual Verification Steps (for user)

1. Restart the backend server: `cd backend && go run ./cmd/server`
2. Open `http://localhost:3000/login`, log in as `club-leader` / `Club@123`
3. Navigate sidebar → **Câu Lạc Bộ** group
4. Click through all 8 pages and verify data loads from API
