# 📊 VCT Platform — Phân Tích Toàn Diện Dự Án

> **Ngày phân tích:** 12/03/2026  
> **Phiên bản dự án:** Đang phát triển (pre-release)

---

## 1. Tổng Quan Kiến Trúc

VCT Platform là **Nền tảng Quản trị Võ thuật Toàn diện** cho Võ Cổ Truyền Việt Nam, xây dựng dưới dạng **monorepo** với kiến trúc hiện đại.

### Tech Stack

| Layer | Công nghệ | Trạng thái |
|-------|-----------|------------|
| Frontend Web | Next.js (App Router), React 19, TypeScript 5.2 | ✅ Hoạt động |
| Frontend Mobile | Expo (React Native) | 🏗️ Cơ bản |
| Backend API | Go 1.26 (Clean Architecture) | ⚠️ Có lỗi build |
| Database | PostgreSQL 17 (pgx/v5) | ✅ 41 migrations |
| Auth | JWT (golang-jwt/v5) | ✅ Hoạt động |
| Realtime | WebSocket (gorilla/websocket) | ✅ Cơ bản |
| State Mgmt | Zustand 5 | ✅ Hoạt động |
| Validation | Zod 4 | ✅ Hoạt động |
| Animation | Framer Motion 12 | ✅ Hoạt động |
| Build System | Turbo 2.4, Yarn 4.7 | ✅ Hoạt động |
| Container | Docker Compose (multi-stage) | ✅ Cấu hình sẵn |
| Infra | Docker, Kubernetes | 🏗️ Có cấu hình |

### Cấu Trúc Monorepo

```
vct-platform/
├── apps/next/          # 57 route directories (Next.js App Router)
├── apps/expo/          # React Native mobile app
├── packages/app/       # 33 shared feature modules
├── packages/shared-types/  # 13 type definition files
├── packages/shared-utils/  # Shared utilities
├── packages/ui/        # UI Component Library
├── backend/            # Go API (Clean Architecture)
│   ├── cmd/            # server, migrate, worker
│   ├── internal/       # 14 packages (domain, adapter, httpapi...)
│   └── migrations/     # 41 migration pairs (up/down)
├── infra/              # Docker, K8s, scripts
├── docs/               # Architecture, API, guides, regulations
└── tests/e2e/          # Playwright E2E tests
```

---

## 2. Backend — Đánh Giá Chi Tiết

### 2.1 Domain Modules (23 modules)

| Module | Mô tả | Adapter |
|--------|--------|---------|
| `tournament` | Quản lý giải đấu (CORE) | PG + In-memory |
| `federation` | Liên đoàn quốc gia | PG + In-memory |
| `provincial` | Liên đoàn tỉnh | PG + In-memory |
| `club` | Câu lạc bộ võ đường | In-memory |
| `athlete` | Quản lý VĐV | In-memory |
| `scoring` | Chấm điểm real-time | In-memory |
| `bracket` | Bảng đấu | In-memory |
| `btc` | Ban tổ chức | In-memory |
| `approval` | Phê duyệt workflow | In-memory |
| `certification` | Chứng chỉ, đai | In-memory |
| `discipline` | Nội dung thi đấu | In-memory |
| `registration` | Đăng ký thi đấu | In-memory |
| `ranking` | Xếp hạng | In-memory |
| `finance` | Tài chính | — |
| `heritage` | Di sản văn hóa | — |
| `community` | Cộng đồng | — |
| `international` | Quốc tế | In-memory |
| `training` | Đào tạo | — |
| `organization` | Tổ chức | — |
| `parent` | Phụ huynh | — |
| `document` | Tài liệu | In-memory |
| `orchestrator` | Điều phối | — |
| `repository` | Repository base | — |

### 2.2 HTTP Handlers (36 files)

Bao gồm handlers cho: auth, athlete, athlete_profile, club (v1+v2), federation (national + provincial + master), tournament (basic + management), BTC, scoring, bracket, approval, finance, heritage, community, organization, parent, ranking, registration, referee, health, public...

### 2.3 Infrastructure Adapters

