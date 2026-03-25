'use client'
// ════════════════════════════════════════════════════════════════
// VCT PORTAL — State hook
// Manages search, sort, view mode, and category expand states.
// ════════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { WorkspaceCard, WorkspaceCategory } from '../../layout/workspace-types'
import { WORKSPACE_CATEGORIES, getCategoryForType } from '../../layout/workspace-types'
import { useWorkspaceStore } from '../../layout/workspace-store'

// ── Vietnamese diacritics normalization ──
export function normalizeVietnamese(str: string): string {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim()
}

export type SortMode = 'az' | 'recent' | 'pending'
export type ViewMode = 'grid' | 'list'

const VIEW_MODE_KEY = 'vct-portal-view-mode'

export interface PortalCategoryGroup {
    category: WorkspaceCategory
    label: string
    icon: string
    color: string
    cards: WorkspaceCard[]
}

export function usePortalState(workspaces: WorkspaceCard[]) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // ── Search ──
    const initialQuery = searchParams?.get('q') ?? ''
    const [searchQuery, setSearchQuery] = useState(initialQuery)

    // Sync search to URL (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams?.toString() ?? '')
            if (searchQuery) {
                params.set('q', searchQuery)
            } else {
                params.delete('q')
            }
            const qs = params.toString()
            router.replace(qs ? `?${qs}` : '/', { scroll: false })
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery]) // eslint-disable-line react-hooks/exhaustive-deps

    // ── Sort ──
    const [sortMode, setSortMode] = useState<SortMode>('recent')

    // ── View mode (persisted) ──
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    useEffect(() => {
        if (typeof window === 'undefined') return
        const stored = localStorage.getItem(VIEW_MODE_KEY) as ViewMode | null
        if (stored === 'grid' || stored === 'list') setViewMode(stored)
    }, [])
    const handleSetViewMode = useCallback((mode: ViewMode) => {
        setViewMode(mode)
        if (typeof window !== 'undefined') localStorage.setItem(VIEW_MODE_KEY, mode)
    }, [])

    // ── Category expand states ──
    const [expandedCategories, setExpandedCategories] = useState<Set<WorkspaceCategory>>(new Set())
    const toggleCategory = useCallback((cat: WorkspaceCategory) => {
        setExpandedCategories((prev) => {
            const next = new Set(prev)
            if (next.has(cat)) next.delete(cat)
            else next.add(cat)
            return next
        })
    }, [])

    // ── Store data ──
    const { pinnedWorkspaceIds, lastAccessedMap } = useWorkspaceStore()

    // ── Filtered + Sorted workspaces ──
    const filteredCards = useMemo(() => {
        let cards = [...workspaces]

        // Search filter (diacritics-aware)
        if (searchQuery) {
            const normalizedQuery = normalizeVietnamese(searchQuery)
            cards = cards.filter((card) => {
                const name = normalizeVietnamese(card.label)
                const desc = normalizeVietnamese(card.description)
                const scopeName = normalizeVietnamese(card.scope.name)
                return (
                    name.includes(normalizedQuery) ||
                    desc.includes(normalizedQuery) ||
                    scopeName.includes(normalizedQuery)
                )
            })
        }

        // Sort
        switch (sortMode) {
            case 'az':
                cards.sort((a, b) => a.label.localeCompare(b.label, 'vi'))
                break
            case 'recent':
                cards.sort((a, b) => (lastAccessedMap[b.id] ?? 0) - (lastAccessedMap[a.id] ?? 0))
                break
            case 'pending':
                cards.sort((a, b) => (b.pendingActions ?? 0) - (a.pendingActions ?? 0))
                break
        }

        return cards
    }, [workspaces, searchQuery, sortMode, lastAccessedMap])

    // ── Pinned workspaces ──
    const pinnedCards = useMemo(
        () => workspaces.filter((c) => pinnedWorkspaceIds.includes(c.id)),
        [workspaces, pinnedWorkspaceIds]
    )

    // ── Recent workspaces ──
    const recentCards = useMemo(() => {
        return workspaces
            .filter((c) => lastAccessedMap[c.id] != null)
            .sort((a, b) => (lastAccessedMap[b.id] ?? 0) - (lastAccessedMap[a.id] ?? 0))
            .slice(0, 5)
    }, [workspaces, lastAccessedMap])

    // ── Category groups ──
    const categoryGroups = useMemo<PortalCategoryGroup[]>(() => {
        const groups: PortalCategoryGroup[] = []

        const sortedCategories = Object.entries(WORKSPACE_CATEGORIES)
            .sort(([, a], [, b]) => a.order - b.order)

        for (const [cat, meta] of sortedCategories) {
            const cards = filteredCards.filter(
                (c) => getCategoryForType(c.type) === cat
            )
            if (cards.length === 0) continue
            groups.push({
                category: cat as WorkspaceCategory,
                label: meta.label,
                icon: meta.icon,
                color: meta.color,
                cards,
            })
        }

        return groups
    }, [filteredCards])

    return {
        // Search
        searchQuery,
        setSearchQuery,
        // Sort
        sortMode,
        setSortMode,
        // View
        viewMode,
        setViewMode: handleSetViewMode,
        // Categories
        expandedCategories,
        toggleCategory,
        categoryGroups,
        // Data
        filteredCards,
        pinnedCards,
        recentCards,
        // Totals
        totalCount: workspaces.length,
        filteredCount: filteredCards.length,
    }
}
