---
description: How to organize documentation files (.md) in the project
---

# Documentation Organization Convention

All `.md` documentation files created by the AI agent MUST be placed inside the `docs/` directory at the project root (`d:\VCT PLATFORM\vct-platform\docs\`).

## Directory Structure

```
docs/
├── api/                  # API documentation
├── architecture/         # Architecture & system design docs
├── business-analysis/    # Business analysis, evaluations, audits
├── guides/               # How-to guides, tutorials, onboarding
├── infrastructure/       # Deployment, CI/CD, DevOps docs
├── prompts/              # AI prompts and templates
├── regulations/          # Rules, regulations, compliance docs
├── skills/               # AI agent skill definitions
└── *.html                # Pitch decks, presentations
```

## Rules

// turbo-all

1. **Never** place `.md` files at the project root or in random directories.
2. **Always** choose the appropriate subdirectory under `docs/` based on the content type.
3. If no existing subdirectory fits, create a new descriptive subdirectory under `docs/`.
4. Use kebab-case for file and directory names (e.g., `tournament-workflow.md`).
5. Backend-specific docs go in `backend/docs/`.

## When Creating New Documentation

1. Determine the content category (API, architecture, business, guide, infrastructure, etc.)
2. Place the file in the matching `docs/<category>/` subdirectory.
3. If the category doesn't exist yet, create it with a clear, descriptive name.
4. Use a descriptive filename: `docs/<category>/<descriptive-name>.md`

## Examples

| Content Type | Location |
|---|---|
| Business analysis report | `docs/business-analysis/admin-processes.md` |
| API endpoint docs | `docs/api/tournament-endpoints.md` |
| Deployment guide | `docs/infrastructure/fly-io-deployment.md` |
| System architecture | `docs/architecture/rbac-design.md` |
| Feature walkthrough | `docs/guides/tournament-setup.md` |
| Regulation rules | `docs/regulations/vo-co-truyen-rules.md` |
