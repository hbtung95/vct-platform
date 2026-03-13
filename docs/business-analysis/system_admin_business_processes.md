# 📋 Phân Tích Chi Tiết Nghiệp Vụ Quản Trị Hệ Thống — VCT Platform

> **Vai trò:** System Admin — nhân viên kỹ thuật/quản trị của **công ty VCT Platform** (đơn vị phát triển và vận hành nền tảng)
> **Nền tảng:** SaaS multi-tenant phục vụ **nhiều bộ môn võ thuật**
> **Ưu tiên Phase 1:** Võ Cổ Truyền Việt Nam

---

## I. ĐỐI TƯỢNG PHỤC VỤ & HỆ SINH THÁI

### 1.1 Các Bộ Môn Võ Thuật

| Ưu tiên | Bộ môn | Đặc điểm riêng cần hỗ trợ |
|---|---|---|
| 🥇 Phase 1 | **Võ Cổ Truyền VN** | Quyền thuật, Đối kháng, Biểu diễn | 
| 🥈 Phase 2 | Vovinam Việt Võ Đạo | Song luyện, Đa luyện, Quyền, Đối kháng |
| 🥉 Phase 3 | Karate | Kata, Kumite, hệ thống đai khác |
| Phase 4 | Taekwondo | Poomsae, Sparring, WT/ITF |
| Phase 5+ | Judo, Pencak Silat, Wushu... | Mỗi môn có nội dung thi đấu + hệ đai riêng |

> [!IMPORTANT]
> Mỗi bộ môn có **hệ thống đai**, **nội dung thi đấu**, **tiêu chí chấm điểm**, và **quy chế** khác nhau. System Admin phải quản lý **Reference Data riêng cho từng bộ môn**.

### 1.2 Phân Cấp Đối Tượng Sử Dụng

```
                    ┌─────────────────────────┐
                    │   VCT PLATFORM (ADMIN)  │ ← System Admin tại đây
                    └───────────┬─────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
┌─────────▼─────────┐ ┌────────▼────────┐ ┌─────────▼────────┐
│ LĐ Võ Cổ Truyền  │ │ LĐ Vovinam VN  │ │ LĐ Karate VN    │
│ (Quốc gia)       │ │ (Quốc gia)     │ │ (Quốc gia)      │
└────────┬──────────┘ └────────┬────────┘ └────────┬─────────┘
         │                     │                    │
    ┌────┴───────────────────────────┐
    │  34 Hội/LĐ cấp Tỉnh/TP      │
    │  (Hà Nội, TP.HCM, Đà Nẵng...) │
    └────┬───────────────────────────┘
         │
    ┌────┴────────────────────────────┐
    │  Câu lạc bộ / Võ đường        │
    │  (hàng trăm → hàng nghìn)     │
    └────┬────────────────────────────┘
         │
    ┌────┴──────────────┬───────────────┬──────────────┐
    │                   │               │              │
┌───▼───┐  ┌───────────▼──┐  ┌────────▼─────┐  ┌────▼──────┐
│ Võ sinh │  │  HLV / Thầy  │  │  Trọng tài  │  │ Phụ huynh │
│ / VĐV  │  │   Truyền dạy │  │             │  │ Khán giả  │
└─────────┘  └──────────────┘  └─────────────┘  └───────────┘
```

### 1.3 Quy Mô Thực Tế (Ước lượng cho Võ Cổ Truyền giai đoạn đầu)

| Đối tượng | Số lượng ước tính | Ghi chú |
|---|---|---|
| Liên đoàn QG | 1 | Liên đoàn Võ thuật Cổ truyền VN |
| Hội/LĐ cấp Tỉnh | 34 | 34 tỉnh thành |
| CLB / Võ đường | 500 – 2,000 | Mỗi tỉnh 15-60 CLB |
| HLV / Thầy truyền dạy | 1,000 – 5,000 | |
| Võ sinh / VĐV | 10,000 – 50,000 | |
| Trọng tài | 200 – 500 | |
| Phụ huynh | 5,000 – 30,000 | Đặc biệt lứa U12, U15 |

> **Tổng users tiềm năng Phase 1:** ~20,000 – 90,000 tài khoản

---

## II. CẤU TRÚC TENANT CHO VCT PLATFORM

### 2.1 Mô Hình Tenant Phù Hợp

Không phải model đơn giản "1 tenant = 1 tổ chức". VCT cần **hierarchical multi-tenant**:

