# Walkthrough: Skills & Workflows Upgrade (2026-03-13)

## Summary

Rà soát và nâng cấp toàn bộ AI agent skills và workflows cho VCT Platform qua **2 phases**, dựa trên 17+ conversations phát triển gần đây.

---

## Phase 1: Core Skills + New Workflows

### Skills Updated (5)
| Skill | Key Changes |
|-------|-------------|
| [vct-frontend](file:///D:/VCT%20PLATFORM/vct-platform/.agent/skills/vct-frontend/SKILL.md) | +33 feature modules, +18 custom hooks, +admin Drawer patterns, +deployment URLs |
| [vct-devops](file:///D:/VCT%20PLATFORM/vct-platform/.agent/skills/vct-devops/SKILL.md) | Replaced generic K8s → actual Vercel/Render/Fly.io, +env vars, +CORS pitfall |
| [vct-error-handling](file:///D:/VCT%20PLATFORM/vct-platform/.agent/skills/vct-error-handling/SKILL.md) | +6 error playbooks (401/502/CORS/double-prefix/JSX/deploy-404), +debug decision tree |
| [vct-ui-ux](file:///D:/VCT%20PLATFORM/vct-platform/.agent/skills/vct-ui-ux/SKILL.md) | +VCT_Drawer usage pattern, +admin page design pattern |
| [vct-skill-evolver](file:///D:/VCT%20PLATFORM/vct-platform/.agent/skills/vct-skill-evolver/SKILL.md) | Updated Health Dashboard, +upgrade log |

### New Workflows (3)
| Workflow | Description |
|----------|-------------|
| [deploy-production.md](file:///D:/VCT%20PLATFORM/vct-platform/.agent/workflows/deploy-production.md) | Full deploy: Vercel + Render/Fly.io + Neon, env checklist, smoke test, rollback |
| [debug-common-errors.md](file:///D:/VCT%20PLATFORM/vct-platform/.agent/workflows/debug-common-errors.md) | 10 error playbooks with decision tree |
| [admin-page.md](file:///D:/VCT%20PLATFORM/vct-platform/.agent/workflows/admin-page.md) | Table+Drawer template for admin pages |

### Workflows Enhanced (3)
| Workflow | Added |
|----------|-------|
| [fix-bug.md](file:///D:/VCT%20PLATFORM/vct-platform/.agent/workflows/fix-bug.md) | Quick reference table (8 common bugs), cross-ref |
| [deploy.md](file:///D:/VCT%20PLATFORM/vct-platform/.agent/workflows/deploy.md) | Platform-specific checks, cross-ref |
| [add-page.md](file:///D:/VCT%20PLATFORM/vct-platform/.agent/workflows/add-page.md) | Admin variant + hooks reference |

---

## Phase 2: Extended Skills + Lint Fixes

### Skills Updated (3)
| Skill | Key Changes |
|-------|-------------|
| [vct-backend-go](file:///D:/VCT%20PLATFORM/vct-platform/.agent/skills/vct-backend-go/SKILL.md) | +23 domain modules catalog with descriptions |
| [vct-mobile-lead](file:///D:/VCT%20PLATFORM/vct-platform/.agent/skills/vct-mobile-lead/SKILL.md) | Updated project structure to actual Expo setup (App.tsx, not Router), +3 implemented screens |
| [vct-cto](file:///D:/VCT%20PLATFORM/vct-platform/.agent/skills/vct-cto/SKILL.md) | +production platform table, +workflow cross-references |

### Lint Fixes (12 errors → 0)

**Component interfaces fixed:**
- [vct-ui-form.tsx](file:///D:/VCT%20PLATFORM/vct-platform/packages/app/features/components/vct-ui-form.tsx): Added `required` and `hint` props to `VCTFieldProps`, updated `VCT_Field` component

**Admin pages fixed:**

render_diffs(file:///D:/VCT%20PLATFORM/vct-platform/packages/app/features/admin/Page_documents.tsx)
render_diffs(file:///D:/VCT%20PLATFORM/vct-platform/packages/app/features/admin/Page_notifications_admin.tsx)

---

## Final Stats

- **Skills upgraded**: 8 / 36
- **Workflows**: 3 new + 3 updated = 42 total
- **Lint errors fixed**: 12 → 0
- **Slash commands available**: `/deploy-production`, `/debug-common-errors`, `/admin-page`
