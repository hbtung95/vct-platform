'use client'

import * as React from 'react'
import { useState, useMemo, useEffect } from 'react'
import {
    VCT_Badge, VCT_Button, VCT_Stack, VCT_Toast,
    VCT_SearchInput, VCT_Modal, VCT_Input, VCT_Field, VCT_Select,
    VCT_ConfirmDialog, VCT_AvatarLetter, VCT_EmptyState, VCT_Tabs,
    VCT_PageContainer, VCT_StatRow
} from '../components/vct-ui'
import { VCT_Textarea } from '../components/VCT_Textarea'
import type { StatItem } from '../components/VCT_StatRow'
import { VCT_Icons } from '../components/vct-icons'
import { VCT_Drawer } from '../components/VCT_Drawer'
import { AdminSkeletonRow } from './components/AdminSkeletonRow'
import { AdminPaginationBar } from './components/AdminPaginationBar'
import { useAdminToast } from './hooks/useAdminToast'
import { exportToCSV } from './utils/adminExport'
import { usePagination } from '../hooks/usePagination'
import { useI18n } from '../i18n'

// ════════════════════════════════════════
// TYPES & CONSTANTS
// ════════════════════════════════════════

interface SupportTicket {
    id: string; maTicket: string; tieuDe: string; noiDung: string
    loai: 'account' | 'technical' | 'tournament' | 'payment' | 'general'
    mucUuTien: 'low' | 'medium' | 'high' | 'critical'
    trangThai: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed'
    danhMuc: string; nguoiTaoTen: string; nguoiTaoEmail: string
    nguoiXuLyTen?: string; soTraLui: number
    createdAt: string; updatedAt: string
    // SLA fields
    firstResponseAt?: string; slaDeadline?: string
    satisfactionRating?: number; satisfactionNote?: string
    resolvedAt?: string
}

interface TicketReply {
    id: string; ticketId: string; sender: string; senderRole: 'customer' | 'admin'
    content: string; createdAt: string; attachments?: string[]
}

interface FAQ {
    id: string; cauHoi: string; traLoi: string; danhMuc: string
    luotXem: number; isActive: boolean
}

interface InternalNote {
    id: string; ticketId: string; author: string; content: string; createdAt: string
}

interface TicketActivity {
    id: string; ticketId: string; action: string; actor: string; detail?: string; createdAt: string
}

interface SupportCategory {
    id: string; ten: string; moTa: string; icon: string
    mauSac: string; soTicket: number; isActive: boolean
}

const CANNED_RESPONSES = [
    { id: 'CR-01', label: '🔄 Reset mật khẩu', content: 'Bạn vui lòng nhấn "Quên mật khẩu" trên trang đăng nhập → Nhập email → Nhận OTP → Đặt mật khẩu mới. Nếu vẫn gặp lỗi, vui lòng cung cấp email đăng ký để chúng tôi hỗ trợ.' },
    { id: 'CR-02', label: '📋 Yêu cầu thêm info', content: 'Để xử lý yêu cầu, chúng tôi cần thêm thông tin: 1) Ảnh chụp lỗi, 2) Trình duyệt/thiết bị đang dùng, 3) Thời điểm xảy ra. Vui lòng bổ sung!' },
    { id: 'CR-03', label: '✅ Đã sửa lỗi', content: 'Lỗi đã được khắc phục. Vui lòng thử lại và xác nhận. Nếu vấn đề vẫn tiếp tục, hãy mở lại ticket này.' },
    { id: 'CR-04', label: '🕐 Đang xử lý', content: 'Chúng tôi đã tiếp nhận và đang xử lý. Dự kiến hoàn thành trong 24h. Chúng tôi sẽ cập nhật ngay khi có kết quả.' },
]

const STATUS_BADGE: Record<string, { label: string; type: 'info' | 'warning' | 'success' | 'neutral' | 'danger' }> = {
    open: { label: 'Mới mở', type: 'info' },
    in_progress: { label: 'Đang xử lý', type: 'warning' },
    waiting_customer: { label: 'Chờ KH', type: 'neutral' },
    resolved: { label: 'Đã giải quyết', type: 'success' },
    closed: { label: 'Đã đóng', type: 'neutral' },
}

const PRIORITY_BADGE: Record<string, { label: string; type: 'neutral' | 'info' | 'warning' | 'danger' }> = {
    low: { label: '▽ Thấp', type: 'neutral' },
    medium: { label: '● Trung bình', type: 'info' },
    high: { label: '△ Cao', type: 'warning' },
    critical: { label: '⚠ Khẩn cấp', type: 'danger' },
}
const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }

const TYPE_BADGE: Record<string, { label: string; type: 'info' | 'success' | 'warning' | 'neutral' | 'danger' }> = {
    account: { label: 'Tài khoản', type: 'info' },
    technical: { label: 'Kỹ thuật', type: 'danger' },
    tournament: { label: 'Giải đấu', type: 'success' },
    payment: { label: 'Thanh toán', type: 'warning' },
    general: { label: 'Chung', type: 'neutral' },
}

// ════════════════════════════════════════
// MOCK DATA
// ════════════════════════════════════════

const MOCK_TICKETS: SupportTicket[] = [
    { id: 'TK-001', maTicket: 'TK-001', tieuDe: 'Không thể đăng nhập vào hệ thống', noiDung: 'Tôi đã thử đăng nhập nhiều lần nhưng hệ thống báo lỗi 401. Tôi đã kiểm tra lại mật khẩu và chắc chắn đúng. Vui lòng hỗ trợ.', loai: 'account', mucUuTien: 'high', trangThai: 'open', danhMuc: 'Tài khoản', nguoiTaoTen: 'Nguyễn Văn An', nguoiTaoEmail: 'an@vct.vn', soTraLui: 0, createdAt: '2026-03-17 10:30', updatedAt: '2026-03-17 10:30' },
    { id: 'TK-002', maTicket: 'TK-002', tieuDe: 'Lỗi hiển thị bảng xếp hạng', noiDung: 'Bảng xếp hạng VĐV không hiển thị đúng thứ tự. Các VĐV đai đen đang xếp dưới đai xanh.', loai: 'technical', mucUuTien: 'critical', trangThai: 'in_progress', danhMuc: 'Kỹ thuật', nguoiTaoTen: 'Trần Thị Bình', nguoiTaoEmail: 'binh@vct.vn', nguoiXuLyTen: 'Admin VCT', soTraLui: 2, createdAt: '2026-03-16 15:20', updatedAt: '2026-03-17 09:15' },
    { id: 'TK-003', maTicket: 'TK-003', tieuDe: 'Yêu cầu thêm hạng cân mới cho giải tỉnh', noiDung: 'Giải võ cổ truyền tỉnh Bình Định cần thêm hạng cân U18 từ 54kg đến 57kg.', loai: 'tournament', mucUuTien: 'medium', trangThai: 'waiting_customer', danhMuc: 'Giải đấu', nguoiTaoTen: 'Võ Đại Hùng', nguoiTaoEmail: 'hung@vct.vn', nguoiXuLyTen: 'Admin VCT', soTraLui: 3, createdAt: '2026-03-15 08:45', updatedAt: '2026-03-17 14:00' },
    { id: 'TK-004', maTicket: 'TK-004', tieuDe: 'Hóa đơn thanh toán lệ phí giải không hiển thị', noiDung: 'Tôi đã thanh toán lệ phí tham gia giải thi đấu nhưng hóa đơn không hiển thị trong mục thanh toán.', loai: 'payment', mucUuTien: 'high', trangThai: 'resolved', danhMuc: 'Thanh toán', nguoiTaoTen: 'Lê Minh Cường', nguoiTaoEmail: 'cuong@vct.vn', nguoiXuLyTen: 'Admin VCT', soTraLui: 4, createdAt: '2026-03-14 11:00', updatedAt: '2026-03-16 16:30' },
    { id: 'TK-005', maTicket: 'TK-005', tieuDe: 'Đề xuất tính năng quản lý lịch tập luyện', noiDung: 'Đề xuất thêm tính năng lịch tập luyện cá nhân cho VĐV.', loai: 'general', mucUuTien: 'low', trangThai: 'open', danhMuc: 'Chung', nguoiTaoTen: 'Phạm Thị Dung', nguoiTaoEmail: 'dung@vct.vn', soTraLui: 0, createdAt: '2026-03-17 08:00', updatedAt: '2026-03-17 08:00' },
    { id: 'TK-006', maTicket: 'TK-006', tieuDe: 'App mobile bị crash khi xem kết quả trận đấu', noiDung: 'Khi mở chi tiết kết quả trận đối kháng trên app mobile (Android), app bị crash.', loai: 'technical', mucUuTien: 'critical', trangThai: 'in_progress', danhMuc: 'Kỹ thuật', nguoiTaoTen: 'Hoàng Văn Phong', nguoiTaoEmail: 'phong@vct.vn', nguoiXuLyTen: 'DevTeam', soTraLui: 5, createdAt: '2026-03-16 20:00', updatedAt: '2026-03-17 11:45' },
    { id: 'TK-007', maTicket: 'TK-007', tieuDe: 'Cập nhật thông tin CLB bị từ chối', noiDung: 'Tôi đã nộp yêu cầu cập nhật thông tin CLB VCT Huế nhưng bị từ chối mà không có lý do.', loai: 'account', mucUuTien: 'medium', trangThai: 'closed', danhMuc: 'Tài khoản', nguoiTaoTen: 'Nguyễn Thị Lan', nguoiTaoEmail: 'lan@vct.vn', nguoiXuLyTen: 'Admin VCT', soTraLui: 6, createdAt: '2026-03-10 14:30', updatedAt: '2026-03-12 09:00' },
    { id: 'TK-008', maTicket: 'TK-008', tieuDe: 'Không thể tải xuống chứng nhận đai', noiDung: 'Nút "Tải chứng nhận" không hoạt động. Chrome 121.', loai: 'technical', mucUuTien: 'medium', trangThai: 'open', danhMuc: 'Kỹ thuật', nguoiTaoTen: 'Trần Văn Minh', nguoiTaoEmail: 'minh@vct.vn', soTraLui: 0, createdAt: '2026-03-17 14:20', updatedAt: '2026-03-17 14:20' },
]

