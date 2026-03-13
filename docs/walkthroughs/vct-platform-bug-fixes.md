# Walkthrough — VCT Platform Bug Fixes (Complete)

## All Bugs Fixed

### Bug 1: [vct-ui.legacy.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/components/vct-ui.legacy.tsx) — ✅
Created legacy barrel with inline `VCT_Modal` (`role="dialog"`) and `VCT_Toast` (`aria-live="polite"`)

### Bug 2: [Page_spectator.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/portals/Page_spectator.tsx) — ✅
Fixed framer-motion v12 TS errors: replaced `{...tabContent}` spread with `variants` prop + named states

### Bug 3: [server.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/httpapi/server.go) + [server_test.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/httpapi/server_test.go) — ✅
- Removed 13 duplicate exact-match route registrations causing Go 1.22+ ServeMux 307 redirects
- Moved `/api/v1/brackets/` → `/api/v1/brackets-action/assign-medals` (was shadowing generic entity handler)
- Updated test to POST to `/api/v1/teams/` (trailing slash for dedicated handler)

### Bug 4: [Page_parent_dashboard.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/parent/Page_parent_dashboard.tsx) — ✅
Created `createApiFetch(token)` factory with `useAuth()` token injection + `Authorization: Bearer` header

### Bug 5: Child Action Buttons — ✅
Wired 📊📅📋 buttons via `onNavigateTab` callback to switch active tab

### Bug 6: Silent Error Handling — ✅
Replaced 4 empty `catch {}` blocks with error state + user-visible Vietnamese error messages in `ConsentsTab`, `AttendanceTab`, `ChildrenTab`, `NewConsentModal`

### Smoke Test Fixes: [run-tests.mjs](file:///d:/VCT%20PLATFORM/vct-platform/scripts/run-tests.mjs) — ✅
- AppShell `aria-label` assertion → accepts i18n pattern `t('shell.openMobileNav')`
- Login page heading → accepts i18n pattern `t('loginTitle')`
- Login page input → accepts `username` (refactored from legacy `tournamentCode`)
- Regenerated `entity-authz.generated.ts`

## Final Verification

| Test Suite | Result |
|---|---|
| Go Build | ✅ PASS |
| Go Tests (15 packages) | ✅ ALL PASS |
| Smoke Tests (80+ assertions) | ✅ ALL PASS |
