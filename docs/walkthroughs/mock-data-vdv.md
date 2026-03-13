# Mock Data cho VĐV — Walkthrough

## Vấn đề

Tất cả 8 trang VĐV hiển thị trạng thái trống vì **UserID không khớp**:
- Demo user `athlete` login → nhận UUID ngẫu nhiên (thay đổi mỗi lần restart)
- Seed data trong profile store → dùng ID cố định `user-athlete-001`
- Endpoint `/api/v1/athlete-profiles/me` → `GetByUserID()` luôn thất bại

## Thay đổi

### 1. [service.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/auth/service.go)
- Thêm hằng số `DemoAthleteUserID = "demo-athlete-00000001"`
- Gán cho demo user `athlete` thay vì `util.NewUUIDv7()`
- Display name → `"Nguyễn Hoàng Nam"` (khớp profile AP-001)

render_diffs(file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/auth/service.go)

### 2. [profile_store.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/domain/athlete/profile_store.go)
- AP-001 seed: `UserID: auth.DemoAthleteUserID` thay vì `"user-athlete-001"`
- Khi `athlete` login → UserID khớp → trả về profile AP-001

render_diffs(file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/domain/athlete/profile_store.go)

## Cách test

> [!IMPORTANT]
> **Cần restart backend** để load seed data mới.

1. **Đăng nhập**: `athlete` / `Athlete@123`
2. **Kiểm tra 8 trang**:

| Trang | URL | Dữ liệu hiển thị |
|-------|-----|-------------------|
| Portal | `/athlete-portal` | Profile hero, skill bars, belt timeline, giải đấu, CLB |
| Hồ sơ | `/athlete-portal/profile` | Thông tin cá nhân, thể chất, đẳng cấp |
| CLB | `/athlete-portal/clubs` | 1 CLB (Quận 1) — status Active |
| Giải đấu | `/athlete-portal/tournaments` | 2 giải (VĐQG, HCM Open) |
| BXH | `/athlete-portal/rankings` | ELO 1520, 3 HCV, 5 giải |
| Kết quả | `/athlete-portal/results` | Lịch sử thi đấu |
| Lịch tập | `/athlete-portal/training` | Placeholder "Đang phát triển" |
| E-Learning | `/athlete-portal/elearning` | Placeholder "Đang phát triển" |
