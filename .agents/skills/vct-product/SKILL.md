---
name: vct-product
description: "VCT Platform product management — project planning, product ownership, Scrum, business analysis, release management, technical writing, and data analytics."
---

# VCT Product — Process & Management

> Consolidated: pm + po + scrum-master + ba + release-manager + tech-writer + data-analyst

## 1. Project Management (PM)

### Sprint Planning
- Sprint duration: 2 weeks
- Velocity tracking: story points completed per sprint
- Capacity planning: account for holidays, tech debt time
- Risk register: identify, assess, mitigate, track

### Estimation (T-shirt sizing)
| Size | Story Points | Typical Scope |
|------|-------------|---------------|
| XS | 1 | Config change, typo fix |
| S | 2-3 | Simple endpoint, minor UI change |
| M | 5-8 | New page/feature, API + UI |
| L | 13 | New module, cross-cutting feature |
| XL | 21+ | Architecture change, major refactor |

## 2. Product Ownership (PO)

### Prioritization Frameworks
- **MoSCoW**: Must / Should / Could / Won't
- **WSJF**: (Business Value + Time Criticality + Risk Reduction) / Job Size
- **Value/Effort Matrix**: Quick wins → Schedule → Maybe → Avoid

### Backlog Management
- Every item has: title, user story, acceptance criteria, priority, estimate
- Regular grooming: weekly 30-min sessions
- Definition of Done: code reviewed, tested, documented, deployed to staging

## 3. Scrum (SM)

### Ceremonies
| Ceremony | Duration | Output |
|----------|----------|--------|
| Sprint Planning | 2h | Sprint backlog |
| Daily Standup | 15min | Blockers identified |
| Sprint Review | 1h | Demo + stakeholder feedback |
| Retrospective | 1h | Action items for improvement |

## 4. Business Analysis (BA)

### Requirements Process
1. Stakeholder interview / regulation parsing
2. Domain modeling (entities, relationships, rules)
3. User story writing with acceptance criteria
4. Gap analysis (current vs desired state)
5. Feasibility assessment with SA

### VCT Domain Mapping
- Parse Vietnamese martial arts regulations into system requirements
- Map competition rules to database entities and state machines
- Validate domain accuracy with domain experts

## 5. Release Management

### Versioning: Semantic Versioning (SemVer)
- `MAJOR.MINOR.PATCH` (e.g., 1.3.2)
- Breaking change → MAJOR, New feature → MINOR, Fix → PATCH

### Release Process
```
Feature freeze → QA sign-off → Changelog → Tag → Deploy staging → Smoke test → Deploy prod
```

### Rollback Plan
- Always have rollback procedure documented
- Database: down migrations ready
- Application: previous container image tagged

## 6. Documentation (Tech Writer)

### Documentation Types
| Type | Location | Owner |
|------|----------|-------|
| API docs | `docs/api/` | Backend team |
| Architecture | `docs/architecture/` | SA |
| User guides | `docs/guides/` | Tech Writer |
| Changelogs | `CHANGELOG.md` | Release Manager |
| Onboarding | `docs/onboarding/` | Tech Writer |

### Rules
- Docs updated with every feature PR
- Code examples: working, tested, copy-pasteable
- Keep in sync: if code changes, docs change too

## 7. Data Analytics

### KPIs
- **Product**: DAU/MAU, feature adoption, onboarding completion
- **Engineering**: Deploy frequency, lead time, MTTR, change failure rate
- **Business**: Registered athletes, active federations, tournament count
- **Financial**: MRR, churn rate, ARPU

### Reporting
- Weekly: engineering velocity, bug count, deployment stats
- Monthly: product metrics, user growth, revenue
- Quarterly: OKR progress, strategic review

> **Lưu ý**: Việc gắn Tracking/Telemetry code dưới frontend và backend sẽ do `vct-frontend` và `vct-backend` phụ trách. Product/Data Analyst chỉ lo phần thiết kế hệ metric và report.
