# Walkthrough: Ẩn Sidebar & Header trên Portal Hub

## Thay đổi

Sửa duy nhất file [AppShell.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/layout/AppShell.tsx):

- Thêm `PORTAL_ROUTES = ['/']` — route không render AppShell chrome
- Portal route render `{children}` trực tiếp — Portal Hub tự quản layout, header, avatar
- Workspace routes giữ nguyên layout cũ (sidebar + shell header + main)

## Kết quả

### Portal Hub — Full-screen, không sidebar, không shell header ✅
![Portal Hub clean layout](C:/Users/hbtun/.gemini/antigravity/brain/4325c5ef-6083-4241-bd7f-7ff25bafb638/portal_hub_layout_fixed_1773222901090.png)

### Athlete Workspace — Sidebar + header đầy đủ ✅
![Workspace với sidebar](C:/Users/hbtun/.gemini/antigravity/brain/4325c5ef-6083-4241-bd7f-7ff25bafb638/athlete_workspace_with_sidebar_1773222649679.png)

### TypeScript Build — ✅ Pass
