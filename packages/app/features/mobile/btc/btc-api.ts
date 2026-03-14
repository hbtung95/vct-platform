import { isApiAvailable } from '../api-client'

export { isApiAvailable }

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — BTC API Client
// Wraps /api/v1/btc/* and /api/v1/tournament-mgmt/* endpoints
// ═══════════════════════════════════════════════════════════════

const BASE = '/api/v1'

// ── Types ────────────────────────────────────────────────────

export interface BTCStatsAPI {
  total_teams: number
  total_athletes: number
  total_categories: number
  total_arenas: number
  pending_registrations: number
  approved_registrations: number
  matches_today: number
  matches_total: number
  protests_open: number
  total_income: number
  total_expense: number
  balance: number
}

export interface RegistrationAPI {
  id: string
  tournament_id: string
  team_name: string
  club_name: string
  coach_name: string
  status: 'pending' | 'approved' | 'rejected'
  athlete_count: number
  category_count: number
  submitted_at: string
  reviewed_by?: string
  reviewed_at?: string
  reject_reason?: string
}

export interface ScheduleSlotAPI {
  id: string
  tournament_id: string
  day: number
  start_time: string
  end_time: string
  arena_name: string
  arena_id: string
  category_name: string
  category_id: string
  match_type: 'doi_khang' | 'quyen' | 'binh_khi'
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  athlete_a?: string
  athlete_b?: string
  team_a?: string
  team_b?: string
}

export interface WeighInAPI {
  id: string
  athlete_name: string
  athlete_id: string
  team_name: string
  category: string
  weight: number
  result: 'pass' | 'fail' | 'pending'
  weighed_at: string
  weighed_by: string
}

export interface DrawAPI {
  id: string
  category_name: string
  category_id: string
  bracket_type: 'single_elimination' | 'double_elimination' | 'round_robin'
  total_athletes: number
  seed_count: number
  status: 'draft' | 'confirmed'
  generated_at: string
}

export interface RefereeAssignmentAPI {
  id: string
  referee_name: string
  referee_id: string
  arena_name: string
  arena_id: string
  role: 'chu_nhiem' | 'diem_a' | 'diem_b' | 'diem_c' | 'bien_ban'
  day: number
  session: 'morning' | 'afternoon' | 'evening'
}

export interface MatchResultAPI {
  id: string
  tournament_id: string
  category_name: string
  match_number: number
  athlete_a: string
  athlete_b: string
  team_a: string
  team_b: string
  score_a: number
  score_b: number
  winner: string
  method: 'points' | 'knockout' | 'injury' | 'walkover' | 'disqualification'
  status: 'recorded' | 'finalized'
  recorded_at: string
}

export interface TeamStandingAPI {
  id: string
  tournament_id: string
  team_name: string
  gold: number
  silver: number
  bronze: number
  total_medals: number
  rank: number
}

export interface ProtestAPI {
  id: string
  giai_id: string
  team_name: string
  match_id: string
  category: string
  noi_dung: string
  trang_thai: 'pending' | 'accepted' | 'rejected' | 'reviewing'
  nguoi_xl?: string
  quyet_dinh?: string
  created_at: string
}

export interface MeetingAPI {
  id: string
  giai_id: string
  title: string
  date: string
  time: string
  location: string
  attendees: number
  notes: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

// ── API Functions ────────────────────────────────────────────

async function api<T>(path: string, token?: string | null, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options?.headers },
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
  return res.json() as Promise<T>
}

// Stats
export const fetchBTCStats = (token?: string | null, giaiId?: string) =>
  api<BTCStatsAPI>(`/btc/stats?giai_id=${giaiId ?? ''}`, token)

// Registrations (tournament-mgmt)
export const fetchRegistrations = (token?: string | null, tournamentId?: string) =>
  api<{ registrations: RegistrationAPI[]; total: number }>(`/tournament-mgmt/${tournamentId ?? 'default'}/registrations`, token)

export const approveRegistration = (token?: string | null, regId?: string) =>
  api<{ status: string }>(`/tournament-mgmt/default/registrations/${regId}/approve`, token, { method: 'POST' })

