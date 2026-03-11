---
name: vct-ui-ux
description: VCT Platform UI/UX design system — tokens, component catalog, theming, and visual standards for Võ Cổ Truyền Platform.
---

# VCT Platform UI/UX Design System

> **When to activate**: Any task involving UI design, styling, component creation, theming, layout, or visual polish for the VCT Platform.

---

## 1. Design Philosophy

VCT Platform is a **sports management system** for Vietnamese Traditional Martial Arts (Võ Cổ Truyền). The design must feel:

- **Professional & Authoritative** — This is a national federation platform, not a consumer app
- **Dark-first with Light support** — Both modes MUST use design tokens, never hardcoded colors
- **Information-dense but clean** — Dashboards, data tables, forms are the primary UI patterns
- **Culturally respectful** — Honor Vietnamese martial arts heritage through subtle design cues

---

## 2. CSS Design Tokens (Mandatory)

All styling MUST use VCT CSS custom properties. **NEVER hardcode colors.**

### Background Tokens
```css
var(--vct-bg)                  /* Page background */
var(--vct-bg-elevated)         /* Cards, panels */
var(--vct-bg-glass)            /* Glass effect overlay */
var(--vct-bg-glass-heavy)      /* Sidebar, heavy glass */
```

### Text Tokens
```css
var(--vct-text)                /* Primary text */
var(--vct-text-secondary)      /* Secondary/muted text */
var(--vct-text-muted)          /* Labels, captions */
```

### Border & Input Tokens
```css
var(--vct-border)              /* All borders */
var(--vct-input)               /* Input backgrounds */
```

### Accent Colors
```css
var(--vct-accent)              /* Primary accent — sky blue (#0ea5e9) */
```

### Tailwind Utility Classes (mapped to tokens)
```
bg-vct-bg, bg-vct-elevated, bg-vct-input, bg-vct-accent
text-vct-text, text-vct-text-muted, text-vct-text-secondary
border-vct-border
```

### Dark Mode
- Toggle via `document.documentElement.classList.add('dark')`
- `ThemeProvider` at `packages/app/features/theme/ThemeProvider.tsx`
- Use `useTheme()` hook for `{ theme, toggleTheme }`
- Stored in `localStorage` key: `vct-theme`

---

## 3. Component Library (`@vct/ui`)

All reusable components live in `packages/app/features/components/` and are exported from `packages/ui/src/index.ts`.

### Naming Convention
- All components: `VCT_ComponentName` (e.g., `VCT_Button`, `VCT_Card`, `VCT_Modal`)
- Module prefix categories:
  - `vct-ui-layout` — `VCT_Card`, `VCT_Section`, `VCT_PageHeader`
  - `vct-ui-form` — `VCT_Input`, `VCT_Select`, `VCT_Button`
  - `vct-ui-data-display` — `VCT_Badge`, `VCT_Table`
  - `vct-ui-overlay` — `VCT_Modal`, `VCT_Dialog`
  - `vct-ui-feedback` — `VCT_Toast`, `VCT_Alert`
  - `vct-ui-navigation` — `VCT_Tabs`, `VCT_Breadcrumb`

### Key Components Available
| Component | Usage |
|-----------|-------|
| `VCT_Card` | Container with elevation |
| `VCT_Button` | Primary actions |
| `VCT_IconButton` | Toolbar/icon-only actions |
| `VCT_Input` | Text inputs |
| `VCT_Select` | Dropdowns |
| `VCT_Textarea` | Multi-line input |
| `VCT_Modal` | Overlays/dialogs |
| `VCT_Badge` | Status indicators |
| `VCT_Tooltip` | Hover info |
| `VCT_Dropdown` | Context menus |
| `VCT_Tabs` | Tab navigation |
| `VCT_DataGrid` | Complex data tables |
| `VCT_ResponsiveTable` | Mobile-friendly tables |
| `VCT_DatePicker` | Date selection |
| `VCT_Wizard` | Multi-step forms |
| `VCT_FileUpload` | File uploads |
| `VCT_Timeline` | Event history |
| `VCT_StatBlock` | Statistic display |
| `VCT_ProfileHeader` | User profile headers |
| `VCT_InfoGrid` | Key-value info display |
| `VCT_Calendar` | Calendar views |
| `VCT_PageSkeleton` | Loading skeleton |
| `VCT_Drawer` / `VCT_Sheet` | Side panels |
| `VCT_CommandPalette` | Keyboard-driven command |
| `VCT_QRCode` / `VCT_QRScanner` | QR functionality |

