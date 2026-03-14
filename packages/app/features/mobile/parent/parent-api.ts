import { isApiAvailable } from '../api-client'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Parent Mobile API Client
// Wraps all /api/v1/parent/* endpoints
// ═══════════════════════════════════════════════════════════════

const API_BASE = '/api/v1/parent'

async function parentFetch<T>(token: string | null, path: string, init?: RequestInit): Promise<T> {
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

export interface ParentDashboardAPI {
  children_count: number
  pending_consents: number
  active_consents: number
  upcoming_events: number
  children: ChildLinkAPI[]
  recent_results: ChildResultAPI[]
}

export interface ChildLinkAPI {
  id: string
  parent_id: string
  parent_name: string
  athlete_id: string
  athlete_name: string
  club_name: string
  belt_level: string
  relation: string
  status: 'pending' | 'approved' | 'rejected'
  requested_at: string
  approved_at?: string
}

export interface ConsentRecordAPI {
  id: string
  parent_id: string
  athlete_id: string
  athlete_name: string
  type: string
  title: string
  description: string
  status: 'active' | 'revoked' | 'expired'
  signed_at: string
  expires_at?: string
  revoked_at?: string
}

export interface AttendanceRecordAPI {
  date: string
  session: string
  status: 'present' | 'late' | 'absent'
  coach: string
}

export interface ChildResultAPI {
  tournament: string
  category: string
  result: string
  date: string
}

// ── API Functions ──

export async function fetchParentDashboard(token: string | null): Promise<ParentDashboardAPI> {
  return parentFetch<ParentDashboardAPI>(token, '/dashboard')
}

export async function fetchParentChildren(token: string | null): Promise<ChildLinkAPI[]> {
  return parentFetch<ChildLinkAPI[]>(token, '/children')
}

export async function linkChild(
  token: string | null,
  athleteId: string,
  athleteName: string,
  relation: string,
): Promise<ChildLinkAPI> {
  return parentFetch<ChildLinkAPI>(token, '/children/link', {
    method: 'POST',
    body: JSON.stringify({ athlete_id: athleteId, athlete_name: athleteName, relation }),
  })
}

export async function unlinkChild(token: string | null, linkId: string): Promise<void> {
  await parentFetch<unknown>(token, `/children/${linkId}`, { method: 'DELETE' })
}

export async function fetchConsents(token: string | null): Promise<ConsentRecordAPI[]> {
  return parentFetch<ConsentRecordAPI[]>(token, '/consents')
}

export async function createConsent(
  token: string | null,
  data: { athlete_id: string; athlete_name: string; type: string; title: string; description: string },
): Promise<ConsentRecordAPI> {
  return parentFetch<ConsentRecordAPI>(token, '/consents', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function revokeConsent(token: string | null, consentId: string): Promise<void> {
  await parentFetch<unknown>(token, `/consents/${consentId}`, { method: 'DELETE' })
}

export async function fetchChildAttendance(
  token: string | null,
  athleteId: string,
): Promise<AttendanceRecordAPI[]> {
  return parentFetch<AttendanceRecordAPI[]>(token, `/children/${athleteId}/attendance`)
}

export async function fetchChildResults(
  token: string | null,
  athleteId: string,
): Promise<ChildResultAPI[]> {
  return parentFetch<ChildResultAPI[]>(token, `/children/${athleteId}/results`)
}

export { isApiAvailable }
