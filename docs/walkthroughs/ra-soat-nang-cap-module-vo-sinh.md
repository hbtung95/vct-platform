# Walkthrough — Rà Soát & Nâng Cấp Module Võ Sinh

## Kết Quả Rà Soát

Phát hiện **12 vấn đề** (4 bugs, 5 thiếu tính năng, 3 UX issues). Đã fix toàn bộ.

## Các Fix Đã Triển Khai

### Backend (4 files)

| File | Fix | Chi tiết |
|------|-----|---------|
| [service.go](file:///D:/VCT%20PLATFORM/vct-platform/backend/internal/domain/provincial/service.go) | 3 đai thiếu | Bát/Cửu/Thập đẳng (BeltBlack8-10) |
| | Auto AgeGroup | `resolveAgeGroup()` tính từ DOB |
| | `ReactivateVoSinh()` | inactive → active |
| | `by_club` stats | Phân bổ theo CLB |
| [store.go](file:///D:/VCT%20PLATFORM/vct-platform/backend/internal/domain/provincial/store.go) | Seed name fix | 15 entries khớp đúng tên VoSinh |
| [handler.go](file:///D:/VCT%20PLATFORM/vct-platform/backend/internal/httpapi/provincial_handler.go) | Reactivate endpoint | `POST /vo-sinh/{id}/reactivate` |

### Frontend

| Fix | Vấn đề gốc | Giải pháp |
|-----|------------|-----------|
| CSV escape | Tên có dấu phẩy làm hỏng CSV | `csvEscape()` quote fields |
| Province ID | Hardcode `PROV-HCM` | `getProvinceId()` from localStorage |
| Confirm dialog | Deactivate không xác nhận | Modal ⚠️ + nút Hủy/Xác nhận |
| Reactivate | Không thể kích hoạt lại | ▶️ button cho inactive rows |
| Stats refresh | Số liệu cũ sau action | `refreshAfterAction()` sau mỗi thao tác |
| Loading skeleton | Empty khi loading | 6-row animated skeleton |
| Edit → Detail | Edit đóng modal | Edit xong quay về detail |
| by_club chart | Thiếu phân tích CLB | Bar chart CLB với % |
| 16 belt options | Thiếu 3 đai cao cấp | Bát/Cửu/Thập đẳng |

## Verification

- ✅ `go build ./internal/domain/provincial/...` — pass
- ✅ `go build ./internal/httpapi/...` — pass
- ⚠️ `go build ./...` — fail ở `btc` package (lỗi pre-existing, không liên quan)
