'use client'

import { apiClient } from './api-client'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — BTC API CLIENT
// Typed API functions for all BTC (Ban Tổ Chức) endpoints.
// Uses the shared apiClient with retry + error handling.
// ═══════════════════════════════════════════════════════════════

// ── Types ───────────────────────────────────────────────────

export interface BTCMember {
    id: string
    ten: string
    chuc_vu: string
    ban: string
    cap: number
    sdt: string
    email: string
    don_vi: string
    giai_id: string
    is_active: boolean
}

export interface WeighInRecord {
    id: string
    giai_id: string
    vdv_id: string
    vdv_ten: string
    doan_id: string
    doan_ten: string
    hang_can: string
    can_nang: number
    gioi_han: number
    sai_so: number
    ket_qua: 'dat' | 'khong_dat'
    lan_can: number
    nguoi_can: string
    thoi_gian: string
    created_at: string
}

export interface DrawInput {
    giai_id: string
    noi_dung_id: string
    noi_dung_ten: string
    loai: 'doi_khang' | 'quyen'
    vdv_ids: string[]
    vdv_tens: string[]
}

export interface DrawResult {
    id: string
    giai_id: string
    noi_dung_id: string
    noi_dung_ten: string
    loai: 'doi_khang' | 'quyen'
    branches?: DrawBranch[]
    order?: DrawOrder[]
    created_at: string
    created_by: string
}

export interface DrawBranch {
    nhanh: string
    vi_tri: number
    vdv_id: string
    vdv_ten: string
}

export interface DrawOrder {
    thu_tu: number
    vdv_id: string
    vdv_ten: string
}

export interface RefereeAssignment {
    id: string
    giai_id: string
    trong_tai_id: string
    trong_tai_ten: string
    cap_bac: string
    chuyen_mon: string
    san_id: string
    san_ten: string
    ngay: string
    phien: string
    vai_tro: string
    trang_thai: string
    created_at: string
}

export interface TeamResult {
    id: string
    giai_id: string
    doan_id: string
    doan_ten: string
    tinh: string
    hcv: number
    hcb: number
    hcd: number
    tong_hc: number
    diem: number
    xep_hang: number
}

export interface FinanceEntry {
    id: string
    giai_id: string
    loai: 'thu' | 'chi'
    danh_muc: string
    mo_ta: string
    so_tien: number
    doan_id?: string
    doan_ten?: string
    trang_thai: string
    ngay_gd: string
    created_by: string
    created_at: string
}

export interface TechnicalMeeting {
    id: string
    giai_id: string
    tieu_de: string
    ngay: string
    dia_diem: string
    chu_tri: string
    tham_du: string[]
    noi_dung: string
    quyet_dinh: string[]
    trang_thai: string
    created_at: string
}

export interface Protest {
    id: string
    giai_id: string
    tran_id: string
    tran_mo_ta: string
    nguoi_nop: string
    doan_ten: string
    loai_kn: string
    ly_do: string
    trang_thai: string
    quyet_dinh?: string
    nguoi_xl?: string
    has_video: boolean
    ngay_nop: string
    created_at: string
}

export interface BTCStats {
    tong_vdv: number
    tong_doan: number
    tong_tran: number
    tong_huy_chuong: number
    da_can_ky: number
    chua_can_ky: number
    ty_le_dat_can: number
    tong_trong_tai: number
    da_phan_cong: number
    tong_khieu_nai: number
    kn_cho_xu_ly: number
    tong_thu: number
    tong_chi: number
}

export interface FinanceSummary {
    tong_thu: number
    tong_chi: number
    so_du: number
    so_but: number
}

// ── API Functions ───────────────────────────────────────────

const q = (giaiId?: string) => (giaiId ? `?giai_id=${giaiId}` : '')