const MOCK_REPLIES: TicketReply[] = [
    // TK-002 conversation
    { id: 'R-001', ticketId: 'TK-002', sender: 'Trần Thị Bình', senderRole: 'customer', content: 'Bảng xếp hạng VĐV không hiển thị đúng thứ tự. Các VĐV đai đen đang xếp dưới đai xanh.', createdAt: '2026-03-16 15:20' },
    { id: 'R-002', ticketId: 'TK-002', sender: 'Admin VCT', senderRole: 'admin', content: 'Chào bạn Bình, cảm ơn đã báo cáo lỗi. Chúng tôi đã tiếp nhận và đang kiểm tra hệ thống ranking. Bạn có thể cho biết đang kiểm tra bảng xếp hạng nào (đối kháng/quyền thuật)?', createdAt: '2026-03-16 16:00' },
    { id: 'R-003', ticketId: 'TK-002', sender: 'Trần Thị Bình', senderRole: 'customer', content: 'Bảng xếp hạng Đối kháng, hạng cân 54kg nam. VĐV Nguyễn Văn A (đai đen 2 đẳng, ELO 1850) đang xếp dưới Trần Văn B (đai xanh, ELO 1620).', createdAt: '2026-03-17 09:15' },
    // TK-006 conversation
    { id: 'R-004', ticketId: 'TK-006', sender: 'Hoàng Văn Phong', senderRole: 'customer', content: 'Khi mở chi tiết kết quả trận đối kháng trên app mobile (Android), app bị crash.', createdAt: '2026-03-16 20:00' },
    { id: 'R-005', ticketId: 'TK-006', sender: 'DevTeam', senderRole: 'admin', content: 'Cảm ơn anh đã báo. Anh dùng Android version mấy? App version nào ạ? Lỗi xảy ra ở tất cả trận hay chỉ trận cụ thể?', createdAt: '2026-03-16 21:30' },
    { id: 'R-006', ticketId: 'TK-006', sender: 'Hoàng Văn Phong', senderRole: 'customer', content: 'Android 14, Samsung S23. App v2.1.0. Xảy ra ở trận TK-BĐ-034 và TK-BĐ-041.', createdAt: '2026-03-17 08:00' },
    { id: 'R-007', ticketId: 'TK-006', sender: 'DevTeam', senderRole: 'admin', content: 'Đã reproduce được lỗi. Nguyên nhân: API trả về null cho trường điểm phạt. Đang fix. ETA: hôm nay 14h.', createdAt: '2026-03-17 10:00' },
    { id: 'R-008', ticketId: 'TK-006', sender: 'DevTeam', senderRole: 'admin', content: 'Đã deploy hotfix v2.1.1. Vui lòng cập nhật app và thử lại ạ.', createdAt: '2026-03-17 11:45' },
    // TK-004 (resolved)
    { id: 'R-009', ticketId: 'TK-004', sender: 'Lê Minh Cường', senderRole: 'customer', content: 'Tôi đã thanh toán lệ phí tham gia giải nhưng hóa đơn không hiển thị.', createdAt: '2026-03-14 11:00' },
    { id: 'R-010', ticketId: 'TK-004', sender: 'Admin VCT', senderRole: 'admin', content: 'Đã kiểm tra, thanh toán qua VNPay bị delay webhook. Hóa đơn đã được bổ sung. Xin lỗi vì sự bất tiện!', createdAt: '2026-03-14 14:30' },
]

const MOCK_FAQS: FAQ[] = [
    { id: 'FAQ-001', cauHoi: 'Làm thế nào để đăng ký tài khoản VĐV?', traLoi: 'Truy cập trang đăng ký, chọn vai trò "Võ sinh / VĐV", điền đầy đủ thông tin cá nhân, tải lên ảnh chân dung và chờ CLB/HLV xác nhận. Quá trình xét duyệt thường mất 1-3 ngày làm việc.', danhMuc: 'Tài khoản', luotXem: 1250, isActive: true },
    { id: 'FAQ-002', cauHoi: 'Quy trình đăng ký tham gia giải đấu như thế nào?', traLoi: 'VĐV đăng nhập → Chọn giải đấu → Chọn hạng cân/nội dung → Nộp lệ phí → Chờ BTC xác nhận. Thời hạn đăng ký thường đóng trước ngày thi đấu 7 ngày.', danhMuc: 'Giải đấu', luotXem: 980, isActive: true },
    { id: 'FAQ-003', cauHoi: 'Thanh toán lệ phí giải đấu bằng những hình thức nào?', traLoi: 'VCT Platform hỗ trợ: Chuyển khoản ngân hàng, Ví MoMo, ZaloPay, VNPay. Sau khi thanh toán, hệ thống sẽ tự động cập nhật trạng thái đăng ký.', danhMuc: 'Thanh toán', luotXem: 756, isActive: true },
    { id: 'FAQ-004', cauHoi: 'Lỗi đăng nhập, quên mật khẩu xử lý thế nào?', traLoi: 'Nhấn "Quên mật khẩu" → Nhập email đăng ký → Nhận OTP qua email → Đặt mật khẩu mới.', danhMuc: 'Tài khoản', luotXem: 2100, isActive: true },
    { id: 'FAQ-005', cauHoi: 'Làm sao để xem kết quả giải đấu?', traLoi: 'Vào mục "Giải đấu" → Chọn giải → Tab "Kết quả". Bạn có thể lọc theo hạng cân, nội dung thi đấu.', danhMuc: 'Giải đấu', luotXem: 540, isActive: true },
    { id: 'FAQ-006', cauHoi: 'Cách liên hệ hỗ trợ kỹ thuật?', traLoi: 'Tạo ticket hỗ trợ qua hệ thống (nhanh nhất), gửi email support@vct.vn, hoặc gọi hotline 1900-xxxx.', danhMuc: 'Chung', luotXem: 320, isActive: true },
]

const MOCK_CATEGORIES: SupportCategory[] = [
    { id: 'CAT-001', ten: 'Tài khoản & Đăng nhập', moTa: 'Đăng ký, đăng nhập, quên mật khẩu, cập nhật thông tin', icon: 'Users', mauSac: '#0ea5e9', soTicket: 12, isActive: true },
    { id: 'CAT-002', ten: 'Hỗ trợ Kỹ thuật', moTa: 'Lỗi hệ thống, bug, vấn đề hiển thị', icon: 'Wrench', mauSac: '#8b5cf6', soTicket: 8, isActive: true },
    { id: 'CAT-003', ten: 'Giải đấu & Thi đấu', moTa: 'Đăng ký giải, lịch thi, kết quả, bảng xếp hạng', icon: 'Trophy', mauSac: '#10b981', soTicket: 15, isActive: true },
    { id: 'CAT-004', ten: 'Thanh toán & Hóa đơn', moTa: 'Lệ phí, thanh toán online, hóa đơn, hoàn tiền', icon: 'DollarSign', mauSac: '#f59e0b', soTicket: 5, isActive: true },
    { id: 'CAT-005', ten: 'Đề xuất & Góp ý', moTa: 'Đề xuất tính năng mới, góp ý cải thiện', icon: 'MessageSquare', mauSac: '#ec4899', soTicket: 3, isActive: true },
    { id: 'CAT-006', ten: 'Chứng nhận & Đai cấp', moTa: 'Chứng nhận thăng đai, lịch sử đai cấp', icon: 'Award', mauSac: '#f97316', soTicket: 7, isActive: true },
]

