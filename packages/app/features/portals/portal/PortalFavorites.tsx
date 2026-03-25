'use client'
// ════════════════════════════════════════════════════════════════
// VCT PORTAL — Favorites Section
// Pinned/starred workspaces shown at top of portal.
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

export const PortalFavorites = ({ cards, onClick }: Props) => {
    const { t } = useI18n()
    const { togglePin, lastAccessedMap } = useWorkspaceStore()

    if (cards.length === 0) return null

    return (
        <section aria-label={t('portal.favorites')}>
            <h2 className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-amber-500">
                <VCT_Icons.Star size={14} />
                {t('portal.favorites')} ({cards.length})
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                {cards.map((card) => {
                    const meta = WORKSPACE_META[card.type]
                    const iconMap = VCT_Icons as Record<string, React.ComponentType<any>>
                    const CardIcon = iconMap[card.icon] ?? iconMap[meta?.icon ?? 'Activity'] ?? VCT_Icons.Activity
                    const displayName = card.scope.name && card.scope.name !== card.label
                        ? t(card.scope.name)
                        : t(card.label)

                    return (
                        <button
                            key={card.id}
                            type="button"
                            onClick={() => onClick(card)}
                            className="group flex min-w-[180px] items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-left transition-all hover:border-amber-500/40 hover:bg-amber-500/10 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                        >
                            {card.logoUrl ? (
                                <img src={card.logoUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />
                            ) : (
                                <div
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                                    style={{ backgroundColor: `${card.color}20` }}
                                >
                                    <CardIcon size={16} color={card.color} />
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-bold text-vct-text">{displayName}</div>
                                <div className="truncate text-[11px] text-vct-text-muted">{t(meta?.label ?? '')}</div>
                            </div>
                            {(card.pendingActions ?? 0) > 0 && (
                                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                    {card.pendingActions}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>
        </section>
    )
}