- **PostgreSQL**: `auxiliary_pg_repos.go`, `federation_pg_repos.go`, `federation_pg_master_repos.go`, `provincial_pg_repos.go`, `provincial_pg_phase2_repos.go`, `tournament_mgmt_pg.go`
- **In-memory**: 8 store files (federation, tournament, approval, certification, discipline, document, international, scoring)
- **Redis**: Cache layer
- **NATS**: Event queue
- **Meilisearch**: Search engine
- **MinIO**: Object storage

### 2.4 Testing

- **22 test files** across `auth`, `authz`, `cache`, `config`, `domain/`, `httpapi/`, `pkg/`, `realtime/`, `util/`
- **E2E tests**: Playwright (`appshell`, `core-workflow`)
- Frontend tests: Playwright config sẵn

### 2.5 Database

**41 migration pairs** (up + down) bao gồm:
- Entity records, relational schema, scoring events
- Enterprise foundation, training module, org/people
- Finance, heritage, community
- System partitions, materialized counters, infrastructure
- Structural hardening, FK exclusion, PII advisory
- Permissions workflows, geo analytics, i18n
- Event sourcing, GDPR masking, circuit breaker
- Federation core + master data + approvals + seed data
- Club/võ đường, Tournament management
- UUID v7 upgrade, API views, audit logs

---

## 3. Frontend — Đánh Giá Chi Tiết

### 3.1 Route Pages (57 routes)

Bao gồm: admin, athlete-portal, athletes, bracket, calendar, club(s), coaches, combat, community, dashboard, federation, finance, heritage, login/register, marketplace, medical, organizations, parent, portal, provincial, public, rankings, referee-scoring, reports, results, schedule, scoreboard, settings, spectator, teams, tournament, training, users, weigh-in...

### 3.2 Feature Modules (33 modules)

`admin`, `athletes`, `auth`, `calendar`, `club`, `clubs`, `community`, `components`, `dashboard`, `data`, `federation`, `finance`, `heritage`, `home`, `hooks`, `i18n`, `layout`, `mobile`, `notifications`, `organizations`, `parent`, `people`, `portals`, `provincial`, `public`, `pwa`, `rankings`, `reporting`, `settings`, `theme`, `tournament`, `training`, `user`

### 3.3 i18n

- **2 ngôn ngữ**: Tiếng Anh (`en.ts` - 27KB) + Tiếng Việt (`vi.ts` - 30KB)
- Với i18n Provider component

### 3.4 Shared Types (14 files)

`common.ts`, `tournament.ts`, `athlete.ts`, `scoring.ts`, `finance.ts`, `community.ts`, `heritage.ts`, `organization.ts`, `ranking.ts`, `training.ts`, `v7_infrastructure.ts`, `v7_security.ts`, `federation/`

---

## 4. ⚠️ Vấn Đề Hiện Tại

### 🔴 Critical: Go Backend Build Broken

> [!CAUTION]
> Backend **KHÔNG BUILD ĐƯỢC**. Cần fix ngay.

**File 1:** `athlete_profile_handler.go:326` — `notFound` function gọi sai số arguments.
```
too many arguments in call to notFound
    have (http.ResponseWriter, string)
    want (http.ResponseWriter)
```

**File 2:** `btc_handler.go` — **9 lỗi** cùng loại: handler functions thiếu tham số `auth.Principal`.
```
cannot use s.handleBTCMemberList (func(w http.ResponseWriter, r *http.Request))
  as func(http.ResponseWriter, *http.Request, auth.Principal) in argument to s.withAuth
```
Tất cả BTC handlers (`MemberList`, `MemberCreate`, `WeighInList`, `WeighInCreate`, `DrawList`, `DrawGenerate`, `AssignmentList`, `AssignmentCreate`, `TeamResults`) đều cần thêm tham số `auth.Principal`.

---

## 5. Đánh Giá Tổng Thể

### ✅ Điểm Mạnh