export const btcApi = {
    // Members
    listMembers: (token: string, giaiId?: string) =>
        apiClient.get<{ data: BTCMember[] }>(`/api/v1/btc/members${q(giaiId)}`, token),
    getMember: (token: string, id: string) =>
        apiClient.get<{ data: BTCMember }>(`/api/v1/btc/members/${id}`, token),
    createMember: (token: string, member: Partial<BTCMember>) =>
        apiClient.post<{ data: BTCMember }>('/api/v1/btc/members/create', member, token),
    updateMember: (token: string, id: string, member: Partial<BTCMember>) =>
        apiClient.patch<{ data: BTCMember }>(`/api/v1/btc/members/${id}`, member, token),
    deleteMember: (token: string, id: string) =>
        apiClient.delete<{ data: { status: string } }>(`/api/v1/btc/members/${id}`, token),

    // Weigh-In
    listWeighIns: (token: string, giaiId?: string) =>
        apiClient.get<{ data: WeighInRecord[] }>(`/api/v1/btc/weigh-in${q(giaiId)}`, token),
    createWeighIn: (token: string, record: Partial<WeighInRecord>) =>
        apiClient.post<{ data: WeighInRecord }>('/api/v1/btc/weigh-in/create', record, token),

    // Draw
    listDraws: (token: string, giaiId?: string) =>
        apiClient.get<{ data: DrawResult[] }>(`/api/v1/btc/draws${q(giaiId)}`, token),
    generateDraw: (token: string, input: DrawInput) =>
        apiClient.post<{ data: DrawResult }>('/api/v1/btc/draws/generate', input, token),

    // Referee Assignments
    listAssignments: (token: string, giaiId?: string) =>
        apiClient.get<{ data: RefereeAssignment[] }>(`/api/v1/btc/referee-assignments${q(giaiId)}`, token),
    createAssignment: (token: string, assignment: Partial<RefereeAssignment>) =>
        apiClient.post<{ data: RefereeAssignment }>('/api/v1/btc/referee-assignments/create', assignment, token),

    // Results
    listTeamResults: (token: string, giaiId?: string) =>
        apiClient.get<{ data: TeamResult[] }>(`/api/v1/btc/results${q(giaiId)}`, token),
    listContentResults: (token: string, giaiId?: string) =>
        apiClient.get<{ data: TeamResult[] }>(`/api/v1/btc/results/content${q(giaiId)}`, token),

    // Finance
    listFinance: (token: string, giaiId?: string) =>
        apiClient.get<{ data: FinanceEntry[] }>(`/api/v1/btc/finance${q(giaiId)}`, token),
    createFinance: (token: string, entry: Partial<FinanceEntry>) =>
        apiClient.post<{ data: FinanceEntry }>('/api/v1/btc/finance/create', entry, token),
    getFinanceSummary: (token: string, giaiId?: string) =>
        apiClient.get<{ data: FinanceSummary }>(`/api/v1/btc/finance/summary${q(giaiId)}`, token),

    // Technical Meetings
    listMeetings: (token: string, giaiId?: string) =>
        apiClient.get<{ data: TechnicalMeeting[] }>(`/api/v1/btc/meetings${q(giaiId)}`, token),
    createMeeting: (token: string, meeting: Partial<TechnicalMeeting>) =>
        apiClient.post<{ data: TechnicalMeeting }>('/api/v1/btc/meetings/create', meeting, token),

    // Protests
    listProtests: (token: string, giaiId?: string) =>
        apiClient.get<{ data: Protest[] }>(`/api/v1/btc/protests${q(giaiId)}`, token),
    createProtest: (token: string, protest: Partial<Protest>) =>
        apiClient.post<{ data: Protest }>('/api/v1/btc/protests/create', protest, token),
    updateProtest: (token: string, id: string, body: { trang_thai: string; nguoi_xl?: string; quyet_dinh?: string }) =>
        apiClient.patch<{ data: { status: string } }>(`/api/v1/btc/protests/${id}`, body, token),

    // Stats
    getStats: (token: string, giaiId?: string) =>
        apiClient.get<{ data: BTCStats }>(`/api/v1/btc/stats${q(giaiId)}`, token),
}
