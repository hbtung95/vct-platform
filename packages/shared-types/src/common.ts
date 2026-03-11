// ════════════════════════════════════════════════════════════════
// VCT PLATFORM — CANONICAL TYPE DEFINITIONS
// Single Source of Truth for all enums, interfaces, and status maps
// ════════════════════════════════════════════════════════════════

// ── Enum Arrays (usable by Zod .enum()) ──────────────────────

export const TRANG_THAI_GIAI_VALUES = ['nhap', 'dang_ky', 'khoa_dk', 'thi_dau', 'ket_thuc'] as const;
export const CAP_DO_GIAI_VALUES = ['quoc_gia', 'khu_vuc', 'tinh', 'clb'] as const;
export const GIOI_TINH_VALUES = ['nam', 'nu'] as const;
export const LOAI_NOI_DUNG_VALUES = ['doi_khang', 'quyen', 'quyen_dong_doi', 'song_luyen', 'nhieu_luyen', 'binh_khi', 'vu_khi_doi_luyen', 'bieu_dien_chien_luoc', 'tu_ve'] as const;
export const TRANG_THAI_ND_VALUES = ['active', 'draft', 'closed'] as const;
export const HINH_THUC_QUYEN_VALUES = ['ca_nhan', 'doi', 'dong_doi'] as const;
export const TRANG_THAI_SAN_VALUES = ['dong', 'san_sang', 'dang_chuan_bi', 'dang_thi_dau', 'su_co', 'bao_tri'] as const;
export const LOAI_SAN_VALUES = ['quyen', 'doi_khang', 'ca_hai'] as const;
export const TRANG_THAI_DOAN_VALUES = ['nhap', 'cho_duyet', 'yeu_cau_bo_sung', 'da_xac_nhan', 'da_checkin', 'tu_choi'] as const;
export const LOAI_DOAN_VALUES = ['doan_tinh', 'clb', 'ca_nhan'] as const;
export const TRANG_THAI_VDV_VALUES = ['du_dieu_kien', 'cho_xac_nhan', 'thieu_ho_so', 'nhap'] as const;
export const TRANG_THAI_DK_VALUES = ['da_duyet', 'cho_duyet', 'tu_choi'] as const;
export const CAP_BAC_TT_VALUES = ['quoc_gia', 'cap_1', 'cap_2', 'cap_3'] as const;
export const CHUYEN_MON_TT_VALUES = ['quyen', 'doi_khang', 'ca_hai'] as const;
export const TRANG_THAI_TT_VALUES = ['xac_nhan', 'cho_duyet', 'tu_choi'] as const;
export const KET_QUA_CAN_VALUES = ['dat', 'khong_dat', 'cho_can'] as const;
export const VONG_DAU_VALUES = ['vong_loai', 'tu_ket', 'ban_ket', 'chung_ket'] as const;
export const TRANG_THAI_TRAN_DAU_VALUES = ['chua_dau', 'dang_dau', 'ket_thuc'] as const;
export const TRANG_THAI_QUYEN_VALUES = ['cho_thi', 'dang_thi', 'da_cham', 'hoan'] as const;
export const TRANG_THAI_LICH_VALUES = ['du_kien', 'xac_nhan', 'dang_dien_ra', 'hoan_thanh'] as const;
export const PHIEN_THI_VALUES = ['sang', 'chieu', 'toi'] as const;
export const LOAI_KN_VALUES = ['khieu_nai', 'khang_nghi'] as const;
export const TRANG_THAI_KN_VALUES = ['moi', 'dang_xu_ly', 'chap_nhan', 'bac_bo'] as const;
export const LOAI_TAI_TRO_VALUES = ['chinh', 'vang', 'bac', 'dong_hanh'] as const;
export const TRANG_THAI_TRANG_BI_VALUES = ['tot', 'thieu', 'hong'] as const;

// ── Derived Type Aliases ─────────────────────────────────────

