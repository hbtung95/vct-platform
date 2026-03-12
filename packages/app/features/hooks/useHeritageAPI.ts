'use client'

import { useApiQuery, useApiMutation } from './useApiQuery'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — HERITAGE API HOOKS
// Typed React hooks for belt ranks, techniques, and lineage tree.
// ═══════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────

export interface BeltRank {
    id: string; name: string; level: number; color_hex?: string
    required_time_min?: number; is_dan_level?: boolean
    description?: string; requirements?: string
}

export interface Technique {
    id: string; name: string; category: string; description?: string
    difficulty?: string; belt_level?: string; video_url?: string
    origin?: string; variations?: string[]
}

export interface LineageNode {
    id: string; name: string; title?: string; era?: string
    description?: string; parent_id?: string
    children?: LineageNode[]
}

// ── Query Hooks ──────────────────────────────────────────────

export function useBeltRanks() {
    return useApiQuery<BeltRank[]>('/api/v1/belts/')
}

export function useBeltRank(id: string) {
    return useApiQuery<BeltRank>(`/api/v1/belts/${id}`, { enabled: !!id })
}

export function useTechniques(category?: string) {
    const qs = category ? `?loai=${encodeURIComponent(category)}` : ''
    return useApiQuery<Technique[]>(`/api/v1/techniques/${qs}`)
}

export function useTechnique(id: string) {
    return useApiQuery<Technique>(`/api/v1/techniques/${id}`, { enabled: !!id })
}

// Lineage — uses generic entity endpoint
export function useLineageTree() {
    return useApiQuery<LineageNode[]>('/api/v1/lineage_trees')
}

// ── Mutation Hooks ───────────────────────────────────────────

export function useCreateBeltRank() {
    return useApiMutation<Partial<BeltRank>, BeltRank>('POST', '/api/v1/belts/')
}

export function useCreateTechnique() {
    return useApiMutation<Partial<Technique>, Technique>('POST', '/api/v1/techniques/')
}
