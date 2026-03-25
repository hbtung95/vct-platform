'use client'
// ════════════════════════════════════════════════════════════════
// VCT PORTAL — Category Group (Accordion)
// Collapsible section grouping workspace cards by category.
// ════════════════════════════════════════════════════════════════

import * as React from 'react'
import { motion, Variants } from 'framer-motion'
import { VCT_Icons } from '../../components/vct-icons'
import { useI18n } from '../../i18n'
import type { WorkspaceCard, WorkspaceCategory } from '../../layout/workspace-types'
import type { ViewMode } from './usePortalState'
import { PortalWorkspaceCard } from './PortalWorkspaceCard'
import { PortalWorkspaceRow } from './PortalWorkspaceRow'

const COLLAPSED_SHOW_COUNT = 4

interface Props {
    category: WorkspaceCategory
    label: string
    icon: string
    color: string
    cards: WorkspaceCard[]
    viewMode: ViewMode
    isExpanded: boolean
    onToggle: () => void
    onCardClick: (card: WorkspaceCard) => void
}

export const PortalCategoryGroup = ({
    category,
    label,
    icon,
    color,
    cards,
    viewMode,
    isExpanded,
    onToggle,
    onCardClick,
}: Props) => {
    const { t } = useI18n()
    const iconMap = VCT_Icons as Record<string, React.ComponentType<any>>
    const CategoryIcon = iconMap[icon] ?? VCT_Icons.Activity

    const needsCollapse = cards.length > COLLAPSED_SHOW_COUNT
    const visibleCards = needsCollapse && !isExpanded
        ? cards.slice(0, COLLAPSED_SHOW_COUNT)
        : cards
    const hiddenCount = cards.length - COLLAPSED_SHOW_COUNT

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
        }
    }

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 15, scale: 0.95 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    }

    return (
        <section aria-label={t(label)}>
            {/* Header */}
            <button
                type="button"
                onClick={needsCollapse ? onToggle : undefined}
                className={`mb-3 flex w-full items-center gap-2 text-left ${needsCollapse ? 'cursor-pointer' : 'cursor-default'}`}
                tabIndex={needsCollapse ? 0 : -1}
                {...(needsCollapse ? { 'aria-expanded': isExpanded } : {})}
            >
                <div
                    className="flex h-6 w-6 items-center justify-center rounded-md"
                    style={{ backgroundColor: `${color}15` }}
                >
                    <CategoryIcon size={13} color={color} />
                </div>
                <h2 className="text-xs font-extrabold uppercase tracking-widest text-vct-text-muted">
                    {t(label)}
                </h2>
                <span className="rounded-full bg-vct-text-muted/10 px-2 py-0.5 text-[10px] font-bold text-vct-text-muted">
                    {cards.length}
                </span>
                {needsCollapse && (
                    <span 
                        className="ml-auto text-vct-text-muted transition-transform" 
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                        <VCT_Icons.ChevronDown size={14} />
                    </span>
                )}
            </button>

            {/* Cards */}
            {viewMode === 'grid' ? (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {visibleCards.map((card) => (
                        <motion.div key={card.id} variants={itemVariants}>
                            <PortalWorkspaceCard
                                card={card}
                                onClick={onCardClick}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="rounded-xl border border-vct-border/60 bg-(--vct-bg-card) divide-y divide-vct-border/50"
                >
                    {visibleCards.map((card) => (
                        <motion.div key={card.id} variants={itemVariants}>
                            <PortalWorkspaceRow
                                card={card}
                                onClick={onCardClick}
                            />
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Show more / less */}
            {needsCollapse && !isExpanded && hiddenCount > 0 && (
                <button
                    type="button"
                    onClick={onToggle}
                    className="mt-2 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-vct-accent transition-colors hover:bg-vct-accent/10"
                >
                    <VCT_Icons.ChevronDown size={12} />
                    Xem thêm +{hiddenCount}
                </button>
            )}
            {needsCollapse && isExpanded && (
                <button
                    type="button"
                    onClick={onToggle}
                    className="mt-2 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-vct-text-muted transition-colors hover:bg-vct-text-muted/10"
                >
                    <span style={{ transform: 'rotate(180deg)' }}><VCT_Icons.ChevronDown size={12} /></span>
                    Thu gọn
                </button>
            )}
        </section>
    )
}