export type TrangThaiGiai = typeof TRANG_THAI_GIAI_VALUES[number];
export type CapDoGiai = typeof CAP_DO_GIAI_VALUES[number];
export type GioiTinh = typeof GIOI_TINH_VALUES[number];
export type LoaiNoiDung = typeof LOAI_NOI_DUNG_VALUES[number];
export type TrangThaiND = typeof TRANG_THAI_ND_VALUES[number];
export type HinhThucQuyen = typeof HINH_THUC_QUYEN_VALUES[number];
export type TrangThaiSan = typeof TRANG_THAI_SAN_VALUES[number];
export type LoaiSan = typeof LOAI_SAN_VALUES[number];
export type TrangThaiDoan = typeof TRANG_THAI_DOAN_VALUES[number];
export type LoaiDoan = typeof LOAI_DOAN_VALUES[number];
export type TrangThaiVDV = typeof TRANG_THAI_VDV_VALUES[number];
export type TrangThaiDK = typeof TRANG_THAI_DK_VALUES[number];
export type CapBacTT = typeof CAP_BAC_TT_VALUES[number];
export type ChuyenMonTT = typeof CHUYEN_MON_TT_VALUES[number];
export type TrangThaiTT = typeof TRANG_THAI_TT_VALUES[number];
export type KetQuaCan = typeof KET_QUA_CAN_VALUES[number];
export type VongDau = typeof VONG_DAU_VALUES[number];
export type TrangThaiTranDau = typeof TRANG_THAI_TRAN_DAU_VALUES[number];
export type TrangThaiQuyen = typeof TRANG_THAI_QUYEN_VALUES[number];
export type TrangThaiLich = typeof TRANG_THAI_LICH_VALUES[number];
export type PhienThi = typeof PHIEN_THI_VALUES[number];
export type LoaiKN = typeof LOAI_KN_VALUES[number];
export type TrangThaiKN = typeof TRANG_THAI_KN_VALUES[number];
export type LoaiTaiTro = typeof LOAI_TAI_TRO_VALUES[number];
export type TrangThaiTrangBi = typeof TRANG_THAI_TRANG_BI_VALUES[number];

// ── Audit Entry ───────────────────────────────────────────────

export interface AuditEntry {
    time: string;
    action: string;
    by: string;
}


// ── Status Maps (shared label+color lookups) ──────────────────

export const TRANG_THAI_DOAN_MAP: Record<TrangThaiDoan, { label: string; color: string; type: string }> = {
    nhap: { label: 'Nháp', color: '#94a3b8', type: 'info' },
    cho_duyet: { label: 'Chờ duyệt', color: '#f59e0b', type: 'warning' },
    yeu_cau_bo_sung: { label: 'Yêu cầu bổ sung', color: '#ef4444', type: 'danger' },
    da_xac_nhan: { label: 'Đã xác nhận', color: '#10b981', type: 'success' },
    da_checkin: { label: 'Đã check-in', color: '#22d3ee', type: 'info' },
    tu_choi: { label: 'Từ chối', color: '#ef4444', type: 'danger' },
};

export const TRANG_THAI_VDV_MAP: Record<TrangThaiVDV, { label: string; color: string; type: string }> = {
    du_dieu_kien: { label: 'Đủ điều kiện', color: '#10b981', type: 'success' },
    cho_xac_nhan: { label: 'Chờ xác nhận', color: '#f59e0b', type: 'warning' },
    thieu_ho_so: { label: 'Thiếu hồ sơ', color: '#ef4444', type: 'danger' },
    nhap: { label: 'Nháp', color: '#94a3b8', type: 'info' },
};

export const TRANG_THAI_DK_MAP: Record<TrangThaiDK, { label: string; color: string; type: string }> = {
    da_duyet: { label: 'Đã duyệt', color: '#10b981', type: 'success' },
    cho_duyet: { label: 'Chờ duyệt', color: '#f59e0b', type: 'warning' },
    tu_choi: { label: 'Từ chối', color: '#ef4444', type: 'danger' },
};

export const TRANG_THAI_TT_MAP: Record<TrangThaiTT, { label: string; color: string; type: string }> = {
    xac_nhan: { label: 'Xác nhận', color: '#10b981', type: 'success' },
    cho_duyet: { label: 'Chờ duyệt', color: '#f59e0b', type: 'warning' },
    tu_choi: { label: 'Từ chối', color: '#ef4444', type: 'danger' },
};

export const CAP_BAC_TT_MAP: Record<CapBacTT, { label: string; color: string }> = {
    quoc_gia: { label: 'Quốc gia', color: '#a78bfa' },
    cap_1: { label: 'Cấp 1', color: '#22d3ee' },
    cap_2: { label: 'Cấp 2', color: '#10b981' },
    cap_3: { label: 'Cấp 3', color: '#94a3b8' },
};

export const TRANG_THAI_KN_MAP: Record<TrangThaiKN, { label: string; color: string; type: string }> = {
    moi: { label: 'Mới', color: '#ef4444', type: 'danger' },
    dang_xu_ly: { label: 'Đang xử lý', color: '#f59e0b', type: 'warning' },
    chap_nhan: { label: 'Chấp nhận', color: '#10b981', type: 'success' },
    bac_bo: { label: 'Bác bỏ', color: '#94a3b8', type: 'info' },
};

