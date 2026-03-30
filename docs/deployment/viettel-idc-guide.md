# Triển Khai VCT Platform Lên Viettel IDC Cloud Server

Tài liệu này hướng dẫn cách boot toàn bộ hệ thống (Frontend, Backend, Database v3.0) trên một Cloud Server (VM) mới tinh của Viettel IDC, sử dụng kiến trúc Docker Compose.

## 1. Yêu Cầu Cấu Hình VM Server
- **Hệ điều hành:** Ubuntu 22.04 LTS (hoặc 24.04 LTS).
- **Phần cứng tối thiểu:** 2 vCPU, 4GB RAM (Khuyến nghị 4 vCPU, 8GB RAM do có Next.js và PostgreSQL chạy ngầm).
- **Mạng:** Đã open Inbound Port `80` (HTTP), `443` (HTTPS), và `22` (SSH).

## 2. Cài Đặt Môi Trường Nền Tảng

SSH vào server Viettel IDC và chạy chuẩn bị môi trường:

```bash
# Cập nhật OS
sudo apt update && sudo apt upgrade -y

# Cài đặt Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Log out & Log in lại để áp dụng quyền Docker, sau đó verify
docker compose version
```

## 3. Clone Mã Nguồn & Cấu Hình Biến Môi Trường

```bash
# Clone Source
git clone https://github.com/vct/vct-platform.git
cd vct-platform

# Generate biến môi trường rác hoặc thật
cp .env.example .env
```
Mở file `.env` bằng `nano` để chỉnh sửa lại `DB_PASSWORD`, `JWT_SECRET`, đổi các link CORS thành Domain của bạn (Ví dụ `vctplatform.vn`).

## 4. Bootstrap SSL (Quan Trọng để Nginx Khởi Động Trơn Tru)

Vì `docker-compose.prod.yml` map volume cho Nginx đọc `cert.pem` và `key.pem` ở thư mục `/etc/nginx/ssl`. Lần đầu deploy chưa có domain thực hoặc chưa chạy Let's Encrypt thành công, Nginx sẽ **crashes** nếu file không tồn tại.

Hãy tạo chứng chỉ Self-Signed tạm thời trên Máy chủ gốc để Nginx boot qua rào cản đầu tiên:

```bash
mkdir -p ./infra/docker/nginx/ssl

sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./infra/docker/nginx/ssl/key.pem \
  -out ./infra/docker/nginx/ssl/cert.pem \
  -subj "/C=VN/ST=Hanoi/L=Hanoi/O=VCT/OU=IT/CN=vctplatform.vn"
```

*Lưu ý: Volume `ssl_certs` có thể cần load từ thư mục vật lý nếu bạn muốn map. Tuy nhiên, cách dễ hơn hiện tại trong compose của ta là Docker Volume tên `ssl_certs` nội bộ. Tốt nhất là mount trực tiếp file hoặc xài script.*

**CÁCH TỐI ƯU TRONG VCT PLATFORM (Sử dụng dummy container copy file):**
```bash
docker volume create vct-platform_ssl_certs

docker run --rm -v $(pwd)/infra/docker/nginx/ssl:/tmp/ssl -v vct-platform_ssl_certs:/etc/nginx/ssl alpine sh -c "cp /tmp/ssl/* /etc/nginx/ssl/"
```

## 5. Khởi Động Hệ Thống

Chạy lệnh build và up toàn bộ các Containers trong chế độ ngầm (detached):

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Quá trình này sẽ tốn khoảng 3-5 phút tải layer:
- Build Go Backend `api` (`FROM golang:1.26-alpine`).
- Build Next.js `web` multi-stage (`standalone`).
- Kéo Redis, PostgreSQL 18.3, Minio, Nginx.

Check trạng thái xem tất cả có vào trạng thái `Up (healthy)` hay không:
```bash
docker compose -f docker-compose.prod.yml ps
```

## 6. Khởi Tạo Cơ Sở Dữ Liệu V3.0 (One-Shot)

Chạy bộ Migration Master để khởi tạo Hệ thống phân cấp Hub-and-Spoke và 35 Liên đoàn:

```bash
docker compose -f docker-compose.prod.yml run --rm migrate
```
Nếu script bash hiển thị `✅ VCT DATABASE v3.0 MIGRATION COMPLETE!`, backend của bạn đã sẵn sàng!

## 7. Đăng Nhập Hệ Thống
Bây giờ, trỏ Tên miền (A Record) của bạn về IP của VPS Viettel IDC. Mở trình duyệt Web:
- Truy cập thẳng vào `https://<ip>` (Sẽ bị cảnh báo không an toàn do Self-Signed, bấm Advance -> Proceed).
- Tận hưởng giao diện Frontend hiển thị đầy đủ, gọi được qua cổng `/api/`.
