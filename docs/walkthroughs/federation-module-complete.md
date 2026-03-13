# Federation Module — Complete Walkthrough

## Summary

Fully implemented the national-level federation module across 3 upgrade rounds + PR/International/Workflow endpoints.

---

## Upgrade Round 4: PR / International / Workflow Backend + Frontend

### Backend — 4 New Go Files

| File | Purpose |
|------|---------|
| [model_extended.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/domain/federation/model_extended.go) | Domain models: `NewsArticle`, `InternationalPartner`, `InternationalEvent`, `WorkflowDefinition` + store interfaces |
| [store_extended.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/domain/federation/store_extended.go) | Thread-safe in-memory stores with seeded demo data (6 articles, 5 partners, 3 events, 7 workflows) |
| [service_extended.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/domain/federation/service_extended.go) | Service methods: CRUD + PublishArticle, ToggleWorkflow |
| [federation_extended_handler.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/httpapi/federation_extended_handler.go) | HTTP handlers with RBAC, pagination, error responses |

### 8 New API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/v1/federation/articles` | List/Create news articles |
| GET/PUT/DELETE | `/api/v1/federation/articles/:id` | Article CRUD |
| GET/POST | `/api/v1/federation/partners` | List/Create international partners |
| GET/PUT/DELETE | `/api/v1/federation/partners/:id` | Partner CRUD |
| GET/POST | `/api/v1/federation/intl-events` | List/Create international events |
| GET/PUT/DELETE | `/api/v1/federation/intl-events/:id` | Event CRUD |
| GET/POST | `/api/v1/federation/workflows` | List/Create workflow definitions |
| GET/PUT/DELETE | `/api/v1/federation/workflows/:id` | Workflow CRUD |

### Frontend — Hooks + Pages Wired

**New hooks** in [useFederationAPI.ts](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/hooks/useFederationAPI.ts): `usePRArticles`, `useIntlPartners`, `useIntlEvents`, `useWorkflowDefs` + mutations.

| Page | Hook | Status |
|------|------|--------|
| [Page_federation_pr.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/federation/Page_federation_pr.tsx) | `usePRArticles()` | ✅ Live |
| [Page_federation_international.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/federation/Page_federation_international.tsx) | `useIntlPartners()` + `useIntlEvents()` | ✅ Live |
| [Page_federation_workflow_config.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/federation/Page_federation_workflow_config.tsx) | `useWorkflowDefs()` | ✅ Live |

### Verification

| Check | Result |
|-------|--------|
| `go build ./internal/domain/federation/... ./internal/httpapi/...` | ✅ 0 errors |
| `go test ./internal/domain/federation/...` | ✅ 21/21 PASS |
