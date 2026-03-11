// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — FEDERATION MASTER DATA PAGE
// Manage belt ranks, weight classes, and age groups.
// API-driven with VCT design system.
// ═══════════════════════════════════════════════════════════════
'use client';
import React, { useState } from 'react';
import { useApiQuery } from '../hooks/useApiQuery';
import { VCT_PageContainer, VCT_PageHero } from '../components/VCT_PageContainer';
import { VCT_Icons } from '../components/vct-icons';

// ── Types ────────────────────────────────────────────────────

interface MasterBelt {
    level: number; name: string; color_hex: string;
    required_time_min: number; is_dan_level: boolean;
}

interface MasterWeight {
    id: string; gender: string; category: string;
    max_weight: number; is_heavy: boolean;
}

interface MasterAge {
    id: string; name: string; min_age: number; max_age: number;
}

// ── Fallback Seed Data ───────────────────────────────────────

const SEED_BELTS: MasterBelt[] = [
    { level: 1, name: 'Đai Trắng (Cấp 8)', color_hex: '#ffffff', required_time_min: 3, is_dan_level: false },
    { level: 2, name: 'Đai Vàng (Cấp 7)', color_hex: '#fbbf24', required_time_min: 3, is_dan_level: false },
    { level: 3, name: 'Đai Xanh Lá (Cấp 6)', color_hex: '#4ade80', required_time_min: 3, is_dan_level: false },
    { level: 4, name: 'Đai Xanh Dương (Cấp 5)', color_hex: '#3b82f6', required_time_min: 3, is_dan_level: false },
    { level: 5, name: 'Đai Đỏ (Cấp 4)', color_hex: '#ef4444', required_time_min: 3, is_dan_level: false },
    { level: 6, name: 'Đai Nâu (Cấp 1)', color_hex: '#92400e', required_time_min: 6, is_dan_level: false },
    { level: 7, name: 'Đai Đen 1 Đẳng', color_hex: '#1e293b', required_time_min: 12, is_dan_level: true },
    { level: 8, name: 'Đai Đen 2 Đẳng', color_hex: '#0f172a', required_time_min: 12, is_dan_level: true },
];

const SEED_WEIGHTS: MasterWeight[] = [
    { id: 'm-u45', gender: 'MALE', category: 'Kyorugi', max_weight: 45, is_heavy: false },
    { id: 'm-u48', gender: 'MALE', category: 'Kyorugi', max_weight: 48, is_heavy: false },
    { id: 'm-u51', gender: 'MALE', category: 'Kyorugi', max_weight: 51, is_heavy: false },
    { id: 'f-u42', gender: 'FEMALE', category: 'Kyorugi', max_weight: 42, is_heavy: false },
    { id: 'f-u44', gender: 'FEMALE', category: 'Kyorugi', max_weight: 44, is_heavy: false },
    { id: 'f-u46', gender: 'FEMALE', category: 'Kyorugi', max_weight: 46, is_heavy: false },
    { id: 'm-heavy', gender: 'MALE', category: 'Kyorugi', max_weight: 80, is_heavy: true },
];

const SEED_AGES: MasterAge[] = [
    { id: 'u12', name: 'Nhi đồng (U12)', min_age: 6, max_age: 11 },
    { id: 'u15', name: 'Thiếu niên (U15)', min_age: 12, max_age: 14 },
    { id: 'u18', name: 'Trẻ (U18)', min_age: 15, max_age: 17 },
    { id: 'u35', name: 'Vô địch (18-35)', min_age: 18, max_age: 35 },
];

// ── Component ────────────────────────────────────────────────

type TabKey = 'belts' | 'weights' | 'ages';