### Chart Components
| Component | Usage |
|-----------|-------|
| `VCT_BarChart` | Vertical bar charts |
| `VCT_HorizontalBarChart` | Horizontal bars |
| `VCT_DonutChart` | Pie/donut charts |
| `VCT_StatCard` | Stat with sparkline |
| `VCT_ChartProgressBar` | Progress indicators |

### Icons
```tsx
import { VCT_Icons } from '../components/vct-icons'
// Usage: <VCT_Icons.Users size={18} />
```
- **NEVER** import icons directly from `lucide-react` or other packages
- Always use `VCT_Icons.IconName` which wraps Lucide icons

---

## 4. Layout Architecture

### AppShell Pattern
```
┌─────────────────────────────────────────────────┐
│ Header (role label, search, theme toggle, user) │
├──────────┬──────────────────────────────────────┤
│ Sidebar  │  Main Content Area                   │
│ (nav)    │  ┌──────────────────────────────────┐ │
│          │  │ PageHeader                       │ │
│          │  │ Content                          │ │
│          │  └──────────────────────────────────┘ │
├──────────┴──────────────────────────────────────┤
│ Mobile: Bottom Tab Bar                          │
└─────────────────────────────────────────────────┘
```

### Sidebar
- `VCT_Sidebar` at `packages/app/features/layout/sidebar.tsx`
- Collapsible (88px collapsed / 272px expanded)
- Mobile: full overlay with slide animation
- Nav configured via `route-registry.ts` → `getSidebarGroups(role)`
- Active state uses longest-path matching algorithm

### Responsive Breakpoints
```
Mobile:  < 768px  (sidebar hidden, bottom tabs)
Tablet:  768–1024px (collapsed sidebar)
Desktop: > 1024px (full sidebar)
```

---

## 5. Page Pattern

Every feature page follows this structure:

```tsx
'use client'
import { VCT_Card, VCT_PageHeader, VCT_Badge } from '@vct/ui'
import { VCT_Icons } from '../components/vct-icons'
import { useI18n } from '../i18n'
import { useTheme } from '../theme/ThemeProvider'

export function Page_feature_name() {
  const { t } = useI18n()
  const { theme } = useTheme()

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-vct-text">{t('feature.title')}</h1>
        <p className="text-vct-text-muted">{t('feature.subtitle')}</p>
      </div>

      {/* Content in Cards */}
      <VCT_Card>
        {/* Content */}
      </VCT_Card>
    </div>
  )
}
```

### File Naming
- Pages: `Page_module_submodule.tsx` (e.g., `Page_athlete_profile.tsx`)
- Components: `VCT_ComponentName.tsx`
- Feature dirs: `packages/app/features/{module}/`

---

## 6. Animation Standards

Using `framer-motion` for all animations:

```tsx
import { motion, AnimatePresence } from 'framer-motion'

// Standard transitions
transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}

// Page enter animation
initial={{ opacity: 0, y: 8 }}
animate={{ opacity: 1, y: 0 }}
```

### Rules
- Max transition duration: 300ms for UI elements
- Use `AnimatePresence` for mount/unmount animations
- Always respect `prefers-reduced-motion`
- Sidebar collapse/expand: 220ms ease-out

---

## 7. Anti-Patterns (NEVER Do These)

1. ❌ **NEVER** hardcode colors — use `var(--vct-*)` tokens
2. ❌ **NEVER** import icons directly from `lucide-react` — use `VCT_Icons`
3. ❌ **NEVER** use inline `color: '#fff'` — use `text-vct-text` classes
4. ❌ **NEVER** create new component files without `VCT_` prefix
5. ❌ **NEVER** use `dark:` Tailwind modifier — theme switching is via CSS vars
6. ❌ **NEVER** skip `useI18n()` for user-facing text
7. ❌ **NEVER** use `<a>` tags directly — use `onNavigate()` from router
8. ❌ **NEVER** make the design look "simple/basic" — VCT requires premium feel

---

## 8. Accessibility Checklist

- [ ] All interactive elements: `aria-label` or visible label
- [ ] Buttons: `type="button"` unless form submit
- [ ] Active navigation: `aria-current="page"`
- [ ] Modals: focus trap, Escape key to close
- [ ] Color contrast: 4.5:1 minimum for text
- [ ] Keyboard navigation: all actions reachable via Tab/Enter
