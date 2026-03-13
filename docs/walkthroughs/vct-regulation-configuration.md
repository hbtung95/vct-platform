# Walkthrough: VCT Regulation Configuration

## Architecture: Layered Override Pattern

```
regulation_config.go   ← 2021 base (belts, contents, weapons, certifications)
amendment_2024.go      ← 2024 overrides (age groups, weights, scoring, fouls, penalties)
store.go               ← seedData() calls Effective*() merged functions
```

> **Key principle:** The 2021 base stays untouched. The 2024 amendment only overrides what changed. `Effective*()` functions merge both layers.

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| [amendment_2024.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/domain/federation/amendment_2024.go) | NEW | 2024 amendment data & types |
| [amendment_2024_summary.md](file:///d:/VCT%20PLATFORM/vct-platform/docs/regulations/national/amendment_2024_summary.md) | NEW | Amendment analysis document |
| [CHANGELOG.md](file:///d:/VCT%20PLATFORM/vct-platform/docs/regulations/national/CHANGELOG.md) | NEW | Regulation version history |
| [store.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/domain/federation/store.go) | MOD | seedData → Effective*() functions |
| [common.ts](file:///d:/VCT%20PLATFORM/vct-platform/packages/shared-types/src/common.ts) | MOD | Scoring, fouls, penalties, competition categories |

## Data Summary (Effective / Current)

| Category | 2021 Base | 2024 Amendment | Effective |
|----------|-----------|----------------|-----------|
| Belt levels | 18 | — (unchanged) | **18** |
| Age groups | 7 | → 10 (4 đối kháng + 6 quyền) | **10** |
| Weight classes | 57 | → 67 (15M+12F sr, 10M+9F u13, 12M+9F u15) | **67** |
| Competition contents | 9 | — (unchanged) | **9** |
| Weapons | 8 | — (unchanged) | **8** |
| Scoring rules | — | 3 types (1/2/3 pts) | **3** |
| Foul rules | — | 28 (6 light + 14 heavy + 8 banned) | **28** |
| Penalty levels | — | 6 steps (remind → DQ) | **6** |

## Verification

- ✅ `go build ./...` — passed
- ✅ `go test ./internal/domain/federation/...` — 4/4 tests passed
