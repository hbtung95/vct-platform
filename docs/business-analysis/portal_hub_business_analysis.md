# Phân tích Luồng nghiệp vụ Trang Portal (Ecosystem Hub) – VCT Platform

**Ngày cập nhật**: 26/03/2026
**Mục tiêu**: Phân tích tổng thể nghiệp vụ (Context-Awareness Workspace Switcher), định hướng kiến trúc UI/UX và luồng bảo mật trên trang Portal Hub của Võ Cổ Truyền Platform.

---

## 1. Định vị chức năng (Product Positioning)
Trang Portal Hub (`/`) đóng vai trò như một **Đại Sảnh (Sảnh chờ)** của toàn bộ Hệ sinh thái VCT. 
Thay vì đẩy thẳng người dùng vào một Dashboard được cài sẵn (hardcode) và nhồi nhét mọi thanh Menu (Sidebar) của mọi chức năng, Portal hoạt động theo nguyên tắc **Multi-tenant Workspace Switcher**:
* Lọc bỏ hoàn toàn các chức năng chưa cần thiết.
* Trình bày các không gian làm việc (Workspace) độc lập mà một người dùng có Quyền (Role) truy cập.
* Tách biệt các Vùng dữ liệu (Scope) để đảm bảo dữ liệu CLB A không bao giờ tràn sang CLB B trên cùng một phiên đăng nhập của HLV.

---

## 2. Luồng nghiệp vụ (Business Flow)

### Bước 2.1: Điều hướng sau khi Đăng Nhập (Login Redirection)
* **Trạng thái**: Khi người dùng vừa thực hiện ủy quyền (authenticate) và nhận JWT/Refresh Token.
* **Hành vi**: Bộ định tuyến (Next.js Navigation) luôn ưu tiên điều hướng mặc định về `app.vctplatform.vn/` (Trang Portal Hub).
* **Kết quả UX**: Trải nghiệm nhất quán "Landing Zone". Bất kể người đăng nhập là Admin hệ thống, Chủ tịch Liên đoàn hay một Võ sinh, trạm nghỉ chân đầu tiên của họ luôn là một "Không gian nhìn tổng quát các vai trò của bản thân" thay vì bị ép vào một chức năng cụ thể nào đó.

### Bước 2.2: Phân giải Ngữ cảnh & Dựng thẻ Workspace (Context Resolution)
* Dữ liệu nhận từ Backend (trong `currentUser.roles`) là một mảng dữ liệu quyền lực (ví dụ: `[ { role: 'club_leader', scope_id: 'clb_01' }, { role: 'athlete', scope_id: 'self' } ]`).
* **Zustand Store (`workspace-store.ts`)** tiến hành phân giải. Map từng role thành các **Workspace Card**. 
* **Business Rules**:
  * Nhóm các vai trò hệ thống (`system_admin`).
  * Nhóm vai trò tổ chức Vĩ mô (`federation_admin`, `provincial`).
  * Nhóm vai trò quản lý thực địa (`tournament_ops`, `club_management`, `referee_console`).
  * Nhóm cá nhân & Công cộng (`athlete_portal`, `parent_portal`, `public_spectator`).
* **Đặc quyền mở**: Ai cũng nhận được thẻ `Cá nhân (Hồ sơ võ sinh)` và `Công cộng (Xem điểm live spectator)`, đảm bảo tính liên kết mọi cá thể đều là một võ sinh.

### Bước 2.3: Tổ chức Giao diện "Context-Aware" (UI Presentation)
* **Giao diện Toàn màn hình (Full-Screen Layout)**: 
  * Header chính chỉ bao gồm 2 yếu tố: Search khẩn cấp (`Command Palette ⌘K`) và User Menu (Đăng xuất, Chuyển ngôn ngữ, Theme).
  * **Không Sidebar**: Mọi Sidebar (Menu dọc) đều bị vô hiệu hoá trên Portal, giúp thiết kế tràn viền (Edge-to-Edge), tránh việc người dùng bấm nhầm vào các menu của Liên đoàn trong khi họ chỉ muốn vào xem điểm thi đấu.
* **Cá nhân hóa nội bộ (Smart Layout)**:
  * Thuật toán lấy dữ liệu từ `localStorage` (cụ thể là `lastAccessedMap` và `pinnedWorkspaceIds`) để bóc tách 2 danh sách cực kỳ quan trọng lên thẳng tầm mắt người dùng ngay dưới Lời chào: **Mục Yêu Thích (Pinned)** và **Truy Cập Gần Nhất (Recent)**.
  * Các chuyên mục còn lại được ẩn dưới Divider hoặc Nhóm danh mục (Categories) theo nguyên tắc Staggered Animation (chuyển động xuất hiện theo bậc thang).

