'use client'

import { useApiQuery } from './useApiQuery'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — PUBLIC API HOOKS
// No-auth hooks for spectator-facing data: scoreboard, brackets,
// schedule, medals, results, athlete search, stats.
// ═══════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────

export interface LiveScoreboard {
    combat_matches: any[]; form_performances: any[]; total_active: number
}

export interface PublicSchedule {
    entries: any[]; total: number
    filters: { date: string; arena: string }
}

export interface MedalTable {
    medals: any[]; total: number
}

export interface PublicResults {
    results: any[]; total: number
}

export interface AthleteSearchResult {
    athletes: any[]; total: number; query: string
}

export interface PublicStats {
    total_athletes: number; total_matches: number
    total_medals: number; total_teams: number
    categories: number; arenas: number
    tournament_name: string; tournament_date: string
    location: string
}

// ── Query Hooks ──────────────────────────────────────────────

export function usePublicScoreboard() {
    return useApiQuery<LiveScoreboard>('/api/v1/public/scoreboard')
}

export function usePublicBrackets() {
    return useApiQuery<any[]>('/api/v1/public/bracket/')
}

export function usePublicBracket(id: string) {
    return useApiQuery<any>(`/api/v1/public/bracket/${id}`, { enabled: !!id })
}

export function usePublicSchedule(params?: { date?: string; arena?: string }) {
    const qs = new URLSearchParams()
    if (params?.date) qs.set('date', params.date)
    if (params?.arena) qs.set('arena', params.arena)
    const query = qs.toString()
    return useApiQuery<PublicSchedule>(`/api/v1/public/schedule${query ? '?' + query : ''}`)
}

export function usePublicMedals() {
    return useApiQuery<MedalTable>('/api/v1/public/medals')
}

export function usePublicResults(category?: string) {
    const qs = category ? `?category=${encodeURIComponent(category)}` : ''
    return useApiQuery<PublicResults>(`/api/v1/public/results${qs}`)
}

export function usePublicAthleteSearch(query: string) {
    return useApiQuery<AthleteSearchResult>(
        `/api/v1/public/athletes/search?q=${encodeURIComponent(query)}`,
        { enabled: query.length > 0 }
    )
}

export function usePublicStats() {
    return useApiQuery<PublicStats>('/api/v1/public/stats')
}
