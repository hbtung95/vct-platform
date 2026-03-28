---
description: Lệnh /checkpoint — Giao thức Tự Dọn Dẹp và Đóng băng Trạng thái cho Javis Commander
---

# Lệnh `/checkpoint`

> **Khi nào dùng**: TỰ ĐỘNG áp dụng sau mỗi bước MAP-REDUCE xử lý xong sub-task hoặc khi User yêu cầu rõ ràng thay đổi bối cảnh, xóa bớt lịch sử do token cao.
> **Mục đích**: Chấm dứt bộ nhớ hội thoại tồn thừa. Sinh file tóm tắt dự án để Javis load nhẹ như lông hồng cho bước sau.
> **Người thực hiện**: Javis và Orchestrator

---

## BƯỚC 1: XÁC MINH VÀ LỌC LÕI DỮ LIỆU
Bất kỳ khi nào thực hiện xong **1 Phase của kịch bản MAP-REDUCE**, Javis phải tự review lại context và xác minh cái gì cần giữ lại, cái gì phải vứt rác.

## BƯỚC 2: TỰ ĐỘNG SINH FILE `STATE_NOW.md`
Ghi đè báo cáo tổng kết tiến độ vào `.agents/state/Javis_STATE_NOW.md` theo Format chuẩn:

```markdown
# 💾 VCT Platform - Master Javis State
**Time**: [YYYY-MM-DD HH:mm]

## 1. What was completed (Thành quả)
- [Liệt kê các module hoặc frontend components đã render xong]
- Đã test và fix bug ở tuyến số 2.

## 2. What's pending (Tồn đọng - Cần tiếp tục)
- User chưa check luồng API XYZ.
- Phase 3 của MAP-REDUCE chưa chạy.

## 3. Active Architecture Flags
- Frameworks in use: NestJS, AuthZ Middleware, etc.

## 4. Next Step
- Javis đang chờ User / Chairman cấp lệnh cho Phase tiếp theo. Lệnh gợi ý là: "[Insert Next Logical Prompt]"
```

## BƯỚC 3: PHẢN HỒI LẠI TRÊN MÀN HÌNH CHAT
"Thưa Chairman, Javis đã đúc kết và ghi đè toàn bộ Context vừa qua vào `.agents/state/Javis_STATE_NOW.md` thành công.
✅ **Chairman có thể Tắt Terminal/Clear Chat này ngay bây giờ**. Hệ thống đã giảm 100% tài nguyên thừa."

---
// turbo-all
