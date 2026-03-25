'use client'
// ════════════════════════════════════════════════════════════════
// VCT PORTAL — Workspace Row (List view compact)
// ════════════════════════════════════════════════════════════════

import * as React from 'react'
import { VCT_Icons } from '../../components/vct-icons'
import { useI18n } from '../../i18n'
import { useWorkspaceStore } from '../../layout/workspace-store'
import type { WorkspaceCard } from '../../layout/workspace-types'
import { WORKSPACE_META } from '../../layout/workspace-types'

interface Props {
    card: WorkspaceCard
    onClick: (card: WorkspaceCard) => void
}

export const PortalWorkspaceRow = ({ card, onClick }: Props) => {
    const { t } = useI18n()
    const { togglePin, isPinned, lastAccessedMap } = useWorkspaceStore()
    const meta = WORKSPACE_META[card.type]
    const pinned = isPinned(card.id)
    const lastAccess = lastAccessedMap[card.id]

    const iconMap = VCT_Icons as Record<string, React.ComponentType<any>>
    const CardIcon = iconMap[card.icon] ?? iconMap[meta?.icon ?? 'Activity'] ?? VCT_Icons.Activity

    const displayName = card.scope.name && card.scope.name !== card.label
        ? t(card.scope.name)
        : t(card.label)
    const typeName = t(meta?.label ?? card.label)
    const status = card.status ?? 'active'

    const statusColor = status === 'active' ? 'bg-emerald-500' : status === 'upcoming' ? 'bg-blue-500' : 'bg-vct-text-muted/40'

    return (
        <button
            type="button"
            onClick={() => onClick(card)}
            className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-4 py-3 text-left transition-all duration-150 hover:border-vct-border hover:bg-[var(--vct-bg-elevated)] focus:outline-none focus:ring-2 focus:ring-vct-accent/30"
        >
            {/* Status dot */}
            <span className={`h-2 w-2 shrink-0 rounded-full ${statusColor}`} />

            {/* Icon */}
            {card.logoUrl ? (
                <img src={card.logoUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />
            ) : (
                <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${card.color}18` }}
                >
                    <CardIcon size={16} color={card.color} />
                </div>
            )}

            {/* Name + type */}
            <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-vct-text">{displayName}</div>
                <div className="truncate text-[11px] text-vct-text-muted">{typeName}</div>
            </div>

            {/* Permission */}
            {(card.permission ?? 'manage') === 'view' && (
                <span className="shrink-0 rounded-full bg-vct-text-muted/10 px-2 py-0.5 text-[10px] font-semibold text-vct-text-muted">
                    {t('portal.viewOnly')}
                </span>
            )}

            {/* Pending badge */}
            {(card.pendingActions ?? 0) > 0 && (
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                    {card.pendingActions}
                </span>
            )}

            {/* Last access */}
            {lastAccess && (
                <span className="hidden shrink-0 text-[11px] text-vct-text-muted/60 sm:block">
                    {new Date(lastAccess).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                </span>
            )}

            {/* Pin */}
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); togglePin(card.id) }}
                title={pinned ? t('portal.unpin') : t('portal.pin')}
                className={`shrink-0 rounded p-1 transition-colors ${pinned ? 'text-amber-500' : 'text-vct-text-muted/30 opacity-0 group-hover:opacity-100'} hover:text-amber-500`}
            >
                <VCT_Icons.Star size={12} />
            </button>

            {/* Arrow */}
            <VCT_Icons.ChevronRight size={14} className="shrink-0 text-vct-text-muted/40 transition-transform group-hover:translate-x-0.5" />
        </button>
    )
}
