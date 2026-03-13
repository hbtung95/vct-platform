# Walkthrough: Nâng cấp toàn diện Module Federation

## Kết quả Rà soát
Phát hiện **5 vấn đề** trên 9 trang federation:
- 9/9 dùng Mock Data (backend có 17+ API, frontend không gọi)
- Inline `style={{}}` thay vì VCT design tokens
- Thiếu i18n keys cho 3 route mới
- Barrel exports thiếu 3 pages
- Duplicate i18n keys

## Thay đổi thực hiện

| Loại | File | Nội dung |
|------|------|----------|
| ✏️ FIX | [vi.ts](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/i18n/vi.ts) | Xóa 6 i18n keys trùng lặp (giữ bộ gốc ở L225-230) |
| ✏️ FIX | [index.ts](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/federation/index.ts) | Thêm barrel exports: Organizations, Master Data, Finance |
| 🔄 REFACTOR | [Page_federation_organizations.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/federation/Page_federation_organizations.tsx) | `ORGS[]` → `useApiQuery('/api/v1/federation/units')` + VCT components + search bar |
| 🔄 REFACTOR | [Page_federation_master_data.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/federation/Page_federation_master_data.tsx) | `BELTS/WEIGHTS/AGES[]` → 3x `useApiQuery` + VCT components + age range vis |
| 🔄 REFACTOR | [Page_federation_finance.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/federation/Page_federation_finance.tsx) | `FIN_DATA[]` → `useApiQuery` + VCT components + bar chart visualization |

## Build Verification
- ✅ Backend: `go build ./cmd/server` → exit 0
- ✅ Frontend: Không có lỗi TypeScript liên quan federation (lỗi duy nhất `VCT_Icons.Target` là pre-existing ở file khác)