### Bước 2.4: Luồng thực thi "Bước vào Không gian" (Enter Workspace Flow)
1. **User action**: Người dùng Click/Tap vào một thẻ Workspace (VD thẻ `Chấm điểm Trọng Tài` hoặc thẻ `Quản lý CLB Võ Đang`).
2. **Context Binding**: Hệ thống bắn Object Card đó vào **Active Context** (Lưu trong trạng thái phân trang toàn cầu - Zustand State). 
3. **Data Persistance**: Cập nhật lại thời gian truy cập (`trackAccess`), lưu object `activeWorkspace` vào Storage để phòng trường hợp F5/Refresh trang không bị văng trở lại Portal.
4. **Router Push**: Tùy theo Loại Workspace (`type`), Router rẽ nhánh (Routing Switch) để đẩy user vào Dashboard gốc của loại đó. (Ví dụ: `federation_admin` -> `/dashboard`, `referee_console` -> `/referee-scoring`, v.v.).

---

## 3. Kiến trúc Bảo mật & Dữ liệu Kế thừa (Inheritance Security)
* **Không lưu trữ bí mật trên Client**: Tên của Workspace (`scope_name`) trên thẻ chỉ mang tính chất hiển thị (Render Props). 
* API vẫn tự đọc Role và Phân cấp từ Object trong ruột Backend. Kể cả khi User Hack chỉnh sửa chữ, API Call (Header truyền `X-Tenant-Id` hay Backend intercept JWT) vẫn chặn đúng cấp thẩm quyền.
* Chức năng **Active Workspace** trong bộ nhớ sẽ "ngầm" quyết định:
  1. Menu Sidebar nào được xuất hiện.
  2. Breadcrumbs (đường dẫn phân cấp trên thanh Header) sẽ in chữ gì.
  3. Context mặc định cho các màn hình Form (vd: Tạo VĐV mới -> Lấy mặc định `activeWorkspace.scope_id` làm CLB).

---

## 4. Tương lai mở rộng (Future Roadmap)
Từ nền tảng của Portal v3 hiện tại, luồng nghiệp vụ mở đường cho các tính năng:
1. **Live Metrics/Badges Badge Polling**: Gọi 1 API nhẹ (/api/portal-stats) lúc vào trang để lấy số lượng "Thông báo cấu hình đỏ" (Pending actions) gắn thẳng vào góc thẻ. Giúp Hội đồng quản trị nhìn thấy ngay CLB nào có bao nhiêu Đơn cần duyệt trước khi Click vào.
2. **Đăng nhập một lần trên nhiều giải (SSO for multi-tournament)**: Vì mỗi giải đấu có thể được xem là 1 Context Scope, trọng tài làm việc cùng lúc 2 sân giải đấu khác nhau ở Miền Nam và Miền Bắc sẽ thấy 2 thẻ Workspace độc lập mà không cần chuyển tài khoản. Thay đổi Workspace đồng nghĩa với thay đổi toàn bộ không gian dữ liệu giải đấu.

---

## 5. Xử lý Trạng thái Ngoại lệ & Cận biên (Edge Cases & Fallbacks)
Một nền tảng chuyên nghiệp không bao giờ hiển thị "lỗi hệ thống" (500) trên trang đắc địa nhất. Portal Hub cần xử lý các tình huống cận biên (Edge cases):
1. **Trạng thái Trắng (Empty/Orphan State)**: Nếu một người dùng đăng ký thành công nhưng chưa được Liên đoàn phân công vào bất kỳ CLB hay Ban nào (Role rỗng). Giao diện Portal không được "trống rỗng" mà phải hiển thị 1 thẻ duy nhất: **"Trạng thái chờ duyệt"**, kèm theo lời kêu gọi hành động (Call to Action) như *"Hãy liên hệ Ban Tổ chức để được cấp quyền"*.
2. **Thu hồi quyền tức thời (Role Revocation)**: Nếu Admin xóa tư cách Chủ nhiệm CLB của ông A trong lúc ông ấy đang truy cập Portal. Ở lần tải lại trang hoặc Refresh Token tiếp theo, thẻ CLB đó phải biến mất ngay lập tức trên Portal cá nhân của ông A.
3. **Mạng yếu & Ngoại tuyến (Offline-First)**: Vì VCT có tích cực sử dụng PWA ở diện điện thoại/thiết bị di động, Portal Hub cần duy trì trạng thái lưu cache (caching roles) để nếu tạm đứt mạng, người ta vẫn nhìn thấy các thẻ Workspace của mình (trạng thái read-only).

