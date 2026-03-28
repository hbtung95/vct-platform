# VCT Platform AI Agents Index
> **Context Reduction Directive:** Javis / Orchestrator must NEVER load the whole `skills/` or `workflows/` directory. Use this Index to find the EXACT file you need, then use `view_file` to load ONLY that file into your context cache.

---

## 🧠 Core Mega-Skills (Path: `.agents/skills/[name]/SKILL.md`)
| Skill | Role | When to Load (Keyword Triggers) |
|---|---|---|
| `vct-backend` | Go Backend Engineer | API, Go, Database adapters, Auth, Middleware |
| `vct-database` | Data Layer Expert | PostgreSQL, Neon, Migrations, Indexing |
| `vct-domain` | Business Logic Master | Business rules, VCT Domain, Scoring, Payments |
| `vct-frontend` | Web UI/UX Engineer | Next.js, React, Tailwind, UI building, MFE |
| `vct-infra` | DevOps / Infrastructure | Docker, K8s, CI/CD, Deployment, Logging |
| `vct-javis` | Master Commander | System coordination, Rules, Hit-The-Loop (You are me) |
| `vct-leadership` | Tech Lead / Architect | Architecture, Patterns, Code Review, Conflict |
| `vct-mobile` | Mobile App Dev | React Native, Expo, App features |
| `vct-orchestrator`| Dispatcher | Workflow mapping, Delegate logic |
| `vct-product` | PM / PO | Release mgmt, user stories, docs, scrum |
| `vct-qa` | Test Automation | Testing, E2E, quality strategy |
| `vct-security` | Cybersecurity | Security audits, OWASP, Secrets, RBAC |

---

## 🔗 Consolidated Workflow Graphs (Path: `.agents/workflows/[name].md`)
| Graph (Super-Workflow) | Merged From (Old Workflows) |
|---|---|
| `engineering_graph` | `feature`, `review`, `database`, `maintenance`, `testing` |
| `ops_graph` | `deploy`, `release`, `health`, `admin` |
| `product_graph` | `docs`, `team`, `skills`, `i18n`, `javis` |

---

## ⚡ Javis Memory State (Map-Reduce Cache)
- **Path:** `.agents/state/Javis_memory.json`
- **Use:** Read/Write this file to save sub-task progress when doing sequential large jobs, avoiding LLM forgetting what it was doing.