| Khía cạnh | Đánh giá |
|-----------|---------|
| **Kiến trúc** | Clean Architecture rõ ràng, tách biệt domain/adapter/handler |
| **Database** | 41 migrations chặt chẽ, có cả up/down, bao phủ GDPR/audit/event-sourcing |
| **Monorepo** | Tổ chức tốt với Turbo, shared packages, type-safety |
| **Domain Coverage** | 23 domain modules bao phủ toàn bộ nghiệp vụ |
| **Frontend Routes** | 57 routes — UI rất comprehensive |
| **i18n** | Song ngữ EN/VI với hệ thống provider |
| **Testing** | 22 unit test files + E2E tests |
| **DevOps** | Docker Compose, K8s config, CI scripts |
| **Regulations** | Tích hợp luật VCT 2024 (amendment_2024) |

### ⚠️ Điểm Cần Cải Thiện

| # | Vấn đề | Mức độ | Chi tiết |
|---|--------|--------|---------|
| 1 | **Build broken** | 🔴 Critical | `btc_handler.go` + `athlete_profile_handler.go` |
| 2 | **Nhiều module chỉ có In-memory store** | 🟡 High | `club`, `athlete`, `scoring`... chưa có PG adapter |
| 3 | **Test coverage thấp** | 🟡 High | 22 test files cho 23 domains + 36 handlers |
| 4 | **Expo app chưa phát triển** | 🟢 Low | Mobile app còn cơ bản |
| 5 | **Worker chưa implement** | 🟢 Low | `cmd/worker/` tồn tại nhưng chưa dùng |

---

## 6. 🎯 Đề Xuất Các Bước Hành Động Tiếp Theo

### Phase 1: Ổn Định (Ưu tiên CAO — 1-2 ngày)

1. **Fix Go build errors** — sửa `btc_handler.go` (thêm `auth.Principal` cho 9 handlers) và `athlete_profile_handler.go` (sửa `notFound` call)
2. **Chạy full test suite** — `go test ./...` + `npx tsc --noEmit` để xác nhận clean build
3. **Giải quyết migration conflict** — file `0041` tồn tại 2 bản (`club_voduong.sql` và `tournament_management.sql`)

### Phase 2: Chuyển Đổi Storage (Ưu tiên CAO — 1-2 tuần)

4. **Viết PostgreSQL adapters** cho các module còn dùng In-memory: `club`, `athlete`, `scoring`, `bracket`, `certification`, `discipline`
5. **Tích hợp Redis cache** cho các hot queries (rankings, scoreboard)

### Phase 3: Nâng Cao Chất Lượng (Ưu tiên TRUNG BÌNH — 2-3 tuần)

6. **Tăng test coverage** — mục tiêu 80%+ cho domain layer, integration tests cho PG adapters
7. **API documentation** — OpenAPI/Swagger spec cho tất cả endpoints
8. **Error handling** — standardize error responses (đã bắt đầu với `federation_errors.go`)

### Phase 4: Tính Năng & Polish (Ưu tiên TRUNG BÌNH — 2-4 tuần)

9. **Worker implementation** — background jobs cho: email notifications, report generation, data sync
10. **Frontend-Backend integration** — wire remaining mock pages to real API endpoints
11. **Real-time scoring** — hoàn thiện WebSocket flow cho chấm điểm trực tiếp
12. **PWA & Mobile** — hoàn thiện offline capability và Expo app

### Phase 5: Production Readiness (Ưu tiên khi deploy)

13. **Security audit** — JWT rotation, rate limiting, CORS hardening
14. **Performance testing** — load tests cho concurrent scoring scenarios
15. **CI/CD pipeline** — GitHub Actions workflow hoàn chỉnh
16. **Monitoring** — health checks, metrics, alerting

---

## 7. Thống Kê Nhanh

| Metric | Giá trị |
|--------|---------|
| **Backend Go files** | ~80+ files |
| **Frontend TS/TSX files** | ~200+ files |
| **DB Migrations** | 41 pairs (83 files) |
| **Test files** | 22 (backend) + E2E |
| **Shared type definitions** | 14 files |
| **i18n keys** | ~27KB EN + ~30KB VI |
| **Docker services** | 3 (postgres, backend, frontend) |
| **Domain modules** | 23 |
| **HTTP handlers** | 36 |
| **Next.js routes** | 57 |
| **Feature modules** | 33 |