```
Tenant Level 1: BỘ MÔN (Martial Art)
├── Võ Cổ Truyền
├── Vovinam  
├── Karate
└── Taekwondo

Tenant Level 2: LIÊN ĐOÀN QUỐC GIA
├── LĐ Võ thuật Cổ truyền Việt Nam
├── Liên đoàn Vovinam Thế giới
└── ...

Tenant Level 3: HỘI/LĐ CẤP TỈNH  (34 đơn vị)
├── Hội VT Cổ truyền Hà Nội
├── Hội VT Cổ truyền TP.HCM
├── Hội VT Cổ truyền Đà Nẵng
└── ...

Tenant Level 4: CLB / VÕ ĐƯỜNG
├── CLB Sơn Long Quyền (Q.12, TP.HCM)
├── Võ đường Bình Định (TP.Quy Nhơn)
└── ...
```

### 2.2 Nghiệp Vụ System Admin Với Cấu Trúc Này

**System Admin quản lý trực tiếp:**
- Tạo/quản lý **Bộ môn** (Martial Art entity)
- Tạo/quản lý **Liên đoàn Quốc gia** + cấp admin đầu tiên
- Giám sát toàn bộ hệ sinh thái

**System Admin KHÔNG trực tiếp quản lý:**
- CLB/Võ đường → do LĐ Tỉnh quản lý
- Võ sinh/VĐV → do CLB quản lý
- Phụ huynh/Khán giả → tự đăng ký

---

## III. 10 NHÓM NGHIỆP VỤ CHI TIẾT

---

### 🔹 NHÓM 1: QUẢN LÝ BỘ MÔN VÕ THUẬT

Đây là tầng quản lý **cao nhất** — quyết định nền tảng phục vụ bộ môn nào.

#### 1.1 Onboarding Bộ Môn Mới

```
Luồng:
1. Đánh giá nhu cầu → ký hợp đồng hợp tác với Liên đoàn QG
2. Admin tạo "Martial Art" entity: tên, logo, mô tả
3. Cấu hình Reference Data riêng:
   ├── Hệ thống đai/cấp    (VCT: Tứ trụ → Nhất đẳng...)
   ├── Nội dung thi đấu     (Quyền thuật, Đối kháng, Biểu diễn...)
   ├── Hạng cân             (khác nhau mỗi môn)
   ├── Lứa tuổi             (U12, U15, U18, Senior, Veteran)
   ├── Tiêu chí chấm điểm  (riêng cho từng nội dung)
   └── Loại hình phạt       (theo quy chế từng môn)
4. Tạo admin cho LĐ Quốc gia
5. Hỗ trợ import dữ liệu ban đầu (CLB, VĐV có sẵn)
```

#### 1.2 Cấu Hình Riêng Theo Bộ Môn

| Hạng mục | Võ Cổ Truyền | Vovinam | Karate |
|---|---|---|---|
| **Hệ đai** | Không có đai theo màu truyền thống, phân theo tứ trụ/ngũ bộ | Trắng→Xanh→Vàng→Đỏ→Hồng | Trắng→Vàng→Cam→Xanh→Nâu→Đen |
| **Nội dung thi** | Quyền, Đối kháng, Biểu diễn, Tự vệ | Quyền, Đối kháng, Song luyện, Đa luyện | Kata, Kumite |
| **Chấm điểm** | 3-5 TT, thang 10 | 3-7 TT, thang 10 | 5-7 TT, flag system (kumite) |
| **Trọng tài** | Trọng tài chính + phụ | Trọng tài sảnh + cạnh | Chủ tịch HĐ + ban giám khảo |

> [!WARNING]
> Hiện tại Reference Data trong hệ thống **hardcode cho 1 bộ môn**. Cần refactor thành **multi-martial-art ref data** với namespace per martial art.

---

### 🔹 NHÓM 2: QUẢN LÝ TENANT — LIÊN ĐOÀN & HỘI CẤP TỈNH

#### 2.1 Onboarding Liên Đoàn Quốc Gia

```
1. Ký kết hợp tác → xác minh tư cách pháp nhân
2. Admin tạo tenant "LĐ Võ thuật Cổ truyền VN"
   ├── Loại: national_federation
   ├── Bộ môn: vo_co_truyen
   ├── Gói: Enterprise
   └── Phạm vi: Toàn quốc
3. Tạo tài khoản Federation Admin (Chủ tịch/TTK)
4. Training sử dụng hệ thống
5. LĐ QG tự tạo 34 Hội cấp Tỉnh bên dưới
```

