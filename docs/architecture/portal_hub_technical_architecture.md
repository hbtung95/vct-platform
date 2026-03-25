# Bản Thiết kế Kiến trúc Kỹ thuật - Portal Hub VCT Platform

**Trạng thái**: Bản thảo Kiến trúc (Architecture Draft)
**Dựa trên**: `portal_hub_business_analysis.md`
**Người thiết kế**: VCT Agent Architecture Team

---

## 1. Phân tích Khối UI/UX (Frontend Design System)

Để đạt chuẩn mực định vị "Không gian thở" và "Glassmorphism" của Enterprise Portal, chúng ta cần một hệ thống CSS Tokens (Tailwind v4) và Micro-interactions chuẩn mực.

### 1.1 Khung Layout (Layout Component)

- **Bypass Global Sidebar**: Ở cấp độ Root Layout (`AppShell.tsx`), chúng ta bắt buộc phải có điều kiện ngắt ngầm `if (isPortalRoute)`. Sidebar Width sẽ bằng `0px`.
- **Container**: Sử dụng `max-w-7xl mx-auto` để giới hạn chiều rộng nội dung thay vì trải dài 100% gây loãng.

### 1.2 Design Tokens (Tailwind v4 Variables)

- **Nền (Background)**:
  - Dark mode gốc: `--vct-bg-base: #0B0F19`.
  - Ánh sáng Ambient (Orbs): Sử dụng 3 khối Blur khổng lồ đằng sau `bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]` với tông màu `purple-900/40` và `blue-900/30`.
- **Thẻ Kính (Glass Card)**:
  - Dark Mode: `bg-white/5 backdrop-blur-xl border border-white/10`. Tương phản text `text-zinc-100`.
  - Light Mode: `bg-white/80 backdrop-blur-xl border border-zinc-200/50`. Tương phản text `text-zinc-900`.
- **Tương tác (Hover Effects)**:
  - Chuyển động thẻ: `hover:-translate-y-1 transition-all duration-300 ease-out`.
  - Đèn phản chiếu bóng (Glowing shadow): `hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]` (Light) hoặc Glow màu tương ứng của Workspace ở Dark Mode.

### 1.3 State Management (Trạng thái UI)

- Sử dụng `Zustand` (hoặc Jotai) để lưu giữ mảng `workspaces[]`.
- Cần một Store Slice là `usePortalUIStore` để quản lý: `searchQuery` (lọc cục bộ), `activeTab` (Yêu thích/Tất cả), `isImpersonating` (false/true).

---

## 2. Kiến trúc Data & Frontend (Next.js App Router)

### 2.1 Cấu trúc Component

Trang Portal được cấu thành từ 3 Layer Component chính:

