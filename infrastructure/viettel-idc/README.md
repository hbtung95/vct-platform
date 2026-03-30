# 🇻🇳 VCT Platform - Viettel IDC Simulator

Đây là môi trường **Clone 1:1** kiến trúc máy chủ thực tế sẽ chạy trên **Viettel IDC** (đã được Chairman phê duyệt v4.0). Nó giúp phát triển, test mọi thứ ở Local/Laptop y hệt như trên Cloud, khi xong chỉ mất 3 phút để Migrate (đẩy) data thật lên Cloud.

## 🏗 Các Thành phần (18 Tầng Giáp)
1. **PostgreSQL 18.3:** Core Database lưu trữ dữ liệu chính.
2. **PgBouncer (Port 6432):** Connection Pooler (Transaction Mode) chặn nghẽn cổ chai database.
3. **Redis 7:** High-Load Cache & Pub/Sub cho giải thi đấu Quốc gia.
4. **NATS JetStream:** Message Broker cho Event-Sourcing (chống ghi đè).

---

## 🚀 Hướng dẫn Cài đặt & Chạy (Local)

1. Mở Terminal tại thư mục `infrastructure/viettel-idc`
2. Khởi động toàn cụm:
   ```bash
   docker-compose up -d
   ```
3. Kiểm tra trạng thái:
   ```bash
   docker-compose ps
   ```

**⚠️ Lưu ý cho Lập trình viên:** App Backend / API khi kết nối Database phải trỏ vào **Port 6432 (PgBouncer)** thay vì 5432 (ngoại trừ thao tác Migration Schema).

---

## 🚚 Cách "Bê Database" Lên Cloud Server Viettel IDC (Trong Tích Tắc)

Sau khi test hoàn thiện ở Local, ngài mua Server Viettel IDC và làm đúng 3 bước là toàn bộ dữ liệu sẽ "bay" lên Cloud:

### BƯỚC 1: Xuất dữ liệu Local (Backup / pg_dump)
Lệnh này sẽ bọc toàn bộ Database (cấu trúc + dữ liệu thực) thành một file ZIP nén cực nhẹ:
```bash
docker exec -it vct_viettel_postgres pg_dump -U vct_admin -d vct_platform -F c -f /var/lib/postgresql/data/vct_backup.dump
```
> Copy file `vct_backup.dump` từ Local lên Cloud Server bằng FTP hoặc SCP.

### BƯỚC 2: Mở Server Viettel IDC
Làm y hệt bước Local:
1. Cài Docker lên Server Viettel IDC.
2. Ném file `docker-compose.yml` này lên server.
3. Chạy `docker-compose up -d`.

### BƯỚC 3: "Bơm" dữ liệu vào Cloud (Restore)
Ném file `vct_backup.dump` vào máy chủ Viettel, rồi chạy lệnh Restore:
```bash
docker exec -i vct_viettel_postgres pg_restore -U vct_admin -d vct_platform -1 < vct_backup.dump
```

🎉 **XONG! Chỉ tốn 3 phút.** Cả hệ thống đã sẵn sàng đón tải thật trên Viettel IDC.