#### 2.2 Onboarding Hội/LĐ Cấp Tỉnh (34 đơn vị)

```
Có 2 cách:
━━━━━━━━━━

Cách 1: LĐ Quốc gia tự tạo (recommended)
  → LĐ QG admin → Tạo "Hội VT Cổ truyền Hà Nội" → Gán admin

Cách 2: Hội Tỉnh tự đăng ký → LĐ QG phê duyệt
  → Submit form → LĐ QG review → Approve → Active

System Admin VAI TRÒ:
  → Hỗ trợ kỹ thuật nếu LĐ QG gặp khó
  → Không phê duyệt Hội Tỉnh (đó là việc của LĐ QG)
```

#### 2.3 Onboarding CLB / Võ Đường

```
CLB đăng ký qua hệ thống:
1. Chủ nhiệm CLB vào trang đăng ký
2. Chọn: bộ môn, tỉnh/thành, thông tin CLB, giấy tờ
3. Hội Tỉnh nhận thông báo → Review → Phê duyệt
4. CLB active → Chủ nhiệm tạo danh sách HLV, Võ sinh

System Admin VAI TRÒ:
  → Chỉ can thiệp khi có tranh chấp/khiếu nại
  → Giám sát số lượng CLB (phát hiện spam/fake)
```

#### 2.4 Bảng Trạng Thái Tenant Đầy Đủ

| Trạng thái | Áp dụng cho | Mô tả | Ai quản lý |
|---|---|---|---|
| **pending_review** | CLB, Hội Tỉnh | Chờ cấp trên phê duyệt | LĐ Tỉnh / LĐ QG |
| **trial** | LĐ QG mới | Dùng thử 30 ngày | System Admin |
| **active** | Tất cả | Đang hoạt động | — |
| **suspended** | Tất cả | Tạm đình chỉ (vi phạm, nợ phí) | System Admin / LĐ QG |
| **expired** | CLB | Hết hạn đăng ký hàng năm | Auto |
| **archived** | Tất cả | Ngừng hoạt động vĩnh viễn | System Admin |

---

### 🔹 NHÓM 3: QUẢN LÝ TÀI KHOẢN & PHÂN QUYỀN

#### 3.1 Hệ Thống Vai Trò Mở Rộng

```
SYSTEM_ADMIN          ← Nhân viên VCT Platform
  │
  ├── SUPER_FEDERATION_ADMIN   ← Chủ tịch/TTK LĐ Quốc gia
  │     │
  │     ├── FEDERATION_STAFF   ← Nhân viên LĐ QG
  │     │
  │     └── PROVINCIAL_ADMIN   ← Chủ tịch Hội cấp Tỉnh
  │           │
  │           └── PROVINCIAL_STAFF  ← Nhân viên Hội Tỉnh
  │
  ├── CLUB_OWNER              ← Chủ nhiệm CLB / Chưởng môn
  │     │
  │     ├── COACH             ← HLV, Thầy truyền dạy
  │     │
  │     └── CLUB_STAFF        ← Nhân viên CLB
  │
  ├── REFEREE                 ← Trọng tài
  │     ├── CHIEF_REFEREE     ← Trưởng trọng tài
  │     └── REFEREE_ASSISTANT ← Trọng tài phụ
  │
  ├── ATHLETE                 ← VĐV / Võ sinh
  │
  ├── PARENT                  ← Phụ huynh (xem kết quả con)
  │
  └── SPECTATOR               ← Khán giả (xem kết quả, live stream)
```

#### 3.2 Ma Trận Phân Quyền Mở Rộng

| Quyền | Sys Admin | Fed Admin | Prov Admin | Club Owner | Coach | Athlete | Parent | Spectator |
|---|---|---|---|---|---|---|---|---|
| **Toàn bộ hệ thống** | ✅ | — | — | — | — | — | — | — |
| **Quản lý bộ môn** | ✅ | — | — | — | — | — | — | — |
| **Quản lý LĐ Tỉnh** | ✅ | ✅ | — | — | — | — | — | — |
| **Phê duyệt CLB** | — | ✅ | ✅ | — | — | — | — | — |
| **Tạo giải đấu QG** | — | ✅ | — | — | — | — | — | — |
| **Tạo giải đấu Tỉnh** | — | — | ✅ | — | — | — | — | — |
| **Tạo giải nội bộ CLB** | — | — | — | ✅ | — | — | — | — |
| **Quản lý VĐV CLB** | — | — | — | ✅ | ✅ | — | — | — |
| **Đăng ký thi đấu** | — | — | — | ✅ | ✅ | ✅ | — | — |
| **Chấm điểm** | — | — | — | — | — | — | — | — |
| *→ (chỉ Referee)* | — | — | — | — | — | — | — | — |
| **Xem kết quả** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Xem hồ sơ con** | — | — | — | — | — | — | ✅ | — |
| **Cấp chứng chỉ** | ✅ | ✅ | ✅ | — | — | — | — | — |
| **Xuất dữ liệu** | ✅ | ✅ | ✅ | ✅(CLB) | — | — | — | — |

