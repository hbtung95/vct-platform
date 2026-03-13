# Skills & Workflows Upgrade — Walkthrough

## Summary

Completed a comprehensive upgrade of the VCT Platform's AI agent ecosystem across 4 priority levels: cleanup, new skills, new workflows, and existing skill enhancements.

---

## Priority 1: Cleanup & Consolidation ✅

### Removed Duplicates (14 items)
| Item | Reason |
|------|--------|
| `docs/skills/vct-go-backend-foundation/` | Duplicate of `.agent/skills/vct-backend-go` |
| `docs/skills/vct-go-backend-entity-api/` | Same |
| `docs/skills/vct-go-backend-auth-access/` | Same |
| `docs/skills/vct-go-backend-quality-ops/` | Same |
| `.agent/skills/vercel-composition-patterns/` | Duplicate of global Antigravity skill |
| `.agent/skills/vercel-react-best-practices/` | Same |
| `.agent/skills/vercel-react-native-skills/` | Same |
| `.agent/skills/ui-ux-pro-max/` | Merged into `vct-ui-ux` |
| `.agent/skills/vct-ux-designer/` | Merged into `vct-ui-ux` |
| `.agents/workflows/database-migrate.md` | Already in `.agent/workflows/` |
| `.agents/workflows/dev-build-test.md` | Same |
| `.agents/workflows/dev-server.md` | Same |
| `.agents/workflows/git-commit-push.md` | Same |
| `.agents/workflows/turbo-all.md` | Same |

### Merged `vct-ui-ux`
Combined content from 3 skills into one comprehensive skill:
- **From `ui-ux-pro-max`**: Visual quality checklist, icon/interaction rules
- **From `vct-ux-designer`**: User personas table, responsive breakpoints, WCAG 2.1 AA checklist
- **From `vct-ui-ux`**: Design tokens, component library, AppShell layout

### Updated Versions
- `vct-frontend`: Next.js 14 → **Next.js 15+ (React 19)**

---

## Priority 2: New Skills Created ✅

| Skill | Key Content |
|-------|-------------|
| [vct-realtime-scoring](file:///d:/VCT%20PLATFORM/vct-platform/.agent/skills/vct-realtime-scoring/SKILL.md) | Scoring architecture, đối kháng/quyền rules, WebSocket protocol, offline-first PWA, 6-step penalty |
| [vct-state-machine](file:///d:/VCT%20PLATFORM/vct-platform/.agent/skills/vct-state-machine/SKILL.md) | 12 entity lifecycles, `TransitionMap` API, adding new states, side effects |
| [vct-error-handling](file:///d:/VCT%20PLATFORM/vct-platform/.agent/skills/vct-error-handling/SKILL.md) | `APIError` envelope, 8 error codes, handler helpers, Vietnamese messages, frontend display |
| [vct-caching](file:///d:/VCT%20PLATFORM/vct-platform/.agent/skills/vct-caching/SKILL.md) | L1 memory + L2 Redis, TTL config, invalidation patterns, what to cache vs skip |

---

## Priority 3: New Workflows Created ✅

| Workflow | Purpose |
|----------|---------|
| [/health-check](file:///d:/VCT%20PLATFORM/vct-platform/.agent/workflows/health-check.md) | Quick build + vet + test + TSC check |
| [/e2e-test](file:///d:/VCT%20PLATFORM/vct-platform/.agent/workflows/e2e-test.md) | Playwright E2E test suite |
| [/docker-dev](file:///d:/VCT%20PLATFORM/vct-platform/.agent/workflows/docker-dev.md) | Full Docker dev environment |
| [/sync-i18n](file:///d:/VCT%20PLATFORM/vct-platform/.agent/workflows/sync-i18n.md) | Compare vi.ts vs en.ts keys |
| [/clean-build](file:///d:/VCT%20PLATFORM/vct-platform/.agent/workflows/clean-build.md) | Nuclear clean + rebuild |
| [/api-docs](file:///d:/VCT%20PLATFORM/vct-platform/.agent/workflows/api-docs.md) | Generate API docs from Go handlers |

---

## Priority 4: Existing Skills Enhanced ✅

| Skill | New Sections Added |
|-------|--------------------|
| `vct-backend-go` | §14 Structured Logging, §15 Graceful Shutdown, §16 Context Propagation |
| `vct-frontend` | §10 SWR Data Fetching, §11 Form Validation, §12 Optimistic UI |
| `vct-qa` | §11 Visual Regression, §12 Accessibility Testing, §13 API Contract Testing |
| `vct-devops` | §11 GitHub Actions Matrix, §12 Canary Deployments, §13 Feature Flags |
| `vct-dba` | §11 Table Partitioning, §12 VACUUM Strategy |
| `vct-security` | §9 Rate Limiting Patterns, §10 CSRF Protection |
| `vct-domain-expert` | §11 2024 Amendment (Law 128), §12 Mat Specifications |

---

## Final Counts

| Category | Before | After |
|----------|--------|-------|
| Skills | 37 (with duplicates) | **34** (no duplicates, 4 new) |
| Workflows | 34 (with duplicates) | **35** (no duplicates, 6 new) |
| Sections added | — | **21 new sections** across 7 skills |

---

## Bonus: Additional Workflows ✅

| Workflow | Purpose |
|----------|---------|
| [/backup-db](file:///d:/VCT%20PLATFORM/vct-platform/.agent/workflows/backup-db.md) | pg_dump + Neon branch before critical ops |
| [/generate-types](file:///d:/VCT%20PLATFORM/vct-platform/.agent/workflows/generate-types.md) | Go structs → TypeScript interfaces |
| [/benchmark](file:///d:/VCT%20PLATFORM/vct-platform/.agent/workflows/benchmark.md) | Go benchmarks + CPU/memory profiling |
| [/release](file:///d:/VCT%20PLATFORM/vct-platform/.agent/workflows/release.md) | Version bump, changelog, tag, deploy |

## Bonus: Additional Skills ✅

| Skill | Key Content |
|-------|-------------|
| [vct-api-testing](file:///d:/VCT%20PLATFORM/vct-platform/.agent/skills/vct-api-testing/SKILL.md) | httptest patterns, auth mocking, data factories, contract validation |
| [vct-event-driven](file:///d:/VCT%20PLATFORM/vct-platform/.agent/skills/vct-event-driven/SKILL.md) | Domain events, EventBus, event sourcing for scoring, CQRS |
| [vct-accessibility](file:///d:/VCT%20PLATFORM/vct-platform/.agent/skills/vct-accessibility/SKILL.md) | WCAG 2.1 AA, ARIA patterns, keyboard nav, screen readers |
| [vct-migration-safety](file:///d:/VCT%20PLATFORM/vct-platform/.agent/skills/vct-migration-safety/SKILL.md) | Zero-downtime migrations, safe vs dangerous ops, batch backfill |

---

## Grand Total

| Category | Count |
|----------|-------|
| Files removed (duplicates/legacy) | 14 |
| Skills created (new) | **8** |
| Workflows created (new) | **10** |
| Existing skills enhanced | 7 (21 new sections) |
| Skills merged | 3 → 1 |
