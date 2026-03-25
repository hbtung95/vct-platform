'use client'
// ════════════════════════════════════════════════════════════════
// VCT ECOSYSTEM — Portal Hub (v3 — Professional Edition)
// Enterprise-grade workspace selector:
//   • Instance-level cards (not type-level)
//   • Favorites + Recent with localStorage persistence
//   • Vietnamese diacritics search + sort
//   • Responsive: 1-col mobile, 2-col tablet, 3-col desktop
//   • Composable sub-components (no monolith)
//   • No mock data — uses resolveWorkspacesForUser
// ════════════════════════════════════════════════════════════════

import React, { Suspense, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { VCT_Icons } from '../components/vct-icons'
import { useAuth } from '../auth/AuthProvider'
import { useI18n } from '../i18n'
import { useWorkspaceStore, generateWorkspaceCards } from '../layout/workspace-store'
import { WORKSPACE_META } from '../layout/workspace-types'
import type { WorkspaceCard } from '../layout/workspace-types'

// Sub-components
import { PortalSearchBar } from './portal/PortalSearchBar'
import { PortalFavorites } from './portal/PortalFavorites'
import { PortalRecent } from './portal/PortalRecent'
import { PortalCategoryGroup } from './portal/PortalCategoryGroup'
import { PortalEmptyState } from './portal/PortalEmptyState'
import { usePortalState } from './portal/usePortalState'

// ── Workspace destination routes ──
const WORKSPACE_DESTINATIONS: Record<string, string> = {
    federation_admin: '/dashboard',
    federation_provincial: '/provincial',
    federation_discipline: '/discipline/dashboard',
    federation_heritage: '/heritage/dashboard',
    training_management: '/training/dashboard',
    tournament_ops: '/giai-dau',
    club_management: '/clubs',
    referee_console: '/referee-scoring',
    athlete_portal: '/athlete-portal',
    parent_portal: '/parent',
    public_spectator: '/scoreboard',
    system_admin: '/admin',
}

// ── Skeleton ──
const PortalSkeleton = () => (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="h-8 w-48 rounded-lg vct-skeleton" />
        <div className="h-11 w-full rounded-xl vct-skeleton" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-36 rounded-2xl vct-skeleton" />
            ))}
        </div>
    </div>
)

// ── Main Component ──
function PortalHubContent() {
    const router = useRouter()
    const { t } = useI18n()
    const { currentUser } = useAuth()
    const { enterWorkspace, trackAccess } = useWorkspaceStore()

    // Resolve REAL workspace cards from user roles (instance-level)
    const workspaces = useMemo(
        () => generateWorkspaceCards(
            currentUser.roles.map((r) => ({
                role: r.roleCode,
                scope_type: r.scopeType,
                scope_id: r.scopeId ?? 'default',
                scope_name: r.scopeName ?? '',
            })),
            currentUser.name
        ),
        [currentUser]
    )

    const portal = usePortalState(workspaces)

    // ── Navigate to workspace ──
    const handleCardClick = React.useCallback(
        (card: WorkspaceCard) => {
            // Track access
            trackAccess(card.id)
            // Enter workspace context
            enterWorkspace(card)
            // Navigate
            const dest = WORKSPACE_DESTINATIONS[card.type] ?? '/dashboard'
            router.push(dest)
        },
        [trackAccess, enterWorkspace, router]
    )

    // ── Empty state ──
    if (workspaces.length === 0) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
                <WelcomeHeader name={currentUser.name} count={0} t={t} />
                <PortalEmptyState variant="no-workspaces" />
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
            {/* Welcome */}
            <WelcomeHeader name={currentUser.name} count={portal.totalCount} t={t} />

            {/* Search + Sort + View Toggle */}
            <div className="mt-6">
                <PortalSearchBar
                    searchQuery={portal.searchQuery}
                    onSearchChange={portal.setSearchQuery}
                    sortMode={portal.sortMode}
                    onSortChange={portal.setSortMode}
                    viewMode={portal.viewMode}
                    onViewModeChange={portal.setViewMode}
                    totalCount={portal.totalCount}
                    filteredCount={portal.filteredCount}
                />
            </div>

            {/* Favorites */}
            {!portal.searchQuery && portal.pinnedCards.length > 0 && (
                <div className="mt-6">
                    <PortalFavorites
                        cards={portal.pinnedCards}
                        onClick={handleCardClick}
                    />
                </div>
            )}

            {/* Recent */}
            {!portal.searchQuery && portal.recentCards.length > 0 && (
                <div className="mt-6">
                    <PortalRecent
                        cards={portal.recentCards}
                        onClick={handleCardClick}
                    />
                </div>
            )}

            {/* Divider */}
            {!portal.searchQuery && (portal.pinnedCards.length > 0 || portal.recentCards.length > 0) && (
                <div className="mt-8 mb-2 flex items-center gap-3">
                    <h2 className="text-xs font-extrabold uppercase tracking-widest text-vct-text-muted">
                        {t('portal.allWorkspaces')}
                    </h2>
                    <div className="h-px flex-1 bg-vct-border/50" />
                </div>
            )}

            {/* Category Groups */}
            {portal.categoryGroups.length > 0 ? (
                <div className="mt-4 space-y-8">
                    {portal.categoryGroups.map((group) => (
                        <PortalCategoryGroup
                            key={group.category}
                            category={group.category}
                            label={group.label}
                            icon={group.icon}
                            color={group.color}
                            cards={group.cards}
                            viewMode={portal.viewMode}
                            isExpanded={portal.expandedCategories.has(group.category)}
                            onToggle={() => portal.toggleCategory(group.category)}
                            onCardClick={handleCardClick}
                        />
                    ))}
                </div>
            ) : portal.searchQuery ? (
                <PortalEmptyState variant="no-results" searchQuery={portal.searchQuery} />
            ) : null}
        </div>
    )
}

// ── Welcome Header (extracted for clarity) ──
function WelcomeHeader({ name, count, t }: { name: string; count: number; t: (key: string) => string }) {
    const firstName = name.split(' ').pop() ?? name

    return (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <h1 className="text-xl font-black text-vct-text sm:text-2xl">
                    {t('portal.welcome')}, {firstName} 👋
                </h1>
                <p className="mt-1 text-sm text-vct-text-muted">
                    {count} workspace {t('portal.available') || 'khả dụng'}
                </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-vct-text-muted">
                <kbd className="rounded border border-vct-border bg-[var(--vct-bg-elevated)] px-1.5 py-0.5 text-[10px] font-bold">
                    ⌘K
                </kbd>
                <span>{t('portal.quickSwitch') || 'để chuyển nhanh'}</span>
            </div>
        </div>
    )
}

// ── Exported Page with Suspense (for useSearchParams) ──
export default function Page_portal_hub() {
    return (
        <Suspense fallback={<PortalSkeleton />}>
            <PortalHubContent />
        </Suspense>
    )
}
