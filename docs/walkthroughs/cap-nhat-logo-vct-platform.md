# Cập nhật Logo VCT Platform

## Thay đổi

### Logo mới
Đã thay thế logo cũ bằng logo mới chuyên nghiệp — chữ V kết hợp hình ảnh võ sĩ, gradient emerald → indigo phù hợp với design system.

### Các file đã cập nhật

| File | Thay đổi |
|------|----------|
| `apps/next/public/logo-vct.png` | Thay thế file logo |
| `apps/next/app/public/layout.tsx` | Dùng `UI_Logo` component thay vì `<img>` trực tiếp |
| `packages/app/features/public/Page_scoreboard.tsx` | Dùng `UI_Logo` component thay vì `<Image>` trực tiếp |

### Các trang tự động cập nhật (không cần sửa code)
Vì tất cả đều reference cùng 1 file `/logo-vct.png`:
- **Login** (`Page_login.tsx`) — ✅ 2 vị trí logo
- **Register** (`Page_register.tsx`) — ✅ 2 vị trí logo
- **Sidebar** (`sidebar.tsx`) — ✅ qua `UI_Logo` component
- **Portal Hub** (`Page_portal_hub.tsx`) — ✅ qua `UI_Logo` component

## Kết quả

![Logo mới trên trang Login](C:\Users\hbtun\.gemini\antigravity\brain\95c0eb15-940f-45fd-b13a-9ea990e8c04c\vct_logo_final_verification_1773249624131.png)
