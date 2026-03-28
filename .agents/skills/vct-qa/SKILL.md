---
name: vct-qa
description: "VCT Platform quality assurance — test automation, E2E testing (Playwright), test strategies, coverage tracking, and skill self-improvement/evolution."
---

# VCT QA — Quality & Self-Improvement

> Consolidated: qa

## 1. Test Strategy

### Test Pyramid
```
         ┌──────┐
         │ E2E  │ ← Few, critical paths only
         ├──────┤
       │ Integration │ ← API handlers + store
       ├────────────┤
     │   Unit Tests    │ ← Business logic, utils
     └─────────────────┘
```

## 2. Testing by Layer

### Backend (Go)
| Layer | Tool | Coverage Target |
|-------|------|----------------|
| Domain logic | `go test` | 90%+ |
| Handlers | `httptest` | 80%+ |
| Store | testcontainers-go + real PG | 70%+ |
| Integration | `go test -tags=integration` | Critical paths |

### Frontend (Next.js)
| Layer | Tool | Coverage Target |
|-------|------|----------------|
| Utils/hooks | Jest + RTL | 80%+ |
| Components | Jest + RTL | 70%+ |
| Pages | Playwright | Critical flows |
| Visual | Playwright screenshots | Key pages |

### E2E (Playwright)
```typescript
test('athlete registration flow', async ({ page }) => {
  await page.goto('/register');
  await page.fill('[name="fullName"]', 'Nguyễn Văn A');
  await page.selectOption('[name="federation"]', 'hanoi');
  await page.click('button[type="submit"]');
  await expect(page.locator('.success-message')).toBeVisible();
});
```

## 3. Quality Metrics

| Metric | Target | Tool |
|--------|--------|------|
| Unit test coverage | > 80% | Jest/go test |
| E2E pass rate | > 95% | Playwright |
| Bug escape rate | < 5% | Jira |
| Build success rate | > 90% | GitHub Actions |
| Mean time to fix | < 24h | Tracking |

## 4. Test Data

- **Factories**: Create test entities with sensible defaults
- **Fixtures**: Predefined datasets for specific scenarios
- **Cleanup**: Each test cleans up after itself (transaction rollback)
- **NO** production data in tests

