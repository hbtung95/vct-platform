# Walkthrough: Updating Provinces to 34

Dựa trên sự kiện sáp nhập hành chính cấp tỉnh năm 2025, Việt Nam hiện tại có 34 tỉnh/thành phố. Dưới đây là các thay đổi đã được áp dụng vào codebase VCT Platform:

## Cập nhật Dữ liệu Cơ sở (Seed Data)
Hệ thống sử dụng các bộ dữ liệu hạt giống (seed) để tự động tạo danh mục 63 tỉnh thành cũ mỗi khi reset database. Các file này đã được cập nhật thành lập bản đồ 34 tỉnh/thành mới nhất:

1. **SQL Migrations**: `backend/migrations/0040_federation_seed_data.sql`
   - Đã thay thế khối `INSERT` cũ gài sẵn dữ liệu của 63 đơn vị hành chính thành 34 đơn vị hành chính mới.
   - Vẫn giữ nguyên việc phân loại theo 3 vùng (Miền Bắc: 15, Miền Trung & Tây Nguyên: 11, Miền Nam: 8).
2. **Go Seeder Structs**: `backend/internal/adapter/seed_federation.go`
   - Ghi đè struct danh sách `federation.Province` với số liệu thống kê (dummy) về số CLB, HLV, VĐV được cộng gộp tương ứng cho 34 tỉnh mới để giao diện frontend hiển thị đúng logic.

## Phân tích Nghiệp vụ
Tạo file tài liệu chính thức theo convention `docs/`:

1. **Tài liệu phân tích**: `docs/business-analysis/province-merger-2025.md`
   - Ghi chú lại danh sách 34 đơn vị hành chính mới.
   - Chỉ ra các tác động tới tổ chức Liên đoàn VCT VN và giải đấu (BCH hợp nhất, giảm thiểu cấp hành chính từ 63 xuống 34).

## Kết quả Kiểm tra (Verification)
- ✅ Đã chạy `go test ./internal/adapter/...` để biên dịch lại file Go Seed. Go structs đã build thành công và không ghi nhận lỗi. Do server đang chạy sẵn bên dưới terminal, bạn có thể chủ động reset database (`migrate down` rồi `migrate up`) để db nạp lại 34 danh mục tỉnh mới cập nhật này.
