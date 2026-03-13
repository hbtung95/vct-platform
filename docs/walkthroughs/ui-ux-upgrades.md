# Walkthrough — VCT Platform UI/UX Upgrades

---

## Đợt 3: VĐV, Phụ Huynh & Luồng Phê Duyệt

### [Page_athlete_portal.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/athletes/Page_athlete_portal.tsx)
- **Elo Circular Gauge**: SVG ring animation thay thế flat badge, animated từ 0 → giá trị thực.
- **Stagger entrance**: Hero profile, tags, tournament cards, club cards đều có delay cascade.
- **Hover micro-interactions**: Avatar scale+rotate, stat cards lift, club cards slide, buttons spring.
- **Verified badge animation**: Checkmark scales vào bằng spring delay.

### [Page_athlete_tournaments.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/athletes/Page_athlete_tournaments.tsx)
- **Fixed `AlertTriangle` → `Info`**: Icon không có trong VCT_Icons.
- **Ease type fix**: `as const` để TypeScript nhận diện Framer Motion's Easing tuple.

### [Page_parent_dashboard.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/parent/Page_parent_dashboard.tsx)
- **Tailwind migration**: Toàn bộ inline `style={}` → Tailwind classes (`bg-white/[0.04]`, `border-white/[0.08]`...).
- **Animated tab indicator**: `layoutId="parent-tab-bg"` sliding gradient background.
- **Count-up stats**: `useCountUp` hook tạo hiệu ứng đếm từ 0 lên giá trị thực (ease-out cubic).
- **28-day Attendance Heatmap**: Grid calendar trực quan, mỗi ô màu theo trạng thái (xanh/vàng/đỏ), animated scale entrance.
- **Stagger cards + hover effects**: Tất cả cards stagger, consent/child cards hover glow.

### [Page_workflow_config.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/federation/Page_workflow_config.tsx)
- **VCT_PageContainer**: Thay thế inline `div` wrapper bằng component chuẩn.
- **Animated accordion**: `AnimatePresence` + `height: auto` animation thay vì show/hide đột ngột.
- **SVG approval chain connector**: Dashed line + animated pulse dot chạy giữa các step node.
- **Animated filter pills**: Hover scale + tap feedback.
- **Arrow chevron rotation**: Mũi tên ▼ animate rotate 180° khi expand.

---

## Đợt 2: Tournament Operations (BTC) UI Upgrade
- **`Page_dashboard.tsx`**: Animated progress bars, live arena grid.
- **`Page_bracket.tsx`**: Interactive SVG bracket with hover path highlighting.
- **`Page_weigh_in.tsx`**: Kiosk Mode cho iPad/touch (ultra-large targets, photo cards).
- **`Page_combat.tsx`**: Split-view glassmorphism live-scoring control panel.

---

## Đợt 1: Backend & Võ Sinh / CLB / Routing

(See earlier sections in prior task)

---

## Verification

| Component | Status |
|-----------|--------|
| `Page_athlete_portal.tsx` | ✅ No TS errors |
| `Page_athlete_tournaments.tsx` | ✅ Fixed AlertTriangle + ease type |
| `Page_parent_dashboard.tsx` | ✅ No TS errors |
| `Page_workflow_config.tsx` | ✅ No TS errors |
| `npx tsc --noEmit` | ✅ 0 errors in upgraded files |