export const rejectRegistration = (token?: string | null, regId?: string, reason?: string) =>
  api<{ status: string }>(`/tournament-mgmt/default/registrations/${regId}/reject`, token, { method: 'POST', body: JSON.stringify({ reason }) })

// Schedule (tournament-mgmt)
export const fetchSchedule = (token?: string | null, tournamentId?: string) =>
  api<{ schedule: ScheduleSlotAPI[]; total: number }>(`/tournament-mgmt/${tournamentId ?? 'default'}/schedule`, token)

// WeighIn
export const fetchWeighIns = (token?: string | null, giaiId?: string) =>
  api<WeighInAPI[]>(`/btc/weigh-in?giai_id=${giaiId ?? ''}`, token)

export const createWeighIn = (token?: string | null, data?: Partial<WeighInAPI>) =>
  api<WeighInAPI>('/btc/weigh-in/create', token, { method: 'POST', body: JSON.stringify(data) })

// Draws
export const fetchDraws = (token?: string | null, giaiId?: string) =>
  api<DrawAPI[]>(`/btc/draws?giai_id=${giaiId ?? ''}`, token)

export const generateDraw = (token?: string | null, data?: { category_id: string; bracket_type: string }) =>
  api<DrawAPI>('/btc/draws/generate', token, { method: 'POST', body: JSON.stringify(data) })

// Referee Assignments
export const fetchRefereeAssignments = (token?: string | null, giaiId?: string) =>
  api<RefereeAssignmentAPI[]>(`/btc/referee-assignments?giai_id=${giaiId ?? ''}`, token)

export const createRefereeAssignment = (token?: string | null, data?: Partial<RefereeAssignmentAPI>) =>
  api<RefereeAssignmentAPI>('/btc/referee-assignments/create', token, { method: 'POST', body: JSON.stringify(data) })

// Results (tournament-mgmt)
export const fetchResults = (token?: string | null, tournamentId?: string) =>
  api<{ results: MatchResultAPI[]; total: number }>(`/tournament-mgmt/${tournamentId ?? 'default'}/results`, token)

export const finalizeResult = (token?: string | null, tournamentId?: string, resultId?: string) =>
  api<{ status: string }>(`/tournament-mgmt/${tournamentId ?? 'default'}/results/${resultId}/finalize`, token, { method: 'POST' })

// Standings (tournament-mgmt)
export const fetchStandings = (token?: string | null, tournamentId?: string) =>
  api<{ standings: TeamStandingAPI[]; total: number }>(`/tournament-mgmt/${tournamentId ?? 'default'}/standings`, token)

// Protests
export const fetchProtests = (token?: string | null, giaiId?: string) =>
  api<ProtestAPI[]>(`/btc/protests?giai_id=${giaiId ?? ''}`, token)

export const updateProtestStatus = (token?: string | null, protestId?: string, trangThai?: string, nguoiXL?: string, quyetDinh?: string) =>
  api<{ status: string }>(`/btc/protests/${protestId}`, token, { method: 'PATCH', body: JSON.stringify({ trang_thai: trangThai, nguoi_xl: nguoiXL, quyet_dinh: quyetDinh }) })

// Meetings
export const fetchMeetings = (token?: string | null, giaiId?: string) =>
  api<MeetingAPI[]>(`/btc/meetings?giai_id=${giaiId ?? ''}`, token)

export const createMeeting = (token?: string | null, data?: Partial<MeetingAPI>) =>
  api<MeetingAPI>('/btc/meetings/create', token, { method: 'POST', body: JSON.stringify(data) })

// Finance
export const fetchBTCFinance = (token?: string | null, giaiId?: string) =>
  api<any[]>(`/btc/finance?giai_id=${giaiId ?? ''}`, token)

export const fetchBTCFinanceSummary = (token?: string | null, giaiId?: string) =>
  api<{ total_income: number; total_expense: number; balance: number }>(`/btc/finance/summary?giai_id=${giaiId ?? ''}`, token)
