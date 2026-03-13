# Federation Regulations Module — Walkthrough

## Summary
Implemented the national-level federation regulations module for managing expertise standards (belt ranks, weight classes, age groups) with a hierarchical scope system (National → Provincial → School).

## Changes Made

### Backend (Go)

#### [model.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/domain/federation/model.go)
- Added `BeltSystemScope` type with constants: `NATIONAL`, `PROVINCIAL`, `SCHOOL`
- Added `Scope`, `ScopeID`, `InheritsFrom` fields to `MasterBelt`, `MasterWeightClass`, `MasterAgeGroup`

#### [store.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/domain/federation/store.go)
- Updated all seed data entries with `Scope: BeltScopeNational`

#### [federation_pg_master_repos.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/adapter/federation_pg_master_repos.go)
- Updated PG update functions to include scope fields in patches

---

### Frontend — Navigation & i18n

#### [workspace-sidebar-configs.ts](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/layout/workspace-sidebar-configs.ts#L33-L38)
- Added "Quy chế Chuyên môn" (Regulations) group with:
  - `/fed/regulations` → Tổng quan Quy chế
  - `/fed/master-data` → Danh mục Chuẩn

#### [vi.ts](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/i18n/vi.ts) & [en.ts](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/i18n/en.ts)
- Added: `ws.fed.regulations`, `ws.fed.regulationsOverview`, `ws.fed.masterData`

---

### Frontend — New Pages

#### [NEW] [Page_federation_regulations.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/federation/Page_federation_regulations.tsx)
- Regulations overview with summary cards (belts, weights, ages)
- Scope inheritance info banner explaining National → Provincial → School hierarchy
- National scope badge
- Cards link to master-data page with tab pre-selected

#### [UPGRADED] [Page_federation_master_data.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/federation/Page_federation_master_data.tsx)
- **Full CRUD**: Create, Edit, Delete for belts, weights, age groups
- Modal dialogs for create/edit forms
- Delete confirmation dialog
- Toast notifications for success/error feedback
- Tab pre-selection via URL query params (`?tab=belt|weight|age`)
- Inline action buttons (edit/delete) on each record

#### Next.js Route Pages
- [NEW] [fed/regulations/page.tsx](file:///d:/VCT%20PLATFORM/vct-platform/apps/next/app/fed/regulations/page.tsx)
- [NEW] [fed/master-data/page.tsx](file:///d:/VCT%20PLATFORM/vct-platform/apps/next/app/fed/master-data/page.tsx)

#### Barrel Export
- Added `Page_federation_regulations` to [index.ts](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/federation/index.ts)

## Verification

| Check | Status |
|-------|--------|
| Go build (`go build ./...`) | ✅ Pass |
| Go tests (5/5) | ✅ Pass |
| Sidebar config has regulations group | ✅ Verified |
| i18n keys in vi.ts + en.ts | ✅ Added |
| Next.js routes created | ✅ Created |
| Browser routing test | ✅ Routes recognized |

> [!NOTE]
> Browser CRUD testing requires valid auth credentials. The pages are behind authentication as expected.
