import type {
  ClubDashboardAPI,
  ClubMemberAPI,
  ClubClassAPI,
  ClubFinanceEntryAPI,
  ClubFinanceSummaryAPI,
  ClubAttendanceAPI,
  ClubAttendanceSummaryAPI,
} from './club-api'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Club Manager Mock Data
// Mirrors backend seed data for offline / demo mode
// ═══════════════════════════════════════════════════════════════

// ── Display Configs ──

export const MEMBER_STATUS_CFG: Record<string, { label: string; bg: string; fg: string; color: string }> = {
  active:    { label: 'Hoạt động', bg: '#dcfce7', fg: '#166534', color: '#22c55e' },
  pending:   { label: 'Chờ duyệt', bg: '#fef3c7', fg: '#92400e', color: '#f59e0b' },
  suspended: { label: 'Tạm ngưng', bg: '#fee2e2', fg: '#991b1b', color: '#ef4444' },
  left:      { label: 'Đã rời', bg: '#f1f5f9', fg: '#64748b', color: '#94a3b8' },
}

export const CLASS_STATUS_CFG: Record<string, { label: string; bg: string; fg: string; color: string }> = {
  active: { label: 'Hoạt động', bg: '#dcfce7', fg: '#166534', color: '#22c55e' },
  paused: { label: 'Tạm nghỉ', bg: '#fef3c7', fg: '#92400e', color: '#f59e0b' },
  closed: { label: 'Đã đóng', bg: '#fee2e2', fg: '#991b1b', color: '#ef4444' },
}

export const FINANCE_TYPE_CFG: Record<string, { label: string; color: string; icon: string }> = {
  income:  { label: 'Thu', color: '#22c55e', icon: 'trending' },
  expense: { label: 'Chi', color: '#ef4444', icon: 'trendingDown' },
}

export const ATTENDANCE_STATUS_CFG: Record<string, { label: string; color: string }> = {
  present: { label: 'Có mặt', color: '#22c55e' },
  late:    { label: 'Trễ', color: '#f59e0b' },
  absent:  { label: 'Vắng', color: '#ef4444' },
}

export const DAY_LABELS: Record<number, string> = {
  1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7', 7: 'CN',
}

// ── Mock Data ──

export const MOCK_MEMBERS: ClubMemberAPI[] = [
  { id: 'MEM-001', club_id: 'CLB-001', name: 'Nguyễn Văn Hùng', phone: '0901234567', belt_level: 'Hoàng đai nhất', status: 'active', join_date: '2023-06-15', role: 'Thành viên' },
  { id: 'MEM-002', club_id: 'CLB-001', name: 'Trần Thị Lan', phone: '0912345678', belt_level: 'Lam đai', status: 'active', join_date: '2024-01-10', role: 'Thành viên' },
  { id: 'MEM-003', club_id: 'CLB-001', name: 'Lê Minh Quân', phone: '0923456789', belt_level: 'Bạch đai', status: 'pending', join_date: '2026-03-01', role: 'Thành viên' },
  { id: 'MEM-004', club_id: 'CLB-001', name: 'Phạm Thu Hà', phone: '0934567890', belt_level: 'Hoàng đai nhị', status: 'active', join_date: '2022-09-20', role: 'HLV phụ' },
  { id: 'MEM-005', club_id: 'CLB-001', name: 'Võ Đức Anh', phone: '0945678901', belt_level: 'Bạch đai', status: 'suspended', join_date: '2025-06-01', role: 'Thành viên' },
]

export const MOCK_CLASSES: ClubClassAPI[] = [
  {
    id: 'CLS-001', club_id: 'CLB-001', name: 'Lớp Cơ Bản', coach_name: 'Trần Văn Minh',
    status: 'active', max_students: 25, current_students: 18,
    sessions: [{ day_of_week: 2, start_time: '17:30', end_time: '19:00' }, { day_of_week: 5, start_time: '17:30', end_time: '19:00' }],
    monthly_fee: 500000,
  },
  {
    id: 'CLS-002', club_id: 'CLB-001', name: 'Lớp Nâng Cao', coach_name: 'Nguyễn Thị Mai',
    status: 'active', max_students: 20, current_students: 15,
    sessions: [{ day_of_week: 3, start_time: '18:00', end_time: '19:30' }, { day_of_week: 6, start_time: '08:00', end_time: '10:00' }],
    monthly_fee: 700000,
  },
  {
    id: 'CLS-003', club_id: 'CLB-001', name: 'Lớp Thi Đấu', coach_name: 'Lê Đức Trung',
    status: 'active', max_students: 15, current_students: 12,
    sessions: [{ day_of_week: 2, start_time: '19:00', end_time: '21:00' }, { day_of_week: 4, start_time: '19:00', end_time: '21:00' }, { day_of_week: 7, start_time: '07:00', end_time: '09:00' }],
    monthly_fee: 900000,
  },
]

