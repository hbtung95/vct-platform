'use client'

import { useApiQuery, useApiMutation } from './useApiQuery'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — ADMIN API HOOKS
// Typed React hooks for admin workspace: users, audit logs,
// system config, data quality, documents, notifications, integrity,
// tournaments, people, finance, federation, clubs, scoring, rankings.
//
// Hooks are wired to backend endpoints. When the API returns an
// error (e.g. 404), pages gracefully fall back to mock data.
// ═══════════════════════════════════════════════════════════════

// ── Types (original) ────────────────────────────────────────

export interface AdminUser {
    id: string; name: string; email: string; phone: string
    role: string; scope: string
    status: 'active' | 'inactive' | 'locked'
    last_login: string; created_at: string; avatar_letter: string
}

export interface AuditLogEntry {
    id: string; severity: string; timestamp: string
    user: string; role: string; action: string
    resource: string; detail: string; ip: string
}

export interface SystemConfigParam {
    key: string; value: string; description: string; editable: boolean
}

export interface BackupEntry {
    id: string; date: string; size: string
    type: string; status: string
}

export interface DataQualityScore {
    table: string; overall: number
    completeness: number; accuracy: number
    consistency: number; timeliness: number
}

export interface DataQualityRule {
    id: string; table: string; rule: string
    type: string; severity: string
    last_run: string; result: string; detail: string
}

export interface DocumentTemplate {
    id: string; type: string; name: string
    version: number; is_active: boolean
    fields: string[]; federation: string | null
    issued_count: number
}

export interface IssuedDocument {
    id: string; doc_number: string; type: string
    recipient: string; issued_at: string
    status: string; verification_code: string
}

export interface NotificationTemplate {
    id: string; category: string; channel: string
    locale: string; title: string
    variables: string[]; version: number; is_active: boolean
}

export interface NotificationStat {
    category: string; total: number
    delivered: number; failed: number
    read: number; rate: number
}

export interface IntegrityAlert {
    id: string; severity: string; type: string
    tournament: string; detail: string
    status: string; assigned_to: string | null
    reported_at: string
}

// ── Types (new domains) ─────────────────────────────────────

export interface AdminTournament {
    id: string; name: string; type: string
    status: 'draft' | 'registration' | 'in_progress' | 'completed' | 'cancelled'
    start_date: string; end_date: string; location: string
    athletes_count: number; events_count: number
    organizer: string; budget: string
}

export interface AdminPerson {
    id: string; name: string; dob: string; gender: string
    club: string; province: string; phone: string; email: string
    type: 'athlete' | 'coach' | 'referee'
    status: 'active' | 'pending' | 'suspended' | 'retired'
    belt?: string; weight_class?: string
    cert_level?: string; specialization?: string
}

export interface AdminInvoice {
    id: string; tournament: string; payer: string
    amount: number; type: string
    status: 'pending' | 'paid' | 'overdue' | 'cancelled'
    due_date: string; paid_date?: string
}

export interface AdminFederation {
    id: string; name: string; type: 'national' | 'provincial' | 'sub_association'
    president: string; members: number; clubs: number; athletes: number
    status: 'active' | 'pending' | 'suspended'
}

export interface AdminClub {
    id: string; name: string; province: string; head_coach: string
    members: number; athletes: number; status: 'active' | 'pending' | 'suspended'
    equipment_score: number
}

export interface AdminLiveMatch {
    id: string; event_name: string; category: string
    athlete_red: string; athlete_blue: string
    score_red: number; score_blue: number
    round: number; max_rounds: number
    status: 'live' | 'paused' | 'finished' | 'upcoming'
    arena: string; referee: string
}

export interface AdminRankedAthlete {
    id: string; rank: number; name: string; club: string
    elo: number; elo_change: number
    wins: number; losses: number; belt: string; weight_class: string
}

// ── Query Hooks (original — now enabled) ────────────────────

