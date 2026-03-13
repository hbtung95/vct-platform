# Walkthrough — Module Liên đoàn Quốc gia

## Summary
Implemented the full National Federation & System Admin module, encompassing backend domain logic, REST API endpoints, and 4 premium frontend pages.

---

## Backend Changes

### Domain Layer (`backend/internal/domain/federation/`)

| File | What was done |
|------|---------------|
| [model.go](file:///D:/VCT%20PLATFORM/vct-platform/backend/internal/domain/federation/model.go) | Added `MasterBelt`, `MasterWeightClass`, `MasterAgeGroup`, `ApprovalRequest` models |
| [store.go](file:///D:/VCT%20PLATFORM/vct-platform/backend/internal/domain/federation/store.go) | Created `MasterDataStore` interface + `MemoryMasterDataStore` with seeded data |
| [service.go](file:///D:/VCT%20PLATFORM/vct-platform/backend/internal/domain/federation/service.go) | Extended `Service` with Master Data + Approval methods (`ListMasterBelts`, `ProcessApproval`, etc.) |

### HTTP Layer (`backend/internal/httpapi/`)

| File | What was done |
|------|---------------|
| [federation_handler.go](file:///D:/VCT%20PLATFORM/vct-platform/backend/internal/httpapi/federation_handler.go) | Added route registrations for `/master/belts`, `/master/weights`, `/master/ages`, `/approvals` |
| [federation_master_handler.go](file:///D:/VCT%20PLATFORM/vct-platform/backend/internal/httpapi/federation_master_handler.go) | **[NEW]** Handler implementations: `handleMasterBelts`, `handleMasterWeights`, `handleMasterAges`, `handleFederationApprovals` |
| [server.go](file:///D:/VCT%20PLATFORM/vct-platform/backend/internal/httpapi/server.go) | Wired `NewMemoryMasterDataStore()` into `federation.NewService` |

---

## Frontend Changes

### Feature Pages (`packages/app/features/federation/`)

| File | Description |
|------|-------------|
| [Page_federation_master_data.tsx](file:///D:/VCT%20PLATFORM/vct-platform/packages/app/features/federation/Page_federation_master_data.tsx) | **[NEW]** Tab-based UI for belts (color swatches), weight classes (grid cards), age groups |
| [Page_federation_organizations.tsx](file:///D:/VCT%20PLATFORM/vct-platform/packages/app/features/federation/Page_federation_organizations.tsx) | **[NEW]** Organization table with KPIs, region filter, status badges for 63 provinces |
| [Page_federation_finance.tsx](file:///D:/VCT%20PLATFORM/vct-platform/packages/app/features/federation/Page_federation_finance.tsx) | **[NEW]** National finance overview with income/expense table, period filter, KPI cards |

### Routing & i18n

| File | What was done |
|------|---------------|
| [routes.ts](file:///D:/VCT%20PLATFORM/vct-platform/packages/app/features/layout/routes.ts) | Added 3 routes: `federation-organizations`, `federation-master-data`, `federation-finance` |
| [route-types.ts](file:///D:/VCT%20PLATFORM/vct-platform/packages/app/features/layout/route-types.ts) | Added 3 new `RouteId` types |
| [vi.ts](file:///D:/VCT%20PLATFORM/vct-platform/packages/app/features/i18n/vi.ts) | Added Vietnamese translations |
| [en.ts](file:///D:/VCT%20PLATFORM/vct-platform/packages/app/features/i18n/en.ts) | Added English translations |

---

## New API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/v1/federation/master/belts` | List/Create belt ranks |
| GET/POST | `/api/v1/federation/master/weights` | List/Create weight classes |
| GET/POST | `/api/v1/federation/master/ages` | List/Create age groups |
| GET | `/api/v1/federation/approvals` | List approvals (filter by `?status=`) |
| POST | `/api/v1/federation/approvals/{id}/approve` | Approve a request |
| POST | `/api/v1/federation/approvals/{id}/reject` | Reject a request |

## Verification

- ✅ `go vet ./...` — passes (exit code 0)
- ✅ Federation domain package compiles independently
- ✅ All frontend pages created with proper routing and i18n
