# VCT Platform Monorepo

Nền tảng quản trị giải võ cổ truyền chạy song song:
- Web: Next.js App Router (`apps/next`)
- Mobile: Expo + React Navigation (`apps/expo`)
- Backend: Go 1.26 (`backend`)
- Shared app layer: `packages/app`

## Mục tiêu sản phẩm

- Quản trị giải đấu từ đăng ký đến kết quả, bảng huy chương, báo cáo.
- Đồng bộ logic nghiệp vụ giữa Web và Expo qua code dùng chung trong `packages/app`.
- Sẵn sàng mở rộng backend hybrid qua `EntityRepository` + adapter mock/api.

## Cấu trúc thư mục

```text
apps/
  next/      # Web app (App Router)
  expo/      # Mobile app (Expo)
backend/
  cmd/server # Go 1.26 API entrypoint
  internal/  # auth, http handlers, store, config
packages/
  app/
    features/
      components/  # UI primitives (VCT_*)
      data/        # mock data, types, repositories, export utils
      layout/      # AppShell, Sidebar, RouteRegistry
      mobile/      # Mobile screens (Expo)
      auth/        # session auth + login UI
      tournament/  # Web modules theo nghiệp vụ
    navigation/    # Native navigation
    provider/      # Theme, safe-area, navigation providers
scripts/
  run-tests.mjs    # smoke tests
```

## Feature map hiện tại

- Cấu hình giải: thông tin giải, nội dung/hạng cân, sàn đấu.
- Đăng ký: đơn vị, vận động viên, đăng ký nội dung.
- Trọng tài: danh sách và phân công.
- Thi đấu: họp chuyên môn, bốc thăm, cân ký, đối kháng, quyền, bracket, kết quả.
- Tổng hợp: lịch thi đấu, huy chương, khiếu nại, báo cáo.
- Import VĐV: hỗ trợ CSV/JSON + file mẫu import.
- Export báo cáo: CSV, Excel (.xls XML), JSON, in/PDF.
- Expo parity: Teams, Athletes, Registration, Results, Schedule (repository-driven + role guard).
- Login web: route `/login` + session auth (token, tournament code, operation shift).

## Data architecture

`packages/app/features/data/repository` cung cấp:

- `EntityRepository<T>` contract:
  - `list/getById/create/update/remove/replaceAll/importItems/exportItems`
- `createMockAdapter`:
  - lưu local qua `localStorage` (web) hoặc memory fallback
- `createApiAdapter`:
  - sẵn sàng nối backend qua endpoint contract + bearer token

Repositories đã có:
- `teams`, `athletes`, `registration`, `results`, `schedule`
- `arenas`, `referees`, `appeals`
- `weighIns`, `combatMatches`, `formPerformances`

`NEXT_PUBLIC_API_BASE_URL` dùng để trỏ frontend sang backend Go (ví dụ: `http://localhost:18080`).

## Backend Go 1.26

- Thư mục backend: `backend/`
- Runtime: `go 1.26`
- Auth API:
  - `POST /api/v1/auth/login`
  - `GET /api/v1/auth/me`
  - `POST /api/v1/auth/logout`
- Entity API (khớp `EntityRepository`):
  - `GET/POST /api/v1/{entity}`
  - `GET/PATCH/DELETE /api/v1/{entity}/{id}`
  - `PUT /api/v1/{entity}/bulk`
  - `POST /api/v1/{entity}/import`
  - `GET /api/v1/{entity}/export?format=json|csv`

Tài khoản demo backend:
- `admin / Admin@123`
- `btc / Btc@123`
- `ref-manager / Ref@123`
- `referee / Judge@123`
- `delegate / Delegate@123`

## Navigation architecture

- Route source of truth: `packages/app/features/layout/route-registry.ts`
- Dùng chung cho:
  - Sidebar group/menu
  - Page title
  - Breadcrumbs
- Có metadata `roles` cho từng route để làm RBAC menu/guard.
- Mobile route map: `packages/app/features/mobile/mobile-routes.ts`
  - Dùng chung cho Home mobile, deep-link config và guard native screens.

## RBAC + Auth layer

- `AuthProvider` trong `packages/app/features/auth` quản lý session.
- Route `/login` là public; module nghiệp vụ là private và được guard tại AppShell.
- AppShell có role switcher để mô phỏng RBAC nhanh khi kiểm thử nghiệp vụ.
- Route không đủ quyền sẽ hiện AccessDenied state và điều hướng về route hợp lệ.

## UI/UX và accessibility baseline

- AppShell responsive: desktop sidebar, mobile drawer.
- Icon buttons có `aria-label` ở luồng chính.
- `:focus-visible` global style.
- Modal có `role="dialog"` + `aria-modal`.
- Toast có `role="status"` + `aria-live`.
- Trang login có label rõ ràng cho input/select, hỗ trợ keyboard submit.

## UI architecture v2

- `packages/app/features/components/vct-ui.tsx` là barrel export.
- Tách theo domain:
  - `vct-ui-layout.tsx`
  - `vct-ui-form.tsx`
  - `vct-ui-data-display.tsx`
  - `vct-ui-overlay.tsx`
- Source implementation legacy: `vct-ui.legacy.tsx`.

## Lệnh phát triển

Từ root:

```bash
npm run dev          # web dev
npm run dev:web      # web dev
npm run dev:backend  # go backend dev
npm run dev:native   # expo dev
npm run lint
npm run typecheck
npm run test
npm run test:ui      # playwright - breakpoint tests
npm run test:e2e     # playwright - core workflow
npm run build
npm run build:backend
npm run ci
```

Docker backend:

```bash
docker compose -f docker-compose.backend.yml up --build
```

## Quy trình chất lượng

- CI workflow: `.github/workflows/frontend-ci.yml`
  - typecheck
  - lint
  - smoke tests
  - web build
- Smoke tests script: `scripts/run-tests.mjs`
- Playwright tests:
  - Breakpoint UI: `tests/e2e/appshell.breakpoints.spec.mjs`
  - Core business flow: `tests/e2e/core-workflow.spec.mjs`

## Quy ước code

- Ưu tiên dùng lại UI primitives trong `vct-ui.tsx`.
- Trang nghiệp vụ dùng repository thay vì clone state cục bộ từ mock arrays.
- Ưu tiên dùng `useToast` tại `packages/app/features/hooks/use-toast.ts`.
- Khi thêm module mới:
  1. Khai báo route trong `route-registry.ts`
  2. Thêm page wrapper trong `apps/next/app/*/page.tsx`
  3. Thêm repository + validator nếu có CRUD
  4. Bổ sung smoke test tối thiểu
  5. Nếu có mobile parity, cập nhật `mobile-routes.ts` + deep link native

## Hướng nâng cấp tiếp theo

- Chuyển các màn còn lại sang repository-driven state (nội dung, bracket, huy chương, phân công TT).
- Bổ sung e2e cover login + RBAC + logout.
- Bổ sung persistence backend (PostgreSQL) + JWT/refresh token cho production.
- Hoàn thiện mobile login parity với web.

