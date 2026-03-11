# 📜 Tóm tắt Luật sửa đổi, bổ sung 2024
# Luật số 128/2024/LĐVTCTVN

> **Mã văn bản:** 128/2024/LĐVTCTVN
> **Tên:** Luật sửa đổi, bổ sung một số điều của Luật thi đấu Võ cổ truyền
> **Đơn vị ban hành:** Liên đoàn Võ thuật Cổ truyền Việt Nam
> **Ngày ban hành:** 20/07/2024
> **Hiệu lực:** Từ ngày ký
> **Văn bản gốc:** Quy chế 2021-QC01

---

## Tổng quan thay đổi

| # | Điều sửa đổi | Nội dung thay đổi | Ảnh hưởng hệ thống |
|---|-------------|-------------------|---------------------|
| 1 | Điều 1 (K3-K4) | Thảm đấu 10x10m, khu vực thi đấu 8x8m | Cấu hình sân đấu |
| 2 | Điều 2 | Trang phục VĐV & HLV đối kháng | Quy định trang phục |
| 3 | Điều 4 | **Nhóm tuổi & Hạng cân đối kháng** | ⚠️ Config data — CRITICAL |
| 4 | Điều 5 | Quy trình cân kiểm tra | Quy trình giải |
| 5 | Điều 11 | Phân loại lỗi (nhẹ/nặng/cấm) | **Luật lỗi** |
| 6 | Điều 12 | Hệ thống phạt (nhắc nhở → truất quyền) | **Hệ thống phạt** |
| 7 | Điều 14 | **Cách tính điểm (1/2/3 điểm)** | ⚠️ Scoring — CRITICAL |
| 8 | Điều 15 | Tiêu chí đòn đánh ngã hợp lệ | Luật scoring |
| 9 | Điều 21 | Thủ tục khiếu nại | Quy trình khiếu nại |
| 10 | Điều 23 | Trang phục VĐV quyền thuật | Quy định trang phục |
| 11 | Điều 25 | **Nhóm tuổi quyền thuật** | ⚠️ Config data — CRITICAL |
| 12 | Điều 27 | Thể thức gắp thăm & xếp lịch | Quy trình giải |

---

## Chi tiết thay đổi ảnh hưởng hệ thống

### 1. Nhóm tuổi — Đối kháng (Điều 4)

| ID | Tên | Tuổi 2021 | Tuổi 2024 | Ghi chú |
|----|-----|-----------|-----------|---------|
| `dk_senior` | Vô địch | 18–35 | **17–40** | Mở rộng ↕ |
| `dk_u13` | Trẻ 12-13 | — | **12–13** | MỚI |
| `dk_u15` | Trẻ 14-15 | 12–14 | **14–15** | Thu hẹp |
| `dk_u17` | Trẻ 16-17 | 15–17 | **16–17** | Tách riêng |

### 2. Nhóm tuổi — Quyền thuật (Điều 25)

| ID | Tên | Tuổi | Ghi chú |
|----|-----|------|---------|
| `qt_senior` | VĐ 17-40 | 17–40 | Vô địch chính |
| `qt_masters_a` | VĐ 41-50 | 41–50 | MỚI |
| `qt_masters_b` | VĐ 51-60 | 51–60 | MỚI |
| `qt_u10` | Trẻ 6-10 | 6–10 | |
| `qt_u14` | Trẻ 11-14 | 11–14 | |
| `qt_u17` | Trẻ 15-17 | 15–17 | |

### 3. Hạng cân — Đã thay đổi hoàn toàn

**Tổng: 15M + 12F (Senior) + 10M+9F (U13) + 12M+9F (U15/U17) = 67 hạng**

### 4. Hệ thống tính điểm (Điều 14)

| Loại đòn | Điểm | Mã |
|----------|------|----|
| Đòn tay / đánh chỏ | 1 điểm | `score_hand` |
| Đòn chân / đánh gối | 2 điểm | `score_foot` |
| Đánh ngã / bắt chân đánh chân trụ | 3 điểm | `score_knockdown` |

### 5. Phân loại lỗi (Điều 11)

- **Lỗi nhẹ (6 loại):** lôi kéo, kẹp găng, ôm ghì, ra ngoài, không tích cực, không nghe lệnh
- **Lỗi nặng (14 loại):** chẹn cổ, ôm vật, bám dây, tự ngã, ôm ghì tấn công...
- **Đòn cấm (8 loại):** húc đầu, bẻ khớp, cắn, tấn công khớp gối/hạ bộ/gáy/cổ...

### 6. Hệ thống phạt (Điều 12)

| Bước | Hình thức | Trừ điểm | Phạm vi |
|------|-----------|----------|---------|
| 1 | Nhắc nhở | 0 | Hiệp |
| 2 | Khiển trách lần 1 | -1 | Hiệp |
| 3 | Khiển trách lần 2 | -1 | Hiệp |
| 4 | Cảnh cáo lần 1 | -2 | Trận |
| 5 | Cảnh cáo lần 2 | -3 | Trận |
| 6 | Truất quyền | Loại | — |
