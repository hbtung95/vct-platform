# Bộ Dữ Liệu Đơn Vị Hành Chính Việt Nam — Walkthrough

## Kết quả

| Metric | Giá trị |
|--------|---------|
| Tỉnh/TP | **34** (sau sáp nhập 07/2025) |
| Xã/Phường | **3,321** |
| JSON size | **581 KB** (embedded in binary) |
| Build Go | ✅ Pass |
| TypeScript | ✅ Pass |

## Files Created

### Backend (Go)

| File | Mô tả |
|------|-------|
| [fetch_vietnam_divisions.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/cmd/tools/fetch_vietnam_divisions.go) | Script fetch dữ liệu từ API |
| [vietnam_divisions.json](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/domain/divisions/data/vietnam_divisions.json) | Dữ liệu JSON gốc (34 tỉnh + 3,321 xã/phường) |
| [divisions.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/domain/divisions/divisions.go) | Models + embedded loader + Vietnamese search |
| [handler.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/domain/divisions/handler.go) | REST API handler |

### Frontend (React/TypeScript)

| File | Mô tả |
|------|-------|
| [useDivisions.ts](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/hooks/useDivisions.ts) | Hooks: `useProvinces()`, `useWards()` with caching |
| [VCT_AddressSelect.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/components/VCT_AddressSelect.tsx) | Cascading address selector component |

### Modified

| File | Thay đổi |
|------|----------|
| [server.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/httpapi/server.go) | Import `divisions` + register routes |

## API Endpoints

```
GET /api/v1/divisions/provinces          → 34 tỉnh/TP
GET /api/v1/divisions/provinces?q=Hà     → Tìm kiếm (hỗ trợ Unicode)
GET /api/v1/divisions/provinces/1        → Chi tiết tỉnh (Hà Nội)
GET /api/v1/divisions/provinces/1/wards  → 115 xã/phường Hà Nội
GET /api/v1/divisions/provinces/1/wards?q=Ba    → Tìm xã/phường
```

## Sử dụng Component

```tsx
import { VCTAddressSelect, emptyAddress } from '../components/VCT_AddressSelect'

const [address, setAddress] = useState(emptyAddress)
<VCTAddressSelect value={address} onChange={setAddress} />
// address = { provinceCode: 1, provinceName: "Thành phố Hà Nội", wardCode: 4, wardName: "Phường Ba Đình" }
```

## Verification

- `go build ./...` — ✅ Pass
- `npx tsc --noEmit` — ✅ Pass (0 errors)
