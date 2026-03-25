'use client'
// ════════════════════════════════════════════════════════════════
// VCT PORTAL — Recent Workspaces
// Last 5 accessed workspaces with relative timestamps.
// ════════════════════════════════════════════════════════════════

import { VCT_Icons } from '../../components/vct-icons'
import { useI18n } from '../../i18n'
import type { WorkspaceCard } from '../../layout/workspace-types'
import { WORKSPACE_META } from '../../layout/workspace-types'
import { useWorkspaceStore } from '../../layout/workspace-store'

interface Props {
    cards: WorkspaceCard[]
    onClick: (card: WorkspaceCard) => void
}

function getRelativeTime(timestamp: number): string {
    const diff = Date.now() - timestamp
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Vừa xong'
    if (mins < 60) return `${mins} phút trước`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} giờ trước`
    const days = Math.floor(hours / 24)
    if (days === 1) return 'Hôm qua'
    if (days < 7) return `${days} ngày trước`
    return `${Math.floor(days / 7)} tuần trước`
}

export const PortalRecent = ({ cards, onClick }: Props) => {
    const { t } = useI18n()
    const { lastAccessedMap } = useWorkspaceStore()

    if (cards.length === 0) return null

    return (
        <section aria-label={t('portal.recent')}>
            <h2 className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-vct-text-muted">
                <VCT_Icons.Clock size={14} />
                {t('portal.recent')}
            </h2>
            <div className="divide-y divide-vct-border/50 rounded-xl border border-vct-border/60 bg-[var(--vct-bg-card)]">
                {cards.map((card) => {
                    const meta = WORKSPACE_META[card.type]
                    const iconMap = VCT_Icons as Record<string, React.ComponentType<any>>
                    const CardIcon = iconMap[card.icon] ?? iconMap[meta?.icon ?? 'Activity'] ?? VCT_Icons.Activity
                    const displayName = card.scope.name && card.scope.name !== card.label
                        ? t(card.scope.name)
                        : t(card.label)
                    const lastAccess = lastAccessedMap[card.id]

                    return (
                        <button
                            key={card.id}
                            type="button"
                            onClick={() => onClick(card)}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--vct-bg-elevated)] first:rounded-t-xl last:rounded-b-xl focus:outline-none focus:ring-2 focus:ring-inset focus:ring-vct-accent/30"
                        >
                            {card.logoUrl ? (
                                <img src={card.logoUrl} alt="" className="h-7 w-7 rounded-lg object-cover" />
                            ) : (
                                <div
                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                                    style={{ backgroundColor: `${card.color}15` }}
                                >
                                    <CardIcon size={14} color={card.color} />
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <span className="truncate text-sm font-semibold text-vct-text">{displayName}</span>
                            </div>
                            {lastAccess && (
                                <span className="shrink-0 text-[11px] text-vct-text-muted/60">
                                    {getRelativeTime(lastAccess)}
                                </span>
                            )}
                            <VCT_Icons.ChevronRight size={14} className="shrink-0 text-vct-text-muted/30" />
                        </button>
                    )
                })}
            </div>
        </section>
    )
}