const MOCK_NOTES: InternalNote[] = [
    { id: 'N-001', ticketId: 'TK-002', author: 'Admin VCT', content: 'KH đã liên hệ qua hotline, urgently cần fix trước giải vô địch.', createdAt: '2026-03-15 09:00' },
    { id: 'N-002', ticketId: 'TK-002', author: 'DevTeam', content: 'Bug confirmed, do cache bảng xếp hạng không invalidate khi thêm kết quả mới.', createdAt: '2026-03-15 10:30' },
    { id: 'N-003', ticketId: 'TK-006', author: 'Admin VCT', content: 'Đã escalate cho DevTeam, timeout do query N+1.', createdAt: '2026-03-16 14:15' },
]

const MOCK_ACTIVITIES: TicketActivity[] = [
    { id: 'A-001', ticketId: 'TK-002', action: 'created', actor: 'Trần Thị Bình', createdAt: '2026-03-14 08:00' },
    { id: 'A-002', ticketId: 'TK-002', action: 'assigned', actor: 'Admin VCT', detail: 'Nhận xử lý', createdAt: '2026-03-14 08:30' },
    { id: 'A-003', ticketId: 'TK-002', action: 'replied', actor: 'Admin VCT', detail: 'Đã phản hồi lần đầu', createdAt: '2026-03-14 08:45' },
    { id: 'A-004', ticketId: 'TK-002', action: 'note', actor: 'Admin VCT', detail: 'Thêm ghi chú nội bộ', createdAt: '2026-03-15 09:00' },
    { id: 'A-005', ticketId: 'TK-002', action: 'resolved', actor: 'Admin VCT', createdAt: '2026-03-15 14:00' },
    { id: 'A-006', ticketId: 'TK-006', action: 'created', actor: 'Phạm Hồng Đức', createdAt: '2026-03-16 11:00' },
    { id: 'A-007', ticketId: 'TK-006', action: 'assigned', actor: 'Admin VCT', createdAt: '2026-03-16 11:20' },
    { id: 'A-008', ticketId: 'TK-006', action: 'escalated', actor: 'Admin VCT', detail: 'Escalate → DevTeam', createdAt: '2026-03-16 14:15' },
]


