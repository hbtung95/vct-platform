import type { TDDashboardAPI, TDStandardAPI, TDRefereeQualityAPI } from './td-api'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Technical Director Mock Data
// ═══════════════════════════════════════════════════════════════

export const MOCK_TD_DASHBOARD: TDDashboardAPI = {
  total_weight_classes: 22,
  total_age_groups: 8,
  total_competition_contents: 9,
  total_certified_referees: 1240,
  avg_referee_score: 8.4,
  pending_standard_reviews: 5,
}

export const MOCK_TD_STANDARDS: TDStandardAPI[] = [
  { id: 'S-01', type: 'weight_class', name: 'Nam U60kg', scope: 'national', description: 'Hạng cân dưới 60kg nam - áp dụng toàn quốc', status: 'active', last_updated: '2026-01-15' },
  { id: 'S-02', type: 'weight_class', name: 'Nữ U52kg', scope: 'national', description: 'Hạng cân dưới 52kg nữ - áp dụng toàn quốc', status: 'active', last_updated: '2026-01-15' },
  { id: 'S-03', type: 'age_group', name: 'Thiếu niên (U15)', scope: 'national', description: 'Nhóm tuổi từ 12-14', status: 'active', last_updated: '2025-12-01' },
  { id: 'S-04', type: 'age_group', name: 'Thanh niên (U18)', scope: 'national', description: 'Nhóm tuổi từ 15-17', status: 'active', last_updated: '2025-12-01' },
  { id: 'S-05', type: 'competition_content', name: 'Đối kháng', scope: 'national', description: 'Thi đấu 1 vs 1, có hạng cân theo QC2021', status: 'active', last_updated: '2026-02-10' },
  { id: 'S-06', type: 'competition_content', name: 'Quyền thuật', scope: 'national', description: 'Bài quyền cá nhân, chấm điểm 5 tiêu chí', status: 'active', last_updated: '2026-02-10' },
  { id: 'S-07', type: 'competition_content', name: 'Song luyện', scope: 'national', description: 'Đấu mẫu 2 người, chấm điểm kỹ thuật', status: 'active', last_updated: '2026-02-10' },
  { id: 'S-08', type: 'weight_class', name: 'Nam U70kg (Miền Nam)', scope: 'provincial', description: 'Hạng cân riêng khu vực phía Nam', status: 'draft', last_updated: '2026-03-01' },
  { id: 'S-09', type: 'competition_content', name: 'Biểu diễn chiến lược', scope: 'national', description: 'Nội dung biểu diễn tổng hợp', status: 'deprecated', last_updated: '2025-06-01' },
]

export const MOCK_TD_REFEREE_QUALITY: TDRefereeQualityAPI[] = [
  { id: 'RQ-01', referee_name: 'Lê Quốc Hùng', province: 'Hà Nội', grade: 'international', total_matches: 180, avg_score: 9.2, accuracy_rate: 0.96, complaints: 0, status: 'excellent' },
  { id: 'RQ-02', referee_name: 'Phạm Thị Hương', province: 'Đà Nẵng', grade: 'international', total_matches: 145, avg_score: 9.0, accuracy_rate: 0.94, complaints: 1, status: 'excellent' },
  { id: 'RQ-03', referee_name: 'Trần Văn Mạnh', province: 'TP. Hồ Chí Minh', grade: 'national', total_matches: 120, avg_score: 8.5, accuracy_rate: 0.91, complaints: 2, status: 'good' },
  { id: 'RQ-04', referee_name: 'Võ Minh Đức', province: 'Bình Định', grade: 'national', total_matches: 95, avg_score: 8.1, accuracy_rate: 0.88, complaints: 3, status: 'good' },
  { id: 'RQ-05', referee_name: 'Nguyễn Đình Khang', province: 'TP. Hồ Chí Minh', grade: 'national', total_matches: 60, avg_score: 6.8, accuracy_rate: 0.78, complaints: 7, status: 'needs_improvement' },
  { id: 'RQ-06', referee_name: 'Bùi Thanh Liêm', province: 'Thanh Hóa', grade: 'national', total_matches: 40, avg_score: 5.5, accuracy_rate: 0.72, complaints: 10, status: 'under_review' },
]
