import type {
  BTCStatsAPI, RegistrationAPI, ScheduleSlotAPI, WeighInAPI,
  DrawAPI, RefereeAssignmentAPI, MatchResultAPI, TeamStandingAPI,
  ProtestAPI, MeetingAPI,
} from './btc-api'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — BTC Mock Data
// Realistic tournament data for offline/demo mode
// ═══════════════════════════════════════════════════════════════

export const MOCK_BTC_STATS: BTCStatsAPI = {
  total_teams: 24,
  total_athletes: 312,
  total_categories: 18,
  total_arenas: 4,
  pending_registrations: 5,
  approved_registrations: 19,
  matches_today: 32,
  matches_total: 186,
  protests_open: 2,
  total_income: 285000000,
  total_expense: 198000000,
  balance: 87000000,
}

export const MOCK_REGISTRATIONS: RegistrationAPI[] = [
  { id: 'REG-001', tournament_id: 'T-001', team_name: 'CLB Bình Định', club_name: 'Bình Định VCT', coach_name: 'Trần Văn Hùng', status: 'pending', athlete_count: 18, category_count: 6, submitted_at: '2026-03-10' },
  { id: 'REG-002', tournament_id: 'T-001', team_name: 'Tân Khánh Bà Trà', club_name: 'TKBT Sài Gòn', coach_name: 'Nguyễn Minh Tuấn', status: 'approved', athlete_count: 22, category_count: 8, submitted_at: '2026-03-08', reviewed_at: '2026-03-09' },
  { id: 'REG-003', tournament_id: 'T-001', team_name: 'Vĩnh Xuân Nội Gia', club_name: 'VXNG TP.HCM', coach_name: 'Lê Thành Nam', status: 'approved', athlete_count: 15, category_count: 5, submitted_at: '2026-03-07', reviewed_at: '2026-03-08' },
  { id: 'REG-004', tournament_id: 'T-001', team_name: 'CLB Thanh Long', club_name: 'Thanh Long Hà Nội', coach_name: 'Phạm Đức Anh', status: 'pending', athlete_count: 12, category_count: 4, submitted_at: '2026-03-11' },
  { id: 'REG-005', tournament_id: 'T-001', team_name: 'Vovinam Quận 1', club_name: 'Vovinam Q1', coach_name: 'Hoàng Văn Bảo', status: 'rejected', athlete_count: 8, category_count: 3, submitted_at: '2026-03-06', reviewed_at: '2026-03-07', reject_reason: 'Thiếu giấy phép đoàn' },
  { id: 'REG-006', tournament_id: 'T-001', team_name: 'CLB Đồng Nai', club_name: 'Đồng Nai VCT', coach_name: 'Trịnh Quang Vinh', status: 'pending', athlete_count: 20, category_count: 7, submitted_at: '2026-03-12' },
]

export const MOCK_SCHEDULE: ScheduleSlotAPI[] = [
  { id: 'SS-001', tournament_id: 'T-001', day: 1, start_time: '08:00', end_time: '08:15', arena_name: 'Sân A', arena_id: 'A1', category_name: 'Đối kháng Nam 56kg', category_id: 'C-001', match_type: 'doi_khang', status: 'completed', athlete_a: 'Nguyễn Văn A', athlete_b: 'Trần Văn B', team_a: 'Bình Định', team_b: 'TKBT' },
  { id: 'SS-002', tournament_id: 'T-001', day: 1, start_time: '08:20', end_time: '08:35', arena_name: 'Sân A', arena_id: 'A1', category_name: 'Đối kháng Nam 60kg', category_id: 'C-002', match_type: 'doi_khang', status: 'in_progress', athlete_a: 'Lê Văn C', athlete_b: 'Phạm Văn D', team_a: 'VXNG', team_b: 'Thanh Long' },
  { id: 'SS-003', tournament_id: 'T-001', day: 1, start_time: '08:00', end_time: '08:10', arena_name: 'Sân B', arena_id: 'A2', category_name: 'Quyền thuật Nữ', category_id: 'C-010', match_type: 'quyen', status: 'scheduled' },
  { id: 'SS-004', tournament_id: 'T-001', day: 1, start_time: '08:40', end_time: '08:55', arena_name: 'Sân A', arena_id: 'A1', category_name: 'Đối kháng Nam 65kg', category_id: 'C-003', match_type: 'doi_khang', status: 'scheduled', athlete_a: 'Hoàng E', athlete_b: 'Võ F', team_a: 'Đồng Nai', team_b: 'Bình Định' },
  { id: 'SS-005', tournament_id: 'T-001', day: 2, start_time: '08:00', end_time: '08:15', arena_name: 'Sân A', arena_id: 'A1', category_name: 'Bán kết Nam 56kg', category_id: 'C-001', match_type: 'doi_khang', status: 'scheduled' },
  { id: 'SS-006', tournament_id: 'T-001', day: 2, start_time: '09:00', end_time: '09:10', arena_name: 'Sân B', arena_id: 'A2', category_name: 'Chung kết Quyền Nữ', category_id: 'C-010', match_type: 'quyen', status: 'scheduled' },
]

