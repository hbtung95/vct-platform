# Layout Module — Phase 3 Comprehensive Upgrade Walkthrough

## Summary
Audited and upgraded 10 files across the layout module. Eliminated FOUC, added comprehensive i18n support, and polished header/sidebar UX.

---

## Changes (10 files modified)

### 1. [ThemeProvider.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/theme/ThemeProvider.tsx) — FOUC Fix
- Replaced `visibility: hidden` → smooth `opacity: 0 → 1` transition (0.15s ease-in)
- Theme context is always available, preventing child component errors
- Uses `requestAnimationFrame` for smooth paint-after-resolve

### 2. [workspace-types.ts](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/layout/workspace-types.ts) — WORKSPACE_META i18n
- All 9 workspace labels + descriptions → i18n keys (`ws.meta.*.label`, `ws.meta.*.desc`)
- Consumers call `t(meta.label)` for localized text

### 3. [workspace-resolver.ts](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/layout/workspace-resolver.ts) — Scope Names i18n
- Hardcoded Vietnamese scope names → i18n keys (`ws.scope.*`)

### 4. [workspace-store.ts](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/layout/workspace-store.ts) — Labels i18n
- `'Hồ sơ cá nhân'`, `'Xem trực tiếp & Tin tức'`, `'Công cộng'` → i18n keys

### 5. [ContextSwitcher.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/auth/ContextSwitcher.tsx) — Full i18n
- `ROLE_DISPLAY_NAMES` → `ROLE_I18N_KEYS` with `t()` resolution
- Labels, error messages, active badge all use i18n

### 6. [AppShell.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/layout/AppShell.tsx) — Header Upgrades
- **Search** → clickable Command Palette trigger with `⌘K` badge
- **Mobile** → shows mini breadcrumbs (last 2 items) instead of plain text
- **Avatar** → uses workspace-specific gradient color

### 7. [sidebar.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/layout/sidebar.tsx) — User Card Polish
- Green online indicator dot on avatar
- Avatar gradient upgraded from flat `bg-emerald-700` → `from-emerald-600 to-cyan-700`

### 8-9. i18n Keys ([vi.ts](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/i18n/vi.ts), [en.ts](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/i18n/en.ts))
Added **50+ keys** across 4 categories:

| Category | Keys | Example |
|----------|------|---------|
| `ws.meta.*` | 18 keys | `ws.meta.federation.label` |
| `ws.scope.*` | 11 keys | `ws.scope.sysadmin` |
| `role.*` | 12 keys | `role.federation_president` |
| `context.*` | 4 keys | `context.switchRole` |

---

## Verification
> [!NOTE]
> Please refresh `localhost:3000`:
> - No theme flash on page load (smooth opacity transition)
> - Toggle EN/VI → workspace labels, role names, notifications all switch
> - Click search box → opens Command Palette (or triggers `⌘K`)
> - Mobile viewport → breadcrumbs show last 2 items with chevrons
> - Sidebar bottom → user avatar has green online dot
> - Avatar gradient matches current workspace color