1. `PortalHeader`: Chứa Lời chào động ngữ cảnh + Text Input Search Xuyên không gian + Menu Profile (Chuyển đổi ngôn ngữ/Đăng xuất).
2. `PortalRecentSection`: Gọi dữ liệu từ `localStorage` hiển thị bằng Component `PortalWorkspaceCard` chạy ngang bằng Flexbox.
3. `PortalGrid`: Hiển thị bằng CSS Grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`), sử dụng Thư viện Framer Motion để tạo hiệu ứng `staggerChildren` (nhảy thẻ xếp tầng khi load trang).

### 2.2 Tối ưu hóa (Prefetching & Caching)

- Thẻ Card sẽ được wrap bằng thư viện Component của Next.js: `<Link href={dashboardPath} prefetch={true} />`.
- Các ảnh Logo của Câu lạc bộ/Liên đoàn phải dùng `<Image src={...} />` của Next.js với thuộc tính `priority` cho các thẻ mục Recent để tránh LCP (Largest Contentful Paint) chậm.

---

## 3. Kiến trúc Backend Server (Go HTTP API)

### 3.1 Endpoint Phân giải Context (`GET /api/v1/auth/me`)

Endpoint này có trách nhiệm nặng nề nhất khi người dùng vào Portal. Backend phải thực thi 1 lệnh Join phức tạp thay vì ném cục Data thô.

- **Đầu vào**: JWT Token bearer.
- **Đầu ra (JSON)**:
  ```json
  {
    "user_id": "usr_123",
    "email": "hbtun@vct.vn",
    "workspaces": [
      {
        "id": "fed_vn",
        "name": "Liên đoàn VCT Việt Nam",
        "type": "federation",
        "role": "admin",
        "live_metrics": { "pending_tasks": 12 },
        "thumbnail_url": null
      },
      {
        "id": "clb_01",
        "name": "Võ đường Sài Gòn",
        "type": "club",
        "role": "leader",
        "live_metrics": { "pending_tasks": 0 }
      }
    ]
  }
  ```

### 3.2 Tầng Trung gian (Context Middleware)

Khi Front-end bấm vào thẻ Workspace `clb_01`, toàn bộ API call tiếp theo từ Front-end sẽ bị kẹp cứng Header: `X-Context-Scope: clb_01`.

- Go Middleware (`tenant_middleware.go`) sẽ chặn ở cửa, so sánh `X-Context-Scope` có nằm trong danh sách quyền của User ID đó trên DataBase không. Nếu Role Revocation đã xảy ra (quyền bị tước cớ), lập tức trả mã `403 Forbidden` và ép Frontend đá User văng ngược ra Portal Hub để làm mới lại danh sách Workspace.

---

## 4. Kiến trúc Database (PostgreSQL Schema)

Để Portal có thể render ra List Workspace siêu tốc (10-50ms), Database phải được thiết kế dạng RBAC Mở Rộng:

- **Table `users`**: Chứa thông tin tài khoản cá nhân gốc (id, email, password_hash, full_name, is_banned).
- **Table `scopes` (Thực thể Workspace)**: Đại diện cho tất cả thực thể có thể là 1 không gian.
  - `id`
  - `scope_type` (enum: federation, subdivision, club, tournament)
  - `name`, `logo_url`
  - `metadata` (JSONB) - Chứa cấu hình lặt vặt.
- **Table `user_roles` (Bảng trung gian định nghĩa thẩm quyền)**:
  - `user_id` (FK tới users)
  - `scope_id` (FK tới scopes)
  - `role_name` (enum: owner, admin, referee, athlete, member)
  - `granted_at`
- **Table `audit_logs`**:
  Lưu trữ hành vi _Nhập vai (Impersonation)_, ghi rõ `actor_id` (Admin Hệ thống) đang `impersonate_id` (Chủ nhiệm CLB) thực hiện hành vi tạo thẻ thi đấu lúc 14h chiều.

---

## 5. Tổ chức Cấu trúc Codespace (Monorepo Folder Tree)

Theo kiến trúc TurboRepo hiện tại của VCT Platform, trang Portal sẽ rải rác ở 2 Node (App & Backend):

### 5.1 Frontend (`packages/app` & `apps/web`)

```text
vct-platform/
└── packages/
    ├── app/
    │   ├── features/
    │   │   ├── portals/
    │   │   │   ├── Page_portal_hub.tsx     <-- Entry component (Grid tổng)
    │   │   │   ├── components/
    │   │   │   │   ├── PortalWorkspaceCard.tsx <-- (Thẻ giao diện Kính mờ)
    │   │   │   │   ├── PortalHeader.tsx        <-- (Thanh Search Omni)
    │   │   │   │   ├── RecentWorkspaces.tsx    <-- (Scroll ngang mục yêu thích)
    │   │   │   └── hooks/
    │   │   │       ├── useWorkspaceStore.ts    <-- Zustand quản lý Context
    │   │   │       └── usePortalMetrics.ts     <-- Fetch API lấy số liệu Pending Badges
    │   └── ui/
    │       └── components/core/
    │           └── GlassCard.tsx           <-- Generic Glassmorphism component để tái sử dụng
