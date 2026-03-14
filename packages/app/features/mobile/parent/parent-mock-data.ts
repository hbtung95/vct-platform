import type { ChildLinkAPI, ConsentRecordAPI, AttendanceRecordAPI, ParentDashboardAPI, ChildResultAPI } from './parent-api'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Parent Mock Data (Fallback)
// Mirrors backend seed data for offline / demo mode
// ═══════════════════════════════════════════════════════════════

export const MOCK_CHILDREN: ChildLinkAPI[] = [
  {
    id: 'PL-001', parent_id: 'PARENT-001', parent_name: 'Nguyễn Thị Phụ Huynh',
    athlete_id: 'ATH-001', athlete_name: 'Nguyễn Văn An', club_name: 'CLB Thanh Long',
    belt_level: 'Hoàng đai', relation: 'mẹ', status: 'approved',
    requested_at: '2025-12-15T00:00:00Z', approved_at: '2026-01-14T00:00:00Z',
  },
  {
    id: 'PL-002', parent_id: 'PARENT-001', parent_name: 'Nguyễn Thị Phụ Huynh',
    athlete_id: 'ATH-002', athlete_name: 'Nguyễn Thị Bình', club_name: 'CLB Thanh Long',
    belt_level: 'Lam đai', relation: 'mẹ', status: 'approved',
    requested_at: '2025-12-20T00:00:00Z', approved_at: '2026-01-14T00:00:00Z',
  },
]

export const MOCK_CONSENTS: ConsentRecordAPI[] = [
  {
    id: 'CS-001', parent_id: 'PARENT-001', athlete_id: 'ATH-001', athlete_name: 'Nguyễn Văn An',
    type: 'tournament', title: 'Đồng ý tham gia Giải Vovinam Toàn Quốc 2026',
    description: 'Cho phép con em tham gia giải đấu Vovinam Toàn Quốc 2026 tại TP.HCM',
    status: 'active', signed_at: '2026-03-04T00:00:00Z', expires_at: '2027-03-04T00:00:00Z',
  },
  {
    id: 'CS-002', parent_id: 'PARENT-001', athlete_id: 'ATH-001', athlete_name: 'Nguyễn Văn An',
    type: 'medical', title: 'Đồng ý khám sức khỏe & sơ cứu y tế',
    description: 'Cho phép nhân viên y tế giải thực hiện sơ cứu và khám sức khỏe cho con em',
    status: 'active', signed_at: '2026-03-04T00:00:00Z', expires_at: '2027-03-04T00:00:00Z',
  },
  {
    id: 'CS-003', parent_id: 'PARENT-001', athlete_id: 'ATH-002', athlete_name: 'Nguyễn Thị Bình',
    type: 'belt_exam', title: 'Đồng ý thi lên đai Lam đai 2',
    description: 'Cho phép con em tham gia kỳ thi thăng đai Lam đai 2 tại CLB Thanh Long',
    status: 'active', signed_at: '2026-03-09T00:00:00Z', expires_at: '2027-03-09T00:00:00Z',
  },
  {
    id: 'CS-004', parent_id: 'PARENT-001', athlete_id: 'ATH-001', athlete_name: 'Nguyễn Văn An',
    type: 'photo_usage', title: 'Sử dụng hình ảnh thi đấu',
    description: 'Cho phép BTC sử dụng hình ảnh/video thi đấu của con em cho mục đích truyền thông',
    status: 'revoked', signed_at: '2026-02-14T00:00:00Z',
  },
]

