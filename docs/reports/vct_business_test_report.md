# 🧪 BÁO CÁO KIỂM THỬ NGHIỆP VỤ TOÀN DIỆN — VCT PLATFORM

> **Vai trò**: Tester nghiệp vụ | **Ngày**: 11/03/2026  
> **Phương pháp**: Static code analysis + business logic audit + operational simulation  
> **Phạm vi**: Toàn bộ 9 workspace × 17+ roles × 10 modules

---

## 📊 TỔNG QUAN HỆ THỐNG

| Chỉ số | Giá trị |
|---|---|
| Backend Handlers | 31 files |
| Frontend Pages | 125+ Page components |
| Next.js Routes | 54 directories |
| Auth Roles | 24 roles (12 core + 7 provincial + 4 club + 1 parent) |
| Workspaces | 9 types |
| Demo Accounts | 7 (admin, btc, ref-manager, referee, delegate, club-leader, parent) |
| E2E Tests | 2 files (rất thiếu) |

---

## 🔴 PHẦN 1: LỖI NGHIÊM TRỌNG (CRITICAL)

### C-01: Portal Hub vẫn dùng MOCK_WORKSPACE_CARDS hardcoded

**File**: [Page_portal_hub.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/portals/Page_portal_hub.tsx)

```
if (resolvedWorkspaces.length === 0) return MOCK_WORKSPACE_CARDS
```

> [!CAUTION]
> Khi `resolveWorkspacesForUser` trả về mảng rỗng (do role không match hoặc thiếu workspace binding), Portal Hub fallback về mock data. Người dùng **thấy workspace không thuộc quyền mình**, tạo **lỗ hổng bảo mật UX** — ví dụ VĐV thấy "Quản trị hệ thống".

**Ảnh hưởng**: Tất cả roles khi workspace resolver thất bại.

---

### C-02: Backend dùng 100% InMemory stores — MẤT DỮ LIỆU khi restart

Tất cả domain services đều wired với `InMem*Store`:

```go
// server.go
provincialSvc: provincial.NewService(provincial.NewInMemAssociationStore(), ...)
btcSvc: btc.NewService(btc.NewInMemStore(), ...)
parentSvc: parent.NewService(parent.NewInMemParentLinkStore(), ...)
federationSvc: federation.NewService(adapter.NewMemProvinceRepo(), ...)
```

> [!CAUTION]
> **Toàn bộ dữ liệu Federation, Provincial, BTC, Parent, Club** sẽ mất khi server restart. Chỉ có entity CRUD gốc (athletes, tournaments, etc.) dùng `CachedStore` có khả năng persistence (nếu Postgres được cấu hình). Đây là **deal-breaker cho vận hành thực tế**.

---

### C-03: Thiếu authorization guard trên nhiều handler nhóm

| Handler | Vấn đề |
|---|---|
| `federation_handler.go` | Các route dùng `withAuth` nhưng **không kiểm tra role** bên trong |
| `provincial_handler.go` | Tương tự — any authenticated user có thể CRUD provincial data |
| `club_handler.go` | Không phân biệt `club_leader` vs `coach` vs `athlete` |
| `btc_handler.go` | Chỉ check `withAuth`, không restrict theo `btc` role |

> [!WARNING]
> Bất kỳ user nào đã đăng nhập (kể cả `athlete` hoặc `parent`) đều có thể gọi các API của Federation/Provincial/BTC/Club nếu biết endpoint. RBAC chỉ enforce ở **frontend (UI hiding)**, không enforce ở **backend**.

---

### C-04: Role mismatch giữa Backend và Frontend

**Backend** (auth/service.go) định nghĩa **24 roles**:
- 12 core: admin, federation_president, federation_secretary, provincial_admin, technical_director, btc, referee_manager, referee, coach, delegate, athlete, medical_staff
- 7 provincial: provincial_president, provincial_vice_president, provincial_secretary, provincial_technical_head, provincial_referee_head, provincial_committee_member, provincial_accountant
- 4 club: club_leader, club_vice_leader, club_secretary, club_accountant
- 1 parent: parent