## 6. Hiệu năng & Tối ưu Trải nghiệm (Performance & UX Polish)
1. **Dự đoán và tải trước dữ liệu (Smart Prefetching)**: 
   Khi người dùng di chuột (Hover) vào một thẻ Workspace (VD: Thẻ Trọng Tài), Next.js ngầm kích hoạt tải trước (Prefetch) các file Javascript và CSS của trang `/referee-scoring`. Ngay khi họ click, trang sẽ mở ra **tức thì (0 milisecond delay)**.
2. **Quy mô lớn (Heavy-loaded User)**: 
   Nếu một Admin hệ thống có quyền truy cập 500 Câu lạc bộ trên toàn quốc, trang Portal sẽ đứng máy nếu load tất cả. Cần chiến lược Render trì hoãn (Lazy loading), thanh Search lúc này không chỉ lọc trên DOM (client-side) mà tự động nảy sang Server-side Search qua API.
3. **Đón tiếp người mới (User Onboarding)**: 
   Khi một VĐV đăng nhập **lần đầu tiên** trong đời, trang Portal sẽ làm mờ các nội dung rườm rà và chiếu một đốm sáng (Pulsing Spotlight) vào thẻ duy nhất họ cần quan tâm: *"Hồ sơ cá nhân của bạn đã sẵn sàng"*. Đây là đẳng cấp của sự thấu hiểu hành vi!

## 7. Quyền lực Doanh nghiệp (Ultimate Enterprise Capabilities)
Nếu nhắm đến đẳng cấp của Vercel hay Atlassian, Portal Hub cần sở hữu 3 vũ khí bí mật sau:
1. **Tìm kiếm Xuyên Không gian (Omni-Search / Cross-Workspace Search)**: 
   Thanh tìm kiếm (Command Palette) trên Portal là nơi **duy nhất** có khả năng tìm kiếm xuyên lục địa. Ví dụ: Lãnh đạo gõ tên "Nguyễn Văn A", hệ thống sẽ lục lọi trong toàn bộ 50 Câu lạc bộ mà lãnh đạo đó quản lý và chỉ ra chính xác VĐV đó nằm ở thẻ Workspace nào.
2. **Nhập vai tài khoản (Impersonation / View As)**: 
   Dành riêng cho System Admin hoặc Federation Admin. Từ trang Portal, họ có thể bấm nút "Đăng nhập dưới quyền của Chủ nhiệm CLB X" để debug một lỗi mà Chủ nhiệm báo cáo, mà không cần xin mật khẩu của họ. Thẻ Workspace đó sẽ có nhãn `[Đang nhập vai]`.
3. **Timeline Hoạt động Mini (Mini Sparkline/Activity Graph)**: 
   Trên các thẻ của Admin, thay vì chỉ hiện tên CLB, hãy vẽ một biểu đồ đường cực nhỏ (Sparkline) hiển thị tần suất hoạt động/đăng ký võ sinh của CLB đó trong 7 ngày qua. Người quản lý nhìn vào Portal là biết ngay CLB nào đang "ngủ đông", CLB nào đang sôi động.

## 8. Khả năng Tiếp cận & Tùy biến (Accessibility & Customizability)
1. **Tuân thủ WCAG (Accessibility - a11y)**: Mọi thẻ Workspace phải có thẻ `aria-label` cho bộ biểu diễn giọng nói (Screen Reader). Người khiếm thị có thể dùng phím `Tab` để nhảy qua từng thẻ và nghe đọc: *"Không gian làm việc: Câu lạc bộ Võ Đang, có 3 thông báo mới"*.
2. **Kéo thả Tùy biến (Drag-and-Drop Reordering)**: 
   Người dùng có quyền nắm, kéo và thả các thẻ Workspace để sắp xếp theo thói quen cá nhân của riêng họ trên Portal, và trạng thái này được lưu lại vĩnh viễn trên Server.

## 9. Hệ sinh thái Mở & Đa ứng dụng (Open Ecosystem & App Launcher)
Để Portal Hub không chỉ là "trang chủ phần mềm" mà trở thành một **Hệ điều hành (Operating System)** thực thụ cho Võ Cổ Truyền:
1. **Trạm Phóng Ứng dụng (App Launcher / Bảng 9 chấm)**:
   Các thẻ Workspace không nhất thiết chỉ dẫn vào Dashboard. Portal sẽ đóng vai trò như App Store nội bộ. Sẽ có những thẻ mở ra các "Mini-app" tách biệt: *App Kế toán*, *App Bóp thăm - Lên lịch thi đấu*, *Mobile App Cân ký Vận động viên*. Tương tự như cách mở Google Drive hay Google Docs từ trang chủ Google.
