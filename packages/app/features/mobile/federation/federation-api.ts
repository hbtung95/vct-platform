import { isApiAvailable } from '../api-client'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Federation Manager Mobile API Client
// Wraps all /api/v1/federation/* endpoints
// ═══════════════════════════════════════════════════════════════

const API_BASE = '/api/v1/federation'

async function federationFetch<T>(token: string | null, path: string, init?: RequestInit): Promise<T> {
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

export interface FederationDashboardAPI {
  total_clubs: number
  total_athletes: number
  total_referees: number
  active_tournaments: number
  pending_approvals: number
}

export interface FederationClubAPI {
  id: string
  name: string
  address: string
  founding_date: string
  status: 'active' | 'inactive' | 'suspended'
  member_count: number
  coach_name: string
  contact_phone: string
}

export interface FederationApprovalAPI {
  id: string
  type: 'club_registration' | 'athlete_transfer' | 'rank_promotion' | 'tournament_sanction'
  title: string
  description: string
  submitted_by: string
  submitted_date: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface FederationTournamentAPI {
  id: string
  name: string
  location: string
  start_date: string
  end_date: string
  status: 'upcoming' | 'ongoing' | 'completed'
  athlete_count: number
}

export interface FederationRefereeAPI {
  id: string
  name: string
  club_name: string
  grade: '1' | '2' | '3' | 'national' | 'international'
  phone: string
  status: 'active' | 'suspended'
}

export interface FederationFinanceAPI {
  total_revenue: number
  total_club_dues: number
  total_sanction_fees: number
  pending_dues_count: number
  recent_transactions: {
    id: string
    date: string
    description: string
    amount: number
    type: 'in' | 'out'
  }[]
}

// ── API Functions ──

export async function fetchFederationDashboard(token: string | null): Promise<FederationDashboardAPI> {
  const res = await federationFetch<{ data: FederationDashboardAPI }>(token, '/dashboard')
  return res.data
}

export async function fetchFederationClubs(token: string | null): Promise<FederationClubAPI[]> {
  const res = await federationFetch<{ data: { clubs: FederationClubAPI[]; total: number } }>(token, '/clubs')
  return res.data.clubs
}

export async function fetchFederationApprovals(token: string | null): Promise<FederationApprovalAPI[]> {
  const res = await federationFetch<{ data: { approvals: FederationApprovalAPI[]; total: number } }>(token, '/approvals')
  return res.data.approvals
}

export async function processApproval(
  token: string | null,
  approvalId: string,
  action: 'approve' | 'reject',
  reason?: string
): Promise<void> {
  await federationFetch<unknown>(token, `/approvals/${approvalId}`, {
    method: 'POST',
    body: JSON.stringify({ action, reason }),
  })
}

export async function fetchFederationTournaments(token: string | null): Promise<FederationTournamentAPI[]> {
  const res = await federationFetch<{ data: { tournaments: FederationTournamentAPI[]; total: number } }>(token, '/tournaments')
  return res.data.tournaments
}

export async function fetchFederationReferees(token: string | null): Promise<FederationRefereeAPI[]> {
  const res = await federationFetch<{ data: { referees: FederationRefereeAPI[]; total: number } }>(token, '/referees')
  return res.data.referees
}

export async function fetchFederationFinance(token: string | null): Promise<FederationFinanceAPI> {
  const res = await federationFetch<{ data: FederationFinanceAPI }>(token, '/finance')
  return res.data
}

export { isApiAvailable }
