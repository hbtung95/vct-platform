# Walkthrough: Nâng Cấp Bộ Skill VCT Platform

## Changes Made

Upgraded all **11 skill files** to the latest technology stack:

| Technology | Old | New |
|-----------|-----|-----|
| React | 18+ | **20** (Compiler, Server Components, Actions, use()) |
| Node.js | 20 | **25.6.1** (ESM default, native fetch) |
| Tailwind CSS | 3+ / CSS Modules | **v4** (@theme, CSS-first, zero-JS) |
| Go | 1.22+ | **1.26** (range-over-func, enhanced generics) |
| PostgreSQL | 16+ | **18+** (async I/O, JSON_TABLE, virtual columns) |
| Mobile | *(none)* | **Expo React Native** (shared codebase) |
| BaaS | *(none)* | **Supabase** (Auth, Realtime, Storage, RLS) |
| Serverless DB | *(none)* | **Neon** (branching, autoscaling, PITR) |
| Docker images | Alpine variants | **Full versions** (debian-slim/full) |

## Files Modified

| # | Skill File | Key Changes |
|---|-----------|-------------|
| 1 | [cto-tech-lead](file:///d:/VCT%20PLATFORM%20ERP/.agents/skills/cto-tech-lead/SKILL.md) | Full stack table rewrite, platform strategy diagram |
| 2 | [frontend-developer](file:///d:/VCT%20PLATFORM%20ERP/.agents/skills/frontend-developer/SKILL.md) | Monorepo structure, Supabase hooks, Expo patterns, Tailwind v4 |
| 3 | [backend-developer](file:///d:/VCT%20PLATFORM%20ERP/.agents/skills/backend-developer/SKILL.md) | Neon connection, Supabase auth middleware, Go 1.26 iterators |
| 4 | [dba](file:///d:/VCT%20PLATFORM%20ERP/.agents/skills/dba/SKILL.md) | Neon branching strategy, Supabase RLS, PG 18+ features |
| 5 | [devops-engineer](file:///d:/VCT%20PLATFORM%20ERP/.agents/skills/devops-engineer/SKILL.md) | Full Docker images, Neon CI/CD branching, Expo EAS Build |
| 6 | [system-architect](file:///d:/VCT%20PLATFORM%20ERP/.agents/skills/system-architect/SKILL.md) | Architecture with Supabase layer, Neon infra, Expo client |
| 7 | [security-engineer](file:///d:/VCT%20PLATFORM%20ERP/.agents/skills/security-engineer/SKILL.md) | Supabase Auth/RLS, Neon security, custom claims |
| 8 | [qa-engineer](file:///d:/VCT%20PLATFORM%20ERP/.agents/skills/qa-engineer/SKILL.md) | Neon branch isolation, Expo/React Native testing |
| 9 | [ui-ux-designer](file:///d:/VCT%20PLATFORM%20ERP/.agents/skills/ui-ux-designer/SKILL.md) | Tailwind v4 @theme, cross-platform design, NativeWind |
| 10 | [project-manager](file:///d:/VCT%20PLATFORM%20ERP/.agents/skills/project-manager/SKILL.md) | Cross-platform delivery, Neon/Supabase in DoD |
| 11 | [business-analyst](file:///d:/VCT%20PLATFORM%20ERP/.agents/skills/business-analyst/SKILL.md) | Mobile platform field in stories, Expo requirements |

## Verification

- ✅ **No old versions remain**: Grep for `Go 1.22`, `React 18`, `node:20`, `postgres:16`, `golang:1.22`, `Tailwind 3+`, `PostgreSQL 16` → **zero matches** in skill files
- ✅ **No alpine images remain**: Grep for `alpine` → **zero matches** in skill files
- ✅ **Supabase** referenced in **10/11** skill files (not ui-ux-designer — by design)
- ✅ **Neon** referenced in **9/11** skill files (not ui-ux-designer, not frontend — by design)
- ✅ **Expo** referenced in **10/11** skill files
