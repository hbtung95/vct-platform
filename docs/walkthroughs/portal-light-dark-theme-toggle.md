# Portal Light/Dark Theme Toggle — Walkthrough

## Thay đổi

Đã bổ sung chuyển đổi sáng/tối cho trang Portal Hub bằng cách sửa [Page_portal_hub.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/portals/Page_portal_hub.tsx):

- **Thêm nút toggle Sun/Moon** ở header, cạnh avatar
- **Thay 30+ hardcoded dark classes** (`bg-slate-900`, `text-white`, `border-slate-700`…) bằng design system tokens (`bg-vct-bg`, `text-vct-text`, `border-vct-border`…)
- **Thêm stagger animation** cho lưới workspace cards

## Kết quả

````carousel
![Light Mode — Background sáng, text tối, cards có viền nhạt, nút Moon icon](C:/Users/hbtun/.gemini/antigravity/brain/1ebf2885-42d7-466b-a7a2-4baae9acde7c/initial_portal_page_1773240657374.png)
<!-- slide -->
![Dark Mode — Background tối deep blue, text trắng, cards viền đậm, nút Sun icon](C:/Users/hbtun/.gemini/antigravity/brain/1ebf2885-42d7-466b-a7a2-4baae9acde7c/dark_portal_page_1773240678545.png)
````

## Recording

![Portal theme toggle demo](C:/Users/hbtun/.gemini/antigravity/brain/1ebf2885-42d7-466b-a7a2-4baae9acde7c/portal_theme_toggle_1773240635278.webp)

## Verification

- ✅ Nút toggle hiển thị đúng icon (Moon khi sáng, Sun khi tối)
- ✅ Click toggle chuyển theme mượt với transition
- ✅ Cả 2 theme có contrast tốt, text dễ đọc
- ✅ Workspace cards, filter buttons, stats, footer đều responsive với theme
- ✅ Theme được lưu localStorage, refresh giữ nguyên
