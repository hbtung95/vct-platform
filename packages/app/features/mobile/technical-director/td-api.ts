import { isApiAvailable } from '../api-client'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Technical Director Mobile API Client
// ═══════════════════════════════════════════════════════════════

const API_BASE = '/api/v1/technical-director'

async function tdFetch<T>(token: string | null, path: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, { headers })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// ── Types ──

export interface TDDashboardAPI {
  total_weight_classes: number
  total_age_groups: number
  total_competition_contents: number
  total_certified_referees: number
  avg_referee_score: number
  pending_standard_reviews: number
}

export interface TDStandardAPI {
  id: string
  type: 'weight_class' | 'age_group' | 'competition_content'
  name: string
  scope: 'national' | 'provincial'
  description: string
  status: 'active' | 'draft' | 'deprecated'
  last_updated: string
}

export interface TDRefereeQualityAPI {
  id: string
  referee_name: string
  province: string
  grade: 'provincial' | 'national' | 'international'
  total_matches: number
  avg_score: number
  accuracy_rate: number
  complaints: number
  status: 'excellent' | 'good' | 'needs_improvement' | 'under_review'
}

// ── API Functions ──

export async function fetchTDDashboard(token: string | null): Promise<TDDashboardAPI> {
  const res = await tdFetch<{ data: TDDashboardAPI }>(token, '/dashboard')
  return res.data
}

export async function fetchTDStandards(token: string | null): Promise<TDStandardAPI[]> {
  const res = await tdFetch<{ data: { standards: TDStandardAPI[] } }>(token, '/standards')
  return res.data.standards
}

export async function fetchTDRefereeQuality(token: string | null): Promise<TDRefereeQualityAPI[]> {
  const res = await tdFetch<{ data: { referees: TDRefereeQualityAPI[] } }>(token, '/referee-quality')
  return res.data.referees
}

export { isApiAvailable }
