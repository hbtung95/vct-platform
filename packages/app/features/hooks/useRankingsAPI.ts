'use client'

import { useApiQuery } from './useApiQuery'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — RANKINGS API HOOKS
// Typed React hooks for athlete & team rankings.
// ═══════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────

export interface AthleteRanking {
    id: string; rank: number; name: string; club: string
    points: number; change?: number; category?: string
    province?: string; belt?: string; gender?: string
    history?: number[]
}

export interface TeamRanking {
    id: string; rank: number; name: string; province?: string
    points: number; gold: number; silver: number; bronze: number
    total_medals: number
}

// ── Query Hooks ──────────────────────────────────────────────

export function useAthleteRankings(category?: string) {
    const qs = category ? `?category=${encodeURIComponent(category)}` : ''
    return useApiQuery<AthleteRanking[]>(`/api/v1/rankings/athletes${qs}`)
}

export function useTeamRankings() {
    return useApiQuery<TeamRanking[]>('/api/v1/rankings/teams')
}

export function useAthleteRanking(id: string) {
    return useApiQuery<AthleteRanking>(`/api/v1/rankings/${id}`, { enabled: !!id })
}
