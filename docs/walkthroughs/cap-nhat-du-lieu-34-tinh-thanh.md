# Walkthrough: Cập nhật dữ liệu 34 tỉnh thành

## Changes Made

### 1. Backend — [seed_federation.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/adapter/seed_federation.go)
- **FederationUnit ProvinceIDs** fixed to match 34-province indexing:
  - HCM: `prov-045` → `prov-027` | HN: `prov-001` (giữ nguyên)
  - Đà Nẵng: `prov-032` → `prov-020` | Đồng Nai: `prov-048` → `prov-029`
  - Thanh Hóa: `prov-026` → `prov-016` | Huế: `prov-031` → `prov-019`
  - Cần Thơ: `prov-046` → `prov-028` | Nghệ An: `prov-027` → `prov-017`
- **Bình Định** (đã sáp nhập) → thay bằng **Quảng Ngãi** (`prov-022`)
- **Bình Dương** (đã sáp nhập) → thay bằng **Khánh Hòa** (`prov-023`)
- **Cert ProvinceIDs**: `prov-035` → `prov-022`, `prov-045` → `prov-027`
- Comment header: `63 provinces` → `34 provinces (post-2025 merger)`
- Club/member counts updated to match seed data

### 2. SQL Migration — [0040_federation_seed_data.sql](file:///d:/VCT%20PLATFORM/vct-platform/backend/migrations/0040_federation_seed_data.sql)
- Comment: `63 tỉnh/thành phố` → `34 tỉnh/thành phố (sau sáp nhập 2025)`

### 3. Frontend — [Page_federation_dashboard.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/federation/Page_federation_dashboard.tsx)
- `total_provinces`: 63 → **34** | `active_provinces`: 18 → **26**
- `total_clubs`: 498 → **710** | `total_athletes`: 12450 → **15680**
- `by_region`: `{north: 25, central: 13, south: 25}` → `{north: 15, central: 11, south: 8}`

### 4. Frontend — [Page_federation_provinces.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/federation/Page_federation_provinces.tsx)
- `FALLBACK_PROVINCES` expanded from 8 partial entries → **full 34 provinces** matching backend seed
- Subtitle: `"63 tỉnh/thành"` → `"34 tỉnh/thành (sau sáp nhập 2025)"`

## Validation
- ✅ `go build ./...` — compiled successfully (exit code 0)
- ✅ All ProvinceID cross-references correct for 34-province scheme
- ✅ Frontend fallback data consistent with backend seed data