export const MOCK_FINANCE: ClubFinanceEntryAPI[] = [
  { id: 'FIN-001', club_id: 'CLB-001', type: 'income', category: 'Học phí', amount: 12500000, description: 'Thu học phí tháng 3/2026 – Lớp Cơ Bản', date: '2026-03-05', status: 'completed' },
  { id: 'FIN-002', club_id: 'CLB-001', type: 'income', category: 'Học phí', amount: 10500000, description: 'Thu học phí tháng 3/2026 – Lớp Nâng Cao', date: '2026-03-05', status: 'completed' },
  { id: 'FIN-003', club_id: 'CLB-001', type: 'expense', category: 'Thuê mặt bằng', amount: 8000000, description: 'Thuê phòng tập tháng 3/2026', date: '2026-03-01', status: 'completed' },
  { id: 'FIN-004', club_id: 'CLB-001', type: 'expense', category: 'Thiết bị', amount: 3200000, description: 'Mua 10 tấm đệm tập mới', date: '2026-03-10', status: 'completed' },
  { id: 'FIN-005', club_id: 'CLB-001', type: 'income', category: 'Tài trợ', amount: 5000000, description: 'Tài trợ từ UBND Phường', date: '2026-03-12', status: 'pending' },
]

export const MOCK_FINANCE_SUMMARY: ClubFinanceSummaryAPI = {
  total_income: 28000000,
  total_expense: 11200000,
  balance: 16800000,
  pending: 5000000,
}

export const MOCK_ATTENDANCE: ClubAttendanceAPI[] = [
  { id: 'ATT-001', club_id: 'CLB-001', class_id: 'CLS-001', class_name: 'Lớp Cơ Bản', member_id: 'MEM-001', member_name: 'Nguyễn Văn Hùng', date: '2026-03-14', status: 'present', recorded_by: 'HLV Minh' },
  { id: 'ATT-002', club_id: 'CLB-001', class_id: 'CLS-001', class_name: 'Lớp Cơ Bản', member_id: 'MEM-002', member_name: 'Trần Thị Lan', date: '2026-03-14', status: 'late', recorded_by: 'HLV Minh' },
  { id: 'ATT-003', club_id: 'CLB-001', class_id: 'CLS-001', class_name: 'Lớp Cơ Bản', member_id: 'MEM-004', member_name: 'Phạm Thu Hà', date: '2026-03-14', status: 'present', recorded_by: 'HLV Minh' },
  { id: 'ATT-004', club_id: 'CLB-001', class_id: 'CLS-002', class_name: 'Lớp Nâng Cao', member_id: 'MEM-001', member_name: 'Nguyễn Văn Hùng', date: '2026-03-13', status: 'present', recorded_by: 'HLV Mai' },
  { id: 'ATT-005', club_id: 'CLB-001', class_id: 'CLS-002', class_name: 'Lớp Nâng Cao', member_id: 'MEM-002', member_name: 'Trần Thị Lan', date: '2026-03-13', status: 'absent', recorded_by: 'HLV Mai' },
]

export const MOCK_ATTENDANCE_SUMMARY: ClubAttendanceSummaryAPI = {
  total_sessions: 24,
  total_records: 120,
  present_count: 96,
  late_count: 12,
  absent_count: 12,
  attendance_rate: 90,
}

export const MOCK_DASHBOARD: ClubDashboardAPI = {
  club_id: 'CLB-001',
  club_name: 'Võ đường Lạc Việt',
  club_type: 'Võ đường',
  total_members: 45,
  active_members: 38,
  pending_members: 3,
  total_classes: 3,
  active_classes: 3,
  total_income: 28000000,
  total_expense: 11200000,
  balance: 16800000,
  attendance_rate: 90,
  upcoming_exams: 2,
}

// ── Delegation Mock Data ──

export const MOCK_DELEGATION_STATS = {
  total_athletes: 12,
  active_matches: 3,
  gold_medals: 2,
  silver_medals: 1,
  bronze_medals: 4,
  team_rank: 5,
}

export const MOCK_DELEGATION_SCHEDULE = [
  { id: 'M-101', time: '08:30 AM', arena: 'Thảm 1', category: 'Nam 60kg', athleteName: 'Nguyễn Văn Hùng', opponentName: 'Lê Phúc (Đồng Nai)', status: 'completed', result: 'win', score: '5 - 3' },
  { id: 'M-102', time: '10:15 AM', arena: 'Thảm 2', category: 'Quyền thuật nữ', athleteName: 'Trần Thị Lan', opponentName: '', status: 'ongoing' },
  { id: 'M-103', time: '14:00 PM', arena: 'Thảm 1', category: 'Nam 65kg', athleteName: 'Phạm Văn Dũng', opponentName: 'Đào Duy (Bình Dương)', status: 'upcoming' },
]

export const MOCK_DELEGATION_RESULTS = [
  { id: 'R-001', athleteName: 'Nguyễn Văn Hùng', category: 'Nam 60kg Đối kháng', medal: 'gold', rank: 1 },
  { id: 'R-002', athleteName: 'Vũ Đức Toàn', category: 'Lão Hổ Thượng Sơn', medal: 'silver', rank: 2 },
  { id: 'R-003', athleteName: 'Lê Minh Quân', category: 'Tứ Linh Đao', medal: 'bronze', rank: 3 },
  { id: 'R-004', athleteName: 'Trần Thị Lan', category: 'Quyền thuật nữ', medal: 'none', rank: 5 },
]

/** Format VND currency */
export function formatVND(amount: number): string {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}tr`
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}k`
  return `${amount.toLocaleString('vi-VN')}đ`
}
