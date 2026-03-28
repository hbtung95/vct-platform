---
name: vct-security
description: "VCT Platform security — OWASP Top 10, authentication/authorization, secrets management, CORS/CSP, vulnerability scanning, data privacy, and project auditing."
---

# VCT Security — InfoSec & Audit

> Consolidated: security + auditor

## 1. Security Checklist (OWASP Top 10)

| # | Threat | Mitigation |
|---|--------|------------|
| A01 | Broken Access Control | RBAC middleware, tenant isolation, row-level security |
| A02 | Cryptographic Failures | TLS everywhere, bcrypt passwords, encrypted secrets |
| A03 | Injection | Parameterized queries (pgx), input sanitization |
| A04 | Insecure Design | Threat modeling, security reviews |
| A05 | Security Misconfiguration | Secure defaults, no debug in prod |
| A06 | Vulnerable Components | Dependabot, `npm audit`, `govulncheck` |
| A07 | Auth Failures | JWT with short expiry, refresh tokens, rate limiting |
| A08 | Data Integrity | HMAC verification, migration checksums |
| A09 | Logging Failures | Structured audit logs, PII masking |
| A10 | SSRF | URL allowlists, no user-controlled redirects |

## 2. Authentication & Authorization

- **Auth**: JWT (access 15min + refresh 7d) via middleware
- **RBAC**: Roles → Permissions mapping, checked per-handler
- **Multi-tenant**: Tenant extracted from JWT, enforced in queries
- **2FA**: TOTP for admin accounts

## 3. Secrets Management

- **Local**: `.env` files (gitignored)
- **CI/CD**: GitHub Secrets / GCP Secret Manager
- **Production**: Cloud Secret Manager with auto-rotation
- **NEVER**: Hardcode secrets, log credentials, commit `.env`

## 4. Headers & Policies

```
Content-Security-Policy: default-src 'self'; script-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
CORS: origin allowlist, credentials: true
```

## 5. Project Audit (12-Point Health Check)

| # | Audit Area | Check |
|---|-----------|-------|
| 1 | Architecture Compliance | Guard rails adherence |
| 2 | Code Quality | Lint errors, complexity, duplication |
| 3 | Security | Vulnerabilities, secrets exposure |
| 4 | Test Coverage | Unit, integration, E2E coverage % |
| 5 | Performance | Bundle size, API latency, DB queries |
| 6 | Documentation | Staleness, coverage, accuracy |
| 7 | Dependencies | Outdated, vulnerable, unused |
| 8 | Convention Violations | Naming, structure, patterns |
| 9 | Technical Debt | TODOs, workarounds, shortcuts |
| 10 | i18n Coverage | Missing translations, hardcoded text |
| 11 | Accessibility | WCAG violations |
| 12 | Infrastructure | Docker, CI/CD, monitoring gaps |

Output: Prioritized findings with severity (Critical/High/Medium/Low) and fix recommendations.
