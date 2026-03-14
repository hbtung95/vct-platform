// ════════════════════════════════════════════════════════════════
// VCT PLATFORM — BRACKET TYPES & CONSTANTS
// ════════════════════════════════════════════════════════════════

export interface BracketPlayer {
    id: string;
    ten: string;
    doan: string;
}

export interface BracketMatch {
    id: string;
    match_no: string;
    round_key: string;
    red_athlete: BracketPlayer | null;
    blue_athlete: BracketPlayer | null;
    winner_id: string | null;
    status: string; // 'ChuaDau' | 'DangDau' | 'HoanThanh'
}

export interface RoundCoord {
    r: number;
    b: number;
    node: number;
    prevNode1: number;
    prevNode2: number;
}

export interface RoundItem {
    m: BracketMatch;
    pRed: BracketPlayer | null;
    pBlue: BracketPlayer | null;
    w: string | null;
    redWin: boolean;
    blueWin: boolean;
    phRed?: string;
    phBlue?: string;
}

// ── Layout Constants ──
export const CW = 220; // Card width
export const CH = 60;  // Card height
export const SIDE_W = 24; // Side accent block width

// ── Schema Options ──
export const SCHEMA_OPTIONS = [2, 4, 8, 16, 32, 64, 128] as const;
export type SchemaSize = (typeof SCHEMA_OPTIONS)[number];

// ── Round Name / Key Mapping ──
const ROUND_LABELS = ['Chung Kết', 'Bán Kết', 'Tứ Kết', 'Vòng 1/8', 'Vòng 1/16', 'Vòng 1/32', 'Vòng 1/64'];
const ROUND_KEYS_MAP = ['ChungKet', 'BanKet', 'TuKet', 'Vong1_8', 'Vong1_16', 'Vong1_32', 'Vong1_64'];

export const getRoundNames = (numRounds: number): string[] => {
    const names: string[] = [];
    for (let i = 0; i < numRounds; i++) {
        names.unshift(ROUND_LABELS[i] || `Vòng ${i + 1}`);
    }
    return names;
};

export const getRoundKeys = (numRounds: number): string[] => {
    const keys: string[] = [];
    for (let i = 0; i < numRounds; i++) {
        keys.unshift(ROUND_KEYS_MAP[i] || `R${numRounds - i}`);
    }
    return keys;
};

// ── Mock Data Constants ──
export const DOAN_NAMES = [
    'CLB Bình Định', 'CLB Hà Nội', 'Đoàn TP.HCM', 'CLB Đà Nẵng',
    'CLB Cần Thơ', 'Đoàn Nghệ An', 'CLB Huế', 'Đoàn Hải Phòng',
    'CLB Gia Lai', 'Đoàn Đắk Lắk', 'CLB Long An', 'CLB Tây Ninh',
    'Đoàn Bình Dương', 'CLB Vũng Tàu', 'CLB An Giang', 'Đoàn Quảng Nam',
];

export const VDV_HO = [
    'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ',
    'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý',
];

export const VDV_TEN = [
    'Văn A', 'Thị B', 'Minh C', 'Hương D', 'Quốc E', 'Thu F', 'Đức G', 'Ngọc H',
    'Anh I', 'Bảo J', 'Khánh K', 'Long L', 'Mai M', 'Nam N', 'Phúc O', 'Quang P',
];

// ── Schema Info ──
export interface BracketSchemaInfo {
    numSlots: SchemaSize;
    numRounds: number;
    totalMatches: number;
    label: string;
    description: string;
    icon: string;
    color: string;
}

export const getBracketSchemaInfo = (numSlots: SchemaSize): BracketSchemaInfo => {
    const numRounds = Math.log2(numSlots);
    const totalMatches = numSlots - 1;

    const infoMap: Record<number, { label: string; description: string; icon: string; color: string }> = {
        2: { label: 'Chung kết trực tiếp', description: '1 trận duy nhất — 2 VĐV đấu trực tiếp', icon: '⚔️', color: '#ef4444' },
        4: { label: 'Bán kết → Chung kết', description: '2 vòng — Bán kết và Chung kết', icon: '🏅', color: '#f97316' },
        8: { label: 'Tứ kết → Chung kết', description: '3 vòng — Tứ kết, Bán kết, Chung kết', icon: '🥊', color: '#eab308' },
        16: { label: 'Vòng 1/8 → Chung kết', description: '4 vòng — Phù hợp cho nội dung có 16 VĐV', icon: '🔥', color: '#22c55e' },
        32: { label: 'Vòng 1/16 → Chung kết', description: '5 vòng — Giải đấu quy mô trung bình', icon: '🏆', color: '#3b82f6' },
        64: { label: 'Vòng 1/32 → Chung kết', description: '6 vòng — Giải đấu quy mô lớn', icon: '🌟', color: '#8b5cf6' },
        128: { label: 'Vòng 1/64 → Chung kết', description: '7 vòng — Giải đấu quy mô quốc gia', icon: '👑', color: '#ec4899' },
    };

    const info = infoMap[numSlots] || { label: `Schema ${numSlots}`, description: '', icon: '📋', color: '#64748b' };

    return { numSlots, numRounds, totalMatches, ...info };
};
