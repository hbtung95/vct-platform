'use client'

import { useApiQuery, useApiMutation } from './useApiQuery'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — COMMUNITY API HOOKS
// Typed React hooks for community posts, events, groups, clubs, members.
// ═══════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────

export interface Club {
    id: string; name: string; short_name?: string; type?: string
    province?: string; address?: string; leader_name?: string
    phone?: string; email?: string; status?: string
    member_count?: number; created_at?: string
}

export interface Member {
    id: string; club_id: string; name?: string; ho_ten?: string
    role?: string; belt?: string; phone?: string; email?: string
    status?: string; joined_at?: string
}

export interface CommunityEvent {
    id: string; title: string; description?: string
    location?: string; date?: string; start_date?: string; end_date?: string
    type?: string; status?: string; organizer?: string
    max_participants?: number; registered_count?: number
}

export interface Post {
    id: string; author: string; avatar?: string; content: string
    type?: 'announcement' | 'achievement' | 'tutorial' | 'update' | 'discussion'
    likes?: number; comments?: number; created_at?: string
    image_url?: string; tags?: string[]
}

export interface CommunityGroup {
    id: string; name: string; description?: string
    member_count?: number; category?: string; is_public?: boolean
    created_at?: string
}

// ── Query Hooks ──────────────────────────────────────────────

export function useClubs(params?: { search?: string }) {
    const qs = params?.search ? `?search=${encodeURIComponent(params.search)}` : ''
    return useApiQuery<Club[]>(`/api/v1/clubs/${qs}`)
}

export function useClub(id: string) {
    return useApiQuery<Club>(`/api/v1/clubs/${id}`, { enabled: !!id })
}

export function useMembers(clubId?: string) {
    const qs = clubId ? `?clubId=${clubId}` : ''
    return useApiQuery<Member[]>(`/api/v1/members/${qs}`)
}

export function useCommunityEvents() {
    return useApiQuery<CommunityEvent[]>('/api/v1/community-events/')
}

// Posts — uses generic entity endpoint (community_posts)
export function useCommunityPosts() {
    return useApiQuery<Post[]>('/api/v1/community_posts')
}

export function useCommunityGroups() {
    return useApiQuery<CommunityGroup[]>('/api/v1/community_groups')
}

// ── Mutation Hooks ───────────────────────────────────────────

export function useCreateClub() {
    return useApiMutation<Partial<Club>, Club>('POST', '/api/v1/clubs/')
}

export function useCreateMember() {
    return useApiMutation<Partial<Member>, Member>('POST', '/api/v1/members/')
}

export function useCreateCommunityEvent() {
    return useApiMutation<Partial<CommunityEvent>, CommunityEvent>('POST', '/api/v1/community-events/')
}