2. **Dòng Sự kiện Hợp nhất (Global Activity Stream)**:
   Bổ sung một Panel (ngăn kéo bên phải) làm **Bảng tin**. Bảng tin này "Hút" (Aggregate) tất cả sự kiện nóng nhất từ mọi không gian mà người dùng có quyền truy cập, hiển thị dưới dạng luồng (Feed): *"1 phút trước: CLB VCT Quận 1 vừa nộp danh sách... 5 phút trước: Thanh toán giải đấu X đã duyệt"*. Cung cấp góc nhìn toàn cảnh (Bird's-eye view) cực mạnh.
3. **Phát thanh Khẩn cấp (System-wide Broadcast)**:
   Federation Admin có đặc quyền ghim một Banner báo động đỏ trên đỉnh Portal của **toàn bộ người dùng** trong hệ sinh thái: *"Bảo trì máy chủ từ 2h-4h sáng mai"*.

## 10. Tự động hóa & Trợ lý AI (Automation & AI Copilot)
1. **Gợi ý Thông minh (Smart Suggestions)**:
   Portal phải chủ động "dọn sẵn mâm". Thay vì liệt kê thẻ thụ động, nó sẽ nảy lên thẻ AI rực rỡ ở chính giữa: *"Ngày mai Khai mạc Giải Trẻ VCT. Trợ lý ảo đề xuất bạn bấm vào đây để In hàng loạt thẻ thi đấu (ID Card) cho VĐV."*
2. **Cảnh báo Dung lượng & Báo cáo Gói cước (Quota & Billing)**:
   (Cho mô hình SaaS) Hiển thị mini-progress bar ngay dưới đáy Portal: *"Liên đoàn của bạn đã sử dụng 850/1000 hạn mức Vận động viên. Vui lòng bấm vào đây để gia hạn gói Enterprise"*.
3. **Trigger Workflow (Kích hoạt luồng làm việc tự động)**:
   Click chuột phải vào 1 Workspace Card trên Portal có thể hiển thị Menu ngữ cảnh (Context Menu) để chạy nhanh các Automations mà không cần mở Dashboard: *"Tải xuất toàn bộ danh sách hội viên ra Excel"*, *"Gửi email thông báo nộp phí tháng"*.

## 11. Bảo mật thứ cấp & Chế độ Thuyết trình (MFA Step-Up & Privacy Mode)
1. **Kiểm tra An ninh Kép (Step-Up Authentication)**:
   Mặc dù người dùng đã đăng nhập vào Portal, nhưng nếu họ định bấm vào một thẻ Workspace cực kỳ nhạy cảm (Ví dụ: *Ban Tài Chính* hay *Két Sắt Hệ Thống*), Portal sẽ chặn lại và bật POP-UP yêu cầu nhập mã OTP hoặc FaceID/Lấy dấu vân tay từ điện thoại một lần nữa trước khi cho phép vào Dashboard. Đây gọi là mô hình Zero-Trust cục bộ.
2. **Chế độ Thuyết trình (Privacy Blur / Kiosk Mode)**:
   Trên Portal có một công tắc hình Con Mắt (Eye Toggle). Khi bật lên, mọi con số nhạy cảm hiển thị trên các thẻ Workspace (như *Doanh thu: 50,000,000đ*, *1500 VĐV*) đều bị làm mờ thành `***`. Tính năng này dành riêng cho Lãnh đạo khi họ phải cắm máy tính lên máy chiếu giữa hội trường.

## 12. Quản trị biểu quyết & Gamification (Governance & Engagement)
1. **Lệnh Cấm cửa Biểu quyết (Blocking Polls & Force Actions)**:
   Liên đoàn Khởi tạo một cuộc Biểu Quyết (Ví dụ: "Bầu cử BCH Nhiệm kỳ mới"). Khi các Chủ nhiệm CLB truy cập vào Portal, họ sẽ thấy toàn bộ các thẻ Workspace của mình bị Khoá xám (Disabled). Bắt buộc phải bỏ phiếu xong ở Popup trung tâm thì Portal mới nhả thẻ ra cho phép bấm vào làm việc tiếp.
2. **Tôn vinh & Trò chơi hóa (Gamification)**:
   Với VĐV, thẻ cá nhân trên Portal không chỉ khô khốc. Nếu họ có thành tích đăng nhập 10 ngày liên tiếp trước thềm giải đấu, thẻ sẽ phát ra tia lửa (Streak Flames). Hoặc khi CLB mới đạt mốc 100 thành viên, lần chạm thẻ tiếp theo sẽ tung ra hiệu ứng pháo giấy (Confetti) phủ đầy màn hình Portal để ăn mừng.
   
---
*(End of Analysis)*