/** Fetch system users list — GET /api/v1/admin/users */
export function useAdminUsers(params?: { role?: string; status?: string }) {
    const qs = new URLSearchParams()
    if (params?.role) qs.set('role', params.role)
    if (params?.status) qs.set('status', params.status)
    const query = qs.toString()
    return useApiQuery<{ data: AdminUser[]; total: number }>(
        `/api/v1/admin/users${query ? '?' + query : ''}`
    )
}

/** Fetch audit logs — GET /api/v1/admin/audit-logs */
export function useAuditLogs(params?: { severity?: string; action?: string }) {
    const qs = new URLSearchParams()
    if (params?.severity) qs.set('severity', params.severity)
    if (params?.action) qs.set('action', params.action)
    const query = qs.toString()
    return useApiQuery<{ data: AuditLogEntry[]; total: number }>(
        `/api/v1/admin/audit-logs${query ? '?' + query : ''}`
    )
}

/** Fetch system config — GET /api/v1/admin/system/config */
export function useSystemConfig() {
    return useApiQuery<{ data: { params: SystemConfigParam[]; backups: BackupEntry[] } }>(
        '/api/v1/admin/system/config'
    )
}

/** Fetch data quality scores + rules — GET /api/v1/admin/data-quality */
export function useDataQuality() {
    return useApiQuery<{ data: { scores: DataQualityScore[]; rules: DataQualityRule[] } }>(
        '/api/v1/admin/data-quality'
    )
}

/** Fetch document templates + issued — GET /api/v1/admin/documents */
export function useDocumentTemplates() {
    return useApiQuery<{ data: { templates: DocumentTemplate[]; issued: IssuedDocument[] } }>(
        '/api/v1/admin/documents'
    )
}

/** Fetch notification templates + stats — GET /api/v1/admin/notifications */
export function useNotificationTemplates() {
    return useApiQuery<{ data: { templates: NotificationTemplate[]; stats: NotificationStat[] } }>(
        '/api/v1/admin/notifications'
    )
}

/** Fetch integrity alerts — GET /api/v1/admin/integrity */
export function useIntegrityAlerts() {
    return useApiQuery<{ data: IntegrityAlert[]; total: number }>(
        '/api/v1/admin/integrity'
    )
}

// ── Query Hooks (new domains) ───────────────────────────────

/** Fetch tournaments list — GET /api/v1/tournaments */
export function useTournamentAdmin() {
    return useApiQuery<{ data: AdminTournament[]; total: number }>(
        '/api/v1/tournaments'
    )
}

/** Fetch people (athletes/coaches/referees) — GET /api/v1/athletes */
export function usePeopleAdmin(type?: string) {
    const path = type === 'coach' ? '/api/v1/referees' : type === 'referee' ? '/api/v1/referees' : '/api/v1/athletes'
    return useApiQuery<{ data: AdminPerson[]; total: number }>(path)
}

/** Fetch invoices — GET /api/v1/finance/invoices */
export function useFinanceAdmin() {
    return useApiQuery<{ data: AdminInvoice[]; total: number }>(
        '/api/v1/finance/invoices'
    )
}

/** Fetch federation units — GET /api/v1/federation/provinces */
export function useFederationAdmin() {
    return useApiQuery<{ data: AdminFederation[]; total: number }>(
        '/api/v1/federation/provinces'
    )
}

/** Fetch clubs — GET /api/v1/clubs */
export function useClubAdmin() {
    return useApiQuery<{ data: AdminClub[]; total: number }>(
        '/api/v1/clubs'
    )
}

/** Fetch live matches — GET /api/v1/scoring/matches */
export function useScoringAdmin() {
    return useApiQuery<{ data: AdminLiveMatch[]; total: number }>(
        '/api/v1/scoring/matches',
        { refetchInterval: 5000 } // Poll every 5s for live data
    )
}

/** Fetch rankings — GET /api/v1/rankings */
export function useRankingAdmin(weightClass?: string) {
    const qs = weightClass ? `?weight_class=${weightClass}` : ''
    return useApiQuery<{ data: AdminRankedAthlete[]; total: number }>(
        `/api/v1/rankings${qs}`
    )
}