export const MOCK_WEIGH_INS: WeighInAPI[] = [
  { id: 'WI-001', athlete_name: 'Nguyễn Văn A', athlete_id: 'ATH-001', team_name: 'Bình Định', category: '56kg', weight: 55.8, result: 'pass', weighed_at: '2026-03-13 07:30', weighed_by: 'Đặng Trọng Tài' },
  { id: 'WI-002', athlete_name: 'Trần Văn B', athlete_id: 'ATH-002', team_name: 'TKBT', category: '56kg', weight: 56.2, result: 'fail', weighed_at: '2026-03-13 07:35', weighed_by: 'Đặng Trọng Tài' },
  { id: 'WI-003', athlete_name: 'Lê Văn C', athlete_id: 'ATH-003', team_name: 'VXNG', category: '60kg', weight: 59.5, result: 'pass', weighed_at: '2026-03-13 07:40', weighed_by: 'Lê Giám Sát' },
  { id: 'WI-004', athlete_name: 'Phạm Văn D', athlete_id: 'ATH-004', team_name: 'Thanh Long', category: '60kg', weight: 60.0, result: 'pass', weighed_at: '2026-03-13 07:42', weighed_by: 'Lê Giám Sát' },
]

export const MOCK_DRAWS: DrawAPI[] = [
  { id: 'DR-001', category_name: 'Đối kháng Nam 56kg', category_id: 'C-001', bracket_type: 'single_elimination', total_athletes: 16, seed_count: 4, status: 'confirmed', generated_at: '2026-03-12' },
  { id: 'DR-002', category_name: 'Đối kháng Nam 60kg', category_id: 'C-002', bracket_type: 'single_elimination', total_athletes: 12, seed_count: 4, status: 'confirmed', generated_at: '2026-03-12' },
  { id: 'DR-003', category_name: 'Quyền thuật Nữ', category_id: 'C-010', bracket_type: 'round_robin', total_athletes: 8, seed_count: 0, status: 'draft', generated_at: '2026-03-12' },
]

export const MOCK_REFEREE_ASSIGNMENTS: RefereeAssignmentAPI[] = [
  { id: 'RA-001', referee_name: 'Nguyễn Trọng Tài', referee_id: 'R-001', arena_name: 'Sân A', arena_id: 'A1', role: 'chu_nhiem', day: 1, session: 'morning' },
  { id: 'RA-002', referee_name: 'Trần Điểm A', referee_id: 'R-002', arena_name: 'Sân A', arena_id: 'A1', role: 'diem_a', day: 1, session: 'morning' },
  { id: 'RA-003', referee_name: 'Lê Điểm B', referee_id: 'R-003', arena_name: 'Sân A', arena_id: 'A1', role: 'diem_b', day: 1, session: 'morning' },
  { id: 'RA-004', referee_name: 'Phạm Biên Bản', referee_id: 'R-004', arena_name: 'Sân A', arena_id: 'A1', role: 'bien_ban', day: 1, session: 'morning' },
  { id: 'RA-005', referee_name: 'Hoàng Chủ Nhiệm', referee_id: 'R-005', arena_name: 'Sân B', arena_id: 'A2', role: 'chu_nhiem', day: 1, session: 'morning' },
]

export const MOCK_RESULTS: MatchResultAPI[] = [
  { id: 'MR-001', tournament_id: 'T-001', category_name: 'Đối kháng Nam 56kg', match_number: 1, athlete_a: 'Nguyễn Văn A', athlete_b: 'Trần Văn B', team_a: 'Bình Định', team_b: 'TKBT', score_a: 7, score_b: 3, winner: 'Nguyễn Văn A', method: 'points', status: 'finalized', recorded_at: '2026-03-13 08:15' },
  { id: 'MR-002', tournament_id: 'T-001', category_name: 'Đối kháng Nam 60kg', match_number: 1, athlete_a: 'Lê Văn C', athlete_b: 'Phạm Văn D', team_a: 'VXNG', team_b: 'Thanh Long', score_a: 5, score_b: 5, winner: '', method: 'points', status: 'recorded', recorded_at: '2026-03-13 08:35' },
]

