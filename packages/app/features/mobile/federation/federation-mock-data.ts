import type {
  FederationDashboardAPI,
  FederationClubAPI,
  FederationApprovalAPI,
  FederationTournamentAPI,
  FederationRefereeAPI,
  FederationFinanceAPI,
} from './federation-api'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Federation Mock Data
// Mirrors backend seed data for offline / demo mode
// ═══════════════════════════════════════════════════════════════

export const MOCK_FEDERATION_DASHBOARD: FederationDashboardAPI = {
  total_clubs: 42,
  total_athletes: 1250,
  total_referees: 85,
  active_tournaments: 2,
  pending_approvals: 7,
}

export const MOCK_FEDERATION_CLUBS: FederationClubAPI[] = [
  { id: 'C-001', name: 'Võ đường Lạc Việt (Q1)', address: '123 Lê Lợi, Quận 1, TP.HCM', founding_date: '2015-06-12', status: 'active', member_count: 85, coach_name: 'Trần Văn Lực', contact_phone: '0901234567' },
  { id: 'C-002', name: 'CLB Nguyễn Du (Q1)', address: '116 Nguyễn Du, Quận 1, TP.HCM', founding_date: '2018-09-05', status: 'active', member_count: 120, coach_name: 'Lê Tuấn Anh', contact_phone: '0912345678' },
  { id: 'C-003', name: 'Võ phái Sa Long Cương', address: '45 Phạm Văn Đồng, Thủ Đức', founding_date: '2012-03-22', status: 'active', member_count: 210, coach_name: 'Phạm Huỳnh', contact_phone: '0923456789' },
  { id: 'C-004', name: 'Võ đường Hắc Hổ', address: '88 Nguyễn Trãi, Quận 5, TP.HCM', founding_date: '2020-01-10', status: 'active', member_count: 65, coach_name: 'Lương Sơn', contact_phone: '0934567890' },
  { id: 'C-005', name: 'Nhà Thiếu Nhi Quận 3', address: '185 Cách Mạng Tháng 8, Quận 3', founding_date: '2021-08-30', status: 'active', member_count: 150, coach_name: 'Ngô Việt', contact_phone: '0945678901' },
  { id: 'C-006', name: 'CLB Phú Thọ', address: '219 Lý Thường Kiệt, Quận 11', founding_date: '2016-11-11', status: 'inactive', member_count: 0, coach_name: 'Vũ Đức', contact_phone: '0956789012' },
]

export const MOCK_FEDERATION_APPROVALS: FederationApprovalAPI[] = [
  {
    id: 'A-101',
    type: 'club_registration',
    title: 'Đăng ký thành lập CLB mới',
    description: 'CLB Võ thuật Bình Tân yêu cầu gia nhập Liên đoàn. Đáp ứng đủ tiêu chuẩn sân bãi và HLV.',
    submitted_by: 'Nguyễn Văn A (HLV Bình Tân)',
    submitted_date: '2026-03-13',
    status: 'pending',
  },
  {
    id: 'A-102',
    type: 'athlete_transfer',
    title: 'Đề nghị chuyển nhượng môn sinh',
    description: 'VĐV Trần Hữu Đức xin chuyển từ CLB Lạc Việt sang Nhà Thiếu Nhi Quận 3.',
    submitted_by: 'Trần Hữu Đức',
    submitted_date: '2026-03-12',
    status: 'pending',
  },
  {
    id: 'A-103',
    type: 'rank_promotion',
    title: 'Đề nghị phong đẳng cấp - Trọng tài Quốc gia',
    description: 'Trọng tài Lê Minh Thiện hoàn thành khóa học giám định cấp quốc gia.',
    submitted_by: 'Bác Hội đồng Trọng tài',
    submitted_date: '2026-03-10',
    status: 'pending',
  },
  {
    id: 'A-104',
    type: 'tournament_sanction',
    title: 'Xin phép tổ chức Giải Võ mở rộng',
    description: 'Quận 7 xin tổ chức Giải Trẻ VCT Mở rông với 500 VĐV tham dự.',
    submitted_by: 'TT TDTT Quận 7',
    submitted_date: '2026-03-09',
    status: 'approved',
  },
]

export const MOCK_FEDERATION_TOURNAMENTS: FederationTournamentAPI[] = [
  { id: 'T-001', name: 'Giải Trẻ Võ thuật Cổ truyền TP.HCM 2026', location: 'Nhà thi đấu Phú Thọ', start_date: '2026-06-15', end_date: '2026-06-20', status: 'upcoming', athlete_count: 450 },
  { id: 'T-002', name: 'Đại hội TDTT Thành phố - Môn VCT', location: 'Trung tâm TDTT Quận 1', start_date: '2026-04-10', end_date: '2026-04-14', status: 'ongoing', athlete_count: 620 },
  { id: 'T-003', name: 'Giải Vô địch Cúp CLB Mở rộng 2025', location: 'Nhà thi đấu Rạch Miễu', start_date: '2025-11-20', end_date: '2025-11-25', status: 'completed', athlete_count: 380 },
]

export const MOCK_FEDERATION_REFEREES: FederationRefereeAPI[] = [
  { id: 'R-001', name: 'Trần Văn Mạnh', club_name: 'Võ đường Lạc Việt', grade: 'national', phone: '0901112233', status: 'active' },
  { id: 'R-002', name: 'Lê Minh Thiện', club_name: 'CLB Nguyễn Du', grade: '1', phone: '0902223344', status: 'active' },
  { id: 'R-003', name: 'Phạm Thị Lan', club_name: 'Nhà Thiếu Nhi Q3', grade: '2', phone: '0903334455', status: 'active' },
  { id: 'R-004', name: 'Nguyễn Đình Khang', club_name: 'Tự do', grade: 'international', phone: '0904445566', status: 'suspended' },
  { id: 'R-005', name: 'Võ Thành Tâm', club_name: 'Võ phái Sa Long Cương', grade: '3', phone: '0905556677', status: 'active' },
]

export const MOCK_FEDERATION_FINANCE: FederationFinanceAPI = {
  total_revenue: 125000000,
  total_club_dues: 84000000,
  total_sanction_fees: 41000000,
  pending_dues_count: 5,
  recent_transactions: [
    { id: 'TX-(01)', date: '2026-03-12', description: 'Đóng hội phí 2026 - CLB Quận 1', amount: 2000000, type: 'in' },
    { id: 'TX-(02)', date: '2026-03-10', description: 'Đóng hội phí 2026 - CLB Phú Thọ', amount: 2000000, type: 'in' },
    { id: 'TX-(03)', date: '2026-03-05', description: 'Phí cấp phép Giải Trẻ TP', amount: 5000000, type: 'in' },
    { id: 'TX-(04)', date: '2026-02-28', description: 'Chi phí văn phòng phẩm Hội', amount: 1500000, type: 'out' },
  ]
}
