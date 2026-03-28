---
name: vct-frontend
description: "VCT Platform frontend — Next.js 16, React 19, TailwindCSS 4, Zustand 5, micro-frontend architecture, domain ownership, i18n, accessibility (WCAG 2.1 AA), and design system."
---

# VCT Frontend — Web Platform Engineering

> Consolidated: frontend + micro-frontend + mfe-domain-owner + ui-ux + accessibility + i18n-manager + web-design-guidelines
> **⚠️ BẮT BUỘC (V5.0 Architecture)**: Sử dụng lệnh `node ai-tools/scripts/ast-parser.js <đường_dẫn_file>` để lấy sơ đồ X-quang của file trước khi dùng `view_file`. Tuyệt đối không đọc mù toàn bộ file code dài.
## 1. Architecture

```
apps/next/app/         # App Router pages
packages/app/features/ # Feature code (shared web+mobile)
packages/ui/           # @vct/ui component library
packages/i18n/         # Locale files & useI18n hook
```

**Reference**: Full architecture in `docs/architecture/frontend-architecture.md`

## 2. Code Conventions

- **Router**: App Router `app/{route}/page.tsx` (NOT `pages/`)
- **Components**: `VCT_` prefix from `@vct/ui`
- **State**: Zustand 5 stores in `packages/app/features/{feature}/store.ts`
- **Validation**: Zod 4 schemas
- **i18n**: All text via `useI18n()` → `t('key')` — NO hardcoded strings
- **Styling**: CSS variable tokens `--vct-*`, no Tailwind `dark:` modifier
- **Loading**: Skeleton components for all async data
- **Errors**: Error boundaries for critical sections

## 3. Micro-Frontend Domains

| Domain | Routes | Owner Focus |
|--------|--------|-------------|
| D1: Tournament | `/tournament/*`, `/referee-scoring/*`, `/scoreboard/*`, `/calendar/*`, `/rankings/*` | Competition flows |
| D2: Athlete | `/athlete-portal/*`, `/people/*`, `/training/*`, `/parent/*` | Athlete lifecycle |
| D3: Organization | `/federation/*`, `/provincial/*`, `/club/*`, `/organizations/*` | Org management |
| D4: Admin | `/admin/*`, `/settings/*`, reporting | Admin tools |
| D5: Finance | `/finance/*`, `/marketplace/*`, notifications | Financial flows |
| D6: Heritage | `/heritage/*`, `/community/*`, `/public/*` | Cultural content |
| D7: Platform | Shell, auth, theme, i18n, shared hooks, dashboard | Core infrastructure |

**Cross-Domain**: Define contracts via `shared-types` before implementation.

## 4. Design System (`@vct/ui`)

- **Reference**: `docs/architecture/ui-architecture.md` for design tokens, component catalog, theming
- 59+ components with consistent API patterns
- Dark/light theme via CSS variables
- Animation: subtle micro-interactions, no janky transitions

## 5. Accessibility (WCAG 2.1 AA)

- ARIA labels on all interactive elements
- Keyboard navigation (Tab, Enter, Escape, Arrow keys)
- Color contrast ratio ≥ 4.5:1 (text), ≥ 3:1 (large text)
- Focus management: visible focus ring, logical tab order
- Screen reader: `aria-live` for dynamic updates
- Testing: axe-core automated checks

## 6. i18n Management

- Default: Vietnamese (`vi`) + English (`en`)
- Locale files: `packages/i18n/locales/{lang}.json`
- Number/date/currency: `Intl` API with locale-aware formatting
- RTL: prepared but not active
- Audit: no hardcoded strings, all keys in locale files

## 7. Data Analytics & Telemetry (Tracking)

- **Implementation Responsibility**: Frontend is responsible for integrating all client-side UI tracking tools (Google Analytics, Mixpanel, Meta Pixel, etc.).
- **Event Tracking**: Implement tracking hooks/services (`useTracking`) to capture User Actions without polluting business logic.
- **Micro-Frontend Alignment**: Each MF Domain must expose standardized tracking events to the shell application.
