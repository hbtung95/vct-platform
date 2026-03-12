'use client'

import { useApiQuery, useApiMutation } from './useApiQuery'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — NOTIFICATION API HOOKS
// Hooks for recent domain events and notification management.
// ═══════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────

export interface DomainEvent {
    id: string; type: string; entity_type: string
    entity_id: string; action: string; actor_id?: string
    payload?: Record<string, any>; timestamp: string
    is_read?: boolean
}

export interface Notification {
    id: string; title: string; message: string
    type: 'info' | 'success' | 'warning' | 'error'
    is_read: boolean; created_at: string
    link?: string; entity_type?: string; entity_id?: string
}

// ── Query Hooks ──────────────────────────────────────────────

export function useRecentEvents() {
    return useApiQuery<DomainEvent[]>('/api/v1/events/recent', {
        refetchInterval: 30000, // Poll every 30s
    })
}

export function useNotifications() {
    return useApiQuery<Notification[]>('/api/v1/notifications')
}

export function useUnreadNotificationCount() {
    return useApiQuery<{ count: number }>('/api/v1/notifications/unread-count')
}

// ── Mutation Hooks ───────────────────────────────────────────

export function useMarkNotificationRead() {
    return useApiMutation<{ id: string }, void>('PUT', '/api/v1/notifications/mark-read')
}

export function useMarkAllNotificationsRead() {
    return useApiMutation<void, void>('PUT', '/api/v1/notifications/mark-all-read')
}
