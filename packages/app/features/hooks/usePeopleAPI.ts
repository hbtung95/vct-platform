'use client'

import { useApiQuery } from './useApiQuery'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — PEOPLE API HOOKS
// Typed React hooks for athletes, coaches, referees, and profiles.
// ═══════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────

export interface Athlete {
    id: string; ho_ten: string; name?: string; ngay_sinh?: string
    gioi_tinh?: string; so_cccd?: string; dia_chi?: string
    dien_thoai?: string; email?: string; dan_toc?: string
    doi?: string; team_id?: string; team_name?: string
    club?: string; province?: string; belt?: string
    hang_can?: string; trang_thai?: string
    created_at?: string; updated_at?: string
}

export interface Coach {
    id: string; ho_ten: string; belt_level?: string
    specialization?: string; province?: string; club?: string
    phone?: string; email?: string; years_experience?: number
    certification?: string; status?: string
}

export interface Referee {
    id: string; ho_ten: string; level?: string
    specialization?: string; province?: string
    phone?: string; email?: string; years_experience?: number
    certification?: string; status?: string
}

export interface AthleteProfile {
    id: string; user_id: string; full_name: string
    date_of_birth?: string; gender?: string
    avatar_url?: string; bio?: string
    belt_level?: string; height_cm?: number; weight_kg?: number
    province?: string; club_name?: string
    achievements?: Achievement[]
    memberships?: ClubMembership[]
    tournament_entries?: TournamentEntry[]
}

export interface Achievement {
    id: string; title: string; date: string; category?: string
    medal?: 'gold' | 'silver' | 'bronze'; tournament_name?: string
}

export interface ClubMembership {
    id: string; club_id: string; club_name: string; role: string
    joined_at: string; left_at?: string; is_active: boolean
}

export interface TournamentEntry {
    id: string; tournament_id: string; tournament_name: string
    category: string; result?: string; placement?: number
    date: string
}

// ── Query Hooks ──────────────────────────────────────────────

export function useAthletes(params?: { teamId?: string; tournamentId?: string; search?: string }) {
    const qs = new URLSearchParams()
    if (params?.teamId) qs.set('teamId', params.teamId)
    if (params?.tournamentId) qs.set('tournamentId', params.tournamentId)
    if (params?.search) qs.set('search', params.search)
    const query = qs.toString()
    return useApiQuery<Athlete[]>(`/api/v1/athletes/${query ? '?' + query : ''}`)
}

export function useAthlete(id: string) {
    return useApiQuery<Athlete>(`/api/v1/athletes/${id}`, { enabled: !!id })
}

export function useReferees() {
    return useApiQuery<Referee[]>('/api/v1/referees/')
}

export function useReferee(id: string) {
    return useApiQuery<Referee>(`/api/v1/referees/${id}`, { enabled: !!id })
}

export function useTeams() {
    return useApiQuery<any[]>('/api/v1/teams/')
}

// Athlete profiles (V2 dedicated endpoints)
export function useAthleteProfile(id: string) {
    return useApiQuery<AthleteProfile>(`/api/v1/athlete-profiles/${id}`, { enabled: !!id })
}

export function useAthleteProfiles(params?: { province?: string; club?: string }) {
    const qs = new URLSearchParams()
    if (params?.province) qs.set('province', params.province)
    if (params?.club) qs.set('club', params.club)
    const query = qs.toString()
    return useApiQuery<AthleteProfile[]>(`/api/v1/athlete-profiles${query ? '?' + query : ''}`)
}

// Coaches via generic entity
export function useCoaches() {
    return useApiQuery<Coach[]>('/api/v1/coaches')
}

export function useCoach(id: string) {
    return useApiQuery<Coach>(`/api/v1/coaches/${id}`, { enabled: !!id })
}
