'use client'

import { useCallback, useMemo } from 'react'
import { useApiQuery, useApiMutation } from './useApiQuery'
import { useAuth } from '../auth/AuthProvider'
import { apiClient } from '../data/api-client'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — COMMUNITY API HOOKS
// Typed React hooks for community posts, events, groups, clubs, members.
// ═══════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────

type ClubStatusUi = 'active' | 'suspended' | 'closed'

export interface Club {
  id: string
  name: string
  short_name?: string
  code?: string
  type?: string
  province?: string
  address?: string
  leader_name?: string
  master_name?: string
  phone?: string
  email?: string
  status?: ClubStatusUi
  member_count?: number
  total_members?: number
  active_classes?: number
  founded_date?: string
  org_id?: string
  created_at?: string
}

interface ClubApiModel {
  id?: string
  name?: string
  ten?: string
  short_name?: string
  code?: string
  ma?: string
  type?: string
  province?: string
  tinh?: string
  address?: string
  dia_chi?: string
  leader_name?: string
  master_name?: string
  chu_nhiem?: string
  phone?: string
  sdt?: string
  email?: string
  status?: string
  trang_thai?: string
  member_count?: number
  total_members?: number
  so_hoc_vien?: number
  active_classes?: number
  founded_date?: string
  org_id?: string
  created_at?: string
}

export interface Member {
  id: string
  club_id: string
  name?: string
  ho_ten?: string
  role?: string
  belt?: string
  phone?: string
  email?: string
  status?: string
  joined_at?: string
}

export interface CommunityEvent {
  id: string
  title: string
  description?: string
  location?: string
  date?: string
  start_date?: string
  end_date?: string
  type?: string
  status?: string
  organizer?: string
  max_participants?: number
  registered_count?: number
}

export interface Post {
  id: string
  author: string
  avatar?: string
  content: string
  type?: 'announcement' | 'achievement' | 'tutorial' | 'update' | 'discussion'
  likes?: number
  comments?: number
  created_at?: string
  image_url?: string
  tags?: string[]
}

export interface CommunityGroup {
  id: string
  name: string
  description?: string
  member_count?: number
  category?: string
  is_public?: boolean
  created_at?: string
}

const normalizeClubStatus = (value?: string): ClubStatusUi | undefined => {
  switch ((value ?? '').toLowerCase()) {
    case 'hoat_dong':
    case 'active':
      return 'active'
    case 'tam_nghi':
    case 'suspended':
      return 'suspended'
    case 'giai_the':
    case 'closed':
      return 'closed'
    default:
      return undefined
  }
}

const toApiClubStatus = (value?: ClubStatusUi): string | undefined => {
  switch (value) {
    case 'active':
      return 'hoat_dong'
    case 'suspended':
      return 'tam_nghi'
    case 'closed':
      return 'giai_the'
    default:
      return undefined
  }
}

const normalizeClub = (input: ClubApiModel): Club => ({
  id: input.id ?? '',
  name: input.name ?? input.ten ?? '',
  short_name: input.short_name,
  code: input.code ?? input.ma,
  type: input.type,
  province: input.province ?? input.tinh,
  address: input.address ?? input.dia_chi,
  leader_name: input.leader_name ?? input.chu_nhiem,
  master_name: input.master_name ?? input.chu_nhiem,
  phone: input.phone ?? input.sdt,
  email: input.email,
  status: normalizeClubStatus(input.status ?? input.trang_thai),
  member_count: input.member_count ?? input.total_members ?? input.so_hoc_vien,
  total_members: input.total_members ?? input.so_hoc_vien,
  active_classes: input.active_classes,
  founded_date: input.founded_date,
  org_id: input.org_id,
  created_at: input.created_at,
})

const toApiClubPayload = (payload: Partial<Club>) => {
  const mapped: Record<string, unknown> = {}
  if (payload.name !== undefined) mapped.ten = payload.name
  if (payload.address !== undefined) mapped.dia_chi = payload.address
  if (payload.province !== undefined) mapped.tinh = payload.province
  if (payload.leader_name !== undefined || payload.master_name !== undefined) {
    mapped.chu_nhiem = payload.leader_name ?? payload.master_name
  }
  if (payload.phone !== undefined) mapped.sdt = payload.phone
  if (payload.email !== undefined) mapped.email = payload.email
  if (payload.status !== undefined) mapped.trang_thai = toApiClubStatus(payload.status)
  return mapped
}

// ── Query Hooks ──────────────────────────────────────────────

export function useClubs(params?: { search?: string }) {
  const qs = params?.search ? `?search=${encodeURIComponent(params.search)}` : ''
  const query = useApiQuery<ClubApiModel[]>(`/api/v1/clubs${qs}`)
  const data = useMemo(() => query.data?.map(normalizeClub) ?? null, [query.data])
  return { ...query, data }
}

export function useClub(id: string) {
  const query = useApiQuery<ClubApiModel>(`/api/v1/clubs/${id}`, { enabled: !!id })
  const data = useMemo(() => (query.data ? normalizeClub(query.data) : null), [query.data])
  return { ...query, data }
}

export function useMembers(clubId?: string) {
  const qs = clubId ? `?clubId=${clubId}` : ''
  return useApiQuery<Member[]>(`/api/v1/members${qs}`)
}

export function useCommunityEvents() {
  return useApiQuery<CommunityEvent[]>('/api/v1/community-events')
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
  const { token } = useAuth()
  return useCallback(
    async (payload: Partial<Club>) => {
      const created = await apiClient.post<ClubApiModel>(
        '/api/v1/clubs',
        toApiClubPayload(payload),
        token ?? undefined
      )
      return normalizeClub(created)
    },
    [token]
  )
}

export function useUpdateClub() {
  const { token } = useAuth()
  return useCallback(
    async (id: string, payload: Partial<Club>) => {
      const updated = await apiClient.patch<ClubApiModel>(
        `/api/v1/clubs/${id}`,
        toApiClubPayload(payload),
        token ?? undefined
      )
      return normalizeClub(updated)
    },
    [token]
  )
}

export function useDeleteClub() {
  const { token } = useAuth()
  return useCallback(
    async (id: string) => {
      await apiClient.delete(`/api/v1/clubs/${id}`, token ?? undefined)
    },
    [token]
  )
}

export function useCreateMember() {
  return useApiMutation<Partial<Member>, Member>('POST', '/api/v1/members')
}

export function useCreateCommunityEvent() {
  return useApiMutation<Partial<CommunityEvent>, CommunityEvent>('POST', '/api/v1/community-events')
}