export const MOCK_ATTENDANCE: Record<string, AttendanceRecordAPI[]> = {
  'ATH-001': [
    { date: '2026-03-10', session: 'Sáng 07:00–09:00', status: 'present', coach: 'HLV Trần Văn Minh' },
    { date: '2026-03-08', session: 'Chiều 16:00–18:00', status: 'present', coach: 'HLV Trần Văn Minh' },
    { date: '2026-03-06', session: 'Sáng 07:00–09:00', status: 'late', coach: 'HLV Lê Thị Hoa' },
    { date: '2026-03-04', session: 'Chiều 16:00–18:00', status: 'absent', coach: 'HLV Trần Văn Minh' },
    { date: '2026-03-02', session: 'Sáng 07:00–09:00', status: 'present', coach: 'HLV Lê Thị Hoa' },
    { date: '2026-02-28', session: 'Chiều 16:00–18:00', status: 'present', coach: 'HLV Trần Văn Minh' },
    { date: '2026-02-26', session: 'Sáng 07:00–09:00', status: 'present', coach: 'HLV Lê Thị Hoa' },
    { date: '2026-02-24', session: 'Chiều 16:00–18:00', status: 'present', coach: 'HLV Trần Văn Minh' },
  ],
  'ATH-002': [
    { date: '2026-03-10', session: 'Sáng 07:00–09:00', status: 'present', coach: 'HLV Lê Thị Hoa' },
    { date: '2026-03-08', session: 'Chiều 16:00–18:00', status: 'present', coach: 'HLV Lê Thị Hoa' },
    { date: '2026-03-06', session: 'Sáng 07:00–09:00', status: 'present', coach: 'HLV Lê Thị Hoa' },
    { date: '2026-03-04', session: 'Chiều 16:00–18:00', status: 'late', coach: 'HLV Lê Thị Hoa' },
    { date: '2026-03-02', session: 'Sáng 07:00–09:00', status: 'present', coach: 'HLV Lê Thị Hoa' },
  ],
}

export const MOCK_CHILD_RESULTS: Record<string, ChildResultAPI[]> = {
  'ATH-001': [
    { tournament: 'Giải Vovinam TP.HCM Mở rộng 2026', category: 'Đối kháng Nam 52kg', result: '🥇 Huy chương vàng', date: '2026-02-15' },
    { tournament: 'Giải Vovinam Học sinh 2025', category: 'Quyền Nam Thiếu niên', result: '🥈 Huy chương bạc', date: '2025-11-20' },
    { tournament: 'Giải CLB Thanh Long 2025', category: 'Đối kháng Nam 48kg', result: '🥉 Huy chương đồng', date: '2025-09-10' },
  ],
  'ATH-002': [
    { tournament: 'Giải Vovinam Học sinh 2025', category: 'Quyền Nữ Thiếu niên', result: '🥈 Huy chương bạc', date: '2025-11-20' },
  ],
}

export const MOCK_DASHBOARD: ParentDashboardAPI = {
  children_count: 2,
  pending_consents: 0,
  active_consents: 3,
  upcoming_events: 2,
  children: MOCK_CHILDREN,
  recent_results: [...MOCK_CHILD_RESULTS['ATH-001']!, ...MOCK_CHILD_RESULTS['ATH-002']!],
}

// ── Consent type display config ──

export const CONSENT_TYPE_CFG: Record<string, { label: string; color: string }> = {
  tournament: { label: 'Giải đấu', color: '#3b82f6' },
  belt_exam: { label: 'Thi đai', color: '#8b5cf6' },
  medical: { label: 'Y tế', color: '#22c55e' },
  photo_usage: { label: 'Hình ảnh', color: '#f59e0b' },
  training: { label: 'Tập luyện', color: '#06b6d4' },
}

export const CONSENT_STATUS_CFG: Record<string, { label: string; bg: string; fg: string }> = {
  active: { label: 'Hiệu lực', bg: '#dcfce7', fg: '#166534' },
  revoked: { label: 'Đã thu hồi', bg: '#fee2e2', fg: '#991b1b' },
  expired: { label: 'Hết hạn', bg: '#f1f5f9', fg: '#64748b' },
}

export const ATTENDANCE_STATUS_CFG: Record<string, { label: string; color: string }> = {
  present: { label: 'Có mặt', color: '#22c55e' },
  late: { label: 'Trễ', color: '#f59e0b' },
  absent: { label: 'Vắng', color: '#ef4444' },
}

export const LINK_STATUS_CFG: Record<string, { label: string; bg: string; fg: string }> = {
  approved: { label: 'Đã liên kết', bg: '#dcfce7', fg: '#166534' },
  pending: { label: 'Chờ duyệt', bg: '#fef3c7', fg: '#92400e' },
  rejected: { label: 'Từ chối', bg: '#fee2e2', fg: '#991b1b' },
}