**Frontend** RBAC (entity-authz.generated.ts) chỉ có **12 roles**: Thiếu hoàn toàn nhóm provincial (7), club (4), parent (1). **Thiếu**: `vice_president`, `inspector`, `pr_manager`, `international_liaison`, `discipline_board` được liệt kê trong `USER_ROLE_OPTIONS` nhưng không có trong đó.

> [!IMPORTANT]
> Người dùng đăng nhập với role `provincial_president` hoặc `club_leader` sẽ **không có permission nào được resolve** ở frontend → UI rỗng hoặc lỗi.

---

### C-05: Demo accounts thiếu nhiều roles quan trọng

Chỉ có 7 demo users:

| Username | Role | Có thể test? |
|---|---|---|
| admin | admin | ✅ |
| btc | btc | ✅ |
| ref-manager | referee_manager | ✅ |
| referee | referee | ✅ |
| delegate | delegate | ✅ |
| club-leader | club_leader | ✅ |
| parent | parent | ✅ |
| ❌ federation_president | — | ❌ Không test được |
| ❌ coach | — | ❌ Không test được |
| ❌ athlete | — | ❌ Không test được |
| ❌ provincial_admin | — | ❌ Không test được |
| ❌ medical_staff | — | ❌ Không test được |

> **8+ roles quan trọng không có demo user** → Không thể kiểm thử qua login.

---

## 🟠 PHẦN 2: LỖI TRUNG BÌNH (MAJOR)

### M-01: Workspace stats dùng data cứng, không từ API

[Page_portal_hub.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/portals/Page_portal_hub.tsx) lines 175-211:

```typescript
const WORKSPACE_STATS = {
  federation_admin: [
    { label: 'CLB', value: 128 },  // Hardcoded!
    { label: 'VĐV', value: '2,450' },  // Hardcoded!
  ],
  // ...
}
```

Thống kê workspace luôn hiển thị số cố định (128 CLB, 2450 VĐV, etc.) bất kể hệ thống có bao nhiêu dữ liệu thực.

---

### M-02: Thiếu workspace types trong filter & navigation

`WORKSPACE_TYPES` set trong AuthProvider chỉ có 7 entries, **thiếu** `federation_provincial` và `federation_discipline` → người dùng không thể chọn workspace cho Provincial Admin hay Discipline Board.

---

### M-03: `tournamentCode` mặc định "VCT-2026" hardcoded

```typescript
// AuthProvider.tsx line 525
tournamentCode: session?.tournamentCode ?? 'VCT-2026',
```

Khi không có session, hệ thống fallback về mã giải cứng `VCT-2026`. Ở môi trường production với nhiều giải, code này gây confusion.

---

### M-04: E2E Tests gần như không có

Chỉ có 2 file test E2E:
- `appshell.breakpoints.spec.mjs` — test responsive breakpoints  
- `core-workflow.spec.mjs` — test workflow cơ bản

**Không có test cho**: Login flow, role switching, CRUD operations, scoring, tournament workflow, registration, finance, heritage — Tức **0% business coverage**.

---

### M-05: AuthProvider DEFAULT_USER role là 'delegate'

```typescript
const DEFAULT_USER: AuthUser = {
  id: 'guest',
  name: 'Khách vận hành',
  role: 'delegate',  // ← Vấn đề
}
```

Guest user có role `delegate` thay vì `guest` hoặc `viewer`. Điều này cho phép user **chưa đăng nhập** có quyền tương đương "Cán bộ đoàn" trên frontend (tạo appeals, create/update athletes, teams).

---

## 🟡 PHẦN 3: LỖI NHỎ & CẢI THIỆN (MINOR)

### m-01: Rate limiter không per-endpoint

Rate limiter hiện tại áp dụng **global** 100 burst / 10 req/s cho mọi IP. Không phân biệt:
- Login endpoint (cần strict hơn)
- Public API (có thể nới lỏng hơn)
- Scoring real-time (cần priority cao)

