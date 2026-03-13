# 🔍 Phân Tích & Đề Xuất Nâng Cấp Skills + Workflows

## Tổng Quan Hiện Trạng

### Skills (Tổng: 37)

| Vị trí | Số lượng | Mô tả |
|--------|----------|-------|
| `.agent/skills/` | 33 | Skills chính — vai trò từ CTO đến QA, DBA |
| `docs/skills/` | 4 | Skills backend Go (foundation, entity-api, auth, quality) |
| Global Antigravity | 4 | Vercel React/Web skills (chung, không riêng VCT) |

### Workflows (Tổng: 34)

| Vị trí | Số lượng | Mô tả |
|--------|----------|-------|
| `.agent/workflows/` | 29 | Workflows chính — từ add-module đến deploy |
| `.agents/workflows/` | 5 | Workflows cũ (database-migrate, dev-build-test, dev-server, git-commit-push, turbo-all) |

---

## ✅ Điểm Mạnh

1. **Phủ sóng rộng rãi** — 33 skills bao phủ hầu hết vai trò phát triển phần mềm
2. **Chất lượng tốt** — Skills có cấu trúc rõ ràng: mô tả, anti-patterns, checklist, code mẫu
3. **Cross-reference** — Các skills liên kết qua lại (QA → DevOps, DBA → SA, v.v.)
4. **Monorepo-aware** — Skills frontend/backend đều hiểu cấu trúc monorepo
5. **Domain-specific** — Skills bao gồm kiến thức chuyên ngành VCT (Vovinam)

---

## ⚠️ Điểm Yếu & Lỗ Hổng

### 1. Skills Trùng Lặp / Xung Đột

| Vấn đề | Chi tiết |
|---------|----------|
| Trùng backend Go | `docs/skills/vct-go-backend-*` (4 files) ↔ `.agent/skills/vct-backend-go` (1 file tổng hợp). Hai bộ skill cùng chủ đề nhưng ở vị trí khác nhau |
| Trùng Vercel skills | `.agent/skills/vercel-*` ↔ Global `~/.gemini/antigravity/skills/vercel-*`. Bản sao tại 2 nơi |
| UI/UX phân tán | `ui-ux-pro-max`, `vct-ui-ux`, `vct-ux-designer` — 3 skills xử lý cùng lĩnh vực |

### 2. Skills Thiếu

| Skill Thiếu | Lý do cần |
|-------------|-----------|
| **vct-api-testing** | Không có skill riêng cho API integration testing (Postman, httptest patterns) |
| **vct-realtime-scoring** | Module scoring là core business nhưng chưa có skill chuyên biệt |
| **vct-state-machine** | `state_machine.go` phức tạp nhưng chưa có skill hướng dẫn mở rộng |
| **vct-migration-safety** | Chỉ có hướng dẫn cơ bản, cần skill chi tiết cho zero-downtime migration |
| **vct-error-handling** | `apierror.go` mới tạo (Phase 3) nhưng chưa có skill chuẩn hóa error patterns |
| **vct-caching-strategy** | `cached_store.go` + Redis nhưng chưa có hướng dẫn invalidation/strategy |
| **vct-event-driven** | Event bus + NATS nhưng chưa có skill event sourcing / CQRS patterns |
| **vct-accessibility** | Web accessibility (WCAG) cho ứng dụng thể thao quốc gia |

### 3. Workflows Thiếu

| Workflow Thiếu | Lý do cần |
|----------------|-----------|
| **health-check** | Kiểm tra nhanh toàn bộ hệ thống (backend build, frontend TSC, DB connection) |
| **e2e-test** | Chạy Playwright E2E tests end-to-end |
| **docker-dev** | Khởi động full docker-compose dev environment |
| **backup-db** | Backup database trước khi thực hiện migration nguy hiểm |
| **generate-types** | Tự động sinh TypeScript types từ Go models |
| **sync-i18n** | Kiểm tra và đồng bộ i18n keys giữa vi/en |
| **clean-build** | Xóa cache + build lại toàn bộ (node_modules, .next, go build) |
| **benchmark** | Chạy performance benchmarks (Go bench + Lighthouse) |
| **api-docs** | Sinh API documentation (OpenAPI/Swagger) từ handlers |
| **release** | Quy trình release bản mới (tag, changelog, deploy) |

### 4. Cập Nhật Lỗi Thời

| Item | Vấn đề |
|------|--------|
| `vct-frontend` skill | Ghi Next.js 14 nhưng project dùng React 19, cần cập nhật |
| `docs/skills/` | Không được nhận diện bởi Antigravity (chỉ nhận `.agent/skills/`) |
| `.agents/workflows/` | 5 workflows cũ, có thể conflicting với 29 workflows mới ở `.agent/workflows/` |
| Migration count | Skills ghi "36 migrations" nhưng có thể đã nhiều hơn |

---

## 🚀 Đề Xuất Nâng Cấp

### Ưu tiên 1: Dọn Dẹp & Hợp Nhất (Critical)

