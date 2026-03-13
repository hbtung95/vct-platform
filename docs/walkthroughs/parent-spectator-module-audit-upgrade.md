# Walkthrough: Parent/Spectator Module Audit & Upgrade

## Summary

Comprehensive audit found **15 issues** (3 Critical, 8 Major, 4 Minor). All fixed in 3 phases.

---

## Phase 1: Backend Hardening

### [service.go](file:///D:/VCT%20PLATFORM/vct-platform/backend/internal/domain/parent/service.go)

| Fix | What Changed |
|-----|-------------|
| Typed patches | Replaced `map[string]interface{}` → `LinkUpdate` / `ConsentUpdate` structs |
| Error propagation | `GetDashboard` now returns `fmt.Errorf("list children: %w", err)` instead of `_` |
| Real stores | Added `InMemAttendanceStore` + `InMemResultStore` with per-athlete seed data |
| Input validation | `RequestLink` validates relation enum; `CreateConsent` validates consent type |
| Ownership check | `RevokeConsent` verifies consent belongs to calling parent |
| UpcomingEvents | Dynamically counts active tournament/belt_exam consents |

### [parent_handler.go](file:///D:/VCT%20PLATFORM/vct-platform/backend/internal/httpapi/parent_handler.go)

| Fix | What Changed |
|-----|-------------|
| Role guard | `requireParentRole()` checks `p.User.Role == RoleParent` on every endpoint |
| Ownership | `handleParentChildDetail` verifies athlete is linked via `IsChildOfParent()` |
| DELETE endpoint | New `DELETE /api/v1/parent/children/{id}` to unlink child |
| Validation errors | Returns 400 instead of 500 for validation failures |

### [server.go](file:///D:/VCT%20PLATFORM/vct-platform/backend/internal/httpapi/server.go)

Updated `parent.NewService()` constructor to pass 5 args (+ AttendanceStore + ResultStore).

---

## Phase 2: Parent Dashboard Frontend

### [Page_parent_dashboard.tsx](file:///D:/VCT%20PLATFORM/vct-platform/packages/app/features/parent/Page_parent_dashboard.tsx)

| Fix | What Changed |
|-----|-------------|
| API integration | Fetches from `/api/v1/parent/dashboard`, `/consents`, `/children/{id}/attendance` |
| Loading states | `LoadingSkeleton` component with animated pulse blocks |
| Error handling | `ErrorBanner` with retry button |
| `useCountUp` fix | Moved side-effect from `useState()` → `useEffect()` with `cancelAnimationFrame` cleanup |
| Link modal | Full form (athlete ID, name, relation dropdown) → POST `/children/link` |
| Consent modal | Select child + type + title + description → POST `/consents` |
| Revoke consent | Two-step confirmation → DELETE `/consents/{id}` |
| Child selector | Attendance tab fetches per-child from API, dropdown for multi-child parents |

---

## Phase 3: Spectator Portal

### [Page_spectator.tsx](file:///D:/VCT%20PLATFORM/vct-platform/packages/app/features/portals/Page_spectator.tsx)

| Fix | What Changed |
|-----|-------------|
| Cleaned imports | Removed unused `VCT_PageContainer`, `VCT_PageHero`, `VCT_SectionCard`, etc. |
| AnimatePresence | Tab transitions with `mode="wait"` + smooth enter/exit animations |
| Tab indicator | Added `layoutId="spectator-tab-bg"` spring animation |
| Athlete search | Debounced 300ms API call to `/api/v1/public/athletes/search?q=` with local fallback |
| Tournament stats | Fetches from `/api/v1/public/stats` with demo data fallback |
| Auto-refresh | Polls `/api/v1/public/scoreboard` every 15s when WebSocket offline |

---

## Verification

| Check | Result |
|-------|--------|
| `go build ./...` | ✅ Clean |
| ESLint | ✅ 0 errors on both files |