└── apps/
    └── web/
        └── app/
            └── (portal)/
                └── page.tsx                <-- Next.js Route "/" ánh xạ sang Page_portal_hub
```

### 5.2 Backend Go (`backend/`)

```text
vct-platform/
└── backend/
    ├── internal/
    │   ├── domain/
    │   │   ├── users/
    │   │   │   ├── repository.go       <-- JOIN users + scopes + user_roles
    │   │   │   └── service.go          <-- Logic tính toán Role Hierarchy
    │   │   └── scopes/                 <-- Module quản lý Workspace
    │   ├── httpapi/
    │   │   ├── handlers/
    │   │   │   ├── auth_handler.go     <-- Trả về Profile + mảng Workspaces
    │   │   │   └── portal_handler.go   <-- Endpoint siêu nhẹ trả về Live Metrics (Polling)
    │   │   └── middleware/
    │   │       └── tenant_middleware.go<-- Bảo mật kẹp X-Context-Scope ở mọi Route
    └── migrations/
        └── 00XX_create_scopes_rbac.sql <-- Schema Database RBAC cốt lõi
```

---

**Tổng kết:**
Bản vẽ trên là cầu nối thực tiễn để biến 12 tiêu chuẩn vàng của _Business Analysis_ thành các File Code thực sự. Frontend sẽ dồn sức cho `GlassCard` và `StaggerChildren`, Backend tập trung vào `tenant_middleware` chặn Header bắt buộc, Database cần tối ưu Cấu trúc RBAC để trả JSON trong dưới 30ms.

---

## 6. Chiến lược Hạ tầng & Caching (Infrastructure & CDN)
Trang Portal là màn hình hứng toàn bộ Traffic (lưu lượng) khởi tạo của hệ thống. Nếu sập Portal, toàn bộ sinh thái VCT tê liệt.
* **Vercel Edge Network**: Trang `/` phải được tận dụng Route Segment Config của Next.js (`export const dynamic = 'force-dynamic'`) để lấy Context cá nhân hoá, nhưng tài nguyên tĩnh (Background Orbs, JS/CSS Chunks, Logos) phải được Cache tuyệt đối tại Vercel Edge.
* **Database Connection Pooling**: Khi 1.000 trọng tài đồng loạt đăng nhập vào Portal lúc 7h sáng ngày khai mạc giải đấu, lệnh Query dò tìm `user_roles` sẽ bùng nổ. Phải sử dụng **PgBouncer** (được cung cấp bởi Neon/Supabase) để gom (multiplexing) các kết nối, tránh sập Database cấp phát.
* **Redis Cache (Tùy chọn)**: Dữ liệu phân quyền (Roles & Workspaces) của 1 User hiếm khi thay đổi từng giây. Có thể Cache JSON response của `/api/v1/auth/me` vào Redis với TTL là 15 phút. Nếu Frontend có hành vi F5, Backend trả Redis ra ngay (3ms) thay vì Query Database (30ms).

## 7. Giải pháp An ninh & Chống Tấn công (Security & Rate Limiting)
* **Rate Limiting (Cửa ngõ)**: Màn hình Portal cung cấp rất nhiều thông tin nhạy cảm. API `/auth/me` phải được bảo vệ bởi Rate Limiter (ví dụ: tối đa 30 requests/phút/1 IP).
* **JWT Token Rotation & Trạm gác Middleware**: Header `X-Context-Scope` truyền từ Portal Frontend không có giá trị tuyệt đối. Mọi API call ở Backend (như `/api/tournaments` hay `/api/clubs`) **LUÔN LUÔN** phải Query chéo `X-Context-Scope` với Token JWT gốc để đảm bảo Frontend không bị Hacker sửa biến `localStorage`.

## 8. Chiến lược Kiểm thử Tự động (Testing Strategy)
Để đảm bảo Portal luôn hoạt động hoàn hảo sau mỗi lần cập nhật Code:
1. **Unit Test (Go Backend)**: Viết bộ Test cho `tenant_middleware_test.go` với các User Inject Role khác nhau. Kiểm tra xem Middleware có chặn đúng `403 Forbidden` khi truyền `X-Context-Scope` rác (thuộc về CLB khác) hay không.
2. **E2E Testing (Playwright)**:
   * Giả lập 1 User mang 3 Role (Federation Admin, Club Leader, Referee).
   * Kịch bản tự động: Playwright mở trang `/`, đếm xem có đúng 3 thẻ Card hiển thị.
   * Playwright click vào thẻ `Referee`, kiểm tra xem URL có chuyển sang `/referee-scoring` và Header Authorization có gắn đúng Scope ID hay chưa.

## 9. Giám sát Hiệu năng & Truy vết Lỗi (Observability & APM)
*   **Datadog / Sentry Integration**: Portal phải được cắm đầu dò APM. Nếu API `/auth/me` chậm hơn 200ms, hệ thống tự động bắn alert qua Slack cho Đội ngũ Kỹ thuật.
*   **Truy vết Lỗi Frontend (Error Tracking)**: Mọi thao tác click lỗi (kể cả lỗi JS) trên Portal đều được thu thập kèm theo `user_id` hiện tại để có thể debug chính xác nguyên nhân thay vì "lỗi màn hình trắng".

## 10. Tự động hóa CI/CD (Continuous Integration & Deployment)
*   **GitHub Actions**: Bất cứ khi nào lập trình viên push code thay đổi cấu trúc `PortalWorkspaceCard`, GitHub Actions sẽ tự chạy Cypress/Playwright E2E Test.
*   **Preview Environments**: Vercel sẽ tự động tạo một URL độc lập (Preview Link) cho riêng thay đổi của Portal. Đội QA có thể tự do test thẻ Workspace trên URL này mà không sợ vỡ Production.

## 11. Quản lý Biến thể Tính năng (Feature Flags & A/B Testing)
*   **Vercel Edge Config / LaunchDarkly**: Khi ra mắt tính năng *Omni-Search* trên Portal, không được bật cho 100% người dùng ngay lập tức. Tính năng này được "giấu" sau một Biến cờ (Feature Flag). Chỉ bật trước cho 5% Liên đoàn nội bộ test thử, nếu sập Database, chỉ cần tắt cờ (Toogle off) trong 0.1 giây mà không cần Rollback Code.

## 12. Khôi phục Thảm họa (Disaster Recovery - DR)
*   Dữ liệu Bảng `scopes` và `user_roles` là xương sống của nền tảng. Database Neon phải được kích hoạt tính năng **Point-In-Time-Recovery (PITR)** lùi thời gian. Nếu một System Admin lỡ tay xóa nhầm quyền của 500 Câu lạc bộ trên Portal, hệ thống có khả năng tua ngược thời gian (Rewind) về trước thời điểm xóa chính xác tới từng giây.

## 13. Quyền riêng tư & Tuân thủ Dữ liệu (Compliance & Data Privacy)
*   **Dynamic Data Masking**: CSDL phải tuân thủ PDPA (Luật Bảo vệ Dữ liệu Cá nhân). Khi Đội trưởng CLB xem danh sách võ sinh từ Portal Hub, các thông tin nhạy cảm như CCCD, Số điện thoại phải được che giấu (Masking) ở ngay tầng Database (`090****123`), chỉ những Role cấp Liên đoàn được xét duyệt mới gọi API giải mã được dữ liệu chuẩn.
*   **Data Residency**: Phân mảnh lưu trữ (Data Sharding) để đảm bảo dữ liệu giải đấu thuộc khu vực Châu Âu (nếu mở rộng) mặc định nằm ở Data Center Châu Âu thay vì châu Á để tránh vi phạm GDPR.

## 14. Kiến trúc Hướng Sự kiện Thời gian thực (Event-Driven Architecture)
*   Thay vì dùng Polling (Pull) khiến API gọi liên tục 10s/lần để đếm số lượng "Pending Badges" trên thẻ Workspace, Portal Hub sẽ sử dụng kết nối **WebSocket/Server-Sent Events (SSE)**.
*   Khi có một Vận động viên mới đăng ký vào CLB, Backend Go đẩy một Message vào **NATS/Kafka**. NATS sẽ stream (truyền) thẳng sự kiện đó xuống đúng cái Tab Portal đang mở của Chủ nhiệm CLB: Huy hiệu từ số `[5]` nhảy mượt mà sang `[6]` kèm tiếng tít (Notification Sound) mà không tốn lấy một truy vấn bóp nghẹt Database.

## 15. Tính Sẵn sàng Cao & Đa vùng (Multi-Region HA)
*   Kiến trúc VCT Platform không thể sập ở bất kỳ vĩ độ nào. Dùng **Cloudflare Global Load Balancer** kết nối phía trước. Nếu Data Center chính ở Singapore bị bão làm đứt cáp, Traffic của Portal lập tức Route (chuyển hướng) không độ trễ sang Data Center dự phòng (Disaster Read Replica) ở Tokyo. Người dùng chỉ thấy tải chậm hơn 100ms chứ không bao giờ thấy trang báo lỗi 502/504.

## 16. Lịch sử Nhật ký Bất biến (Immutable Audit Trails)
*   Những hành động liên quan đến tước quyền (Revoke Role), thăng cấp đai đẳng quốc gia phải được ghi vào một sổ cái bất biến (Append-Only Ledger hoặc ứng dụng Blockchain nội bộ). 
*   **Không một ai, kể cả DBA (Quản trị viên Database) có quyền truy cập vào CSDL để sửa (UPDATE/DELETE) dòng lịch sử cấp quyền này**. Trên Portal Hub, có thể cung cấp thêm một thẻ "Verify Certificate" cho phép quét mã QR chứng nhận để check chéo với Ledger này.

## 17. Chiến lược Đồng bộ Hóa Đa nền tảng (Cross-Platform Consistency)

Để đảm bảo trải nghiệm của một võ sư khi mở Portal Hub trên Web (Màn hình máy tính) và trên điện thoại (Mobile App) là hoàn toàn đồng nhất cả về mỹ cảm lẫn logic, chúng ta áp dụng **Universal Architecture** (Kiến trúc hợp nhất):

*   **Universal Design System (UI/UX)**:
    *   Sử dụng thư viện hệ giao diện đa nền tảng (ví dụ: `Tamagui` hoặc `NativeWind`).
    *   Một dòng code `className="bg-white/5 backdrop-blur-xl"` sẽ tự động biên dịch thành mã CSS thực cho trình duyệt (Web) và mã Skia/React Native Views tạo độ mờ thực tế cho Mobile (iOS/Android).
    *   Giao diện Glassmorphism trên App điện thoại sẽ hiển thị chính xác từng mm bóng đổ (Shadow) hệt như trên máy tính.

*   **Shared State & Logic (Business Context)**:
    *   Toàn bộ logic quản lý thẻ Workspace, phân giải quyền (Role Hierarchy) và Zustand Store (`useWorkspaceStore`) được đặt ở thư mục dùng chung `packages/app/`.
    *   Cả `apps/web` (Next.js) và `apps/mobile` (Expo) đều *import* chung 100% logic này. Nếu Web nhận huy hiệu [5] thì ứng dụng Mobile cũng tự động Re-render hiển thị số 5 cùng lúc. Không có chuyện 2 team Web/App code lệch logic nhau.

*   **Universal Routing (Điều hướng Hợp nhất)**:
    *   Sử dụng công nghệ điều hướng thông minh (như `Solito`). Khi võ sư nhấn vào thẻ "Liên đoàn VCT" trên Web, nó đẩy URL sang `/federation_dashboard`. Khi chạm vào trên điện thoại, hệ thống tự hiểu và dùng Native Stack Navigator để trượt màn hình sang `FederationScreen` cực kỳ mượt mà.

---
*(End of Architecture Blueprint - Tầng Đại Cung Đỉnh Cấp)*
