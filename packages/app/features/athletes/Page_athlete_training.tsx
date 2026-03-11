'use client'
import React from 'react'
import { VCT_Icons } from '../components/vct-icons'
import { VCT_PageContainer, VCT_SectionCard, VCT_EmptyState } from '../components/vct-ui'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — ATHLETE TRAINING
// Lịch tập & Điểm danh riêng cho VĐV
// ═══════════════════════════════════════════════════════════════

export function Page_athlete_training() {
    return (
        <VCT_PageContainer size="wide" animated>
            {/* ══ HEADER ══ */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-vct-border">
                        <VCT_Icons.Calendar size={24} className="text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-vct-text m-0">Lịch tập</h1>
                        <p className="text-sm text-vct-text-muted mt-0.5">Lịch tập luyện và điểm danh cá nhân</p>
                    </div>
                </div>
            </div>

            {/* ══ SCHEDULE (Placeholder) ══ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <VCT_SectionCard
                    title="Lịch tập tuần này"
                    icon={<VCT_Icons.Calendar size={20} />}
                    accentColor="#22c55e"
                    className="border border-vct-border"
                >
                    <div className="py-8">
                        <VCT_EmptyState
                            icon={<VCT_Icons.Calendar size={48} />}
                            title="Đang phát triển"
                            description="Lịch tập luyện hàng tuần với thời gian, địa điểm và nội dung buổi tập sẽ hiển thị tại đây."
                        />
                    </div>
                </VCT_SectionCard>

                <VCT_SectionCard
                    title="Điểm danh"
                    icon={<VCT_Icons.CheckCircle size={20} />}
                    accentColor="#3b82f6"
                    className="border border-vct-border"
                >
                    <div className="py-8">
                        <VCT_EmptyState
                            icon={<VCT_Icons.CheckCircle size={48} />}
                            title="Đang phát triển"
                            description="Lịch sử điểm danh, tỷ lệ chuyên cần và thống kê tập luyện sẽ hiển thị tại đây."
                        />
                    </div>
                </VCT_SectionCard>
            </div>

            {/* ══ TRAINING STATS ══ */}
            <div className="mt-6">
                <VCT_SectionCard
                    title="Thống kê tập luyện"
                    icon={<VCT_Icons.Activity size={20} />}
                    accentColor="#8b5cf6"
                    className="border border-vct-border"
                >
                    <div className="py-8">
                        <VCT_EmptyState
                            icon={<VCT_Icons.Activity size={48} />}
                            title="Đang phát triển"
                            description="Biểu đồ thống kê số buổi tập, thể lực, tiến độ theo tuần/tháng sẽ hiển thị tại đây."
                        />
                    </div>
                </VCT_SectionCard>
            </div>
        </VCT_PageContainer>
    )
}