#### 3.3 Luồng Tự Đăng Ký Tài Khoản

```
Đối với Phụ huynh / Khán giả:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Vào trang đăng ký → nhập email, SĐT, mật khẩu
2. Xác minh OTP qua SMS/Email
3. Tài khoản active ngay → role = SPECTATOR
4. Nếu muốn link con là VĐV → gửi yêu cầu → CLB xác nhận

Đối với Võ sinh/VĐV:
━━━━━━━━━━━━━━━━━━━━
Cách 1: CLB tạo hộ → VĐV nhận link kích hoạt
Cách 2: VĐV tự đăng ký → chọn CLB → CLB xác nhận
         (tránh giả mạo CLB)

Đối với HLV:
━━━━━━━━━━━━
CLB chủ nhiệm mời → HLV nhận link → set password → Active

Đối với Trọng tài:
━━━━━━━━━━━━━━━━━━
LĐ QG/LĐ Tỉnh tạo tài khoản → gán giấy phép trọng tài
```

---

### 🔹 NHÓM 4: QUẢN LÝ DỮ LIỆU THAM CHIẾU — ĐA BỘ MÔN

#### 4.1 Reference Data Theo Bộ Môn

```
reference_data
├── martial_art: vo_co_truyen
│   ├── belt_ranks: [Trắng, Vàng, Xanh, Đỏ, Đen 1 đẳng ... 9 đẳng]
│   ├── competition_events: [Quyền thuật, Đối kháng, Biểu diễn, Tự vệ...]
│   ├── weight_classes: [{name: "48kg", min: 0, max: 48}, ...]
│   ├── scoring_criteria: [Chính xác kỹ thuật, Lực, Tốc độ, Tác phong...]
│   ├── age_groups: [U12, U15, U18, Senior, Veteran]
│   └── penalty_types: [Nhắc nhở, Cảnh cáo, Trừ điểm, Truất quyền]
│
├── martial_art: vovinam
│   ├── belt_ranks: [Trắng, Xanh đậm, Xanh nhạt, Vàng đậm...]
│   ├── competition_events: [Quyền, Đối kháng, Song luyện, Đa luyện...]
│   └── ...
│
└── martial_art: karate
    ├── belt_ranks: [Trắng, Vàng, Cam, Xanh lá, Xanh dương, Nâu, Đen]
    ├── competition_events: [Kata, Kumite]
    └── ...
```

> [!CAUTION]
> `Page_admin_reference_data` hiện tại **KHÔNG có khái niệm `martial_art` namespace**. Toàn bộ ref data đang lẫn vào 1 bảng duy nhất. Cần refactor schema + UI.

#### 4.2 Dữ Liệu Địa Lý

```
Cần bổ sung cho hệ thống:
━━━━━━━━━━━━━━━━━━━━━━━━━━
regions (Vùng miền)
├── provinces (34 Tỉnh/TP trực thuộc TW)
│   ├── districts (Quận/Huyện)
│   └── wards (Phường/Xã)    ← optional, dùng cho địa chỉ CLB

countries (Quốc gia)         ← cho giải quốc tế
```

---

### 🔹 NHÓM 5: GIÁM SÁT & VẬN HÀNH

#### 5.1 Dashboard System Admin — Metrics Quan Trọng

| Nhóm | Metric | Ý nghĩa |
|---|---|---|
| **Users** | Tổng tài khoản active | Tăng trưởng platform |
| | Đăng ký mới hôm nay/tuần | Growth rate |
| | Users online real-time | Platform load |
| **Tenants** | Số LĐ / Hội Tỉnh / CLB active | Business health |
| | Tenant chờ phê duyệt | Action needed |
| | CLB hết hạn đăng ký | Revenue risk |
| **Giải đấu** | Giải đang diễn ra | Cần monitoring intensively |
| | Giải sắp tới (7 ngày) | Cần chuẩn bị resources |
| **System** | API Latency P95 | Performance |
| | Error rate | Stability |
| | DB connections | Capacity |

