// ════════════════════════════════════════════════════════════════
// VCT PLATFORM — ATHLETE DOMAIN TYPES
// ════════════════════════════════════════════════════════════════

import type {
    GioiTinh, TrangThaiVDV, TrangThaiDK, LoaiNoiDung,
    CapBacTT, ChuyenMonTT, TrangThaiTT, KetQuaCan,
} from './common';

export interface VanDongVien {
    id: string;
    ho_ten: string;
    gioi: GioiTinh;
    ngay_sinh: string;
    tuoi: number;
    can_nang: number;
    chieu_cao: number;
    doan_id: string;
    doan_ten: string;
    nd_quyen: string[];
    nd_dk: string;
    trang_thai: TrangThaiVDV;
    ho_so: {
        kham_sk: boolean;
        bao_hiem: boolean;
        anh: boolean;
        cmnd: boolean;
    };
    ghi_chu: string;
}

export interface DangKy {
    id: string;
    vdv_id: string;
    vdv_ten: string;
    doan_id: string;
    doan_ten: string;
    loai: LoaiNoiDung;
    nd_id: string;
    nd_ten: string;
    trang_thai: TrangThaiDK;
    ngay: string;
}

export interface TrongTai {
    id: string;
    ho_ten: string;
    gioi: GioiTinh;
    ngay_sinh: string;
    cap_bac: CapBacTT;
    chuyen_mon: ChuyenMonTT;
    don_vi: string;
    sdt: string;
    email: string;
    trang_thai: TrangThaiTT;
    kinh_nghiem: string;
    ghi_chu: string;
}

export interface CanKy {
    id: string;
    vdv_id: string;
    vdv_ten: string;
    doan_ten: string;
    gioi: GioiTinh;
    hang_can_dk: string;
    can_tu: number;
    can_den: number;
    can_thuc_te: number;
    ket_qua: KetQuaCan;
    ghi_chu: string;
    thoi_gian: string;
}

export type ProfileStatus = "draft" | "active" | "inactive";
export type MembershipStatus = "pending" | "active" | "inactive";
export type MembershipRole = "member" | "captain";
export type ProfileEntryStatus = "nhap" | "thieu_ho_so" | "cho_xac_nhan" | "du_dieu_kien" | "bi_tu_choi";
export type BeltRank =
    | "none"
    | "yellow"
    | "green"
    | "blue"
    | "red"
    | "so_dang"
    | "nhat_dang"
    | "nhi_dang"
    | "tam_dang"
    | "tu_dang"
    | "ngu_dang";

export interface HoSoChecklist {
    kham_sk: boolean;
    bao_hiem: boolean;
    anh: boolean;
    cmnd: boolean;
}

export interface AthleteProfile {
    id: string;
    user_id: string;
    full_name: string;
    gender: string;
    date_of_birth: string;
    weight: number;
    height: number;
    belt_rank: BeltRank;
    belt_label: string;
    coach_name?: string;
    phone?: string;
    email?: string;
    photo_url?: string;
    ho_so: HoSoChecklist;
    status: ProfileStatus;
    total_clubs: number;
    total_tournaments: number;
    total_medals: number;
    elo_rating: number;
    created_at: string;
    updated_at: string;
}

export interface ClubMembership {
    id: string;
    athlete_id: string;
    club_id: string;
    club_name: string;
    role: MembershipRole;
    join_date: string;
    status: MembershipStatus;
    coach_name?: string;
    province_id?: string;
    created_at: string;
    updated_at: string;
}

export interface TournamentEntry {
    id: string;
    athlete_id: string;
    athlete_name: string;
    tournament_id: string;
    tournament_name: string;
    doan_id: string;
    doan_name: string;
    categories: string[];
    ho_so: HoSoChecklist;
    status: ProfileEntryStatus;
    weigh_in_result?: string;
    start_date?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}