export const DOC_CHECKLIST = [
    'Công văn cử đoàn',
    'Danh sách VĐV',
    'Ảnh VĐV 3x4',
    'Giấy khám sức khoẻ',
    'Bảo hiểm y tế',
    'Bằng HLV',
];

// ── Pagination & API Response ─────────────────────────────────

export interface PaginationParams {
    page: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
}

// ════════════════════════════════════════════════════════════════
// QUY CHẾ 2021-QC01 — REGULATION TYPES
// Theo Quy chế Quản lý Chuyên môn Võ Cổ Truyền Việt Nam
// ════════════════════════════════════════════════════════════════

// ── Competition Content (Nội dung thi đấu — Chương III) ──────

export interface MasterCompetitionContent {
    id: string;
    code: LoaiNoiDung;
    name: string;
    description: string;
    requires_weight: boolean;    // Đối kháng cần hạng cân
    is_team_event: boolean;      // Nội dung đồng đội
    min_athletes: number;        // Số VĐV tối thiểu
    max_athletes: number;        // Số VĐV tối đa
    has_weapon: boolean;         // Có sử dụng binh khí
    scope: 'NATIONAL' | 'PROVINCIAL' | 'SCHOOL';
    scope_id?: string;
    created_at: string;
    updated_at: string;
}

// ── Weapon Types (Binh khí — Chương III) ─────────────────────

export const BINH_KHI_VALUES = ['kiem', 'dao', 'con', 'thuong', 'song_dao', 'song_kiem', 'dai_dao', 'roi'] as const;
export type LoaiBinhKhi = typeof BINH_KHI_VALUES[number];

export const BINH_KHI_MAP: Record<LoaiBinhKhi, { label: string; labelEN: string }> = {
    kiem: { label: 'Kiếm', labelEN: 'Sword' },
    dao: { label: 'Đao', labelEN: 'Sabre' },
    con: { label: 'Côn/Bổng', labelEN: 'Staff' },
    thuong: { label: 'Thương/Giáo', labelEN: 'Spear' },
    song_dao: { label: 'Song đao', labelEN: 'Dual Sabres' },
    song_kiem: { label: 'Song kiếm', labelEN: 'Dual Swords' },
    dai_dao: { label: 'Đại đao', labelEN: 'Long-handled Sabre' },
    roi: { label: 'Roi', labelEN: 'Whip' },
};

// ── Competition Content Map ──────────────────────────────────

export const LOAI_NOI_DUNG_MAP: Record<LoaiNoiDung, { label: string; icon: string; requiresWeight: boolean; isTeam: boolean }> = {
    doi_khang:            { label: 'Đối kháng',            icon: '⚔️', requiresWeight: true,  isTeam: false },
    quyen:                { label: 'Quyền',                icon: '🥋', requiresWeight: false, isTeam: false },
    quyen_dong_doi:       { label: 'Quyền đồng đội',       icon: '👥', requiresWeight: false, isTeam: true },
    song_luyen:           { label: 'Song luyện',            icon: '🤝', requiresWeight: false, isTeam: false },
    nhieu_luyen:          { label: 'Nhiều luyện',           icon: '👫', requiresWeight: false, isTeam: true },
    binh_khi:             { label: 'Binh khí',              icon: '🗡️', requiresWeight: false, isTeam: false },
    vu_khi_doi_luyen:     { label: 'Vũ khí đối luyện',     icon: '⚔️', requiresWeight: false, isTeam: false },
    bieu_dien_chien_luoc: { label: 'Biểu diễn chiến lược', icon: '🎭', requiresWeight: false, isTeam: true },
    tu_ve:                { label: 'Tự vệ',                icon: '🛡️', requiresWeight: false, isTeam: false },
};

// ── Coach Grades (Cấp bậc HLV — Chương V) ───────────────────

export const CAP_BAC_HLV_VALUES = ['co_so', 'cap_tinh', 'quoc_gia'] as const;
export type CapBacHLV = typeof CAP_BAC_HLV_VALUES[number];

export const CAP_BAC_HLV_MAP: Record<CapBacHLV, { label: string; minDan: number }> = {
    co_so:    { label: 'HLV Cấp cơ sở', minDan: 2 },
    cap_tinh: { label: 'HLV Cấp tỉnh', minDan: 3 },
    quoc_gia: { label: 'HLV Cấp quốc gia', minDan: 4 },
};

// ── Referee Grades (Cấp bậc Trọng tài — Chương V) ───────────

