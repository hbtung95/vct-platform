# Sáp nhập Tỉnh thành năm 2025: Báo cáo Cập nhật Hành chính Hệ thống VCT Platform

## 1. Tổng quan Sự kiện Sáp nhập

Thực hiện Nghị quyết của Quốc hội về sắp xếp đơn vị hành chính cấp tỉnh năm 2025, Việt Nam đã hoàn tất sáp nhập 52 tỉnh, thành phố trực thuộc Trung ương nhằm tinh gọn bộ máy và tăng cường hiệu quả quản lý, kinh tế - xã hội.

Sự kiện định hình lại bản đồ hành chính: **Từ 63 đơn vị xuống còn 34 đơn vị cấp tỉnh** (gồm 28 tỉnh và 6 thành phố trực thuộc Trung ương).

## 2. Danh sách 34 Đơn vị Hành chính Mới (Áp dụng trên VCT Platform)

Danh sách này được tổ chức theo 3 vùng miền, ảnh hưởng trực tiếp tới hệ thống Liên đoàn và giải đấu của chúng ta:

### 2.1. Miền Bắc (15 đơn vị)
1. **Thành phố Hà Nội** (Giữ nguyên)
2. **Thành phố Hải Phòng** (Sáp nhập một phần Hải Dương)
3. **Bắc Ninh** (Sáp nhập Bắc Giang)
4. **Hưng Yên** (Sáp nhập Thái Bình)
5. **Phú Thọ** (Sáp nhập Vĩnh Phúc, Hòa Bình)
6. **Thái Nguyên** (Sáp nhập Bắc Kạn)
7. **Ninh Bình** (Sáp nhập Nam Định)
8. **Lào Cai** (Sáp nhập Yên Bái)
9. **Tuyên Quang** (Sáp nhập Hà Giang)
10. **Quảng Ninh** (Giữ nguyên)
11. **Cao Bằng** (Giữ nguyên)
12. **Lạng Sơn** (Giữ nguyên)
13. **Sơn La** (Giữ nguyên)
14. **Điện Biên** (Giữ nguyên)
15. **Lai Châu** (Giữ nguyên)

### 2.2. Miền Trung & Tây Nguyên (11 đơn vị)
16. **Thành phố Huế** (Giữ nguyên Thừa Thiên Huế lên cấp TP trực thuộc TW)
17. **Thành phố Đà Nẵng** (Sáp nhập Quảng Nam, tùy khu vực hoặc giữ vùng)
18. **Thanh Hóa** (Giữ nguyên)
19. **Nghệ An** (Giữ nguyên)
20. **Hà Tĩnh** (Giữ nguyên)
21. **Quảng Trị** (Sáp nhập Quảng Bình)
22. **Quảng Ngãi** (Sáp nhập phần lân cận)
23. **Khánh Hòa** (Sáp nhập Phú Yên)
24. **Gia Lai** (Sáp nhập một phần Kon Tum)
25. **Đắk Lắk** (Sáp nhập Đắk Nông)
26. **Lâm Đồng** (Sáp nhập phần lân cận)

### 2.3. Miền Nam (8 đơn vị)
27. **Thành phố Hồ Chí Minh** (Bao gồm các tỉnh phụ cận sáp nhập)
28. **Thành phố Cần Thơ** (Sáp nhập Hậu Giang)
29. **Đồng Nai** (Sáp nhập Bà Rịa - Vũng Tàu, Bình Thuận/Bình Dương một phần)
30. **Đồng Tháp** (Sáp nhập Tiền Giang)
31. **Vĩnh Long** (Sáp nhập Bến Tre, Trà Vinh)
32. **Cà Mau** (Sáp nhập Bạc Liêu, Sóc Trăng)
33. **An Giang** (Sáp nhập Kiên Giang)
34. **Tây Ninh** (Sáp nhập Bình Phước một phần)

_Ghi chú: Cấu trúc địa lý sáp nhập cụ thể ở trên dựa theo danh mục 34 tỉnh mới hình thành._

## 3. Ý nghĩa và Tác động đối với VCT Platform

### 3.1. Đối với Liên đoàn VCT Việt Nam (LĐ VCT VN)
- Các liên đoàn địa phương ở những đơn vị bị sáp nhập sẽ hợp nhất ban chấp hành.
- Giảm thiểu đầu mối báo cáo hành chính từ 63 xuống còn 34 đầu mối cấp tỉnh.

### 3.2. Đối với Tổ chức Giải đấu Toàn quốc
- Các giải vô địch toàn quốc phân vùng sẽ có ít đoàn đăng ký hơn (vì các đoàn tỉnh lẻ hợp nhất), nhưng quy mô mỗi đoàn sẽ lớn hơn (đông VĐV hơn, do Quota mỗi tỉnh được nhập chung).
- Module `Chiến dịch đăng ký giải đấu` (Tournament Register) cần cập nhật lại dropdown list "Mã Tỉnh Thành" và "Bộ Lọc Khu Vực".

### 3.3. Dữ liệu Hệ thống DB
Hệ thống VCT Platform vừa tiến hành reset DB:
- Xóa các bản ghi liên quan tới Mã Tỉnh cũ (như `HY`, `HD`, `VP`,...).
- Import lại Database Seeder `federation_provinces` theo danh sách 34 IDs/Mã tỉnh mới nhất.

---
_Document created to ensure organizational awareness: March 2026_