export function Page_federation_master_data() {
    const { data: apiBelts } = useApiQuery<MasterBelt[]>('/api/v1/federation/master/belts');
    const { data: apiWeights } = useApiQuery<MasterWeight[]>('/api/v1/federation/master/weights');
    const { data: apiAges } = useApiQuery<MasterAge[]>('/api/v1/federation/master/ages');

    const belts = apiBelts || SEED_BELTS;
    const weights = apiWeights || SEED_WEIGHTS;
    const ages = apiAges || SEED_AGES;

    const [tab, setTab] = useState<TabKey>('belts');

    const tabs: { key: TabKey; label: string; icon: string; count: number }[] = [
        { key: 'belts', label: 'Hệ thống Đai', icon: '🥋', count: belts.length },
        { key: 'weights', label: 'Hạng Cân', icon: '⚖️', count: weights.length },
        { key: 'ages', label: 'Nhóm Tuổi', icon: '📊', count: ages.length },
    ];

    return (
        <VCT_PageContainer size="default">
            <VCT_PageHero
                title="Danh mục Chuẩn — Master Data"
                subtitle="Cấu hình hệ thống đai, hạng cân và nhóm tuổi áp dụng toàn quốc"
                icon={<VCT_Icons.Settings size={24} />}
                gradientFrom="rgba(139, 92, 246, 0.1)"
                gradientTo="rgba(236, 72, 153, 0.06)"
            />

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-vct-elevated p-1 rounded-2xl border border-vct-border w-fit">
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t.key ? 'bg-purple-500/15 text-purple-400 shadow-sm' : 'text-vct-text-muted hover:text-vct-text'}`}>
                        {t.icon} {t.label} ({t.count})
                    </button>
                ))}
            </div>

            {/* ── Belts Tab ── */}
            {tab === 'belts' && (
                <div className="space-y-2.5">
                    {belts.map(b => {
                        const isLight = b.color_hex === '#ffffff' || b.color_hex === '#fbbf24';
                        return (
                            <div key={b.level} className="flex items-center gap-4 rounded-2xl border border-vct-border bg-vct-elevated px-5 py-4 hover:border-vct-border-hover transition-colors">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0"
                                    style={{
                                        background: b.color_hex === '#ffffff' ? 'rgba(255,255,255,0.9)' : b.color_hex,
                                        border: b.color_hex === '#ffffff' ? '2px solid var(--vct-border)' : 'none',
                                        color: isLight ? '#1e293b' : '#fff',
                                    }}>
                                    {b.level}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-vct-text">{b.name}</div>
                                    <div className="text-xs text-vct-text-muted mt-0.5">Tối thiểu {b.required_time_min} tháng luyện tập</div>
                                </div>
                                {b.is_dan_level && (
                                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/15 text-amber-400">
                                        ĐẲNG CẤP
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Weights Tab ── */}
            {tab === 'weights' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {weights.map(w => (
                        <div key={w.id}
                            className="rounded-2xl border border-vct-border bg-vct-elevated px-4 py-5 text-center hover:border-vct-border-hover transition-colors">
                            <div className="text-2xl font-extrabold" style={{ color: w.gender === 'MALE' ? '#3b82f6' : '#ec4899' }}>
                                {w.is_heavy ? '80+' : `U${w.max_weight}`}
                            </div>
                            <div className="text-xs text-vct-text-muted mt-1.5">
                                {w.gender === 'MALE' ? '♂ Nam' : '♀ Nữ'} • {w.category}
                            </div>
                            <div className="text-[11px] text-vct-text-muted mt-0.5">
                                {w.is_heavy ? 'Trên 80 kg' : `Dưới ${w.max_weight} kg`}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Ages Tab ── */}
            {tab === 'ages' && (
                <div className="space-y-2.5">
                    {ages.map(a => (
                        <div key={a.id} className="flex items-center gap-4 rounded-2xl border border-vct-border bg-vct-elevated px-5 py-4 hover:border-vct-border-hover transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm font-bold shrink-0">
                                {a.id.toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-bold text-vct-text">{a.name}</div>
                                <div className="text-xs text-vct-text-muted mt-0.5">Từ {a.min_age} đến {a.max_age} tuổi</div>
                            </div>
                            <div className="hidden sm:block">
                                {/* Age range bar */}
                                <div className="w-32 h-1.5 rounded-full bg-vct-bg overflow-hidden">
                                    <div className="h-full rounded-full bg-emerald-500/60"
                                        style={{ marginLeft: `${(a.min_age / 40) * 100}%`, width: `${((a.max_age - a.min_age) / 40) * 100}%` }} />
                                </div>
                                <div className="flex justify-between text-[10px] text-vct-text-muted mt-0.5">
                                    <span>{a.min_age}</span><span>{a.max_age}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </VCT_PageContainer>
    );
}

export default Page_federation_master_data;
