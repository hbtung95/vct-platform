# Phân Tích Nghiệp Vụ: Hệ Thống Phê Duyệt Điện Tử (Workflow Approval System)

Để đáp ứng nhu cầu "nâng cấp và mở rộng tính năng", một trong những tính năng lõi quan trọng nhất của VCT Platform cấp Liên đoàn là **Hệ thống Phê duyệt Điện tử (Electronic Approval / Workflow Engine)**. 

Dựa trên bản nháp giao diện `Page_workflow_config.tsx` đang có các trường hợp hardcode, hệ thống thực tế cần một Data Model và API linh hoạt để xử lý các luồng duyệt phức tạp (1 bước, nhiều bước, cần đa số phiếu, v.v.).

## 1. Đối Tượng Người Dùng & Vai Trò (Actors)
- **Người trình duyệt (Requester)**: Bất kỳ ai thực hiện một action cần phê duyệt (VD: HLV đăng ký CLB, VĐV đăng ký thi đấu, Thủ quỹ trình chi tiêu).
- **Người phê duyệt (Approver)**: Các vai trò được chỉ định trong từng bước duyệt (VD: Admin Tỉnh, Thư ký LĐ, Chủ tịch, Trưởng ban chuyên môn).
- **Quản trị viên (System Admin / Federation Admin)**: Người cấu hình, thay đổi số bước và vai trò duyệt của từng loại quy trình.

## 2. Các Quy Trình Cốt Lõi (Core Workflows)
Hệ thống phải hỗ trợ các quy trình mẫu (Templates) chia làm 5 nhóm chính:
- **Hành chính**: Đăng ký CLB, Cấp thẻ Trọng tài/HLV, Đăng ký hội viên.
- **Giải đấu**: Xin phép tổ chức giải, Đăng ký đoàn tham gia.
- **Tài chính**: Phê duyệt chi tiêu (theo hạn mức: <5tr, 5-50tr, >50tr).
- **Đào tạo**: Thi thăng đai, Mở lớp tập huấn.
- **Nội dung / Kỷ luật**: Duyệt tin bài, Xử lý khiếu nại kháng nghị.

## 3. Data Model (Mô Hình Dữ Liệu Backend)

### 3.1 `WorkflowDefinition` (Định nghĩa Luồng Phê Duyệt)
Bảng lưu trữ cấu hình các loại luồng duyệt.
- `id` (UUID)
- `code` (String, unique) - VD: `club_registration`, `expense_large`
- `entity_type` (String) - VD: `club`, `transaction`, `referee`
- `display_name` (String)
- `group_category` (String) - VD: `finance`, `administration`
- `is_active` (Boolean) - Trạng thái hoạt động

### 3.2 `WorkflowStepDefinition` (Cấu hình Bước Duyệt)
Bảng cấu hình các bước trong 1 luồng.
- `id` (UUID)
- `workflow_config_id` (UUID - refs `WorkflowConfig`)
- `step_order` (Int) - Thứ tự bước (1, 2, 3...)
- `step_name` (String) - VD: "Thư ký LĐ thẩm định"
- `required_role` (String) - Vai trò được phép duyệt (VD: `federation_secretary`)
- `requires_all_approvers` (Boolean) - Bắt buộc tất cả người có role phải duyệt hay chỉ cần 1 người.
- `min_approvals_required` (Int) - Số lượng phiếu cần thiết (Dùng cho Ban Thường Vụ >= x phiếu).

### 3.3 `ApprovalRequest` (Yêu Cầu Phê Duyệt)
Bảng lưu trữ trạng thái của 1 yêu cầu thực tế.
- `id` (UUID)
- `workflow_code` (String) - Loại quy trình áp dụng
- `target_entity_id` (String) - ID của bản ghi cần duyệt (CLB ID, Transaction ID...)
- `requester_id` (String) - Người trình
- `current_step_order` (Int) - Bước đang chờ (chạy từ 1)
- `status` (Enum: `pending`, `approved`, `rejected`, `cancelled`)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### 3.4 `ApprovalTask` (Nhiệm vụ Duyệt / Lịch sử)
Mỗi khi Request chuyển sang bước mới, tạo Task cho những người có role tương ứng.
- `id` (UUID)
- `approval_request_id` (UUID)
- `step_order` (Int)
- `assigned_role` (String)
- `approver_id` (String, nullable) - ID người thực tế đã thực hiện bấm duyệt/từ chối.
- `action` (Enum: `pending`, `approved`, `rejected`)
- `comment` (String) - Lý do từ chối/đồng ý.
- `acted_at` (Timestamp)

## 4. Kế Hoạch Triển Khai (Dự Kiến)
1. **Backend**:
   - Viết Data Models (Go Structs).
   - Xây dựng `WorkflowService` xử lý logic (Submit Request, Approve Step, Reject Request).
   - Viết API `GET /api/workflows`, `POST /api/workflows/approve`, `GET /api/workflows/pending`.
2. **Frontend**:
   - Cập nhật `Page_workflow_config.tsx` để fetch data động từ API.
   - Xây dựng Component `VCT_ApprovalTimeline` để gắn vào các trang chi tiết (CLB, Transaction) hiển thị luồng duyệt.
   - Xây dựng trang `Page_pending_approvals.tsx` (Việc cần duyệt của tôi) cho các Admin.

---
> **Ý kiến của bạn?** Bạn có muốn tôi tiến hành thực thi việc xây dựng toàn bộ Hệ thống Phê duyệt (Workflow) này theo kế hoạch trên không, hay bạn muốn ưu tiên làm module nào khác (ví dụ: Phụ huynh/Khán giả)?