#### 5.2 Checklist Vận Hành — Ngày Có Giải Đấu

```
⚡ TRƯỚC GIẢI (1 ngày):
━━━━━━━━━━━━━━━━━━━━━━
□ Kiểm tra scoring module hoạt động
□ Verify trọng tài đã có tài khoản + quyền
□ Test push notification tới BTC
□ Backup toàn bộ DB
□ Kiểm tra capacity (VĐV × trận × TT = concurrent users)
□ Enable feature flags cho giải này (nếu đang pilot)

⚡ TRONG GIẢI:
━━━━━━━━━━━━━
□ Monitor real-time: latency, errors, WebSocket connections
□ Watchlist integrity alerts liên tục
□ Sẵn sàng xử lý sự cố: scoring lỗi, mất kết nối
□ Hotline hỗ trợ kỹ thuật cho BTC

⚡ SAU GIẢI:
━━━━━━━━━━━
□ Verify kết quả đã đồng bộ đầy đủ
□ Generate chứng chỉ batch
□ Tổng hợp incident report
□ Export báo cáo cho LĐ
```

---

### 🔹 NHÓM 6: CẤU HÌNH HỆ THỐNG

#### 6.1 Config Theo Phạm Vi

```
GLOBAL CONFIG (System Admin only):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• session.timeout, jwt.expiry, password.policy
• upload.max_size, email.daily_limit
• backup.schedule, maintenance_window

PER-MARTIAL-ART CONFIG:
━━━━━━━━━━━━━━━━━━━━━━
• scoring.max_judges (Karate: 5, VCT: 3-5)
• scoring.scale (10 điểm vs flag system)
• tournament.default_format (single_elimination, round_robin...)

PER-FEDERATION CONFIG (Fed Admin quản lý, Admin override):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• registration.deadline_hours
• weigh_in.tolerance_kg
• club.annual_fee

⚠️ Config scoring: thay đổi GIỮA GIẢI CẤM TUYỆT ĐỐI.
   Hệ thống phải lock config khi có giải đang diễn ra.
```

---

### 🔹 NHÓM 7: CHỨNG CHỈ & TÀI LIỆU

#### 7.1 Loại Chứng Chỉ/Tài Liệu Mở Rộng

| Loại | Cấp bởi | Tần suất | Xác minh |
|---|---|---|---|
| **Thẻ VĐV** | CLB + LĐ Tỉnh | Hàng năm gia hạn | QR code |
| **Chứng nhận đai** | Hội đồng Thi → LĐ QG | Khi thi đỗ | QR code + digital sign |
| **Huy chương giải** | BTC Giải | Sau giải | QR code |
| **Giấy phép TT** | LĐ QG | 2 năm/lần | QR code + số GP |
| **Giấy phép CLB** | LĐ Tỉnh | Hàng năm | Số đăng ký |
| **Bằng HLV** | LĐ QG | Theo cấp | QR code |
| **Bảo hiểm thi đấu** | Bên thứ 3 | Mỗi giải | Số hợp đồng |

---

### 🔹 NHÓM 8: INTEGRITY — ĐẶC THÙ VÕ THUẬT VN

#### 8.1 Rủi Ro Liêm Chính Đặc Thù

| Rủi ro | Mô tả cụ thể | Phát hiện |
|---|---|---|
| **Gian lận tuổi** | VĐV 17 tuổi thi hạng U15 | Cross-check CCCD/giấy khai sinh |
| **Gian lận đai** | Khai đai thấp hơn để thi hạng thấp | Verify chứng nhận đai trên hệ thống |
| **Gian lận CLB** | Đăng ký CLB khác để tránh gặp đồng đội | Lịch sử chuyển CLB < 6 tháng |
| **VĐV "ma"** | CLB khai khống VĐV để lấy quota | Cross-check danh sách đăng ký giải |
| **TT thiên vị** | Chấm điểm lệch cho VĐV quen | Statistical analysis per-judge |
| **Doping** | (Ít phổ biến ở cấp tỉnh) | Kết nối hệ thống anti-doping (tương lai) |

---

### 🔹 NHÓM 9: THÔNG BÁO — ĐA ĐỐI TƯỢNG