### m-02: X-Forwarded-For header chưa validate

```go
func extractClientIP(r *http.Request) string {
    ip := r.Header.Get("X-Forwarded-For")
    // Lấy giá trị đầu tiên trước dấu phẩy...
```

Không check trusted proxy → client có thể spoof IP để bypass rate limiting.

### m-03: CORS wildcard `*` có thể bật

```go
func (s *Server) isAllowedOrigin(origin string) bool {
    if _, ok := s.allowedOrigins["*"]; ok {
        return true  // Mở toàn bộ
    }
```

Nếu config chứa `*` → mọi domain có thể call API.

### m-04: 125+ page components nhưng i18n chưa đồng nhất

Nhiều page dùng chuỗi tiếng Việt cứng thay vì dùng `t('key')` từ i18n system.

### m-05: Body limit 10MB cho mọi route

```go
const maxRequestBodySize = 10 * 1024 * 1024 // 10MB
```

Scoring real-time hoặc login chỉ cần vài KB, nhưng limit 10MB tạo attack vector cho DoS.

---

## 📋 PHẦN 4: KIỂM THỬ THEO VAI TRÒ

### 4.1 Admin (admin / Admin@123)

| Module | Chức năng | Kết quả | Ghi chú |
|---|---|---|---|
| Portal Hub | Hiển thị workspaces | ⚠️ | Hiện mock data nếu resolver fail |
| Admin Dashboard | Tổng quan hệ thống | ⚠️ | Page tồn tại, data mock |
| User Management | CRUD users | ⚠️ | UI có nhưng chưa có API thực |
| Feature Flags | Toggle features | ⚠️ | Chỉ có UI |
| Audit Logs | Xem lịch sử | ✅ | API `/auth/audit` hoạt động |
| System Admin | Health/Cache stats | ✅ | `/healthz` hoạt động |

### 4.2 BTC (btc / Btc@123)

| Module | Chức năng | Kết quả | Ghi chú |
|---|---|---|---|
| Tournament CRUD | Tạo/sửa/xóa giải | ✅ | API có |
| Bracket Generation | Tạo bảng đấu | ✅ | API có |
| Registration | Đăng ký VĐV | ✅ | API có |
| Schedule | Lịch thi đấu | ⚠️ | UI có, data mock |
| Scoring | Chấm điểm | ✅ | Real-time API có |
| Weigh-in | Cân đo | ⚠️ | UI có, data mock |
| BTC Dashboard | Tổng quan giải | ✅ | API BTC Service đầy đủ |

### 4.3 Referee (referee / Judge@123)

| Module | Chức năng | Kết quả | Ghi chú |
|---|---|---|---|
| Scoring Console | Chấm điểm real-time | ✅ | WebSocket + REST |
| Match Management | Xem trận đấu | ✅ | Qua scoring API |
| Forms Scoring | Chấm quyền thuật | ✅ | Page tồn tại |
| Arena View | Chọn sân đấu | ⚠️ | UI có |

### 4.4 Club Leader (club-leader / Club@123)

| Module | Chức năng | Kết quả | Ghi chú |
|---|---|---|---|
| Club Dashboard | Tổng quan CLB | ✅ | Page + API wired |
| Members | Quản lý thành viên | ✅ | Provincial InMem store |
| Classes | Lớp học | ✅ | Provincial InMem store |
| Finance | Thu chi CLB | ✅ | Provincial InMem store |
| Certifications | Chứng chỉ đai | ✅ | Provincial InMem store |
| Training | Lịch tập | ⚠️ | UI có, data mock |

### 4.5 Parent (parent / Parent@123)

| Module | Chức năng | Kết quả | Ghi chú |
|---|---|---|---|
| Parent Dashboard | Theo dõi con | ✅ | API parent service wired |
| Consent | Đồng ý cho con thi đấu | ✅ | API có |
| Attendance | Điểm danh | ✅ | API InMem store |
| Results | Xem kết quả | ✅ | API có |

