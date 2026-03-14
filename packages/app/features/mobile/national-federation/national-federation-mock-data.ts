import type {
  NationalDashboardAPI,
  ProvincialFederationAPI,
  NationalTournamentAPI,
  NationalRefereeAPI,
  NationalRankingAPI,
} from './national-federation-api'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — National Federation Mock Data
// Mirrors nationwide seed data for offline / demo mode
// ═══════════════════════════════════════════════════════════════

export const MOCK_NF_DASHBOARD: NationalDashboardAPI = {
  provinces_count: 63,
  total_clubs: 1850,
  total_athletes: 45200,
  total_referees: 1240,
  active_national_tournaments: 3,
}

export const MOCK_PROVINCIAL_FEDERATIONS: ProvincialFederationAPI[] = [
  { id: 'PF-01', name: 'LĐVTCT TP. Hồ Chí Minh', province: 'TP. Hồ Chí Minh', president_name: 'Nguyễn Văn Hùng', club_count: 42, athlete_count: 1250, referee_count: 85, status: 'active' },
  { id: 'PF-02', name: 'LĐVTCT Hà Nội', province: 'Hà Nội', president_name: 'Trần Đức Minh', club_count: 38, athlete_count: 1100, referee_count: 72, status: 'active' },
  { id: 'PF-03', name: 'LĐVTCT Bình Định', province: 'Bình Định', president_name: 'Võ Thanh Sơn', club_count: 55, athlete_count: 1800, referee_count: 95, status: 'active' },
  { id: 'PF-04', name: 'LĐVTCT Đà Nẵng', province: 'Đà Nẵng', president_name: 'Lê Quang Vinh', club_count: 25, athlete_count: 720, referee_count: 40, status: 'active' },
  { id: 'PF-05', name: 'LĐVTCT Cần Thơ', province: 'Cần Thơ', president_name: 'Huỳnh Văn Phú', club_count: 18, athlete_count: 480, referee_count: 28, status: 'active' },
  { id: 'PF-06', name: 'LĐVTCT Thừa Thiên Huế', province: 'Thừa Thiên Huế', president_name: 'Phan Đình Khoa', club_count: 22, athlete_count: 650, referee_count: 35, status: 'active' },
  { id: 'PF-07', name: 'LĐVTCT Đồng Nai', province: 'Đồng Nai', president_name: 'Ngô Minh Tuấn', club_count: 30, athlete_count: 900, referee_count: 48, status: 'active' },
  { id: 'PF-08', name: 'LĐVTCT Thanh Hóa', province: 'Thanh Hóa', president_name: 'Bùi Xuân Trường', club_count: 15, athlete_count: 350, referee_count: 20, status: 'inactive' },
]

export const MOCK_NF_TOURNAMENTS: NationalTournamentAPI[] = [
  { id: 'NT-01', name: 'Giải Vô địch Võ Cổ truyền Toàn quốc 2026', location: 'Nhà thi đấu Quốc gia Mỹ Đình, Hà Nội', start_date: '2026-08-10', end_date: '2026-08-18', status: 'upcoming', athlete_count: 1500, province_count: 45 },
  { id: 'NT-02', name: 'Đại hội TDTT Toàn quốc lần thứ X - Môn VCT', location: 'Khu liên hợp TDTT Quốc gia, Hà Nội', start_date: '2026-04-20', end_date: '2026-04-28', status: 'ongoing', athlete_count: 2200, province_count: 55 },
  { id: 'NT-03', name: 'Giải Trẻ VCT Toàn quốc 2026', location: 'Nhà thi đấu Phú Thọ, TP.HCM', start_date: '2026-06-01', end_date: '2026-06-07', status: 'upcoming', athlete_count: 800, province_count: 35 },
  { id: 'NT-04', name: 'Cúp VCT các CLB mạnh Toàn quốc 2025', location: 'Nhà thi đấu Bình Định', start_date: '2025-12-05', end_date: '2025-12-12', status: 'completed', athlete_count: 1200, province_count: 40 },
]

export const MOCK_NF_REFEREES: NationalRefereeAPI[] = [
  { id: 'NR-01', name: 'Trần Văn Mạnh', province: 'TP. Hồ Chí Minh', grade: 'national', certifications: ['Đối kháng', 'Quyền thuật'], phone: '0901112233', status: 'active' },
  { id: 'NR-02', name: 'Lê Quốc Hùng', province: 'Hà Nội', grade: 'international', certifications: ['Đối kháng', 'Quyền thuật', 'Biểu diễn'], phone: '0902223344', status: 'active' },
  { id: 'NR-03', name: 'Võ Minh Đức', province: 'Bình Định', grade: 'national', certifications: ['Đối kháng'], phone: '0903334455', status: 'active' },
  { id: 'NR-04', name: 'Phạm Thị Hương', province: 'Đà Nẵng', grade: 'international', certifications: ['Quyền thuật', 'Biểu diễn'], phone: '0904445566', status: 'active' },
  { id: 'NR-05', name: 'Nguyễn Đình Khang', province: 'TP. Hồ Chí Minh', grade: 'national', certifications: ['Đối kháng'], phone: '0905556677', status: 'suspended' },
  { id: 'NR-06', name: 'Bùi Thanh Liêm', province: 'Thanh Hóa', grade: 'national', certifications: ['Đối kháng', 'Quyền thuật'], phone: '0906667788', status: 'active' },
]

export const MOCK_NF_RANKINGS: NationalRankingAPI[] = [
  { rank: 1, athlete_name: 'Nguyễn Văn Toàn', province: 'Bình Định', weight_class: '60kg', category: 'doi_khang', elo_rating: 2180, wins: 42, losses: 3 },
  { rank: 2, athlete_name: 'Trần Minh Quân', province: 'TP. Hồ Chí Minh', weight_class: '60kg', category: 'doi_khang', elo_rating: 2145, wins: 38, losses: 5 },
  { rank: 3, athlete_name: 'Lê Hoàng Phúc', province: 'Hà Nội', weight_class: '60kg', category: 'doi_khang', elo_rating: 2098, wins: 35, losses: 7 },
  { rank: 1, athlete_name: 'Võ Thị Hạnh', province: 'Bình Định', weight_class: 'Nữ 52kg', category: 'doi_khang', elo_rating: 2050, wins: 30, losses: 2 },
  { rank: 2, athlete_name: 'Phạm Ngọc Anh', province: 'Đà Nẵng', weight_class: 'Nữ 52kg', category: 'doi_khang', elo_rating: 1980, wins: 28, losses: 4 },
  { rank: 1, athlete_name: 'Huỳnh Minh Trí', province: 'TP. Hồ Chí Minh', weight_class: 'N/A', category: 'quyen_thuat', elo_rating: 2210, wins: 25, losses: 1 },
  { rank: 2, athlete_name: 'Nguyễn Thúy Vy', province: 'Bình Định', weight_class: 'N/A', category: 'quyen_thuat', elo_rating: 2150, wins: 22, losses: 2 },
  { rank: 3, athlete_name: 'Đặng Văn Hải', province: 'Hà Nội', weight_class: 'N/A', category: 'quyen_thuat', elo_rating: 2090, wins: 20, losses: 3 },
]
