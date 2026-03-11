'use client'
import React from 'react'
import { VCT_Icons } from '../components/vct-icons'
import { VCT_PageContainer, VCT_SectionCard, VCT_EmptyState, VCT_Badge } from '../components/vct-ui'
import { useApiQuery } from '../hooks/useApiQuery'
import { AthleteProfile, TournamentEntry } from '@vct/shared-types'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — ATHLETE RESULTS (Personal Competition Results)
// Kết quả thi đấu riêng cho VĐV
// ═══════════════════════════════════════════════════════════════

export function Page_athlete_results() {
    const { data: profile, isLoading: isProfileLoading } = useApiQuery<AthleteProfile>(
        '/api/v1/athlete-profiles/me'
    )

    const { data: entries, isLoading: isEntriesLoading } = useApiQuery<TournamentEntry[]>(
        profile ? `/api/v1/tournament-entries?athleteId=${profile.id}&status=completed` : ''
    )

    const isLoading = isProfileLoading || isEntriesLoading

    if (isLoading) {
        return (
            <VCT_PageContainer size="wide" animated>
                <div className="space-y-6 animate-pulse">
                    <div className="h-16 bg-vct-elevated rounded-3xl border border-vct-border"></div>
                    <div className="h-[300px] bg-vct-elevated rounded-3xl border border-vct-border"></div>
                </div>
            </VCT_PageContainer>
        )
    }

    if (!profile) {
        return (
            <VCT_PageContainer>
                <VCT_EmptyState
                    icon={<VCT_Icons.User size={48} />}
                    title="Chưa có hồ sơ VĐV"
                    description="Vui lòng liên kết hồ sơ VĐV trước khi xem kết quả thi đấu."
                />
            </VCT_PageContainer>
        )
    }

    return (
        <VCT_PageContainer size="wide" animated>
            {/* ══ HEADER ══ */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-vct-border">
                        <VCT_Icons.Award size={24} className="text-amber-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-vct-text m-0">Kết quả thi đấu</h1>
                        <p className="text-sm text-vct-text-muted mt-0.5">Lịch sử thành tích qua các giải đấu</p>
                    </div>
                </div>
            </div>

            {/* ══ RESULTS LIST ══ */}
            <VCT_SectionCard
                title="Lịch sử thi đấu"
                icon={<VCT_Icons.Award size={20} />}
                accentColor="#f59e0b"
                className="border border-vct-border"
            >
                {!entries || entries.length === 0 ? (
                    <div className="py-8">
                        <VCT_EmptyState
                            icon={<VCT_Icons.Trophy size={48} />}
                            title="Chưa có kết quả thi đấu"
                            description="Bạn chưa có kết quả thi đấu nào. Hãy đăng ký tham gia giải đấu để bắt đầu hành trình!"
                        />
                    </div>
                ) : (
                    <div className="divide-y divide-vct-border/50">
                        {entries.map((entry, idx) => (
                            <div key={entry.id} className="py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 group px-2 hover:bg-vct-bg/50 rounded-xl transition-colors -mx-2">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-vct-text group-hover:text-amber-500 transition-colors">{entry.tournament_name}</h4>
                                        <div className="text-xs text-vct-text-muted mt-1.5 flex flex-wrap gap-2">
                                            {entry.categories?.map((c, i) => (
                                                <span key={i} className="px-2 py-0.5 rounded bg-vct-bg border border-vct-border">{c}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="sm:text-right self-start sm:self-center ml-14 sm:ml-0">
                                    <VCT_Badge variant={entry.status === 'du_dieu_kien' ? 'success' : 'neutral'}>
                                        {entry.status === 'du_dieu_kien' ? 'Hoàn thành' : entry.status}
                                    </VCT_Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </VCT_SectionCard>
        </VCT_PageContainer>
    )
}