// ── Mutation Hooks (original) ───────────────────────────────

/** Create a document template — POST /api/v1/admin/documents/templates */
export function useCreateDocTemplate() {
    return useApiMutation<Partial<DocumentTemplate>, { data: DocumentTemplate }>(
        'POST', '/api/v1/admin/documents/templates'
    )
}

/** Create a notification template — POST /api/v1/admin/notifications/templates */
export function useCreateNotifTemplate() {
    return useApiMutation<Partial<NotificationTemplate>, { data: NotificationTemplate }>(
        'POST', '/api/v1/admin/notifications/templates'
    )
}

/** Update system config param — PATCH /api/v1/admin/system/config */
export function useUpdateSystemConfig() {
    return useApiMutation<{ key: string; value: string }, { data: SystemConfigParam }>(
        'PATCH', '/api/v1/admin/system/config'
    )
}

/** Trigger system backup — POST /api/v1/admin/system/backup */
export function useCreateBackup() {
    return useApiMutation<{ type: string }, { data: BackupEntry }>(
        'POST', '/api/v1/admin/system/backup'
    )
}

/** Clear system cache — POST /api/v1/admin/system/cache/clear */
export function useClearCache() {
    return useApiMutation<Record<string, never>, { success: boolean }>(
        'POST', '/api/v1/admin/system/cache/clear'
    )
}

/** Create/update admin user — POST /api/v1/admin/users */
export function useCreateAdminUser() {
    return useApiMutation<Partial<AdminUser>, { data: AdminUser }>(
        'POST', '/api/v1/admin/users'
    )
}

/** Delete admin user — DELETE /api/v1/admin/users/:id */
export function useDeleteAdminUser(userId: string) {
    return useApiMutation<Record<string, never>, void>(
        'DELETE', `/api/v1/admin/users/${userId}`
    )
}

// ── Mutation Hooks (new domains) ────────────────────────────

/** Update tournament status — PATCH /api/v1/tournaments/:id */
export function useUpdateTournament(tournamentId: string) {
    return useApiMutation<Partial<AdminTournament>, { data: AdminTournament }>(
        'PATCH', `/api/v1/tournaments/${tournamentId}`
    )
}

/** Approve person (athlete/coach/referee) — POST /api/v1/athletes/:id/approve */
export function useApprovePerson(personId: string) {
    return useApiMutation<Record<string, never>, { data: AdminPerson }>(
        'POST', `/api/v1/athletes/${personId}/approve`
    )
}

/** Confirm invoice payment — POST /api/v1/finance/payments */
export function useConfirmPayment() {
    return useApiMutation<{ invoice_id: string }, { data: AdminInvoice }>(
        'POST', '/api/v1/finance/payments'
    )
}

/** Approve federation — POST /api/v1/federation/provinces/:id/approve */
export function useApproveFederation(fedId: string) {
    return useApiMutation<Record<string, never>, { data: AdminFederation }>(
        'POST', `/api/v1/federation/provinces/${fedId}/approve`
    )
}

/** Approve club — POST /api/v1/clubs/:id/approve */
export function useApproveClub(clubId: string) {
    return useApiMutation<Record<string, never>, { data: AdminClub }>(
        'POST', `/api/v1/clubs/${clubId}/approve`
    )
}

/** Override match score — POST /api/v1/scoring/matches/:id/override */
export function useOverrideScore(matchId: string) {
    return useApiMutation<{ score_red: number; score_blue: number }, { data: AdminLiveMatch }>(
        'POST', `/api/v1/scoring/matches/${matchId}/override`
    )
}

/** Adjust athlete ELO — PATCH /api/v1/rankings/:id/elo */
export function useAdjustElo(athleteId: string) {
    return useApiMutation<{ elo_delta: number; reason: string }, { data: AdminRankedAthlete }>(
        'PATCH', `/api/v1/rankings/${athleteId}/elo`
    )
}
