# VCT Platform — API Architecture Rules

> **Mục đích**: Bộ quy tắc toàn diện quản trị thiết kế, chuẩn hóa, và bảo vệ chất lượng API cho toàn hệ thống VCT Platform.
> Mọi endpoint mới **PHẢI** tuân thủ 100% tài liệu này. Vi phạm bất kỳ quy tắc nào sẽ bị từ chối khi review.

> [!IMPORTANT]
> Tài liệu này bổ sung cho [`backend-architecture.md`](file:///d:/VCT%20PLATFORM/vct-platform/docs/architecture/backend-architecture.md) và [`architecture-guard-rails.md`](file:///d:/VCT%20PLATFORM/vct-platform/docs/architecture/architecture-guard-rails.md). Khi có xung đột, tài liệu nào chi tiết hơn sẽ được ưu tiên.

---

## 1. Base URL & Environments

| Môi trường  | Base URL                                    | Ghi chú                |
| ----------- | ------------------------------------------- | ---------------------- |
| Production  | `https://api.vctplatform.vn/api/v1`         | TLS bắt buộc           |
| Staging     | `https://staging-api.vctplatform.vn/api/v1` | Dữ liệu test          |
| Development | `http://localhost:18080/api/v1`              | `VCT_STORAGE_DRIVER=*` |

---

## 2. URL Design Convention

### 2.1 Quy tắc đường dẫn

| Mẫu                                     | Ý nghĩa                   | Ví dụ                                      |
| ---------------------------------------- | -------------------------- | ------------------------------------------ |
| `/api/v{N}/{resource}/`                  | Collection (List / Create) | `GET /api/v1/athletes/`                    |
| `/api/v{N}/{resource}/{id}`              | Single item (Get/Put/Del)  | `GET /api/v1/athletes/abc-123`             |
| `/api/v{N}/{resource}/{id}/{sub}`        | Sub-resource               | `GET /api/v1/athletes/abc-123/belt-history`|
| `/api/v{N}/{resource}-action/{verb}`     | Custom Action (RPC-style)  | `POST /api/v1/tournament-action/generate-brackets` |
| `/api/v{N}/{module}/{sub-module}/`       | Module group               | `GET /api/v1/finance/invoices/`            |
| `/api/v1/public/{resource}/`             | Public (unauthenticated)   | `GET /api/v1/public/tournaments/`          |

### 2.2 Naming Rules

| #   | Quy tắc                                           | Ví dụ đúng                | Ví dụ sai               |
| --- | -------------------------------------------------- | ------------------------ | ----------------------- |
| U1  | Resource names dùng **kebab-case, plural, English** | `belt-ranks`             | `BeltRanks`, `belt_rank`|
| U2  | Trailing slash `/` cho collection routes           | `/api/v1/athletes/`      | `/api/v1/athletes`      |
| U3  | Không trailing slash cho item routes               | `/api/v1/athletes/{id}`  | `/api/v1/athletes/{id}/`|
| U4  | Không dùng verb trong URL cho CRUD                 | `POST /athletes/`        | `POST /athletes/create` |
| U5  | Custom actions dùng `{resource}-action/{verb}`     | `/tournament-action/draw`| `/tournaments/draw`     |
| U6  | Tối đa **3 cấp** nesting cho sub-resources         | ✅ `/clubs/{id}/members/` | ❌ `/fed/{id}/province/{pid}/club/{cid}/members/` |
| U7  | Query params dùng **snake_case**                    | `?page_size=20`          | `?pageSize=20`         |

---

## 3. HTTP Methods & Status Codes

### 3.1 Method Mapping

| Method   | Mục đích                    | Idempotent | Body | Response              |
| -------- | --------------------------- | ---------- | ---- | --------------------- |
| `GET`    | Lấy resource                | ✅          | ❌    | `200` + data          |
| `POST`   | Tạo mới resource            | ❌          | ✅    | `201` + created item  |
| `PUT`    | Cập nhật toàn phần          | ✅          | ✅    | `200` + updated item  |
| `PATCH`  | Cập nhật một phần           | ❌          | ✅    | `200` + updated item  |
| `DELETE` | Xóa mềm (soft-delete)      | ✅          | ❌    | `204` No Content      |

### 3.2 Standard Status Code Map

| Status | Code Constant   | Khi nào dùng                                                    |
| ------ | --------------- | --------------------------------------------------------------- |
| `200`  | —               | Thành công GET/PUT/PATCH                                         |
| `201`  | —               | Tạo thành công POST                                              |
| `202`  | —               | Accepted — tác vụ nặng đã được đẩy vào Background Worker        |
| `204`  | —               | Delete thành công, không body                                    |
| `400`  | `BAD_REQUEST`   | JSON parse lỗi, thiếu field bắt buộc                             |
| `401`  | `UNAUTHORIZED`  | Thiếu hoặc sai token                                             |
| `403`  | `FORBIDDEN`     | Token hợp lệ nhưng thiếu quyền (RBAC)                            |
| `404`  | `NOT_FOUND`     | Resource không tồn tại                                            |
| `405`  | `BAD_REQUEST`   | HTTP method không hỗ trợ                                          |
| `409`  | `CONFLICT`      | Trùng dữ liệu hoặc Optimistic Lock conflict (version mismatch)   |
| `410`  | —               | API version đã Sunset (không còn phục vụ)                         |
| `422`  | `VALIDATION_ERROR` | Input hợp lệ JSON nhưng vi phạm business rule                 |
| `429`  | `RATE_LIMITED`  | Quá nhiều request — trả kèm `Retry-After` header                  |
| `500`  | `INTERNAL_ERROR`| Lỗi server — **CẤM** rò rỉ stack trace                            |

---

## 4. Request & Response Envelope

### 4.1 Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "page_size": 20,
    "total": 142,
    "total_pages": 8,
    "next_cursor": "eyJpZCI6Ijk5OSJ9"
  }
}
```

| Field  | Bắt buộc | Ghi chú                                        |
| ------ | -------- | ---------------------------------------------- |
| `success` | ✅    | Luôn `true` khi HTTP 2xx                        |
| `data`    | ✅    | Object hoặc Array                                |
| `meta`    | ❎    | Bắt buộc cho list endpoints có pagination        |

### 4.2 Error Response

```json
{
  "success": false,
  "error": {
    "code": "ATHLETE_NOT_ELIGIBLE",
    "message": "Vận động viên chưa đủ tuổi thi đấu hạng Pro",
    "details": {
      "min_age": 18,
      "current_age": 16,
      "field": "date_of_birth"
    }
  }
}
```

| Field              | Bắt buộc | Ghi chú                                               |
| ------------------ | -------- | ----------------------------------------------------- |
| `error.code`       | ✅        | UPPER_SNAKE_CASE — dùng cho frontend switch/case       |
| `error.message`    | ✅        | Chuỗi mô tả tiếng Việt (sẽ dịch phía frontend nếu i18n) |
| `error.details`    | ❎        | Object chứa thông tin debug (field errors, context)     |

### 4.3 Error Code Registry

Tất cả error codes phải khai báo trong `internal/httpapi/apierror.go`. Danh mục chuẩn:

| Code                     | HTTP | Mô tả                                           |
| ------------------------ | ---- | ----------------------------------------------- |
| `VALIDATION_ERROR`       | 400  | Input validation failed                          |
| `BAD_REQUEST`            | 400  | Malformed request                                |
| `UNAUTHORIZED`           | 401  | Missing / invalid authentication                 |
| `FORBIDDEN`              | 403  | Insufficient permissions                         |
| `NOT_FOUND`              | 404  | Resource not found                               |
| `CONFLICT`               | 409  | Duplicate / Optimistic Lock violation             |
| `DUPLICATE`              | 409  | Unique constraint violation                      |
| `RATE_LIMITED`           | 429  | Rate limit exceeded                              |
| `INTERNAL_ERROR`         | 500  | Server error (KHÔNG rò rỉ chi tiết)               |
| `STATE_TRANSITION_ERROR` | 422  | State machine từ chối chuyển trạng thái           |
| `QUOTA_EXCEEDED`         | 429  | Vượt quota (VD: số VĐV tối đa trong CLB)         |

> [!CAUTION]
> Domain Service **CẤM** trả HTTP status code trực tiếp. Service trả Domain Error → Handler map sang HTTP status + error code tại `writeAuthError()` hoặc `apiError()`.

---

## 5. Authentication & Authorization

### 5.1 Token Flow

```
Client → Authorization: Bearer <JWT> → withAuth Middleware → auth.Principal → Handler
```

| Quy tắc | Chi tiết                                                                |
| ------- | ----------------------------------------------------------------------- |
| A1      | Mọi endpoint (trừ `/public/*`, `/healthz`, `/readyz`) **BẮT BUỘC** auth |
| A2      | Token type: JWT (HS256), issued bởi `auth.Service`                       |
| A3      | Access Token TTL: 15 phút. Refresh Token TTL: 7 ngày                    |
| A4      | Token revocation qua Redis blacklist — check tại middleware              |
| A5      | WebSocket auth: First-message `{"action":"auth","token":"xxx"}`          |

### 5.2 Authorization (RBAC)

```go
// ✅ ĐÚNG: Dùng requireRole helper
func (s *Server) handleSomething(w http.ResponseWriter, r *http.Request, p auth.Principal) {
    if !requireRole(w, p, auth.RoleAdmin, auth.RoleFederationPresident) {
        return // 403 đã được ghi
    }
    // ... logic
}

// ❌ SAI: Hardcode role check
if p.User.Role == "admin" { ... }
```

| Quy tắc | Chi tiết                                                                     |
| ------- | ---------------------------------------------------------------------------- |
| R1      | Dùng `requireRole()` hoặc `authz.CanEntityAction()` — **CẤM** hardcode role |
| R2      | Role groups được khai báo tập trung trong `middleware.go`                     |
| R3      | Multi-tenant: `TenantID` từ JWT, enforce qua RLS hoặc adapter WHERE clause  |

---

## 6. API Versioning

### 6.1 Chiến lược

VCT Platform sử dụng **URI-path versioning** là phương thức chính, hỗ trợ fallback qua Accept header và `X-API-Version` header.

```
Ưu tiên trích xuất version:
  1. URL path: /api/v1/... → "v1"
  2. Accept header: application/vnd.vct.v2+json → "v2"
  3. X-API-Version header: v1
  4. Query param: ?version=v1
```

### 6.2 Lifecycle

```
Active → Deprecated (+ Sunset header) → Sunset (410 Gone)
```

| Quy tắc | Chi tiết                                                                       |
| ------- | ------------------------------------------------------------------------------ |
| V1      | Mọi route **BẮT BUỘC** có version prefix (`/api/v1/`)                          |
| V2      | Version deprecated phải set `Deprecation` + `Sunset` + `Link` headers          |
| V3      | Version sunset trả `410 Gone` + `successor` info                              |
| V4      | Giữ backward compatibility tối thiểu **12 tháng** sau khi deprecate             |
| V5      | Breaking changes (đổi payload structure) → phải tạo version mới                 |
| V6      | Additive changes (thêm field mới) → KHÔNG cần version mới                       |

### 6.3 Response Headers

Middleware `apiversioning.Middleware` tự động gắn:

| Header            | Ý nghĩa                          | Ví dụ                                   |
| ----------------- | -------------------------------- | --------------------------------------- |
| `X-API-Version`   | Version đang phục vụ              | `v1`                                    |
| `X-API-Status`    | Lifecycle status                  | `active`, `deprecated`, `sunset`        |
| `Deprecation`     | Ngày version bị deprecated        | `Thu, 01 Jan 2026 00:00:00 GMT`         |
| `Sunset`          | Ngày version ngừng phục vụ        | `Thu, 01 Jul 2026 00:00:00 GMT`         |
| `Link`            | Link tới version kế nhiệm         | `</api/v2>; rel="successor-version"`    |
| `X-API-Warn`      | Cảnh báo deprecation dạng text    | `API version v1 is deprecated, ...`     |

---

## 7. Pagination

### 7.1 Hai chiến lược

| Chiến lược        | Khi nào dùng                                     | Query params                              |
| ----------------- | ------------------------------------------------ | ----------------------------------------- |
| **Offset-based**  | Bảng < 50,000 rows, cần nhảy trang               | `?page=2&page_size=20`                    |
| **Cursor-based**  | Bảng lớn (logs, events, transactions, audit)      | `?cursor=eyJpZCI6Ijk5OSJ9&page_size=20`  |

### 7.2 Quy tắc

| #   | Quy tắc                                                                        |
| --- | ------------------------------------------------------------------------------- |
| P1  | Mọi List API **BẮT BUỘC** phải phân trang — **CẤM** trả toàn bộ records        |
| P2  | `page_size` mặc định: `20`, tối đa: `100`                                      |
| P3  | Bảng > 50,000 rows **BẮT BUỘC** dùng Cursor-based                               |
| P4  | Response `meta` phải chứa đủ: `page`, `page_size`, `total`, `total_pages`        |
| P5  | Cursor-based: `meta` chứa `next_cursor` (base64 encoded keyset)                 |
| P6  | **CẤM** dùng `OFFSET` lớn (> 10,000) — phải chuyển sang Cursor                  |

### 7.3 Implementation Pattern

```go
// Offset-based (bảng nhỏ)
SELECT * FROM athletes
WHERE deleted_at IS NULL AND club_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

// Cursor-based (bảng lớn)
SELECT * FROM audit_logs
WHERE id > $1 AND tenant_id = $2
ORDER BY id ASC
LIMIT $3;
```

---

## 8. Filtering, Sorting & Search

### 8.1 Filtering

```
GET /api/v1/athletes/?status=active&club_id=CLB-001&belt_rank=black
```

| Quy tắc | Chi tiết                                                                |
| ------- | ----------------------------------------------------------------------- |
| F1      | Filter params dùng **snake_case**, match tên field trong DB              |
| F2      | Chỉ cho phép filter trên fields **có index** — tránh full table scan     |
| F3      | Multi-value filter dùng comma: `?status=active,pending`                  |
| F4      | Date range: `?created_from=2025-01-01&created_to=2025-12-31`            |
| F5      | Boolean: `?is_verified=true` (string, không phải boolean)                |

### 8.2 Sorting

```
GET /api/v1/athletes/?sort_by=created_at&sort_order=desc
```

| Quy tắc | Chi tiết                                                                     |
| ------- | ---------------------------------------------------------------------------- |
| S1      | Chỉ cho phép sort trên fields **có index**                                    |
| S2      | `sort_order` chỉ chấp nhận `asc` hoặc `desc`, mặc định `desc`              |
| S3      | Multi-sort: `?sort_by=status,created_at&sort_order=asc,desc`                 |
| S4      | Fields cho phép sort phải được whitelist — **CẤM** sort trên field arbitrary  |

### 8.3 Search

```
GET /api/v1/athletes/?q=Nguyễn
```

| Quy tắc | Chi tiết                                                          |
| ------- | ----------------------------------------------------------------- |
| Q1      | Full-text search param: `q` (query)                              |
| Q2      | Tối thiểu 2 ký tự                                                |
| Q3      | Backend dùng `ILIKE` cho search đơn giản, Meilisearch cho nâng cao |

---

## 9. Handler Pattern (3-Step Rule)

Mọi HTTP handler **BẮT BUỘC** chỉ thực hiện đúng 3 bước:

```
Parse Input → Call Service → Write Response
```

### 9.1 Template chuẩn

```go
// internal/httpapi/{module}_handler.go

// Step 1: Route dispatcher
func (s *Server) handleAthleteRoutes(w http.ResponseWriter, r *http.Request) {
    switch r.Method {
    case http.MethodGet:
        s.handleAthleteList(w, r)
    case http.MethodPost:
        s.withAuth(s.handleAthleteCreate)(w, r)
    default:
        apiMethodNotAllowed(w)
    }
}

// Step 2: Individual handler
func (s *Server) handleAthleteCreate(w http.ResponseWriter, r *http.Request, p auth.Principal) {
    // ① Parse
    var input athlete.CreateInput
    if err := decodeJSON(r, &input); err != nil {
        apiBadRequest(w, err)
        return
    }
    // ② Call Service
    result, err := s.athleteSvc.Create(r.Context(), input)
    if err != nil {
        mapDomainError(w, err) // map domain error → HTTP
        return
    }
    // ③ Respond
    success(w, http.StatusCreated, result)
}
```

### 9.2 Anti-patterns

```go
// ❌ SAI: Business logic trong handler
func (s *Server) handleAthleteCreate(...) {
    if input.Age < 18 && input.Category == "ProFight" {
        // Business rule KHÔNG ĐƯỢC ở đây
    }
}

// ❌ SAI: Truy cập DB trực tiếp trong handler
func (s *Server) handleAthleteList(...) {
    rows, _ := s.sqlDB.Query("SELECT * FROM athletes")
}

// ❌ SAI: Response format không chuẩn
w.Write([]byte(`{"status":"ok"}`)) // CẤM — phải dùng success() / apiError()
```

---

## 10. Middleware Stack

Thứ tự middleware là **CỨNG**, không được thay đổi:

```
Request
  → withRecover          # Panic recovery → 500
  → withRequestID        # X-Request-ID injection
  → withSecurityHeaders  # X-Content-Type-Options, X-Frame-Options, ...
  → withRateLimit        # Token bucket per IP
  → withBodyLimit        # Max 10MB body
  → withCSRF             # Origin validation (skip safe methods)
  → withCORS             # CORS headers from VCT_CORS_ORIGINS
  → withLogging          # Structured access log
  → [withAuth]           # JWT validation (per-route)
  → Handler
```

### 10.1 Quy tắc Middleware

| #   | Quy tắc                                                                        |
| --- | ------------------------------------------------------------------------------- |
| M1  | Middleware mới đăng ký trong `middleware.go`, chain trong `server.go Handler()`  |
| M2  | **CẤM** wrap middleware bên trong handler function                               |
| M3  | Auth middleware (`withAuth`) áp dụng **per-route**, không global                 |
| M4  | Rate limit có 2 tier: Global (100 req/s) + Login (5 req/min per IP)             |
| M5  | Body limit mặc định 10MB, dùng `withBodyLimitSize()` cho route-specific override|

---

## 11. Rate Limiting

### 11.1 Tiers

| Tier         | Rate                 | Burst | Áp dụng                               |
| ------------ | -------------------- | ----- | -------------------------------------- |
| **Global**   | 100 tokens/giây      | 200   | Tất cả endpoints                       |
| **Auth**     | 5 tokens/phút        | 10    | `/auth/login`, `/auth/register`, OTP   |
| **Sensitive**| 10 tokens/phút       | 20    | Password reset, delete operations      |

### 11.2 Response Headers

```
HTTP/1.1 429 Too Many Requests
Retry-After: 1
Content-Type: application/json

{"code":"RATE_LIMITED","message":"Quá nhiều yêu cầu, vui lòng thử lại sau"}
```

---

## 12. Idempotency

### 12.1 Khi nào bắt buộc

Các thao tác **không thể đảo ngược** yêu cầu Idempotency Key:

- Tạo/sửa kết quả trận đấu (scoring)
- Thanh toán / tạo giao dịch tài chính
- Cấp chứng nhận / thăng đai
- Phê duyệt / từ chối workflow

### 12.2 Protocol

```
POST /api/v1/transactions/
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{ "amount": 500000, "type": "registration_fee" }
```

| Quy tắc | Chi tiết                                                                              |
| ------- | ------------------------------------------------------------------------------------- |
| I1      | Client phải generate UUID v4 duy nhất cho mỗi mutation                                 |
| I2      | Backend lưu key + response vào cache (Redis/DB), TTL: 24 giờ                           |
| I3      | Request lặp (trùng key) → trả ngay response cũ, HTTP `200`                             |
| I4      | Key rỗng hoặc thiếu cho sensitive endpoint → HTTP `400` + `IDEMPOTENCY_KEY_REQUIRED`   |

---

## 13. Concurrency Control

### 13.1 Optimistic Locking (CRUD thông thường)

```json
// PUT /api/v1/athletes/abc-123
{
  "name": "Nguyễn Văn A",
  "version": 3
}
```

Backend kiểm tra:
```sql
UPDATE athletes SET name = $1, version = version + 1, updated_at = now()
WHERE id = $2 AND version = $3;
-- Nếu affected rows = 0 → 409 CONFLICT
```

### 13.2 Pessimistic Locking (Scoring)

```sql
BEGIN;
SELECT * FROM match_scores WHERE match_id = $1 FOR UPDATE;
-- ... cập nhật điểm ...
COMMIT;
```

| Quy tắc | Chi tiết                                                             |
| ------- | -------------------------------------------------------------------- |
| C1      | Mọi bảng CRUD phải có field `version INT DEFAULT 1`                   |
| C2      | `PUT` / `PATCH` bắt buộc gửi `version` hiện tại                     |
| C3      | Version mismatch → `409 Conflict` + `CONFLICT` error code             |
| C4      | `SELECT FOR UPDATE` **CHỈ** dùng cho module Scoring                   |

---

## 14. Async Operations Pattern

Tác vụ chạy > 300ms **CẤM** block HTTP response:

```
POST /api/v1/tournament-action/generate-brackets
→ 202 Accepted
{
  "success": true,
  "data": {
    "job_id": "job-abc-123",
    "status": "queued",
    "status_url": "/api/v1/jobs/job-abc-123"
  }
}

GET /api/v1/jobs/job-abc-123
→ 200 OK
{
  "job_id": "job-abc-123",
  "status": "completed",
  "result": { ... },
  "progress": 100
}
```

| Tác vụ                      | Phương thức        |
| --------------------------- | ------------------ |
| Bốc thăm nhánh thi đấu      | Background Worker  |
| Xuất báo cáo PDF/Excel      | Streaming / Worker |
| Gửi batch email/SMS         | Outbox + Worker    |
| Cấp hàng loạt chứng chỉ     | Background Worker  |

---

## 15. Data Format Standards

### 15.1 Field Naming

| Loại                | Convention     | Ví dụ                           |
| ------------------- | -------------- | ------------------------------- |
| JSON response field | `snake_case`   | `first_name`, `created_at`      |
| URL path segment    | `kebab-case`   | `belt-ranks`, `weight-classes`  |
| Query parameter     | `snake_case`   | `page_size`, `sort_by`          |
| Error code          | `UPPER_SNAKE`  | `ATHLETE_NOT_FOUND`             |

### 15.2 Data Types

| Loại              | Format                    | Ví dụ                               |
| ----------------- | ------------------------- | ----------------------------------- |
| ID                | UUID v4 string            | `"550e8400-e29b-41d4-a716-446655440000"` |
| Timestamp         | ISO 8601 (UTC, RFC 3339)  | `"2025-03-26T10:30:00Z"`            |
| Date              | `YYYY-MM-DD`              | `"2025-03-26"`                       |
| Money (VNĐ)       | Integer (đồng)            | `500000` (= 500.000 VNĐ)            |
| Boolean           | JSON `true`/`false`       | `true`                               |
| Enum              | UPPER_SNAKE_CASE string   | `"ACTIVE"`, `"PENDING_APPROVAL"`     |
| Phone             | E.164 format              | `"+84901234567"`                     |
| Email             | Lowercase                 | `"user@example.com"`                 |
| File size         | Bytes (integer)           | `1048576` (= 1MB)                    |

### 15.3 Null Handling

| #   | Quy tắc                                                                     |
| --- | --------------------------------------------------------------------------- |
| N1  | Field optional vắng value → trả `null` hoặc **omit** (`omitempty` tag)       |
| N2  | **CẤM** trả empty string `""` thay cho `null`                                |
| N3  | Array rỗng → trả `[]`, **KHÔNG** trả `null`                                  |

---

## 16. Security Rules

### 16.1 Input Validation

| #    | Quy tắc                                                                   |
| ---- | ------------------------------------------------------------------------- |
| S1   | **CẤM** interpolation SQL — bắt buộc dùng parameterized queries (`$1`)    |
| S2   | `decodeJSON()` **BẮT BUỘC** dùng `DisallowUnknownFields()`                |
| S3   | Validate input size: body max 10MB mặc định, login body max 1KB           |
| S4   | Sanitize output: **CẤM** trả nguyên stack trace trong error response     |
| S5   | IDOR prevention: Mọi `GET/PUT/DELETE /{id}` phải verify ownership/RBAC   |

### 16.2 Headers bảo mật (tự động bởi middleware)

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 16.3 CORS

```
Access-Control-Allow-Origin: <allowed-origin>
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, X-CSRF-Token, X-Request-ID
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

> [!WARNING]
> Wildcard `*` origin CẤM dùng trên production/staging. Chỉ chấp nhận trên development.

---

## 17. Observability

### 17.1 Request Tracing

Mọi request được gắn `X-Request-ID` (auto-generated nếu client không gửi). ID này theo xuyên suốt:

```
HTTP Request → Middleware → Service → Adapter → DB Query → Logs
```

### 17.2 Access Log Format

```json
{
  "ts": "2025-03-26T10:30:00Z",
  "rid": "a1b2c3d4e5f6g7h8",
  "method": "POST",
  "path": "/api/v1/athletes/",
  "status": 201,
  "latency_ms": 45,
  "ip": "103.1.2.3",
  "ua": "VCT-Mobile/1.0"
}
```

### 17.3 Response Headers cho monitoring

| Header                  | Giá trị                | Mục đích              |
| ----------------------- | ---------------------- | --------------------- |
| `X-Request-ID`          | UUID/hex string        | Trace correlation     |
| `X-RateLimit-Remaining` | Integer                | Rate limit info       |
| `X-API-Version`         | `v1`                   | Active version        |

---

## 18. Health Check Endpoints

| Endpoint    | Auth | Mục đích                                      | Response khi OK       |
| ----------- | ---- | --------------------------------------------- | --------------------- |
| `/healthz`  | ❌    | Liveness probe — server có đang chạy            | `200 {"status":"ok"}` |
| `/readyz`   | ❌    | Readiness probe — DB + Redis connected          | `200 {"status":"ok"}` |
| `/`         | ❌    | Root info — version, uptime, build              | `200 { info }`        |

> `/readyz` phải **PING** PostgreSQL + Redis thật. Nếu DB nghẽn → trả `503`.

---

## 19. WebSocket API

### 19.1 Connection

```
ws://localhost:18080/api/v1/ws
```

### 19.2 Protocol

```json
// Auth (first message)
{"action": "auth", "token": "<JWT>"}

// Subscribe
{"action": "subscribe", "channel": "athletes"}
{"action": "subscribe", "channel": "match:MATCH-001"}

// Unsubscribe
{"action": "unsubscribe", "channel": "athletes"}
```

### 19.3 Event Push Format

```json
{
  "type": "entity.updated",
  "channel": "athletes",
  "entity_id": "abc-123",
  "payload": { ... },
  "timestamp": "2025-03-26T10:30:00Z"
}
```

| Quy tắc | Chi tiết                                                             |
| ------- | -------------------------------------------------------------------- |
| W1      | WebSocket Hub **KHÔNG** lưu state — state nằm trong DB/Redis         |
| W2      | Event flow: Handler → EventBus → Hub → Client                       |
| W3      | **CẤM** push data trực tiếp từ HTTP handler vào WebSocket            |
| W4      | Client phải auto-reconnect với Exponential Backoff                   |
| W5      | Sau reconnect, phải fetch lại data mới nhất qua HTTP GET             |

---

## 20. Route Registration Rules

### 20.1 Vị trí đăng ký

Tất cả routes đăng ký tại `internal/httpapi/server.go` → method `Handler()`.

### 20.2 Patterns

```go
// Pattern 1: Direct HandleFunc (cho routes đơn giản)
mux.HandleFunc("/api/v1/athletes/", s.handleAthleteRoutes)

// Pattern 2: Delegated registration (cho module phức tạp)
s.handleFederationRoutes(mux)    // method trên Server, nhận mux

// Pattern 3: External handler (cho module độc lập)
divisions.NewHandler().RegisterRoutes(mux)
```

### 20.3 Quy tắc

| #   | Quy tắc                                                                    |
| --- | --------------------------------------------------------------------------- |
| R1  | Mỗi domain module **1 file** handler: `{module}_handler.go`                |
| R2  | Route registration tập trung tại `Handler()` — **CẤM** đăng ký rải rác     |
| R3  | Auth-protected routes dùng `s.withAuth(...)` wrapper                        |
| R4  | Public routes nằm dưới `/api/v1/public/` — không cần auth                  |
| R5  | Thêm route mới **BẮT BUỘC** cập nhật `api-design.md` hoặc OpenAPI spec     |

---

## 21. API Documentation Requirements

| #   | Quy tắc                                                                        |
| --- | ------------------------------------------------------------------------------- |
| D1  | Mọi endpoint mới phải cập nhật `docs/api/openapi.yaml` hoặc `api-design.md`    |
| D2  | PR thay đổi API **BẮT BUỘC** ghi rõ Breaking vs Non-breaking change             |
| D3  | Request/Response examples phải là JSON hợp lệ, không placeholder               |
| D4  | Error codes mới phải thêm vào Error Code Registry (Mục 4.3)                     |
| D5  | Deprecated endpoints phải document sunset timeline                               |

---

## 22. Checklist — Trước khi tạo API mới

```
□ URL tuân thủ naming convention (kebab-case, plural, max 3 levels)
□ HTTP method đúng semantic (GET=read, POST=create, PUT=update, DELETE=delete)
□ Handler chỉ làm 3 bước: Parse → Service → Respond
□ Response dùng envelope chuẩn (success/error format)
□ Error codes khai báo trong apierror.go
□ Auth middleware applied (hoặc route nằm dưới /public/)
□ RBAC roles checked via requireRole() hoặc CanEntityAction()
□ Pagination implemented cho list endpoints
□ Input validation tại handler layer
□ Parameterized SQL queries ($1, $2)
□ Migration có cả .sql và _down.sql
□ Route registered tại server.go → Handler()
□ API documentation updated
□ Domain errors (KHÔNG HTTP codes) trong service layer
□ Sensitive operations có Idempotency-Key support
□ Large datasets dùng Cursor-based pagination
```

---

## Tham khảo

- [VCT Backend Architecture](file:///d:/VCT%20PLATFORM/vct-platform/docs/architecture/backend-architecture.md)
- [VCT Architecture Guard Rails](file:///d:/VCT%20PLATFORM/vct-platform/docs/architecture/architecture-guard-rails.md)
- [API Versioning Implementation](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/apiversioning/versioning.go)
- [API Error Envelope](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/httpapi/apierror.go)
- [HTTP Middleware Stack](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/httpapi/middleware.go)
- [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines)
- [Google API Design Guide](https://cloud.google.com/apis/design)
