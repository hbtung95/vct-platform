import type { AdminDashboardAPI, AdminUserAPI, AdminAuditAPI } from './admin-api'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Admin Mobile Mock Data
// ═══════════════════════════════════════════════════════════════

export const MOCK_ADMIN_DASHBOARD: AdminDashboardAPI = {
  total_users: 2450,
  active_sessions: 128,
  total_logins_today: 342,
  system_uptime_hours: 720,
  pending_registrations: 12,
  api_error_rate: 0.02,
}

export const MOCK_ADMIN_USERS: AdminUserAPI[] = [
  { id: 'U-01', username: 'admin', display_name: 'Quản trị hệ thống', role: 'admin', email: 'admin@vct.vn', status: 'active', last_login: '2026-03-14T10:30:00', created_at: '2025-01-01' },
  { id: 'U-02', username: 'federation', display_name: 'Chủ tịch Liên đoàn', role: 'federation_president', email: 'ct@vct.vn', status: 'active', last_login: '2026-03-14T09:15:00', created_at: '2025-01-01' },
  { id: 'U-03', username: 'btc', display_name: 'Ban tổ chức', role: 'btc', email: 'btc@vct.vn', status: 'active', last_login: '2026-03-13T16:00:00', created_at: '2025-02-15' },
  { id: 'U-04', username: 'referee', display_name: 'Trọng tài Lê Quốc Hùng', role: 'referee', email: 'referee@vct.vn', status: 'active', last_login: '2026-03-14T08:00:00', created_at: '2025-03-01' },
  { id: 'U-05', username: 'coach-01', display_name: 'HLV Nguyễn Minh', role: 'coach', email: 'coach@vct.vn', status: 'active', last_login: '2026-03-12T14:30:00', created_at: '2025-04-01' },
  { id: 'U-06', username: 'athlete-01', display_name: 'VĐV Nguyễn Hoàng Nam', role: 'athlete', email: 'nam@vct.vn', status: 'active', last_login: '2026-03-14T07:00:00', created_at: '2025-05-01' },
  { id: 'U-07', username: 'locked-user', display_name: 'Tài khoản bị khóa', role: 'athlete', email: 'locked@vct.vn', status: 'locked', last_login: '2026-02-01T10:00:00', created_at: '2025-06-01' },
  { id: 'U-08', username: 'tech-director', display_name: 'Giám đốc Kỹ thuật', role: 'technical_director', email: 'gd@vct.vn', status: 'active', last_login: '2026-03-14T11:00:00', created_at: '2025-01-15' },
]

export const MOCK_ADMIN_AUDIT: AdminAuditAPI[] = [
  { id: 'A-01', time: '2026-03-14T10:30:12', username: 'admin', role: 'admin', action: 'auth.login', success: true, ip: '113.190.x.x', details: 'Đăng nhập thành công' },
  { id: 'A-02', time: '2026-03-14T10:28:00', username: 'federation', role: 'federation_president', action: 'auth.login', success: true, ip: '42.112.x.x', details: 'Đăng nhập thành công' },
  { id: 'A-03', time: '2026-03-14T10:15:30', username: 'hacker123', role: '', action: 'auth.login', success: false, ip: '185.220.x.x', details: 'Sai thông tin đăng nhập' },
  { id: 'A-04', time: '2026-03-14T09:45:00', username: 'btc', role: 'btc', action: 'auth.login', success: true, ip: '14.225.x.x', details: 'Đăng nhập thành công' },
  { id: 'A-05', time: '2026-03-14T09:30:00', username: 'admin', role: 'admin', action: 'auth.revoke', success: true, ip: '113.190.x.x', details: 'Thu hồi 1 phiên' },
  { id: 'A-06', time: '2026-03-14T08:00:00', username: 'referee', role: 'referee', action: 'auth.login', success: true, ip: '27.68.x.x', details: 'Đăng nhập thành công' },
  { id: 'A-07', time: '2026-03-14T07:30:00', username: 'athlete-01', role: 'athlete', action: 'auth.login', success: true, ip: '123.21.x.x', details: 'Đăng nhập thành công' },
  { id: 'A-08', time: '2026-03-14T07:00:00', username: 'unknown', role: '', action: 'auth.login', success: false, ip: '94.102.x.x', details: 'Sai thông tin đăng nhập' },
]