export const MOCK_STANDINGS: TeamStandingAPI[] = [
  { id: 'TS-001', tournament_id: 'T-001', team_name: 'CLB Bình Định', gold: 5, silver: 3, bronze: 4, total_medals: 12, rank: 1 },
  { id: 'TS-002', tournament_id: 'T-001', team_name: 'Tân Khánh Bà Trà', gold: 4, silver: 4, bronze: 2, total_medals: 10, rank: 2 },
  { id: 'TS-003', tournament_id: 'T-001', team_name: 'Vĩnh Xuân Nội Gia', gold: 3, silver: 2, bronze: 5, total_medals: 10, rank: 3 },
  { id: 'TS-004', tournament_id: 'T-001', team_name: 'CLB Thanh Long', gold: 2, silver: 3, bronze: 3, total_medals: 8, rank: 4 },
  { id: 'TS-005', tournament_id: 'T-001', team_name: 'CLB Đồng Nai', gold: 1, silver: 2, bronze: 4, total_medals: 7, rank: 5 },
]

export const MOCK_PROTESTS: ProtestAPI[] = [
  { id: 'PR-001', giai_id: 'T-001', team_name: 'TKBT', match_id: 'MR-001', category: 'Đối kháng Nam 56kg', noi_dung: 'Trọng tài không tính điểm đá vào đầu hợp lệ', trang_thai: 'pending', created_at: '2026-03-13 08:20' },
  { id: 'PR-002', giai_id: 'T-001', team_name: 'Thanh Long', match_id: 'MR-002', category: 'Đối kháng Nam 60kg', noi_dung: 'Yêu cầu xem lại điểm hiệp 2', trang_thai: 'reviewing', nguoi_xl: 'Ban kỷ luật', created_at: '2026-03-13 08:40' },
]

export const MOCK_MEETINGS: MeetingAPI[] = [
  { id: 'MT-001', giai_id: 'T-001', title: 'Họp kỹ thuật trước giải', date: '2026-03-12', time: '14:00', location: 'Phòng họp NTĐ Phú Thọ', attendees: 35, notes: 'Phổ biến điều lệ, quy chế thi đấu', status: 'completed' },
  { id: 'MT-002', giai_id: 'T-001', title: 'Họp giữa giải', date: '2026-03-13', time: '19:00', location: 'Phòng họp NTĐ Phú Thọ', attendees: 28, notes: 'Rà soát kết quả ngày 1, bổ sung lịch thi', status: 'scheduled' },
]

// ── Display Configs ──────────────────────────────────────────

export const REG_STATUS_CFG: Record<string, { label: string; color: string; bg: string; fg: string }> = {
  pending: { label: 'Chờ duyệt', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', fg: '#f59e0b' },
  approved: { label: 'Đã duyệt', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', fg: '#22c55e' },
  rejected: { label: 'Từ chối', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', fg: '#ef4444' },
}

export const SLOT_STATUS_CFG: Record<string, { label: string; color: string }> = {
  scheduled: { label: 'Sắp thi', color: '#60a5fa' },
  in_progress: { label: 'Đang thi', color: '#f59e0b' },
  completed: { label: 'Hoàn thành', color: '#22c55e' },
  cancelled: { label: 'Hủy', color: '#ef4444' },
}

export const WEIGHIN_RESULT_CFG: Record<string, { label: string; color: string }> = {
  pass: { label: 'Đạt', color: '#22c55e' },
  fail: { label: 'Không đạt', color: '#ef4444' },
  pending: { label: 'Chờ', color: '#f59e0b' },
}

export const PROTEST_STATUS_CFG: Record<string, { label: string; color: string; bg: string; fg: string }> = {
  pending: { label: 'Chờ xử lý', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', fg: '#f59e0b' },
  reviewing: { label: 'Đang xem', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', fg: '#60a5fa' },
  accepted: { label: 'Chấp nhận', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', fg: '#22c55e' },
  rejected: { label: 'Bác bỏ', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', fg: '#ef4444' },
}

export const REFEREE_ROLE_CFG: Record<string, string> = {
  chu_nhiem: 'Chủ nhiệm sân',
  diem_a: 'Giám định A',
  diem_b: 'Giám định B',
  diem_c: 'Giám định C',
  bien_ban: 'Biên bản',
}

export const MATCH_TYPE_CFG: Record<string, { label: string; color: string }> = {
  doi_khang: { label: 'Đối kháng', color: '#ef4444' },
  quyen: { label: 'Quyền', color: '#8b5cf6' },
  binh_khi: { label: 'Binh khí', color: '#f59e0b' },
}

export function formatVND(amount: number): string {
  if (Math.abs(amount) >= 1e9) return `${(amount / 1e9).toFixed(1)}tỷ`
  if (Math.abs(amount) >= 1e6) return `${(amount / 1e6).toFixed(1)}tr`
  if (Math.abs(amount) >= 1e3) return `${(amount / 1e3).toFixed(0)}k`
  return amount.toLocaleString('vi-VN')
}
