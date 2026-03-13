# VCT Platform Custom AI Agent Skills — Walkthrough

## Created 5 Custom Skills

All skills are installed at `.agent/skills/` and auto-activate for relevant tasks.

| # | Skill | File | Key Contents |
|---|-------|------|-------------|
| 1 | [vct-ui-ux](file:///D:/VCT%20PLATFORM/vct-platform/.agent/skills/vct-ui-ux/SKILL.md) | `SKILL.md` | Design tokens (`--vct-*`), 40+ component catalog, light/dark theming, layout architecture, animation standards, anti-patterns |
| 2 | [vct-frontend](file:///D:/VCT%20PLATFORM/vct-platform/.agent/skills/vct-frontend/SKILL.md) | `SKILL.md` | Monorepo structure, routing & navigation, API integration, state management, i18n, page/feature patterns |
| 3 | [vct-backend-go](file:///D:/VCT%20PLATFORM/vct-platform/.agent/skills/vct-backend-go/SKILL.md) | `SKILL.md` | Go 1.26 Clean Architecture, domain module pattern, HTTP handlers, middleware stack, storage layer, migration system, event bus |
| 4 | [vct-cloud-database](file:///D:/VCT%20PLATFORM/vct-platform/.agent/skills/vct-cloud-database/SKILL.md) | `SKILL.md` | Neon & Supabase setup, connection strings, SSL, pool tuning, migration on cloud, Docker compose for cloud |
| 5 | [vct-selfhost-database](file:///D:/VCT%20PLATFORM/vct-platform/.agent/skills/vct-selfhost-database/SKILL.md) | `SKILL.md` | Docker PostgreSQL 17, backup/restore, admin queries, production hardening, replication, troubleshooting |

## Total Skills in Project: 10

```
.agent/skills/
├── ui-ux-pro-max/              # General UI/UX (from GitHub)
├── vct-ui-ux/                  # ⭐ VCT-specific UI/UX 
├── vct-frontend/               # ⭐ VCT frontend patterns
├── vct-backend-go/             # ⭐ VCT Go backend patterns
├── vct-cloud-database/         # ⭐ Neon & Supabase
├── vct-selfhost-database/      # ⭐ Docker PostgreSQL
├── vercel-composition-patterns/# React composition
├── vercel-react-best-practices/# React performance
├── vercel-react-native-skills/ # React Native/Expo
└── web-design-guidelines/      # Web UI audit
```
