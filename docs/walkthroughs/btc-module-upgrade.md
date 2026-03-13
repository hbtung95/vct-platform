# BTC Module — Upgrade Walkthrough

## Review Summary

Identified **14 issues** across 4 severity levels, all addressed:

## 🔴 Critical Bugs Fixed

| # | Issue | Fix |
|---|-------|-----|
| 1 | Weigh-in only checked overweight (negative diff always ≤ saiSo) | Uses `math.Abs()` to detect both overweight AND underweight deviations |
| 2 | `DrawInput` had no JSON tags → HTTP deserialization broken | Added all 8 JSON tags |
| 3 | Duplicate protest state transition map (service vs `state_machine.go`) | Removed local map, now uses global `domain.ProtestTransitions.CanTransition()` |
| 4 | `GetStats()` silently swallowed all errors with `_` | Every error now propagated with `fmt.Errorf("lỗi tải ...": %w, err)` |
| 5 | `ContentResult` had no seed data → endpoint always returned `[]` | Added 4 seed content results (ĐK 54kg, 60kg, Nữ 48kg, Quyền thuật Nam) |

## 🟠 Missing Features Added

| Feature | Files |
|---------|-------|
| `GetMember(id)` | service.go + store.go + handler (GET `/members/{id}`) |
| `UpdateMember(m)` | service.go + store.go + handler (PATCH `/members/{id}`) |
| `DeleteMember(id)` | service.go + store.go + handler (DELETE `/members/{id}`) |
| `UpdateFinance(f)` | service.go + store.go |
| `FinanceSummary(giaiID)` | service.go + handler (GET `/finance/summary`) |

## 🟡 Code Quality

| Fix | Description |
|-----|-------------|
| Method-not-allowed | All 14 handlers now use `methodNotAllowed(w)` instead of mix of `w.WriteHeader(...)` |
| Protest ID extraction | Changed from `len(parts) < 1` (always false) to `protestID == "" \|\| protestID == "protests"` |
| Finance validation | Added `loai` validation (must be `thu` or `chi`) |
| Weigh-in validation | Added `canNang > 0` check |
| Stats accuracy | Added `xem_xet` to pending protests count, unique referee counter, TongVDV metric |

## 🟢 Enhancements

| Enhancement | Description |
|-------------|-------------|
| `CanTransition()` method on `TransitionMap` | Reusable state transition validator for all domain services |
| Stats `TongTrongTai` | Counts unique referees from assignments |
| `FinanceSummaryResult` | `{ tong_thu, tong_chi, so_du, so_but }` for dashboard |

## Files Changed

| File | Type |
|------|------|
| [service.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/domain/btc/service.go) | 4 bugs fixed + 5 new methods |
| [store.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/domain/btc/store.go) | 4 new methods + ContentResult seed data |
| [btc_handler.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/httpapi/btc_handler.go) | 4 new endpoints + 14 standardized handlers |
| [state_machine.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/domain/state_machine.go) | `CanTransition()` method |
| [btc-api.ts](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/data/btc-api.ts) | Aligned types + 4 new functions |

## Verification

| Check | Result |
|-------|--------|
| `go build ./...` | ✅ Exit 0 |
| `go vet ./...` | ✅ Exit 0 |
