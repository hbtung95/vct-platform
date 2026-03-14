import { isApiAvailable } from '../api-client'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — National Federation Mobile API Client
// Wraps all /api/v1/national-federation/* endpoints
// ═══════════════════════════════════════════════════════════════

const API_BASE = '/api/v1/national-federation'

async function nfFetch<T>(token: string | null, path: string, init?: RequestInit): Promise<T> {
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

export interface NationalDashboardAPI {
  provinces_count: number
  total_clubs: number
  total_athletes: number
  total_referees: number
  active_national_tournaments: number
}

export interface ProvincialFederationAPI {
  id: string
  name: string
  province: string
  president_name: string
  club_count: number
  athlete_count: number
  referee_count: number
  status: 'active' | 'inactive'
}

export interface NationalTournamentAPI {
  id: string
  name: string
  location: string
  start_date: string
  end_date: string
  status: 'upcoming' | 'ongoing' | 'completed'
  athlete_count: number
  province_count: number
}

export interface NationalRefereeAPI {
  id: string
  name: string
  province: string
  grade: 'national' | 'international'
  certifications: string[]
  phone: string
  status: 'active' | 'suspended'
}

export interface NationalRankingAPI {
  rank: number
  athlete_name: string
  province: string
  weight_class: string
  category: 'doi_khang' | 'quyen_thuat'
  elo_rating: number
  wins: number
  losses: number
}

// ── API Functions ──

export async function fetchNationalDashboard(token: string | null): Promise<NationalDashboardAPI> {
  const res = await nfFetch<{ data: NationalDashboardAPI }>(token, '/dashboard')
  return res.data
}

export async function fetchProvincialFederations(token: string | null): Promise<ProvincialFederationAPI[]> {
  const res = await nfFetch<{ data: { federations: ProvincialFederationAPI[]; total: number } }>(token, '/provinces')
  return res.data.federations
}

export async function fetchNationalTournaments(token: string | null): Promise<NationalTournamentAPI[]> {
  const res = await nfFetch<{ data: { tournaments: NationalTournamentAPI[]; total: number } }>(token, '/tournaments')
  return res.data.tournaments
}

export async function fetchNationalReferees(token: string | null): Promise<NationalRefereeAPI[]> {
  const res = await nfFetch<{ data: { referees: NationalRefereeAPI[]; total: number } }>(token, '/referees')
  return res.data.referees
}

export async function fetchNationalRankings(token: string | null): Promise<NationalRankingAPI[]> {
  const res = await nfFetch<{ data: { rankings: NationalRankingAPI[]; total: number } }>(token, '/rankings')
  return res.data.rankings
}

export { isApiAvailable }