#### 9.1 Ma Trận Thông Báo Theo Đối Tượng

| Sự kiện | VĐV | HLV | CLB | TT | Phụ huynh | LĐ |
|---|---|---|---|---|---|---|
| Gọi thi đấu | ✅ Push+SMS | ✅ Push | — | ✅ Push | ✅ Push | — |
| Kết quả trận | ✅ Push | ✅ Push | ✅ Push | — | ✅ Push | — |
| Thay đổi lịch | ✅ Push+SMS | ✅ Push+SMS | ✅ Email | ✅ Push | ✅ Push | ✅ Email |
| Đăng ký được duyệt | ✅ Push | — | ✅ Email | — | — | — |
| Thi đỗ thăng đai | ✅ Push+Email | ✅ Push | ✅ Email | — | ✅ Push | — |
| Hết hạn đăng ký CLB | — | — | ✅ Email+SMS | — | — | ✅ Email |

> [!IMPORTANT]
> **Phụ huynh** là đối tượng quan trọng nhưng đang **hoàn toàn thiếu** trong hệ thống hiện tại. Cần thêm: link con em, nhận thông báo trận đấu, xem kết quả.

---

### 🔹 NHÓM 10: BACKUP, BẢO MẬT & TUÂN THỦ

#### 10.1 Bảo Mật Dữ Liệu Cá Nhân

```
Dữ liệu nhạy cảm cần bảo vệ:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• CCCD/CMND số + ảnh (võ sinh U18)
• Ngày sinh (bắt buộc cho xác minh tuổi)
• Số điện thoại phụ huynh
• Ảnh chân dung VĐV
• Lịch sử y tế (giấy khám sức khỏe)
• Thông tin tài khoản ngân hàng (nếu có giải thưởng)

Nguyên tắc:
━━━━━━━━━━
• Mã hóa dữ liệu nhạy cảm at-rest
• CLB chỉ xem được VĐV của mình
• LĐ Tỉnh chỉ xem CLB trong tỉnh
• Export data phải ghi audit log
• Phụ huynh có quyền yêu cầu xóa dữ liệu con em (PDPA)
```

---

## IV. SO SÁNH: HỆ THỐNG HIỆN TẠI vs NHU CẦU THỰC TẾ

| Nhu cầu | Hiện tại | Gap |
|---|---|---|
| Multi-martial-art | ❌ Chưa có | Cần thêm entity `martial_art`, namespace ref data |
| Hierarchical tenant (4 cấp) | ⚠️ Flat list | Cần parent-child tenant relationship |
| 34 Hội cấp Tỉnh | ⚠️ Mock tenant | Cần wire API + approval flow |
| Tự đăng ký CLB/VĐV | ❌ Chưa có | Cần public registration + approval |
| Phụ huynh link con em | ❌ Chưa có | Cần entity + notification |
| Khán giả xem kết quả | ❌ Chưa có | Cần public facing pages |
| Ref data per martial art | ❌ 1 bảng chung | Cần refactor schema |
| Địa lý 34 tỉnh | ❌ Chưa có | Cần import danh mục ĐVHC|
| ~20K-90K users | ❌ 7 mock users | Cần backend + scalability |
| Chứng chỉ đai thật | ❌ Mock | Cần PDF engine + QR verify |
| Xác minh tuổi/đai | ❌ Chưa có | Cần cross-check logic |

---

## V. LỘ TRÌNH ĐỀ XUẤT

```
PHASE 1 — MVP (4-6 tuần): Võ Cổ Truyền
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Wire backend Users/Roles API + route guard
✅ Tạo entity martial_art, ref data cho VCT
✅ Wire Tenant API (LĐ QG → Hội Tỉnh → CLB)
✅ Import 34 tỉnh thành
✅ Audit log ghi thật

PHASE 2 — Core Operations (4-6 tuần)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ CLB/VĐV self-registration + approval
✅ Wire Config + Feature Flags
✅ Notification system thật (Push + Email)
✅ Dashboard metrics thật
✅ Thẻ VĐV digital + QR

PHASE 3 — Mở rộng (ongoing)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Phụ huynh module
✅ Chứng chỉ đai, giải
✅ Integrity detection engine
✅ Data Quality engine
✅ Thêm bộ môn Vovinam

PHASE 4 — Scale (ongoing)
━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Karate, Taekwondo
✅ Billing/Subscription
✅ Public spectator portal
✅ Mobile app cho VĐV/Phụ huynh
```
