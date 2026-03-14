import { isApiAvailable } from '../api-client'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Club Manager Mobile API Client
// Wraps all /api/v1/club/* endpoints
// ═══════════════════════════════════════════════════════════════

const API_BASE = '/api/v1/club'

async function clubFetch<T>(token: string | null, path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json()
}

// ── Types ──

export interface ClubDashboardAPI {
  club_id: string
  club_name: string
  club_type: string
  total_members: number
  active_members: number
  pending_members: number
  total_classes: number
  active_classes: number
  total_income: number
  total_expense: number
  balance: number
  attendance_rate: number
  upcoming_exams: number
}

export interface ClubMemberAPI {
  id: string
  club_id: string
  name: string
  phone: string
  email?: string
  belt_level: string
  status: 'active' | 'pending' | 'suspended' | 'left'
  join_date: string
  role: string
}

export interface ClubClassAPI {
  id: string
  club_id: string
  name: string
  coach_name: string
  status: 'active' | 'paused' | 'closed'
  max_students: number
  current_students: number
  sessions: { day_of_week: number; start_time: string; end_time: string }[]
  monthly_fee: number
}

export interface ClubFinanceEntryAPI {
  id: string
  club_id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string
  date: string
  status: 'completed' | 'pending'
}

export interface ClubFinanceSummaryAPI {
  total_income: number
  total_expense: number
  balance: number
  pending: number
}

export interface ClubAttendanceAPI {
  id: string
  club_id: string
  class_id: string
  class_name: string
  member_id: string
  member_name: string
  date: string
  status: 'present' | 'late' | 'absent'
  recorded_by: string
}

export interface ClubAttendanceSummaryAPI {
  total_sessions: number
  total_records: number
  present_count: number
  late_count: number
  absent_count: number
  attendance_rate: number
}

// ── Delegation Tournament Roles ──
export interface DelegationStatsAPI {
  total_athletes: number
  active_matches: number
  gold_medals: number
  silver_medals: number
  bronze_medals: number
  team_rank: number
}

export interface DelegationMatchAPI {
  id: string
  time: string
  arena: string
  category: string
  athleteName: string
  opponentName: string
  status: 'upcoming' | 'ongoing' | 'completed'
  result?: 'win' | 'loss'
  score?: string
}

export interface DelegationResultAPI {
  id: string
  athleteName: string
  category: string
  medal: 'gold' | 'silver' | 'bronze' | 'none'
  rank: number
}

// ── API Functions ──

// Dashboard
export async function fetchClubDashboard(token: string | null): Promise<ClubDashboardAPI> {
  const res = await clubFetch<{ data: ClubDashboardAPI }>(token, '/dashboard')
  return res.data
}

// Members
export async function fetchClubMembers(token: string | null): Promise<ClubMemberAPI[]> {
  const res = await clubFetch<{ data: { members: ClubMemberAPI[]; total: number } }>(token, '/members')
  return res.data.members
}

export async function createClubMember(
  token: string | null,
  member: Omit<ClubMemberAPI, 'id'>,
): Promise<ClubMemberAPI> {
  const res = await clubFetch<{ data: ClubMemberAPI }>(token, '/members', {
    method: 'POST',
    body: JSON.stringify(member),
  })
  return res.data
}

export async function approveMember(token: string | null, memberId: string): Promise<void> {
  await clubFetch<unknown>(token, `/members/${memberId}/approve`, { method: 'POST' })
}

export async function rejectMember(token: string | null, memberId: string): Promise<void> {
  await clubFetch<unknown>(token, `/members/${memberId}/reject`, { method: 'POST' })
}

export async function deleteMember(token: string | null, memberId: string): Promise<void> {
  await clubFetch<unknown>(token, `/members/${memberId}`, { method: 'DELETE' })
}

// Classes
export async function fetchClubClasses(token: string | null): Promise<ClubClassAPI[]> {
  const res = await clubFetch<{ data: { classes: ClubClassAPI[]; total: number } }>(token, '/classes')
  return res.data.classes
}

export async function createClubClass(
  token: string | null,
  cls: Omit<ClubClassAPI, 'id' | 'current_students'>,
): Promise<ClubClassAPI> {
  const res = await clubFetch<{ data: ClubClassAPI }>(token, '/classes', {
    method: 'POST',
    body: JSON.stringify(cls),
  })
  return res.data
}

export async function updateClubClass(token: string | null, classId: string, patch: Record<string, unknown>): Promise<void> {
  await clubFetch<unknown>(token, `/classes/${classId}`, { method: 'PUT', body: JSON.stringify(patch) })
}

export async function deleteClubClass(token: string | null, classId: string): Promise<void> {
  await clubFetch<unknown>(token, `/classes/${classId}`, { method: 'DELETE' })
}

// Finance
export async function fetchClubFinance(token: string | null): Promise<ClubFinanceEntryAPI[]> {
  const res = await clubFetch<{ data: { entries: ClubFinanceEntryAPI[]; total: number } }>(token, '/finance')
  return res.data.entries
}

export async function fetchClubFinanceSummary(token: string | null): Promise<ClubFinanceSummaryAPI> {
  const res = await clubFetch<{ data: ClubFinanceSummaryAPI }>(token, '/finance/summary')
  return res.data
}

export async function createClubFinanceEntry(
  token: string | null,
  entry: Omit<ClubFinanceEntryAPI, 'id'>,
): Promise<ClubFinanceEntryAPI> {
  const res = await clubFetch<{ data: ClubFinanceEntryAPI }>(token, '/finance', {
    method: 'POST',
    body: JSON.stringify(entry),
  })
  return res.data
}

// Attendance
export async function fetchClubAttendance(token: string | null, classId?: string, date?: string): Promise<ClubAttendanceAPI[]> {
  const params = new URLSearchParams()
  if (classId) params.set('class_id', classId)
  if (date) params.set('date', date)
  const qs = params.toString()
  const res = await clubFetch<{ data: { records: ClubAttendanceAPI[]; total: number } }>(token, `/attendance${qs ? `?${qs}` : ''}`)
  return res.data.records
}

export async function fetchClubAttendanceSummary(token: string | null): Promise<ClubAttendanceSummaryAPI> {
  const res = await clubFetch<{ data: ClubAttendanceSummaryAPI }>(token, '/attendance/summary')
  return res.data
}

export async function recordAttendance(
  token: string | null,
  record: Omit<ClubAttendanceAPI, 'id' | 'recorded_by'>,
): Promise<ClubAttendanceAPI> {
  const res = await clubFetch<{ data: ClubAttendanceAPI }>(token, '/attendance', {
    method: 'POST',
    body: JSON.stringify(record),
  })
  return res.data
}

export { isApiAvailable }
