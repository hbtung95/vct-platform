'use client'

import { useApiQuery, useApiMutation } from './useApiQuery'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — CLUB API HOOKS (V2)
// Typed React hooks for club dashboard, attendance, equipment, facilities.
// ═══════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────

export interface ClubDashboard {
    total_members: number; active_members: number
    total_classes: number; monthly_revenue: number
    attendance_rate: number; equipment_count: number
    facility_count: number
}

export interface ClubAttendanceRecord {
    id: string; club_id: string; student_id: string
    student_name?: string; class_id?: string; class_name?: string
    date: string; status: 'present' | 'absent' | 'late' | 'excused'
    checked_in_at?: string; notes?: string
}

export interface ClubAttendanceSummary {
    total_sessions: number; average_attendance: number
    attendance_rate: number; by_class: Record<string, number>
}

export interface ClubEquipment {
    id: string; club_id: string; name: string; type: string
    quantity: number; condition: 'new' | 'good' | 'fair' | 'poor' | 'broken'
    purchase_date?: string; value?: number; notes?: string
}

export interface ClubEquipmentSummary {
    total_items: number; total_value: number
    by_condition: Record<string, number>; by_type: Record<string, number>
}

export interface ClubFacility {
    id: string; club_id: string; name: string; type: string
    capacity: number; area_sqm?: number
    status: 'active' | 'maintenance' | 'closed'
    address?: string; notes?: string
}

export interface ClubFacilitySummary {
    total_facilities: number; total_capacity: number
    by_status: Record<string, number>; by_type: Record<string, number>
}

export interface ClubClass {
    id: string; name: string; schedule?: string; instructor?: string
    level?: string; max_students?: number; current_students?: number
    status?: string; fee?: number
}

// ── Query Hooks ──────────────────────────────────────────────

export function useClubDashboard(clubId?: string) {
    const qs = clubId ? `?club_id=${clubId}` : ''
    return useApiQuery<{ data: ClubDashboard }>(`/api/v1/club/dashboard${qs}`)
}

export function useClubAttendance(clubId?: string, params?: { date?: string; class_id?: string }) {
    const qs = new URLSearchParams()
    if (clubId) qs.set('club_id', clubId)
    if (params?.date) qs.set('date', params.date)
    if (params?.class_id) qs.set('class_id', params.class_id)
    const query = qs.toString()
    return useApiQuery<{ data: { records: ClubAttendanceRecord[]; total: number } }>(`/api/v1/club/attendance${query ? '?' + query : ''}`)
}

export function useClubAttendanceSummary(clubId?: string) {
    const qs = clubId ? `?club_id=${clubId}` : ''
    return useApiQuery<{ data: ClubAttendanceSummary }>(`/api/v1/club/attendance/summary${qs}`)
}

export function useClubEquipment(clubId?: string) {
    const qs = clubId ? `?club_id=${clubId}` : ''
    return useApiQuery<{ data: { items: ClubEquipment[]; total: number } }>(`/api/v1/club/equipment${qs}`)
}

export function useClubEquipmentSummary(clubId?: string) {
    const qs = clubId ? `?club_id=${clubId}` : ''
    return useApiQuery<{ data: ClubEquipmentSummary }>(`/api/v1/club/equipment/summary${qs}`)
}

export function useClubFacilities(clubId?: string) {
    const qs = clubId ? `?club_id=${clubId}` : ''
    return useApiQuery<{ data: { items: ClubFacility[]; total: number } }>(`/api/v1/club/facilities${qs}`)
}

export function useClubFacilitySummary(clubId?: string) {
    const qs = clubId ? `?club_id=${clubId}` : ''
    return useApiQuery<{ data: ClubFacilitySummary }>(`/api/v1/club/facilities/summary${qs}`)
}

// Club classes via generic entity
export function useClubClasses(clubId?: string) {
    const qs = clubId ? `?club_id=${clubId}` : ''
    return useApiQuery<ClubClass[]>(`/api/v1/club_classes${qs}`)
}

// ── Mutation Hooks ───────────────────────────────────────────

export function useRecordClubAttendance() {
    return useApiMutation<Partial<ClubAttendanceRecord>, { data: ClubAttendanceRecord }>('POST', '/api/v1/club/attendance')
}

export function useCreateClubEquipment() {
    return useApiMutation<Partial<ClubEquipment>, { data: ClubEquipment }>('POST', '/api/v1/club/equipment')
}

export function useCreateClubFacility() {
    return useApiMutation<Partial<ClubFacility>, { data: ClubFacility }>('POST', '/api/v1/club/facilities')
}