export const CAP_BAC_TRONG_TAI_VALUES = ['co_so', 'cap_tinh', 'quoc_gia', 'quoc_te'] as const;
export type CapBacTrongTai = typeof CAP_BAC_TRONG_TAI_VALUES[number];

export const CAP_BAC_TRONG_TAI_MAP: Record<CapBacTrongTai, { label: string }> = {
    co_so:    { label: 'TT Cấp cơ sở' },
    cap_tinh: { label: 'TT Cấp tỉnh' },
    quoc_gia: { label: 'TT Cấp quốc gia' },
    quoc_te:  { label: 'TT Quốc tế' },
};

// ── Regulation Metadata ──────────────────────────────────────

export const REGULATION_META = {
    code: '2021-QC01',
    name: 'Quy chế Quản lý Chuyên môn Võ Cổ Truyền Việt Nam',
    year: 2021,
    issuingAuthority: 'Liên đoàn Võ thuật Cổ truyền Việt Nam',
    totalBeltLevels: 18,
    totalAgeGroups: 10,     // 4 đối kháng + 6 quyền thuật (sửa đổi 2024)
    totalContentTypes: 9,
    amendment: {
        code: '128/2024/LĐVTCTVN',
        name: 'Luật sửa đổi, bổ sung một số điều của Luật thi đấu Võ cổ truyền',
        date: '2024-07-20',
        signedBy: 'Nguyễn Ngọc Anh',
    },
} as const;

// ════════════════════════════════════════════════════════════════
// LUẬT 128/2024 — AMENDMENT TYPES
// ════════════════════════════════════════════════════════════════

// ── Scoring (Hệ thống tính điểm — Điều 14 sửa đổi) ─────────

export const DIEM_DON_VALUES = ['hand', 'foot', 'knockdown'] as const;
export type LoaiDiemDon = typeof DIEM_DON_VALUES[number];

export const DIEM_DON_MAP: Record<LoaiDiemDon, { label: string; points: number; icon: string }> = {
    hand:      { label: 'Đòn tay / Chỏ',     points: 1, icon: '✊' },
    foot:      { label: 'Đòn chân / Gối',     points: 2, icon: '🦶' },
    knockdown: { label: 'Đánh ngã',           points: 3, icon: '💥' },
};

// ── Foul Severity (Phân loại lỗi — Điều 11 sửa đổi) ────────

export const MUC_DO_LOI_VALUES = ['light', 'heavy', 'banned'] as const;
export type MucDoLoi = typeof MUC_DO_LOI_VALUES[number];

export const MUC_DO_LOI_MAP: Record<MucDoLoi, { label: string; color: string }> = {
    light:  { label: 'Lỗi nhẹ',  color: '#f59e0b' },
    heavy:  { label: 'Lỗi nặng', color: '#ef4444' },
    banned: { label: 'Đòn cấm',  color: '#7f1d1d' },
};

// ── Penalty Levels (Hệ thống phạt — Điều 12 sửa đổi) ────────

export const HINH_THUC_PHAT_VALUES = [
    'nhac_nho', 'khien_trach_1', 'khien_trach_2',
    'canh_cao_1', 'canh_cao_2', 'truat_quyen'
] as const;
export type HinhThucPhat = typeof HINH_THUC_PHAT_VALUES[number];

export const HINH_THUC_PHAT_MAP: Record<HinhThucPhat, { label: string; points: number; scope: string; color: string }> = {
    nhac_nho:      { label: 'Nhắc nhở',          points: 0,  scope: 'Hiệp',  color: '#94a3b8' },
    khien_trach_1: { label: 'Khiển trách lần 1', points: -1, scope: 'Hiệp',  color: '#f59e0b' },
    khien_trach_2: { label: 'Khiển trách lần 2', points: -1, scope: 'Hiệp',  color: '#f59e0b' },
    canh_cao_1:    { label: 'Cảnh cáo lần 1',    points: -2, scope: 'Trận',  color: '#ef4444' },
    canh_cao_2:    { label: 'Cảnh cáo lần 2',    points: -3, scope: 'Trận',  color: '#dc2626' },
    truat_quyen:   { label: 'Truất quyền',       points: 0,  scope: 'Loại',  color: '#7f1d1d' },
};

// ── Competition Category (Loại giải — Điều 4 & 25) ──────────

export const LOAI_GIAI_VALUES = ['doi_khang', 'quyen_thuat'] as const;
export type LoaiGiai = typeof LOAI_GIAI_VALUES[number];

export const LOAI_GIAI_MAP: Record<LoaiGiai, { label: string }> = {
    doi_khang:   { label: 'Đối kháng' },
    quyen_thuat: { label: 'Quyền thuật' },
};