#### 1.1. Xóa trùng lặp
- **Loại bỏ** `docs/skills/vct-go-backend-*` (4 files) — đã được thay thế bởi `.agent/skills/vct-backend-go`
- **Loại bỏ** `.agent/skills/vercel-*` (3 dirs) — đã có ở global Antigravity skills
- **Hợp nhất** 3 skills UI/UX thành 1: `vct-ui-ux` (chính) + deprecate `ui-ux-pro-max` và `vct-ux-designer`
- **Migrate** `.agents/workflows/` → `.agent/workflows/` (nếu chưa trùng)

#### 1.2. Cập nhật thông tin cũ
- Cập nhật `vct-frontend` SKILL.md: Next.js 14 → Next.js 15 + React 19
- Cập nhật migration count trong các skills
- Cập nhật domain module count (hiện có 23 modules)

---

### Ưu tiên 2: Tạo Skills Mới (High)

#### 2.1. `vct-realtime-scoring` — Scoring & Live Match
```
Khi nào: Xử lý scoring real-time, match events, bracket generation
Nội dung:
- Scoring quyền thuật vs đối kháng (rules 2021 + 2024 amendment)
- Event-driven match state machine
- WebSocket live updates
- Offline-first scoring (PWA)
- Penalty system (6 bước)
```

#### 2.2. `vct-state-machine` — State Machine Patterns
```
Khi nào: Mở rộng/sửa tournament/match/registration state machines
Nội dung:
- Existing states & transitions (từ state_machine.go)
- Guard conditions
- Side effects (events, notifications)
- Testing state transitions
```

#### 2.3. `vct-error-handling` — Standardized Error Patterns
```
Khi nào: Tạo API handlers mới, xử lý business errors
Nội dung:
- apierror.go patterns
- Domain error → HTTP error mapping
- Client-side error display
- i18n error messages
```

#### 2.4. `vct-caching` — Caching Strategy
```
Khi nào: Tối ưu performance, thêm cache layer
Nội dung:
- CachedStore usage
- Redis patterns cho VCT
- Cache invalidation strategy
- TTL configuration
```

---

### Ưu tiên 3: Tạo Workflows Mới (Medium)

#### 3.1. `/health-check` — System Health Check
```yaml
description: Quick system health check — backend build, frontend TSC, tests
steps:
  1. cd backend && go build ./...
  2. cd backend && go vet ./...
  3. npx tsc --noEmit
  4. cd backend && go test ./... -count=1 -short
```

#### 3.2. `/e2e-test` — Run E2E Tests
```yaml
description: Run Playwright E2E test suite
steps:
  1. Ensure dev servers running
  2. npx playwright test
  3. npx playwright show-report
```

#### 3.3. `/docker-dev` — Start Dev Environment
```yaml
description: Start full development environment with Docker
steps:
  1. docker-compose up -d
  2. Wait for health checks
  3. cd backend && go run ./cmd/server
  4. npm run dev (frontend)
```

#### 3.4. `/sync-i18n` — Sync i18n Keys
```yaml
description: Find missing i18n translation keys between vi and en
steps:
  1. Parse vi.ts keys
  2. Parse en.ts keys
  3. Report missing keys in each locale
```

#### 3.5. `/clean-build` — Clean Rebuild
```yaml
description: Clean all caches and rebuild from scratch
steps:
  1. Remove node_modules/.cache, .next, .turbo
  2. npm install
  3. npm run build
  4. cd backend && go build ./...
```

#### 3.6. `/api-docs` — Generate API Documentation
```yaml
description: Generate OpenAPI docs from Go handlers
steps:
  1. Scan httpapi/*_handler.go
  2. Extract routes, methods, payloads
  3. Generate OpenAPI YAML
  4. Output to docs/api/openapi.yaml
```

---

### Ưu tiên 4: Nâng Cấp Skills Hiện Có (Low-Medium)

| Skill | Nâng cấp |
|-------|----------|
| `vct-backend-go` | Thêm section: Structured Logging, Graceful Shutdown patterns, Context propagation |
| `vct-frontend` | Thêm: SWR/React Query patterns, Form validation (Zod), Optimistic UI |
| `vct-qa` | Thêm: Visual regression testing, Accessibility testing, API contract testing |
| `vct-devops` | Thêm: GitHub Actions matrix, Canary deployments, Feature flags |
| `vct-dba` | Thêm: Partitioning for large tables (scoring events), VACUUM strategy |
| `vct-security` | Thêm: OWASP Top 10 checklist cho VCT, Rate limiting patterns |
| `vct-domain-expert` | Cập nhật Luật 2024 amendment (128/2024/LĐVTCTVN) |

---

## 📊 Tóm Tắt Hành Động

| Hành Động | Số lượng | Độ ưu tiên |
|-----------|----------|------------|
| Xóa skills trùng lặp | 7 files/dirs | 🔴 Critical |
| Hợp nhất skills UI/UX | 3 → 1 | 🔴 Critical |
| Migrate workflows cũ | 5 files | 🟠 High |
| Cập nhật thông tin cũ | 4 skills | 🟠 High |
| Tạo skills mới | 4 skills | 🟠 High |
| Tạo workflows mới | 6 workflows | 🟡 Medium |
| Nâng cấp skills hiện có | 7 skills | 🟢 Low-Medium |

> **Tổng ước tính**: ~35 thay đổi, chia thành 4 đợt thực hiện theo thứ tự ưu tiên.
