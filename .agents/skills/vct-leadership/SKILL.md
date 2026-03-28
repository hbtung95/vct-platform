---
name: vct-leadership
description: "VCT Platform technical leadership — architecture decisions, code review, design patterns, troubleshooting, complexity reduction, and solution design."
---

# VCT Leadership — Architecture & Technical Excellence

> Consolidated: cto + sa + tech-lead + design-patterns + simplifier + troubleshooting + skill-evolver

## 1. Architecture Decision Making

### Solution Architect (SA) Role
- Design new modules: API surface, DB schema, component boundaries
- Produce ADRs (Architecture Decision Records)
- Evaluate trade-offs: performance vs complexity vs cost
- Ensure alignment with 19 architecture pillars in `docs/architecture/`

### CTO Role
- Final authority on tech stack decisions
- Code quality standards enforcement
- CI/CD and infrastructure strategy
- Tech debt prioritization

## 2. Code Review Standards

### Review Checklist
- [ ] Clean Architecture boundaries respected
- [ ] No circular dependencies
- [ ] Error handling: all errors wrapped with context
- [ ] Security: input validation, auth checks, no SQL injection
- [ ] Performance: no N+1 queries, proper indexing
- [ ] Testing: new code has tests, edge cases covered
- [ ] i18n: no hardcoded strings
- [ ] Accessibility: ARIA labels, keyboard nav

### Severity Levels
| Level | Block? | Example |
|-------|--------|---------|
| 🔴 Critical | Yes | Security vulnerability, data loss risk |
| 🟡 Major | Yes | Architecture violation, missing error handling |
| 🔵 Minor | No | Naming convention, minor refactor opportunity |
| 💡 Suggestion | No | Better pattern, optimization idea |

## 3. Design Patterns (Go + React)

### Go Patterns
- **Repository**: Interface in domain, implementation in store
- **Factory**: `NewService(deps)` for dependency injection
- **Strategy**: Interface-based polymorphism for business rules
- **Observer**: Event bus for cross-module communication
- **Middleware**: Chain of responsibility for HTTP pipeline

### React/Next.js Patterns
- **Custom Hooks**: Encapsulate logic, return state + actions
- **Compound Components**: Related components sharing context
- **Render Props**: Flexible rendering delegation
- **HOC**: Cross-cutting concerns (auth guard, error boundary)
- **Container/Presenter**: Separate data fetching from display

## 4. Simplification (YAGNI/KISS)

### Rules
- Complexity is a **liability**, not an asset
- Favor **deleting code** over writing new code
- Maximum: 200 lines per file, 20 lines per function, 3 parameters
- Ask: "Is there a simpler way?" before every implementation
- Reject: premature abstraction, speculative generality

### Red Flags
- Generic framework for one use case → **Delete, make specific**
- Config-driven behavior with one config → **Hardcode it**
- Abstraction layer with one implementation → **Inline it**
- "We might need this later" → **YAGNI — delete it**

## 5. Troubleshooting

### Systematic Debug Process
1. **Reproduce**: Consistent steps to trigger the issue
2. **Isolate**: Narrow down to specific module/layer
3. **Hypothesize**: Form theory based on evidence
4. **Verify**: Add logging/breakpoints to confirm
5. **Fix**: Minimal change that resolves root cause
6. **Prevent**: Add test, improve error message

### Common Anti-Patterns to Catch
- Swallowed errors (empty catch blocks)
- Unbounded queries (missing LIMIT/pagination)
- Race conditions (shared mutable state)
- N+1 queries (loop with individual DB calls)

## 6. Skill Evolution (Self-Improvement)

### Technology Monitoring
- Track Go, React, Next.js, Expo release notes
- Monitor security advisories (CVE)
- Evaluate new tools/libraries quarterly

### Skill Upgrade Process
```
Monitor → Assess Relevance → Draft Upgrade → Test → Apply → Document
```

- Check for deprecated APIs in current skills
- Update code patterns to latest best practices
- Remove obsolete knowledge, add emerging patterns
- Verify updated skills against current codebase

