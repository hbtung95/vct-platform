---
name: vct-docs-organization
description: Convention for organizing all documentation files in the VCT Platform project. Use this skill whenever creating, moving, or referencing .md documentation files to ensure consistent project structure.
---

# VCT Documentation Organization Skill

## Purpose

This skill ensures all AI-generated documentation files (`.md`) are consistently organized within the `docs/` directory structure of the VCT Platform project.

## Core Rule

> **All `.md` documentation files MUST be placed inside `docs/` subdirectories. Never at the project root or in ad-hoc locations.**

## Directory Map

| Subdirectory | Content Type | Examples |
|---|---|---|
| `docs/api/` | API docs, endpoint specs | `tournament-endpoints.md` |
| `docs/architecture/` | System design, diagrams | `rbac-design.md`, `data-model.md` |
| `docs/business-analysis/` | Business analysis, evaluations | `admin-processes.md`, `audit-report.md` |
| `docs/guides/` | How-to guides, tutorials | `tournament-setup.md`, `onboarding.md` |
| `docs/infrastructure/` | Deployment, CI/CD, DevOps | `fly-io-deployment.md`, `ci-pipeline.md` |
| `docs/prompts/` | AI prompts, templates | `analysis-prompt.md` |
| `docs/regulations/` | Rules, compliance | `vo-co-truyen-rules.md` |
| `docs/skills/` | AI agent skill definitions | `SKILL.md` |

## Backend Docs

Backend-specific documentation stays in `backend/docs/` following the same organizational principles.

## Naming Conventions

- **Directories**: `kebab-case` (e.g., `business-analysis`)
- **Files**: `kebab-case.md` (e.g., `tournament-workflow.md`)
- **Descriptive**: Names should clearly describe the content

## Workflow

When asked to create documentation:

1. Identify the content category
2. Find or create the matching `docs/<category>/` subdirectory
3. Use a descriptive kebab-case filename
4. Place the file: `docs/<category>/<descriptive-name>.md`

## Related

- Workflow: `.agents/workflows/docs-organization.md`
