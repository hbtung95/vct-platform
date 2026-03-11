'use client'
import React, { useState } from 'react'
import { VCT_Icons } from '../components/vct-icons'
import { VCT_PageContainer, VCT_SectionCard, VCT_EmptyState, VCT_StatRow, VCT_Badge } from '../components/vct-ui'
import { useApiQuery } from '../hooks/useApiQuery'
import { AthleteProfile } from '@vct/shared-types'
import { useRouter } from 'next/navigation'

export function Page_athlete_profile() {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)

    // Fetch profile
    const { data: profile, isLoading } = useApiQuery<AthleteProfile>(
        '/api/v1/athlete-profiles/me'
    )

    if (isLoading) {
        return (
            <VCT_PageContainer size="wide" animated>
                <div className="mb-6 flex justify-between animate-pulse">
                    <div className="h-8 w-48 bg-vct-border rounded-lg"></div>
                    <div className="h-10 w-32 bg-vct-border rounded-xl"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                    <div className="col-span-1 h-[400px] bg-vct-elevated rounded-3xl"></div>
                    <div className="md:col-span-2 space-y-6">
                        <div className="h-32 bg-vct-elevated rounded-3xl"></div>
                        <div className="h-[300px] bg-vct-elevated rounded-3xl"></div>
                    </div>
                </div>
            </VCT_PageContainer>
        )
    }

    if (!profile) {
        return (
            <VCT_PageContainer>
                <VCT_EmptyState
                    icon={<VCT_Icons.User size={48} />}
                    title="Chưa có hồ sơ Vận động viên"
                    description="Bạn cần có hồ sơ VĐV để xem trang này."
                />
            </VCT_PageContainer>
        )
    }

    return (
        <VCT_PageContainer size="wide" animated>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="rounded-xl border border-vct-border p-2 text-vct-text-muted hover:bg-vct-input hover:text-vct-text transition">
                        <VCT_Icons.ChevronLeft size={18} />
                    </button>
                    <div>
                        <h1 className="m-0 text-2xl font-black text-vct-text">Hồ sơ chi tiết</h1>
                        <p className="text-sm text-vct-text-muted">Quản lý lý lịch, đẳng cấp và thành tích</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`flex justify-center items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-all ${isEditing
                        ? 'bg-amber-500/10 border-amber-500 text-amber-500 hover:bg-amber-500/20'
                        : 'bg-vct-bg border-vct-border text-vct-text hover:bg-vct-input hover:border-vct-border-strong'
                        }`}
                >
                    {isEditing ? <VCT_Icons.Check size={16} /> : <VCT_Icons.Edit size={16} />}
                    {isEditing ? 'Lưu thay đổi' : 'Cập nhật hồ sơ'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT COL: INFO */}
                <div className="space-y-6">
                    <div className="relative p-6 rounded-3xl border border-vct-border bg-vct-elevated text-center overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-[#3b82f6]/20 to-[#8b5cf6]/20"></div>
                        <div className="relative w-32 h-32 mx-auto mt-4 mb-4 rounded-full border-4 border-vct-bg shadow-lg bg-vct-border overflow-hidden">
                            {profile.photo_url ? <img src={profile.photo_url} className="w-full h-full object-cover" alt="avatar" /> : <div className="w-full h-full flex items-center justify-center text-4xl">🥋</div>}
                            {isEditing && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/60 transition">
                                    <VCT_Icons.Camera size={24} className="text-white" />
                                </div>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-vct-text">{profile?.full_name}</h2>
                        <div className="text-sm text-[#3b82f6] font-bold mt-1">ID: {profile.id}</div>
                        <VCT_Badge variant={profile.status === 'active' ? 'success' : 'neutral'} className="mt-3">
                            {profile.status === 'active' ? 'Đang hoạt động' : 'Tạm ngưng'}
                        </VCT_Badge>

                        <div className="mt-6 border-t border-vct-border/50 pt-4 text-left space-y-4">
                            {[
                                { i: <VCT_Icons.Calendar size={16} />, l: 'Ngày sinh', v: profile.date_of_birth },
                                { i: <VCT_Icons.User size={16} />, l: 'Giới tính', v: profile.gender === 'nam' ? 'Nam' : 'Nữ' },
                                { i: <VCT_Icons.Phone size={16} />, l: 'Điện thoại', v: profile.phone || 'Chưa cập nhật' },
                                { i: <VCT_Icons.Mail size={16} />, l: 'Email', v: profile.email || 'Chưa cập nhật' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm group">
                                    <div className="flex items-center gap-2 text-vct-text-muted">
                                        {item.i} <span>{item.l}</span>
                                    </div>
                                    {isEditing && (item.l === 'Điện thoại' || item.l === 'Email') ? (
                                        <input type="text" defaultValue={item.v} className="bg-vct-input border border-vct-border-strong rounded px-2 py-1 text-right w-32 text-vct-text focus:outline-none focus:border-vct-accent" />
                                    ) : (
                                        <span className="font-semibold text-vct-text font-mono tracking-tight group-hover:text-vct-accent transition">{item.v}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <VCT_SectionCard title="Thể chất" icon={<VCT_Icons.Activity size={18} />} accentColor="#10b981">
                        <div className="flex gap-4">
                            <div className="flex-1 p-4 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/20 text-center">
                                <div className="text-3xl font-black text-[#10b981] mb-1">
                                    {isEditing ? <input type="number" defaultValue={profile.weight} className="bg-transparent w-full text-center outline-none border-b border-[#10b981]/50 focus:border-[#10b981]" /> : profile.weight || '--'}
                                </div>
                                <div className="text-xs font-bold text-[#10b981]/70 uppercase">Cân nặng (kg)</div>
                            </div>
                            <div className="flex-1 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
                                <div className="text-3xl font-black text-amber-500 mb-1">
                                    {isEditing ? <input type="number" defaultValue={profile.height} className="bg-transparent w-full text-center outline-none border-b border-amber-500/50 focus:border-amber-500" /> : profile.height || '--'}
                                </div>
                                <div className="text-xs font-bold text-amber-500/70 uppercase">Chiều cao (cm)</div>
                            </div>
                        </div>
                    </VCT_SectionCard>
                </div>

                {/* RIGHT COL: STATS & PROGRESS */}
                <div className="lg:col-span-2 space-y-6">
                    <VCT_StatRow
                        items={[
                            { label: 'Elo Rating', value: profile.elo_rating, color: '#3b82f6' },
                            { label: 'Giải thi đấu', value: profile.total_tournaments, color: '#8b5cf6' },
                            { label: 'Huy chương', value: profile.total_medals, color: '#eab308' }
                        ]}
                        cols={3}
                    />

                    <VCT_SectionCard title="Đẳng cấp & Thăng đai" icon={<VCT_Icons.Award size={18} />} accentColor="#eab308">
                        <div className="flex items-center gap-6 mb-8 p-4 bg-vct-bg rounded-2xl border border-vct-border">
                            <div className="w-16 h-16 rounded-full border-4 border-[#eab308]/30 flex items-center justify-center bg-[#eab308]/10 text-2xl shadow-inner">🥋</div>
                            <div>
                                <div className="text-sm font-bold text-vct-text-muted tracking-wide uppercase mb-1">Đẳng cấp hiện tại</div>
                                <div className="text-2xl font-black text-amber-500">{profile.belt_label}</div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="relative pl-6 space-y-6 before:absolute before:inset-y-0 before:left-[11px] before:w-0.5 before:bg-vct-border">
                            {[
                                { belt: profile.belt_label, date: '15/06/2024', ev: 'Kỳ thi thăng cấp cấp Tỉnh', current: true },
                                { belt: 'Đai Xanh', date: '20/12/2023', ev: 'Kỳ thi thăng cấp cơ sở', current: false },
                                { belt: 'Đai Vàng', date: '10/05/2023', ev: 'Kỳ thi thăng cấp cơ sở', current: false },
                                { belt: 'Nhập môn', date: '01/01/2023', ev: 'Gia nhập Võ cổ truyền', current: false }
                            ].map((item, idx) => (
                                <div key={idx} className="relative">
                                    <div className={`absolute -left-[31px] w-5 h-5 rounded-full border-4 border-vct-elevated ${item.current ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-vct-border-strong'}`}></div>
                                    <div className="p-4 rounded-xl bg-vct-bg border border-vct-border hover:border-vct-border-strong transition-colors group">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`font-bold ${item.current ? 'text-amber-500' : 'text-vct-text'}`}>{item.belt}</span>
                                            <span className="text-xs font-mono text-vct-text-muted bg-vct-elevated px-2 py-0.5 rounded-lg border border-vct-border">{item.date}</span>
                                        </div>
                                        <div className="text-sm text-vct-text-muted mt-2">{item.ev}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </VCT_SectionCard>

                    <VCT_SectionCard title="Tương quan Chỉ số" icon={<VCT_Icons.TrendingUp size={18} />} accentColor="#8b5cf6">
                        <div className="p-10 border border-dashed border-vct-border rounded-2xl flex flex-col items-center justify-center text-center opacity-60 bg-vct-bg">
                            <VCT_Icons.Activity size={48} className="text-vct-border-strong mb-4" />
                            <p className="text-vct-text-muted font-bold">Biểu đồ Radar Năng Lực</p>
                            <p className="text-xs text-vct-text-muted mt-2">(Tính năng phân tích chỉ số thi đấu sẽ sớm ra mắt)</p>
                        </div>
                    </VCT_SectionCard>
                </div>
            </div>
        </VCT_PageContainer>
    )
}