// ════════════════════════════════════════
// FAQ FORM SUB-COMPONENT
// ════════════════════════════════════════
const FaqForm = ({ initial, onSave, onCancel }: { initial: FAQ | null, onSave: (data: Pick<FAQ, 'cauHoi' | 'traLoi' | 'danhMuc'>) => void, onCancel: () => void }) => {
    const [cauHoi, setCauHoi] = useState(initial?.cauHoi ?? '')
    const [traLoi, setTraLoi] = useState(initial?.traLoi ?? '')
    const [danhMuc, setDanhMuc] = useState(initial?.danhMuc ?? 'Chung')
    return (
        <VCT_Stack gap={16}>
            <VCT_Field label="Câu hỏi"><VCT_Input value={cauHoi} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCauHoi(e.target.value)} placeholder="Nhập câu hỏi..." /></VCT_Field>
            <VCT_Field label="Câu trả lời"><VCT_Textarea value={traLoi} onChange={setTraLoi} placeholder="Nhập câu trả lời..." rows={4} /></VCT_Field>
            <VCT_Field label="Danh mục">
                <VCT_Select value={danhMuc} onChange={setDanhMuc} options={[
                    { value: 'Tài khoản', label: 'Tài khoản' }, { value: 'Giải đấu', label: 'Giải đấu' },
                    { value: 'Thanh toán', label: 'Thanh toán' }, { value: 'Kỹ thuật', label: 'Kỹ thuật' },
                    { value: 'Chung', label: 'Chung' },
                ]} />
            </VCT_Field>
            <VCT_Stack direction="row" gap={8} justify="end" className="pt-2 border-t border-(--vct-border-subtle)">
                <VCT_Button variant="ghost" onClick={onCancel}>Hủy</VCT_Button>
                <VCT_Button variant="primary" onClick={() => onSave({ cauHoi, traLoi, danhMuc })} icon={<VCT_Icons.CheckCircle size={14} />}>{initial ? 'Cập nhật' : 'Thêm'}</VCT_Button>
            </VCT_Stack>
        </VCT_Stack>
    )
}

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════
export const Page_admin_support = () => {
    const { t } = useI18n()
    const [tickets, setTickets] = useState(MOCK_TICKETS)
    const [replies, setReplies] = useState(MOCK_REPLIES)
    const [faqs, setFaqs] = useState(MOCK_FAQS)
    const [categories, setCategories] = useState(MOCK_CATEGORIES)
    const [tab, setTab] = useState('tickets')
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterPriority, setFilterPriority] = useState('all')
    const [isLoading, setIsLoading] = useState(true)
    const [selected, setSelected] = useState<SupportTicket | null>(null)
    const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showResolveConfirm, setShowResolveConfirm] = useState<string | null>(null)
    const [replyText, setReplyText] = useState('')
    const [showCanned, setShowCanned] = useState(false)
    const [showFaqModal, setShowFaqModal] = useState(false)
    const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
    const [faqSearch, setFaqSearch] = useState('')
    const [viewMode, setViewMode] = useState<'table' | 'board'>('table')
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [notes, setNotes] = useState(MOCK_NOTES)
    const [noteText, setNoteText] = useState('')
    const [sortBy, setSortBy] = useState<'createdAt' | 'mucUuTien' | 'trangThai'>('createdAt')
    const [sortAsc, setSortAsc] = useState(false)
    const [showCatModal, setShowCatModal] = useState(false)
    const [editingCat, setEditingCat] = useState<SupportCategory | null>(null)
    const [drawerTab, setDrawerTab] = useState<'conversation' | 'notes' | 'timeline'>('conversation')
    const { toast, showToast, dismiss } = useAdminToast()
    // CreateTicket form state
    const [newTitle, setNewTitle] = useState('')
    const [newContent, setNewContent] = useState('')
    const [newType, setNewType] = useState<SupportTicket['loai']>('general')
    const [newPriority, setNewPriority] = useState<SupportTicket['mucUuTien']>('medium')
    const nextTicketId = useMemo(() => `TK-${String(tickets.length + 1).padStart(3, '0')}`, [tickets.length])

    useEffect(() => {
        const t = setTimeout(() => setIsLoading(false), 800)
        return () => clearTimeout(t)
    }, [])

    // ── FILTERED + SORTED TICKETS ──
    const filteredTickets = useMemo(() => {
        const filtered = tickets.filter(t => {
            const matchSearch = t.tieuDe.toLowerCase().includes(search.toLowerCase())
                || t.maTicket.toLowerCase().includes(search.toLowerCase())
                || t.nguoiTaoTen.toLowerCase().includes(search.toLowerCase())
            const matchStatus = filterStatus === 'all' || t.trangThai === filterStatus
            const matchPriority = filterPriority === 'all' || t.mucUuTien === filterPriority
            return matchSearch && matchStatus && matchPriority
        })
        return [...filtered].sort((a, b) => {
            let cmp = 0
            if (sortBy === 'mucUuTien') cmp = (PRIORITY_ORDER[a.mucUuTien] ?? 9) - (PRIORITY_ORDER[b.mucUuTien] ?? 9)
            else if (sortBy === 'trangThai') cmp = a.trangThai.localeCompare(b.trangThai)
            else cmp = a.createdAt.localeCompare(b.createdAt)
            return sortAsc ? cmp : -cmp
        })
    }, [tickets, search, filterStatus, filterPriority, sortBy, sortAsc])

    const pagination = usePagination(filteredTickets, { pageSize: 10 })

    // ── REPLIES + NOTES + ACTIVITIES for selected ticket ──
    const ticketReplies = useMemo(() => {
        if (!selected) return []
        return replies.filter(r => r.ticketId === selected.id)
    }, [selected, replies])

    const ticketNotes = useMemo(() => {
        if (!selected) return []
        return notes.filter(n => n.ticketId === selected.id)
    }, [selected, notes])

    const ticketActivities = useMemo(() => {
        if (!selected) return []
        return MOCK_ACTIVITIES.filter(a => a.ticketId === selected.id)
    }, [selected])

    // ── SLA STATS ──
    const countByStatus = (s: string) => tickets.filter(t => t.trangThai === s).length
    const resolvedCount = countByStatus('resolved') + countByStatus('closed')
    const resolutionRate = tickets.length > 0 ? Math.round((resolvedCount / tickets.length) * 100) : 0
    const avgResponseHours = 2.4 // mock
    const slaViolations = tickets.filter(t => t.mucUuTien === 'critical' && t.trangThai === 'open').length

    const stats: StatItem[] = [
        { icon: <VCT_Icons.FileText size={20} />, label: 'Tổng tickets', value: tickets.length, color: '#0ea5e9' },
        { icon: <VCT_Icons.AlertTriangle size={20} />, label: 'Đang mở', value: countByStatus('open'), color: '#f59e0b' },
        { icon: <VCT_Icons.Clock size={20} />, label: 'Phản hồi TB', value: `${avgResponseHours}h`, color: '#8b5cf6' },
        { icon: <VCT_Icons.Activity size={20} />, label: 'Tỉ lệ giải quyết', value: `${resolutionRate}%`, color: '#10b981' },
        { icon: <VCT_Icons.AlertTriangle size={20} />, label: 'Vi phạm SLA', value: slaViolations, color: slaViolations > 0 ? '#ef4444' : '#10b981' },
    ]

    // ── ACTIONS ──
    const handleAssign = (id: string) => {
        setTickets(prev => prev.map(t => t.id === id ? { ...t, trangThai: 'in_progress' as const, nguoiXuLyTen: 'Admin VCT', updatedAt: new Date().toISOString() } : t))
        showToast('Đã nhận xử lý ticket')
    }

    const handleResolve = (id: string) => {
        setTickets(prev => prev.map(t => t.id === id ? { ...t, trangThai: 'resolved' as const, updatedAt: new Date().toISOString() } : t))
        setShowResolveConfirm(null)
        showToast('Đã đánh dấu giải quyết')
    }

    const handleClose = (id: string) => {
        setTickets(prev => prev.map(t => t.id === id ? { ...t, trangThai: 'closed' as const, updatedAt: new Date().toISOString() } : t))
        showToast('Đã đóng ticket', 'info')
    }

    const handleReopen = (id: string) => {
        setTickets(prev => prev.map(t => t.id === id ? { ...t, trangThai: 'open' as const, updatedAt: new Date().toISOString() } : t))
        showToast('Đã mở lại ticket')
    }

    const handleCreateTicket = () => {
        if (!newTitle || !newContent) {
            showToast('Vui lòng nhập tiêu đề và nội dung', 'error')
            return
        }
        const now = new Date().toISOString()
        const newTicket: SupportTicket = {
            id: nextTicketId,
            maTicket: nextTicketId,
            tieuDe: newTitle,
            noiDung: newContent,
            loai: newType,
            mucUuTien: newPriority,
            trangThai: 'open',
            danhMuc: TYPE_BADGE[newType]?.label || 'Chung',
            nguoiTaoTen: 'Admin VCT', // Assuming admin creates it
            nguoiTaoEmail: 'admin@vct.vn',
            soTraLui: 0,
            createdAt: now,
            updatedAt: now,
        }
        setTickets(prev => [...prev, newTicket])
        setNewTitle('')
        setNewContent('')
        setNewType('general')
        setNewPriority('medium')
        setShowCreateModal(false)
        showToast('Đã tạo ticket mới', 'success')
    }

    // ── BULK ACTIONS ──
    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }
    const toggleAll = () => {
        if (selectedIds.size === filteredTickets.length) setSelectedIds(new Set())
        else setSelectedIds(new Set(filteredTickets.map(t => t.id)))
    }
    const bulkAssign = () => {
        setTickets(prev => prev.map(t => selectedIds.has(t.id) ? { ...t, trangThai: 'in_progress' as const, nguoiXuLyTen: 'Admin VCT' } : t))
        showToast(`Đã nhận xử lý ${selectedIds.size} tickets`)
        setSelectedIds(new Set())
    }
    const bulkClose = () => {
        setTickets(prev => prev.map(t => selectedIds.has(t.id) ? { ...t, trangThai: 'closed' as const } : t))
        showToast(`Đã đóng ${selectedIds.size} tickets`, 'info')
        setSelectedIds(new Set())
    }

    // ── SORT HELPER ──
    const handleSort = (col: typeof sortBy) => {
        if (sortBy === col) setSortAsc(!sortAsc)
        else { setSortBy(col); setSortAsc(true) }
    }
    const sortIcon = (col: typeof sortBy) => sortBy === col ? (sortAsc ? ' ↑' : ' ↓') : ''

    const tabItems = [
        { key: 'tickets', label: `Tickets (${tickets.length})` },
        { key: 'faq', label: `FAQ (${faqs.length})` },
        { key: 'categories', label: `Danh mục (${categories.length})` },
        { key: 'analytics', label: '📊 Thống kê' },
    ]

    return (
        <VCT_PageContainer size="wide" animated>
            {/* Header */}
            <style>{`
                @keyframes vct-blink { 0%, 100% { opacity: 1 } 50% { opacity: 0.3 } }
                @keyframes vct-pulse { 0% { transform: scale(1) } 50% { transform: scale(1.15) } 100% { transform: scale(1) } }
                .vct-blink { animation: vct-blink 1.2s ease-in-out infinite }
                .vct-pulse { animation: vct-pulse 2s ease-in-out infinite }
            `}</style>
            <div className="mb-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-(--vct-text-primary) flex items-center gap-3">
                            <VCT_Icons.Shield size={28} className="text-[#8b5cf6]" />
                            Chăm sóc Khách hàng & Hỗ trợ Kỹ thuật
                        </h1>
                        <p className="text-sm text-(--vct-text-secondary) mt-1">Quản lý ticket hỗ trợ, FAQ, và danh mục dịch vụ</p>
                    </div>
                    {/* Live status bar */}
                    <div className="flex items-center gap-4">
                        {slaViolations > 0 && (
                            <div className="flex items-center gap-2 bg-[#ef444418] border border-[#ef444430] rounded-full px-3 py-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#ef4444] vct-blink" />
                                <span className="text-xs font-bold text-[#ef4444]">{slaViolations} vi phạm SLA</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 bg-[#f59e0b18] border border-[#f59e0b30] rounded-full px-3 py-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#f59e0b] vct-blink" />
                            <span className="text-xs font-bold text-[#f59e0b]">{countByStatus('open')} chờ phản hồi</span>
                        </div>
                        <div className="flex items-center gap-2 bg-[#0ea5e918] border border-[#0ea5e930] rounded-full px-3 py-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                            <span className="text-xs font-bold text-[#0ea5e9]">{resolutionRate}% giải quyết</span>
                        </div>
                    </div>
                </div>
            </div>

            <VCT_Toast isVisible={toast.show} message={toast.msg} type={toast.type} onClose={dismiss} />

            <VCT_StatRow items={stats} className="mb-6" />

            {/* ── Tabs ── */}
            <VCT_Tabs tabs={tabItems} activeTab={tab} onChange={setTab} className="mb-6" />

            {/* ═══════════════════════════════════════
                TAB: TICKETS
               ═══════════════════════════════════════ */}
            {tab === 'tickets' && (
                <>
                    {/* ── Toolbar ── */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <VCT_SearchInput value={search} onChange={setSearch} placeholder="Tìm ticket, mã, người tạo..." className="flex-1 min-w-[220px]" />
                        <VCT_Select
                            value={filterStatus}
                            onChange={setFilterStatus}
                            options={[
                                { value: 'all', label: 'Tất cả trạng thái' },
                                ...Object.entries(STATUS_BADGE).map(([k, v]) => ({ value: k, label: v.label }))
                            ]}
                        />
                        <VCT_Select
                            value={filterPriority}
                            onChange={setFilterPriority}
                            options={[
                                { value: 'all', label: 'Tất cả mức ưu tiên' },
                                ...Object.entries(PRIORITY_BADGE).map(([k, v]) => ({ value: k, label: v.label }))
                            ]}
                        />
                        <VCT_Button variant="primary" onClick={() => setShowCreateModal(true)} icon={<VCT_Icons.Plus size={14} />}>Tạo ticket</VCT_Button>
                        <div className="flex items-center bg-(--vct-bg-base) border border-(--vct-border-subtle) rounded-lg overflow-hidden">
                            <button type="button" className={`px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-(--vct-accent-cyan) text-white' : 'text-(--vct-text-tertiary) hover:text-(--vct-text-primary)'}`} onClick={() => setViewMode('table')}>☰ Table</button>
                            <button type="button" className={`px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${viewMode === 'board' ? 'bg-(--vct-accent-cyan) text-white' : 'text-(--vct-text-tertiary) hover:text-(--vct-text-primary)'}`} onClick={() => setViewMode('board')}>▦ Board</button>
                        </div>
                        <VCT_Button variant="outline" icon={<VCT_Icons.Download size={16} />} onClick={() => {
                            exportToCSV({
                                headers: ['Mã', 'Tiêu đề', 'Loại', 'Ưu tiên', 'Trạng thái', 'Người tạo', 'Email', 'Ngày tạo'],
                                rows: filteredTickets.map(t => [t.maTicket, t.tieuDe, t.loai, t.mucUuTien, t.trangThai, t.nguoiTaoTen, t.nguoiTaoEmail, t.createdAt]),
                                filename: 'vct_support_tickets.csv',
                            })
                            showToast('Đã xuất danh sách tickets!')
                        }}>Xuất CSV</VCT_Button>
                    </div>

                    {/* ── Bulk Action Bar ── */}
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-3 mb-4 p-3 bg-[var(--vct-accent-cyan)]/10 border border-[var(--vct-accent-cyan)]/20 rounded-xl">
                            <span className="text-sm font-bold text-(--vct-text-primary)">{selectedIds.size} đã chọn</span>
                            <VCT_Button size="sm" variant="primary" onClick={bulkAssign} icon={<VCT_Icons.User size={14} />}>Nhận xử lý</VCT_Button>
                            <VCT_Button size="sm" variant="ghost" onClick={bulkClose} icon={<VCT_Icons.Close size={14} />}>Đóng</VCT_Button>
                            <VCT_Button size="sm" variant="ghost" onClick={() => {
                                exportToCSV({
                                    headers: ['Mã', 'Tiêu đề', 'Loại', 'Ưu tiên', 'Trạng thái', 'Người tạo'],
                                    rows: filteredTickets.filter(t => selectedIds.has(t.id)).map(t => [t.maTicket, t.tieuDe, t.loai, t.mucUuTien, t.trangThai, t.nguoiTaoTen]),
                                    filename: 'vct_selected_tickets.csv',
                                })
                                showToast(`Đã xuất ${selectedIds.size} tickets`)
                            }} icon={<VCT_Icons.Download size={14} />}>Xuất</VCT_Button>
                            <VCT_Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())} className="ml-auto">Bỏ chọn</VCT_Button>
                        </div>
                    )}

                    {/* ── Table View ── */}
                    {viewMode === 'table' && (
                    <div className="bg-(--vct-bg-elevated) border border-(--vct-border-strong) rounded-2xl overflow-hidden mb-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-(--vct-border-subtle)">
                                        <th className="w-10 p-4"><input type="checkbox" aria-label="Chọn tất cả" checked={selectedIds.size > 0 && selectedIds.size === filteredTickets.length} onChange={toggleAll} className="accent-[var(--vct-accent-cyan)] cursor-pointer" /></th>
                                        <th className="text-left p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Mã</th>
                                        <th className="text-left p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider cursor-pointer hover:text-(--vct-text-primary)" onClick={() => handleSort('createdAt')}>Tiêu đề{sortIcon('createdAt')}</th>
                                        <th className="text-center p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Loại</th>
                                        <th className="text-center p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider cursor-pointer hover:text-(--vct-text-primary)" onClick={() => handleSort('mucUuTien')}>Ưu tiên{sortIcon('mucUuTien')}</th>
                                        <th className="text-center p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider cursor-pointer hover:text-(--vct-text-primary)" onClick={() => handleSort('trangThai')}>Trạng thái{sortIcon('trangThai')}</th>
                                        <th className="text-left p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Người tạo</th>
                                        <th className="text-center p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? [...Array(5)].map((_, i) => <AdminSkeletonRow key={i} cols={8} />) : pagination.paginatedItems.length === 0 ? (
                                        <tr><td colSpan={8}><VCT_EmptyState icon={<VCT_Icons.FileText size={40} />} title="Không có ticket" description="Thử thay đổi bộ lọc hoặc tạo ticket mới" /></td></tr>
                                    ) : pagination.paginatedItems.map(t => (
                                        <tr key={t.id} className={`border-b border-(--vct-border-subtle) hover:bg-(--vct-bg-base) cursor-pointer transition-colors ${selectedIds.has(t.id) ? 'bg-[var(--vct-accent-cyan)]/5' : ''}`} onClick={() => setSelected(t)}>
                                            <td className="p-4" onClick={e => { e.stopPropagation(); toggleSelect(t.id) }}><input type="checkbox" aria-label={`Chọn ${t.maTicket}`} checked={selectedIds.has(t.id)} onChange={() => {}} className="accent-[var(--vct-accent-cyan)] cursor-pointer" /></td>
                                            <td className="p-4 font-mono text-xs text-(--vct-accent-cyan) font-bold">{t.maTicket}</td>
                                            <td className="p-4">
                                                <div className="font-semibold text-(--vct-text-primary) line-clamp-1 max-w-[300px]">{t.tieuDe}</div>
                                                <div className="text-[11px] text-(--vct-text-tertiary) mt-0.5">{t.createdAt} · {t.soTraLui} phản hồi</div>
                                            </td>
                                            <td className="p-4 text-center"><VCT_Badge type={TYPE_BADGE[t.loai]?.type ?? 'neutral'} text={TYPE_BADGE[t.loai]?.label} /></td>
                                            <td className="p-4 text-center"><VCT_Badge type={PRIORITY_BADGE[t.mucUuTien]?.type ?? 'neutral'} text={PRIORITY_BADGE[t.mucUuTien]?.label} /></td>
                                            <td className="p-4 text-center"><VCT_Badge type={STATUS_BADGE[t.trangThai]?.type ?? 'neutral'} text={STATUS_BADGE[t.trangThai]?.label} /></td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <VCT_AvatarLetter name={t.nguoiTaoTen} size={28} />
                                                    <div>
                                                        <div className="text-xs font-semibold text-(--vct-text-primary)">{t.nguoiTaoTen}</div>
                                                        <div className="text-[10px] text-(--vct-text-tertiary)">{t.nguoiTaoEmail}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                                                <VCT_Stack direction="row" gap={4} justify="center">
                                                    {t.trangThai === 'open' && <VCT_Button size="sm" variant="ghost" onClick={() => handleAssign(t.id)} icon={<VCT_Icons.User size={14} />}>Nhận</VCT_Button>}
                                                    {t.trangThai === 'in_progress' && <VCT_Button size="sm" variant="ghost" onClick={() => setShowResolveConfirm(t.id)} icon={<VCT_Icons.CheckCircle size={14} />}>Xong</VCT_Button>}
                                                    {t.trangThai === 'resolved' && <VCT_Button size="sm" variant="ghost" onClick={() => handleClose(t.id)} icon={<VCT_Icons.Close size={14} />}>Đóng</VCT_Button>}
                                                </VCT_Stack>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {!isLoading && pagination.totalPages > 1 && (
                            <AdminPaginationBar {...pagination} />
                        )}
                    </div>
                    )}

                    {/* ── Kanban Board View ── */}
                    {viewMode === 'board' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {(['open', 'in_progress', 'waiting_customer', 'resolved'] as const).map(status => {
                                const col = filteredTickets.filter(t => t.trangThai === status)
                                const badge = STATUS_BADGE[status]
                                return (
                                    <div key={status} className="bg-(--vct-bg-elevated) border border-(--vct-border-strong) rounded-2xl overflow-hidden">
                                        <div className="p-3 border-b border-(--vct-border-subtle) flex items-center justify-between">
                                            <VCT_Badge type={badge?.type ?? 'neutral'} text={badge?.label ?? status} />
                                            <span className="text-xs font-bold text-(--vct-text-tertiary) bg-(--vct-bg-base) px-2 py-0.5 rounded-full">{col.length}</span>
                                        </div>
                                        <div className="p-2 space-y-2 min-h-[120px] max-h-[420px] overflow-y-auto">
                                            {col.length === 0 ? (
                                                <div className="text-center py-8 text-xs text-(--vct-text-tertiary)">Trống</div>
                                            ) : col.map(t => (
                                                <div key={t.id} className="p-3 bg-(--vct-bg-base) border border-(--vct-border-subtle) rounded-xl cursor-pointer hover:border-(--vct-accent-cyan)/40 transition-all hover:shadow-md" onClick={() => setSelected(t)}>
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="text-[10px] font-mono font-bold text-(--vct-accent-cyan)">{t.maTicket}</span>
                                                        <VCT_Badge type={PRIORITY_BADGE[t.mucUuTien]?.type ?? 'neutral'} text={PRIORITY_BADGE[t.mucUuTien]?.label} />
                                                    </div>
                                                    <div className="font-semibold text-xs text-(--vct-text-primary) line-clamp-2 mb-2">{t.tieuDe}</div>
                                                    <div className="flex items-center gap-1.5">
                                                        <VCT_AvatarLetter name={t.nguoiTaoTen} size={18} />
                                                        <span className="text-[10px] text-(--vct-text-tertiary)">{t.nguoiTaoTen}</span>
                                                        {t.soTraLui > 0 && <span className="text-[10px] text-(--vct-text-tertiary) ml-auto">💬 {t.soTraLui}</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </>
            )}

            {/* ═══════════════════════════════════════
                TAB: FAQ
               ═══════════════════════════════════════ */}
            {tab === 'faq' && (
                <>
                    {/* FAQ Toolbar */}
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <VCT_SearchInput value={faqSearch} onChange={setFaqSearch} placeholder="Tìm câu hỏi..." className="flex-1 min-w-[220px]" />
                        <VCT_Button variant="primary" onClick={() => { setEditingFaq(null); setShowFaqModal(true) }} icon={<VCT_Icons.Plus size={14} />}>Thêm FAQ</VCT_Button>
                    </div>

                    <div className="space-y-3 mb-6">
                        {faqs.filter(f => f.cauHoi.toLowerCase().includes(faqSearch.toLowerCase()) || f.danhMuc.toLowerCase().includes(faqSearch.toLowerCase())).map(faq => (
                            <div key={faq.id} className={`bg-(--vct-bg-elevated) border border-(--vct-border-strong) rounded-2xl overflow-hidden transition-all ${!faq.isActive ? 'opacity-50' : ''}`}>
                                <button
                                    type="button"
                                    className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-white/5 transition-colors"
                                    onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-8 h-8 rounded-full bg-[#8b5cf620] flex items-center justify-center shrink-0">
                                            <VCT_Icons.Info size={16} className="text-[#8b5cf6]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-sm text-(--vct-text-primary) line-clamp-1">{faq.cauHoi}</div>
                                            <div className="text-[11px] text-(--vct-text-tertiary) mt-0.5">{faq.danhMuc} · {faq.luotXem.toLocaleString()} lượt xem</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-3">
                                        <VCT_Badge type={faq.isActive ? 'success' : 'neutral'} text={faq.isActive ? 'Bật' : 'Tắt'} />
                                        <VCT_Icons.ChevronDown size={16} className={`text-(--vct-text-tertiary) transition-transform ${expandedFAQ === faq.id ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>
                                {expandedFAQ === faq.id && (
                                    <div className="px-5 pb-5 pt-0 border-t border-(--vct-border-subtle)">
                                        <div className="mt-4 text-sm text-(--vct-text-secondary) leading-relaxed whitespace-pre-line">{faq.traLoi}</div>
                                        <div className="mt-4 flex items-center gap-2 flex-wrap">
                                            <VCT_Button size="sm" variant="ghost" onClick={(e: React.MouseEvent) => { e.stopPropagation(); setEditingFaq(faq); setShowFaqModal(true) }} icon={<VCT_Icons.Edit size={14} />}>Sửa</VCT_Button>
                                            <VCT_Button size="sm" variant="ghost" onClick={(e: React.MouseEvent) => { e.stopPropagation(); setFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, isActive: !f.isActive } : f)); showToast(faq.isActive ? 'Đã tắt FAQ' : 'Đã bật FAQ', 'info') }} icon={<VCT_Icons.Eye size={14} />}>{faq.isActive ? 'Tắt' : 'Bật'}</VCT_Button>
                                            <VCT_Button size="sm" variant="ghost" onClick={(e: React.MouseEvent) => { e.stopPropagation(); setFaqs(prev => prev.filter(f => f.id !== faq.id)); showToast('Đã xóa FAQ', 'info') }} icon={<VCT_Icons.Trash size={14} />}>Xóa</VCT_Button>
                                            <span className="text-[10px] text-(--vct-text-tertiary) ml-auto">ID: {faq.id}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* ═══════════════════════════════════════
                TAB: CATEGORIES
               ═══════════════════════════════════════ */}
            {tab === 'categories' && (
                <>
                    {/* Category Toolbar */}
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-sm font-bold text-(--vct-text-primary) flex-1">{categories.length} danh mục dịch vụ</span>
                        <VCT_Button variant="primary" onClick={() => { setEditingCat(null); setShowCatModal(true) }} icon={<VCT_Icons.Plus size={14} />}>Thêm danh mục</VCT_Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {categories.map(cat => {
                        const IconComponent = (VCT_Icons as Record<string, React.ComponentType<{ size?: number }>>)[cat.icon] ?? VCT_Icons.Layers
                        return (
                            <div
                                key={cat.id}
                                className="rounded-2xl p-5 transition-all hover:scale-[1.02] hover:shadow-lg"
                                style={{
                                    background: `linear-gradient(135deg, ${cat.mauSac}12, transparent)`,
                                    border: `1px solid ${cat.mauSac}30`,
                                }}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className="w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg"
                                        style={{ backgroundColor: cat.mauSac, boxShadow: `0 8px 16px -4px ${cat.mauSac}40` }}
                                    >
                                        <IconComponent size={22} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-(--vct-text-primary) text-sm">{cat.ten}</div>
                                        <div className="text-xs text-(--vct-text-secondary) mt-1 line-clamp-2">{cat.moTa}</div>
                                        <div className="flex items-center gap-2 mt-3">
                                            <VCT_Badge type="info" text={`${cat.soTicket} tickets`} />
                                            {cat.isActive && <span className="w-2 h-2 rounded-full bg-[#10b981]" />}
                                        </div>
                                        <div className="flex items-center gap-1 mt-2">
                                            <VCT_Button size="sm" variant="ghost" onClick={() => { setEditingCat(cat); setShowCatModal(true) }} icon={<VCT_Icons.Edit size={12} />}>Sửa</VCT_Button>
                                            <VCT_Button size="sm" variant="ghost" onClick={() => { setCategories(prev => prev.filter(c => c.id !== cat.id)); showToast('Đã xóa danh mục', 'info') }} icon={<VCT_Icons.Trash size={12} />}>Xóa</VCT_Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    </div>
                </>
            )}

            {/* ═══════════════════════════════════════
                TAB: ANALYTICS
               ═══════════════════════════════════════ */}
            {tab === 'analytics' && (
                <div className="space-y-6 mb-6">
                    {/* Row 1: Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Bar chart */}
                        <div className="bg-(--vct-bg-elevated) border border-(--vct-border-strong) rounded-2xl p-5">
                            <div className="text-sm font-bold text-(--vct-text-primary) mb-4 flex items-center gap-2">
                                <VCT_Icons.Activity size={16} className="text-[#0ea5e9]" /> Tickets theo ngày (7 ngày)
                            </div>
                            <div className="flex items-end gap-2 h-[160px]">
                                {[3, 5, 2, 7, 4, 6, 1].map((v, i) => {
                                    const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                            <span className="text-[10px] font-bold text-(--vct-text-primary)">{v}</span>
                                            <div className="w-full rounded-t-md transition-all" style={{ height: `${(v / 7) * 120}px`, background: 'linear-gradient(to top, #0ea5e9, #8b5cf6)' }} />
                                            <span className="text-[10px] text-(--vct-text-tertiary)">{days[i]}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Donut chart */}
                        <div className="bg-(--vct-bg-elevated) border border-(--vct-border-strong) rounded-2xl p-5">
                            <div className="text-sm font-bold text-(--vct-text-primary) mb-4 flex items-center gap-2">
                                <VCT_Icons.Target size={16} className="text-[#8b5cf6]" /> Phân bổ theo loại
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="relative w-[120px] h-[120px] shrink-0">
                                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                        {(() => {
                                            const types = Object.entries(TYPE_BADGE)
                                            const total = tickets.length || 1
                                            const colors = ['#0ea5e9', '#ef4444', '#10b981', '#f59e0b', '#6b7280']
                                            let offset = 0
                                            return types.map(([key], i) => {
                                                const count = tickets.filter(t => t.loai === key).length
                                                const pct = (count / total) * 100
                                                const el = <circle key={key} r="15.9" cx="18" cy="18" fill="none" stroke={colors[i]} strokeWidth="3.8" strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={-offset} />
                                                offset += pct
                                                return el
                                            })
                                        })()}
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-(--vct-text-primary)">{tickets.length}</div>
                                            <div className="text-[9px] text-(--vct-text-tertiary)">tickets</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2 flex-1">
                                    {Object.entries(TYPE_BADGE).map(([key, badge], i) => {
                                        const count = tickets.filter(t => t.loai === key).length
                                        const colors = ['#0ea5e9', '#ef4444', '#10b981', '#f59e0b', '#6b7280']
                                        return (
                                            <div key={key} className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: colors[i] }} />
                                                <span className="text-xs text-(--vct-text-secondary) flex-1">{badge.label}</span>
                                                <span className="text-xs font-bold text-(--vct-text-primary)">{count}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: SLA + Top Agents */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* SLA Compliance */}
                        <div className="bg-(--vct-bg-elevated) border border-(--vct-border-strong) rounded-2xl p-5">
                            <div className="text-sm font-bold text-(--vct-text-primary) mb-4 flex items-center gap-2">
                                <VCT_Icons.Shield size={16} className="text-[#10b981]" /> SLA Compliance
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: 'Phản hồi lần đầu < 2h', value: 85, color: '#10b981' },
                                    { label: 'Giải quyết < 24h', value: 72, color: '#f59e0b' },
                                    { label: 'CSAT >= 4/5', value: 91, color: '#0ea5e9' },
                                ].map(item => (
                                    <div key={item.label}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-(--vct-text-secondary)">{item.label}</span>
                                            <span className="text-xs font-bold" style={{ color: item.color }}>{item.value}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-(--vct-bg-base) rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Agents */}
                        <div className="bg-(--vct-bg-elevated) border border-(--vct-border-strong) rounded-2xl p-5">
                            <div className="text-sm font-bold text-(--vct-text-primary) mb-4 flex items-center gap-2">
                                <VCT_Icons.Trophy size={16} className="text-[#f59e0b]" /> Top Agents
                            </div>
                            <div className="space-y-3">
                                {[
                                    { name: 'Admin VCT', resolved: 42, avgTime: '1.8h', rating: 4.7 },
                                    { name: 'DevTeam', resolved: 28, avgTime: '3.2h', rating: 4.5 },
                                    { name: 'Support Team', resolved: 15, avgTime: '2.1h', rating: 4.8 },
                                ].map((agent, i) => (
                                    <div key={agent.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${i === 0 ? 'bg-[#f59e0b]' : i === 1 ? 'bg-[#94a3b8]' : 'bg-[#cd7f32]'}`}>{i + 1}</div>
                                        <VCT_AvatarLetter name={agent.name} size={28} />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold text-(--vct-text-primary)">{agent.name}</div>
                                            <div className="text-[10px] text-(--vct-text-tertiary)">{agent.resolved} đã giải quyết · TB {agent.avgTime}</div>
                                        </div>
                                        <div className="text-xs font-bold text-[#f59e0b]">⭐ {agent.rating}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Priority breakdown */}
                    <div className="bg-(--vct-bg-elevated) border border-(--vct-border-strong) rounded-2xl p-5">
                        <div className="text-sm font-bold text-(--vct-text-primary) mb-4 flex items-center gap-2">
                            <VCT_Icons.AlertTriangle size={16} className="text-[#ef4444]" /> Phân bổ theo mức ưu tiên
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {Object.entries(PRIORITY_BADGE).map(([key, badge]) => {
                                const count = tickets.filter(t => t.mucUuTien === key).length
                                const pct = tickets.length > 0 ? Math.round((count / tickets.length) * 100) : 0
                                return (
                                    <div key={key} className="text-center p-3 bg-(--vct-bg-base) rounded-xl border border-(--vct-border-subtle)">
                                        <div className="text-2xl font-bold text-(--vct-text-primary)">{count}</div>
                                        <VCT_Badge type={badge.type} text={badge.label} />
                                        <div className="text-[10px] text-(--vct-text-tertiary) mt-1">{pct}%</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
            <VCT_Drawer isOpen={!!selected} onClose={() => { setSelected(null); setReplyText(''); setShowCanned(false) }} title={selected?.tieuDe ?? ''} width={620}>
                {selected && (
                    <VCT_Stack gap={16}>
                        {/* Header */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-mono text-sm font-bold text-(--vct-accent-cyan)">{selected.maTicket}</span>
                            <VCT_Badge type={STATUS_BADGE[selected.trangThai]?.type ?? 'neutral'} text={STATUS_BADGE[selected.trangThai]?.label} />
                            <VCT_Badge type={PRIORITY_BADGE[selected.mucUuTien]?.type ?? 'neutral'} text={PRIORITY_BADGE[selected.mucUuTien]?.label} />
                            <VCT_Badge type={TYPE_BADGE[selected.loai]?.type ?? 'neutral'} text={TYPE_BADGE[selected.loai]?.label} />
                        </div>

                        {/* Info compact */}
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { label: 'Người tạo', value: selected.nguoiTaoTen },
                                { label: 'Người xử lý', value: selected.nguoiXuLyTen ?? '—' },
                                { label: 'Ngày tạo', value: selected.createdAt },
                            ].map(item => (
                                <div key={item.label} className="p-2 bg-(--vct-bg-base) rounded-lg border border-(--vct-border-subtle)">
                                    <div className="text-[9px] uppercase tracking-wider text-(--vct-text-tertiary) font-bold">{item.label}</div>
                                    <div className="font-bold text-xs text-(--vct-text-primary) mt-0.5">{item.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* ── Drawer Tabs ── */}
                        <div className="flex items-center gap-1 border-b border-(--vct-border-subtle) pb-1">
                            {([
                                { key: 'conversation', label: `💬 Hội thoại (${ticketReplies.length})` },
                                { key: 'notes', label: `📝 Ghi chú (${ticketNotes.length})` },
                                { key: 'timeline', label: `📋 Timeline (${ticketActivities.length})` },
                            ] as const).map(t => (
                                <button key={t.key} type="button" className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${drawerTab === t.key ? 'bg-(--vct-accent-cyan) text-white' : 'text-(--vct-text-tertiary) hover:text-(--vct-text-primary) hover:bg-white/5'}`} onClick={() => setDrawerTab(t.key)}>{t.label}</button>
                            ))}
                        </div>

                        {/* ── Tab: Conversation ── */}
                        {drawerTab === 'conversation' && (
                        <div className="border-t border-(--vct-border-subtle) pt-3">
                            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                                {ticketReplies.length === 0 ? (
                                    <div className="text-center py-6 text-sm text-(--vct-text-tertiary)">Chưa có phản hồi nào</div>
                                ) : ticketReplies.map(r => (
                                    <div key={r.id} className={`flex ${r.senderRole === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-2xl p-3 ${
                                            r.senderRole === 'admin'
                                                ? 'bg-(--vct-accent-cyan)/10 border border-(--vct-accent-cyan)/20 rounded-br-md'
                                                : 'bg-(--vct-bg-base) border border-(--vct-border-subtle) rounded-bl-md'
                                        }`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <VCT_AvatarLetter name={r.sender} size={20} />
                                                <span className="text-[11px] font-bold text-(--vct-text-primary)">{r.sender}</span>
                                                <span className="text-[10px] text-(--vct-text-tertiary) ml-auto">{r.createdAt.split(' ')[1] ?? r.createdAt}</span>
                                            </div>
                                            <div className="text-sm text-(--vct-text-secondary) leading-relaxed">{r.content}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        )}

                        {/* ── Tab: Internal Notes ── */}
                        {drawerTab === 'notes' && (
                        <div className="space-y-3">
                            {ticketNotes.length === 0 ? (
                                <div className="text-center py-6 text-sm text-(--vct-text-tertiary)">Chưa có ghi chú nội bộ</div>
                            ) : ticketNotes.map(n => (
                                <div key={n.id} className="bg-[#f59e0b10] border border-[#f59e0b25] rounded-xl p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <VCT_AvatarLetter name={n.author} size={18} />
                                        <span className="text-[11px] font-bold text-(--vct-text-primary)">{n.author}</span>
                                        <VCT_Badge type="warning" text="Nội bộ" />
                                        <span className="text-[10px] text-(--vct-text-tertiary) ml-auto">{n.createdAt}</span>
                                    </div>
                                    <div className="text-sm text-(--vct-text-secondary) leading-relaxed">{n.content}</div>
                                </div>
                            ))}
                            {/* Add note form */}
                            <div className="border-t border-(--vct-border-subtle) pt-3">
                                <VCT_Textarea value={noteText} onChange={setNoteText} placeholder="Thêm ghi chú nội bộ..." rows={2} />
                                <div className="flex justify-end mt-2">
                                    <VCT_Button size="sm" variant="primary" onClick={() => {
                                        if (!noteText.trim() || !selected) return
                                        setNotes(prev => [...prev, { id: `N-${Date.now()}`, ticketId: selected.id, author: 'Admin VCT', content: noteText.trim(), createdAt: new Date().toLocaleString('vi-VN') }])
                                        setNoteText('')
                                        showToast('Đã thêm ghi chú')
                                    }} icon={<VCT_Icons.Plus size={14} />}>Thêm ghi chú</VCT_Button>
                                </div>
                            </div>
                        </div>
                        )}

                        {/* ── Tab: Activity Timeline ── */}
                        {drawerTab === 'timeline' && (
                        <div className="relative pl-6">
                            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-(--vct-border-subtle)" />
                            {ticketActivities.length === 0 ? (
                                <div className="text-center py-6 text-sm text-(--vct-text-tertiary)">Chưa có hoạt động</div>
                            ) : ticketActivities.map(a => {
                                const icons: Record<string, string> = { created: '🆕', assigned: '👤', replied: '💬', note: '📝', resolved: '✅', escalated: '🔺', closed: '🔒' }
                                return (
                                    <div key={a.id} className="relative pb-4 last:pb-0">
                                        <div className="absolute -left-4 top-1 w-4 h-4 rounded-full bg-(--vct-bg-elevated) border-2 border-(--vct-border-strong) flex items-center justify-center text-[8px]">{icons[a.action] ?? '•'}</div>
                                        <div className="ml-2">
                                            <div className="text-xs font-bold text-(--vct-text-primary)">{a.actor} <span className="font-normal text-(--vct-text-tertiary)">· {a.action}</span></div>
                                            {a.detail && <div className="text-[11px] text-(--vct-text-secondary) mt-0.5">{a.detail}</div>}
                                            <div className="text-[10px] text-(--vct-text-tertiary) mt-0.5">{a.createdAt}</div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        )}

                        {/* ── Reply Form ── */}
                        {selected.trangThai !== 'closed' && (
                            <div className="border-t border-(--vct-border-subtle) pt-3">
                                {/* Canned responses */}
                                {showCanned && (
                                    <div className="mb-3 bg-(--vct-bg-base) border border-(--vct-border-subtle) rounded-xl p-3 space-y-2">
                                        <div className="text-[10px] font-bold text-(--vct-text-tertiary) uppercase tracking-wider mb-1">Mẫu phản hồi nhanh</div>
                                        {CANNED_RESPONSES.map(cr => (
                                            <button key={cr.id} type="button" className="w-full text-left p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer" onClick={() => { setReplyText(cr.content); setShowCanned(false) }}>
                                                <div className="text-xs font-bold text-(--vct-text-primary)">{cr.label}</div>
                                                <div className="text-[11px] text-(--vct-text-tertiary) line-clamp-1 mt-0.5">{cr.content}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <VCT_Textarea value={replyText} onChange={setReplyText} placeholder="Nhập phản hồi..." rows={3} />
                                <VCT_Stack direction="row" gap={8} className="mt-2" justify="between">
                                    <VCT_Button size="sm" variant="ghost" onClick={() => setShowCanned(!showCanned)} icon={<VCT_Icons.Layers size={14} />}>Mẫu</VCT_Button>
                                    <VCT_Button size="sm" variant="primary" onClick={() => {
                                        if (!replyText.trim()) return
                                        const newReply: TicketReply = { id: `R-${Date.now()}`, ticketId: selected.id, sender: 'Admin VCT', senderRole: 'admin', content: replyText.trim(), createdAt: new Date().toLocaleString('vi-VN') }
                                        setReplies(prev => [...prev, newReply])
                                        setReplyText('')
                                        showToast('Đã gửi phản hồi')
                                    }} icon={<VCT_Icons.ArrowRight size={14} />}>Gửi</VCT_Button>
                                </VCT_Stack>
                            </div>
                        )}

                        {/* CSAT for resolved tickets */}
                        {(selected.trangThai === 'resolved' || selected.trangThai === 'closed') && (
                            <div className="bg-[#10b98115] border border-[#10b98130] rounded-xl p-4">
                                <div className="text-xs font-bold text-(--vct-text-tertiary) uppercase tracking-wider mb-2">Đánh giá dịch vụ</div>
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">{'⭐'.repeat(selected.satisfactionRating ?? 4)}{'☆'.repeat(5 - (selected.satisfactionRating ?? 4))}</div>
                                    <span className="text-sm font-bold text-(--vct-text-primary)">{selected.satisfactionRating ?? 4}/5</span>
                                </div>
                                {selected.satisfactionNote && <div className="text-xs text-(--vct-text-secondary) mt-1 italic">"{selected.satisfactionNote}"</div>}
                            </div>
                        )}

                        {/* Actions */}
                        <VCT_Stack direction="row" gap={8} className="pt-2 border-t border-(--vct-border-subtle)">
                            {selected.trangThai === 'open' && <VCT_Button variant="primary" onClick={() => { handleAssign(selected.id); setSelected(null) }} icon={<VCT_Icons.User size={14} />}>Nhận xử lý</VCT_Button>}
                            {selected.trangThai === 'in_progress' && <VCT_Button variant="primary" onClick={() => { handleResolve(selected.id); setSelected(null) }} icon={<VCT_Icons.CheckCircle size={14} />}>Giải quyết</VCT_Button>}
                            {selected.trangThai === 'resolved' && <VCT_Button variant="primary" onClick={() => { handleClose(selected.id); setSelected(null) }} icon={<VCT_Icons.Close size={14} />}>Đóng</VCT_Button>}
                            {(selected.trangThai === 'closed' || selected.trangThai === 'resolved') && <VCT_Button variant="ghost" onClick={() => { handleReopen(selected.id); setSelected(null) }} icon={<VCT_Icons.Refresh size={14} />}>Mở lại</VCT_Button>}
                        </VCT_Stack>
                    </VCT_Stack>
                ) || null}
            </VCT_Drawer>

            <VCT_ConfirmDialog
                isOpen={!!showResolveConfirm}
                onClose={() => setShowResolveConfirm(null)}
                onConfirm={() => showResolveConfirm && handleResolve(showResolveConfirm)}
                title="Giải quyết ticket?"
                message="Xác nhận đánh dấu ticket này là đã giải quyết? Khách hàng sẽ nhận thông báo."
                confirmLabel="Giải quyết"
                confirmVariant="primary"
            />

            {/* ── Create Ticket Modal ── */}
            <VCT_Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); setNewTitle(''); setNewContent(''); setNewType('general'); setNewPriority('medium') }} title={t('support.action.create')} width={560}>
                <VCT_Stack gap={16}>
                    <VCT_Field label="Tiêu đề">
                        <VCT_Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Mô tả ngắn gọn vấn đề..." />
                    </VCT_Field>
                    <VCT_Field label="Nội dung chi tiết">
                        <VCT_Textarea value={newContent} onChange={setNewContent} placeholder="Mô tả chi tiết vấn đề cần hỗ trợ..." rows={4} />
                    </VCT_Field>
                    <div className="grid grid-cols-2 gap-3">
                        <VCT_Field label="Loại">
                            <VCT_Select
                                value={newType}
                                onChange={(v) => setNewType(v as SupportTicket['loai'])}
                                options={Object.entries(TYPE_BADGE).map(([k, v]) => ({ value: k, label: v.label }))}
                            />
                        </VCT_Field>
                        <VCT_Field label="Mức ưu tiên">
                            <VCT_Select
                                value={newPriority}
                                onChange={(v) => setNewPriority(v as SupportTicket['mucUuTien'])}
                                options={Object.entries(PRIORITY_BADGE).map(([k, v]) => ({ value: k, label: v.label }))}
                            />
                        </VCT_Field>
                    </div>
                    <VCT_Stack direction="row" gap={8} justify="end" className="pt-2 border-t border-(--vct-border-subtle)">
                        <VCT_Button variant="ghost" onClick={() => { setShowCreateModal(false); setNewTitle(''); setNewContent(''); setNewType('general'); setNewPriority('medium') }}>{t('common.cancel')}</VCT_Button>
                        <VCT_Button variant="primary" onClick={handleCreateTicket} icon={<VCT_Icons.Plus size={14} />}>
                            {t('support.action.create')}
                        </VCT_Button>
                    </VCT_Stack>
                </VCT_Stack>
            </VCT_Modal>

            {/* ── FAQ Create/Edit Modal ── */}
            <VCT_Modal isOpen={showFaqModal} onClose={() => { setShowFaqModal(false); setEditingFaq(null) }} title={editingFaq ? 'Chỉnh sửa FAQ' : 'Thêm FAQ mới'} width={560}>
                <FaqForm
                    initial={editingFaq}
                    onSave={(data) => {
                        if (editingFaq) {
                            setFaqs(prev => prev.map(f => f.id === editingFaq.id ? { ...f, ...data } : f))
                            showToast('Đã cập nhật FAQ')
                        } else {
                            setFaqs(prev => [...prev, { ...data, id: `FAQ-${Date.now()}`, luotXem: 0, isActive: true }])
                            showToast('Đã thêm FAQ mới')
                        }
                        setShowFaqModal(false)
                        setEditingFaq(null)
                    }}
                    onCancel={() => { setShowFaqModal(false); setEditingFaq(null) }}
                />
            </VCT_Modal>

            {/* ── Category Create/Edit Modal ── */}
            <VCT_Modal isOpen={showCatModal} onClose={() => { setShowCatModal(false); setEditingCat(null) }} title={editingCat ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'} width={480}>
                {(() => {
                    const CatForm = () => {
                        const [ten, setTen] = useState(editingCat?.ten ?? '')
                        const [moTa, setMoTa] = useState(editingCat?.moTa ?? '')
                        const [mauSac, setMauSac] = useState(editingCat?.mauSac ?? '#8b5cf6')
                        return (
                            <VCT_Stack gap={16}>
                                <VCT_Field label="Tên danh mục"><VCT_Input value={ten} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTen(e.target.value)} placeholder="VD: Hỗ trợ tài khoản..." /></VCT_Field>
                                <VCT_Field label="Mô tả"><VCT_Textarea value={moTa} onChange={setMoTa} placeholder="Mô tả danh mục..." rows={3} /></VCT_Field>
                                <VCT_Field label="Màu sắc"><VCT_Input value={mauSac} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMauSac(e.target.value)} placeholder="#hex color" /></VCT_Field>
                                <VCT_Stack direction="row" gap={8} justify="end" className="pt-2 border-t border-(--vct-border-subtle)">
                                    <VCT_Button variant="ghost" onClick={() => { setShowCatModal(false); setEditingCat(null) }}>Hủy</VCT_Button>
                                    <VCT_Button variant="primary" onClick={() => {
                                        if (editingCat) {
                                            setCategories(prev => prev.map(c => c.id === editingCat.id ? { ...c, ten, moTa, mauSac } : c))
                                            showToast('Đã cập nhật danh mục')
                                        } else {
                                            setCategories(prev => [...prev, { id: `CAT-${Date.now()}`, ten, moTa, mauSac, icon: 'Layers', soTicket: 0, isActive: true }])
                                            showToast('Đã thêm danh mục mới')
                                        }
                                        setShowCatModal(false); setEditingCat(null)
                                    }} icon={<VCT_Icons.CheckCircle size={14} />}>{editingCat ? 'Cập nhật' : 'Thêm'}</VCT_Button>
                                </VCT_Stack>
                            </VCT_Stack>
                        )
                    }
                    return <CatForm />
                })()}
            </VCT_Modal>
        </VCT_PageContainer>
    )
}
