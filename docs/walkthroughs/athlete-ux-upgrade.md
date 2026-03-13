# Athlete UX Upgrade — Walkthrough

## Tóm tắt
Nâng cấp 4 điểm yếu từ [athlete_ux_analysis.md](file:///c:/Users/hbtun/.gemini/antigravity/brain/4325c5ef-6083-4241-bd7f-7ff25bafb638/athlete_ux_analysis.md.resolved):
sidebar mismatch, naming confusion, hardcoded data, và missing pages.

---

## 1. Sidebar Refactor

render_diffs(file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/layout/workspace-sidebar-configs.ts)

**Trước → Sau:**

| # | Label | Path cũ | Path mới |
|---|---|---|---|
| 1 | Trang chủ VĐV *(đổi tên)* | `/athlete-portal` | `/athlete-portal` |
| 2 | Hồ sơ cá nhân *(mới)* | — | `/athlete-portal/profile` |
| 3 | BXH & Thành tích | `/rankings` | `/athlete-portal/rankings` |
| 4 | Kết quả thi đấu | `/results` | `/athlete-portal/results` |
| 5 | Giải đấu | `/giai-dau` | `/athlete-portal/tournaments` |
| 6 | Câu lạc bộ *(mới)* | — | `/athlete-portal/clubs` |
| 7 | Lịch tập | `/training/plans` | `/athlete-portal/training` |
| 8 | E-Learning | `/training/elearning` | `/athlete-portal/elearning` |

> [!IMPORTANT]
> Tất cả sidebar items giờ nằm trong namespace `/athlete-portal/...` — không còn link sang shared routes.

---

## 2. i18n Updates

render_diffs(file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/i18n/vi.ts)
render_diffs(file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/i18n/en.ts)

Keys mới: `ws.ath.home`, `ws.ath.profileBelt`, `ws.ath.clubs`, `ws.ath.learning`
Keys xóa: `ws.ath.community`, `ws.ath.news`

---

## 3. Dashboard — Dữ liệu thật từ API

render_diffs(file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/athletes/Page_athlete_portal.tsx)

3 hàm mới thay thế hardcoded arrays:
- `deriveSkillStats(profile)` — tính từ ELO rating
- `deriveBeltHistory(profile)` — từ `profile.belt_history` hoặc `profile.belt_label`
- `deriveGoals(profile)` — từ `profile.goals` hoặc tự  tạo từ stats

Mỗi hàm đều có fallback hợp lý khi API chưa trả data đầy đủ.

---

## 4. Trang mới

| Trang | File | Route |
|---|---|---|
| BXH & Thành tích | [Page_athlete_rankings.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/athletes/Page_athlete_rankings.tsx) | `/athlete-portal/rankings` |
| Kết quả thi đấu | [Page_athlete_results.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/athletes/Page_athlete_results.tsx) | `/athlete-portal/results` |
| Lịch tập | [Page_athlete_training.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/athletes/Page_athlete_training.tsx) | `/athlete-portal/training` |
| E-Learning | [Page_athlete_elearning.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/athletes/Page_athlete_elearning.tsx) | `/athlete-portal/elearning` |

Mỗi trang có skeleton loading, empty state, và consistent VCT design system. Rankings & Results fetch data từ API; Training & E-Learning hiển thị placeholder "Đang phát triển".

---

## Verification

- ✅ TypeScript build: `npx tsc --noEmit` — exit code 0
- ⬜ Browser test: cần chạy dev server để verify sidebar navigation