### 4.6 Các roles THIẾU demo account (❌ không test được)

| Role | Modules không thể test |
|---|---|
| federation_president | Org chart, approvals, finance, heritage, rankings |
| provincial_admin | Provincial management, sub-associations, coaches, referees |
| coach | Athletes, registration, teams, techniques |
| athlete | Athlete portal, tournaments, rankings, results |
| medical_staff | Weigh-ins, medical checks, athlete updates |
| technical_director | Techniques, heritage, belts, content categories |

---

## 📋 PHẦN 5: KIỂM THỬ THEO MODULE

### 5.1 Module Authentication (🔐)

| Test Case | Kết quả | Chi tiết |
|---|---|---|
| Login thành công | ✅ | JWT + bcrypt + audit log |
| Login sai mật khẩu | ✅ | Error code `ERR_INVALID_CREDENTIALS` |
| Token refresh | ✅ | Rotation + reuse detection |
| Logout + revoke | ✅ | Session invalidation |
| Register mới | ✅ | Self-registration |
| Brute force protection | ⚠️ | Rate limit global, không per-account |
| Password complexity | ❌ | **Không validate** — "123" cũng chấp nhận |
| Session timeout | ✅ | Configurable via config |
| Multi-device logout | ✅ | `revokeAll: true` |

### 5.2 Module Tournament Operations (🏆)

| Test Case | Kết quả | Chi tiết |
|---|---|---|
| Create tournament | ✅ | CRUD via entity handler |
| Open registration | ✅ | State machine action |
| Lock registration | ✅ | State machine action |
| Generate bracket | ✅ | Bracket service |
| Start tournament | ✅ | State machine action |
| Real-time scoring | ✅ | WebSocket hub wired |
| Assign medals | ✅ | Bracket handler |
| End tournament | ✅ | State machine action |
| Tournament lifecycle | ⚠️ | State machine exists nhưng thiếu validation tại some transitions |

### 5.3 Module Federation (🏛️)

| Test Case | Kết quả | Chi tiết |
|---|---|---|
| Province CRUD | ✅ | Federation service wired (InMem) |
| Unit management | ✅ | Federation service |
| Personnel | ✅ | Federation service |
| Master data | ✅ | FederationMasterDataStore |
| Approval workflows | ✅ | Approval service + workflow repo |
| Certifications | ✅ | Certification service |
| Discipline cases | ✅ | Discipline service |
| Documents | ✅ | Document service |
| International relations | ✅ | International service |
| **Data persistence** | ❌ | **Tất cả InMem — mất khi restart** |

### 5.4 Module Scoring & Real-time (⚡)

| Test Case | Kết quả | Chi tiết |
|---|---|---|
| WebSocket connection | ✅ | Hub supports first-message auth |
| Channel subscription | ✅ | Entity-level + item-level channels |
| Broadcast events | ✅ | EventBus → WebSocket bridge |
| Auth for WebSocket | ✅ | JWT validation on first message |
| Concurrent scoring | ⚠️ | Scoring service thread-safe nhưng chưa test load |

### 5.5 Module Finance (💰)

| Test Case | Kết quả | Chi tiết |
|---|---|---|
| Invoices | ✅ | Finance V2 handlers |
| Payments | ✅ | Confirm + record |
| Fee schedules | ✅ | List handler |
| Budgets | ✅ | Budget handler |
| Sponsorships | ✅ | CRUD handler |
| Financial reporting | ⚠️ | Thiếu aggregation endpoints |

---

## 🚀 PHẦN 6: ĐỀ XUẤT NÂNG CẤP & PHẢN BIỆN

### 🔴 Ưu tiên P0 (Must fix trước go-live)

