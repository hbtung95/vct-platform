'use client'

import { useApiQuery } from './useApiQuery'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — CALENDAR API HOOKS
// Aggregates events from tournaments and community events.
// ═══════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────

export interface CalendarEvent {
    id: string; title: string; start: string; end?: string
    type: 'tournament' | 'training' | 'meeting' | 'exam' | 'community' | 'other'
    location?: string; description?: string
    status?: string; color?: string
}

// ── Query Hooks ──────────────────────────────────────────────

export function useCalendarEvents(params?: { month?: string; year?: string }) {
    const qs = new URLSearchParams()
    if (params?.month) qs.set('month', params.month)
    if (params?.year) qs.set('year', params.year)
    const query = qs.toString()
    return useApiQuery<CalendarEvent[]>(`/api/v1/calendar_events${query ? '?' + query : ''}`)
}

// Also pull community events as calendar items
export function useTournamentCalendar() {
    return useApiQuery<any[]>('/api/v1/tournaments/')
}
