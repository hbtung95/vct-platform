'use client'
import React from 'react'
import { VCT_Icons } from '../components/vct-icons'
import { VCT_PageContainer, VCT_SectionCard, VCT_EmptyState } from '../components/vct-ui'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — ATHLETE E-LEARNING
// Học tập trực tuyến cho VĐV
// ═══════════════════════════════════════════════════════════════

export function Page_athlete_elearning() {
    return (
        <VCT_PageContainer size="wide" animated>
            {/* ══ HEADER ══ */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-vct-border">
                        <VCT_Icons.Laptop size={24} className="text-[#8b5cf6]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-vct-text m-0">E-Learning</h1>
                        <p className="text-sm text-vct-text-muted mt-0.5">Học bài quyền, kỹ thuật và kiến thức võ thuật</p>
                    </div>
                </div>
            </div>

            {/* ══ COURSE CARDS (Placeholder) ══ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <VCT_SectionCard
                    title="Bài quyền cơ bản"
                    icon={<VCT_Icons.Video size={20} />}
                    accentColor="#8b5cf6"
                    className="border border-vct-border"
                >
                    <div className="py-8">
                        <VCT_EmptyState
                            icon={<VCT_Icons.Video size={48} />}
                            title="Đang phát triển"
                            description="Video hướng dẫn các bài quyền từ cơ bản đến nâng cao, kèm theo bài tập thực hành sẽ hiển thị tại đây."
                        />
                    </div>
                </VCT_SectionCard>

                <VCT_SectionCard
                    title="Luật thi đấu"
                    icon={<VCT_Icons.Book size={20} />}
                    accentColor="#3b82f6"
                    className="border border-vct-border"
                >
                    <div className="py-8">
                        <VCT_EmptyState
                            icon={<VCT_Icons.Book size={48} />}
                            title="Đang phát triển"
                            description="Tài liệu luật thi đấu, quy chế giải và kiến thức trọng tài sẽ hiển thị tại đây."
                        />
                    </div>
                </VCT_SectionCard>
            </div>

            {/* ══ PROGRESS ══ */}
            <div className="mt-6">
                <VCT_SectionCard
                    title="Tiến độ học tập"
                    icon={<VCT_Icons.Award size={20} />}
                    accentColor="#f59e0b"
                    className="border border-vct-border"
                >
                    <div className="py-8">
                        <VCT_EmptyState
                            icon={<VCT_Icons.Award size={48} />}
                            title="Đang phát triển"
                            description="Tiến độ hoàn thành khóa học, chứng chỉ đã đạt và đề xuất khóa học phù hợp sẽ hiển thị tại đây."
                        />
                    </div>
                </VCT_SectionCard>
            </div>
        </VCT_PageContainer>
    )
}