| # | Đề xuất | Lý do |
|---|---|---|
| **U-01** | **Migrate InMem stores → PostgreSQL** cho toàn bộ domain services | Mất dữ liệu = hệ thống vô dụng trong production |
| **U-02** | **Enforce RBAC tại backend handler level** — Thêm role check vào mọi handler | Frontend-only RBAC = lỗ hổng bảo mật nghiêm trọng |
| **U-03** | **Xóa mock data fallback** trong Portal Hub → Hiện empty state + hướng dẫn | Tránh user thấy workspace không thuộc quyền mình |
| **U-04** | **Đồng bộ roles** frontend ↔ backend: thêm 12 roles thiếu vào `entity-authz.generated.ts` | Role login thành công nhưng UI không hiển thị gì |
| **U-05** | **Thêm password complexity validation** | Demo passwords quá yếu cho production |

### 🟠 Ưu tiên P1 (Cần làm trước UAT)

| # | Đề xuất | Lý do |
|---|---|---|
| **U-06** | Thêm **demo accounts** cho tất cả 24 roles | Không test = không phát hiện lỗi |
| **U-07** | **Per-endpoint rate limiting** — strict cho login, relaxed cho public | Bảo mật + user experience |
| **U-08** | **Trusted proxy validation** cho X-Forwarded-For | Tránh IP spoofing |
| **U-09** | Guest user role đổi thành `viewer` hoặc `guest` thay vì `delegate` | Nguyên tắc least privilege |
| **U-10** | **i18n audit** — tìm và thay tất cả hardcoded Vietnamese strings | Đa ngôn ngữ + maintain dễ hơn |

### 🟡 Ưu tiên P2 (Nice to have)

| # | Đề xuất | Lý do |
|---|---|---|
| **U-11** | Workspace stats từ API thay vì hardcoded | Dữ liệu thực tế, tin cậy |
| **U-12** | Per-route body size limits (scoring: 4KB, upload: 50MB) | Security hardening |
| **U-13** | Thêm CORS `Access-Control-Max-Age` header | Giảm preflight requests |
| **U-14** | **Comprehensive E2E test suite** (tối thiểu 30 test cases) | Business confidence |
| **U-15** | **Audit trail** cho mọi data change, không chỉ auth events | Compliance requirement |
| **U-16** | **Offline support** — PWA cho scoring tại sân đấu | Thực tế thi đấu thường mạng yếu |
| **U-17** | **Medical module completion** — weigh-in + medical clearance workflow | Bắt buộc theo quy chế giải |

---

## 📊 PHẦN 7: SCORECARD TỔNG QUAN

| Tiêu chí | Điểm (/10) | Ghi chú |
|---|---|---|
| **Authentication** | 8/10 | JWT flow solid, thiếu password policy |
| **Authorization (Backend)** | 3/10 | Hầu hết handler thiếu role check |
| **Authorization (Frontend)** | 6/10 | RBAC policy tồn tại nhưng thiếu 12 roles |
| **Data Persistence** | 3/10 | Chỉ entity CRUD có Postgres, còn lại InMem |
| **Real-time** | 8/10 | WebSocket hub well-designed |
| **Tournament Workflow** | 7/10 | State machine có, thiếu edge case validation |
| **UI/UX Quality** | 7/10 | Design premium, nhưng nhiều mock data |
| **API Design** | 7/10 | RESTful, có versioning, thiếu pagination chuẩn |
| **Test Coverage** | 2/10 | 2 E2E tests, vài unit tests |
| **Production Readiness** | 3/10 | InMem stores + missing auth = chưa sẵn sàng |

### **Điểm tổng: 5.4/10** — Cần address P0 issues trước khi vận hành thực tế.

---

> [!IMPORTANT]
> **Kết luận**: Kiến trúc hệ thống vững chắc (Clean Architecture, modular design, real-time support), nhưng **3 vấn đề blocking** cho production:
> 1. In-Memory stores → mất dữ liệu
> 2. Backend thiếu role authorization → lỗ hổng bảo mật  
> 3. Role mismatch FE/BE → UI broken cho 12 roles
>
> Recommend bắt đầu với **U-01 → U-02 → U-04** theo thứ tự, song song với **U-06** để enable testing.
