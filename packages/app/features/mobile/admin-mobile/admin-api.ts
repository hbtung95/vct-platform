import { isApiAvailable } from '../api-client'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Admin Mobile API Client
// ═══════════════════════════════════════════════════════════════

const API_BASE = '/api/v1/admin'

async function adminFetch<T>(token: string | null, path: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, { headers })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// ── Types ──

export interface AdminDashboardAPI {
  total_users: number
  active_sessions: number
  total_logins_today: number
  system_uptime_hours: number
  pending_registrations: number
  api_error_rate: number
}

export interface AdminUserAPI {
  id: string
  username: string
  display_name: string
  role: string
  email: string
  status: 'active' | 'locked' | 'inactive'
  last_login: string
  created_at: string
}

export interface AdminAuditAPI {
  id: string
  time: string
  username: string
  role: string
  action: string
  success: boolean
  ip: string
  details: string
}

// ── API Functions ──

export async function fetchAdminDashboard(token: string | null): Promise<AdminDashboardAPI> {
  const res = await adminFetch<{ data: AdminDashboardAPI }>(token, '/dashboard')
  return res.data
}

export async function fetchAdminUsers(token: string | null): Promise<AdminUserAPI[]> {
  const res = await adminFetch<{ data: { users: AdminUserAPI[] } }>(token, '/users')
  return res.data.users
}

export async function fetchAdminAudit(token: string | null): Promise<AdminAuditAPI[]> {
  const res = await adminFetch<{ data: { entries: AdminAuditAPI[] } }>(token, '/audit')
  return res.data.entries
}

export { isApiAvailable }
