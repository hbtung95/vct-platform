'use client'

import * as React from 'react'

interface PaginationBarProps {
    currentPage: number
    totalPages: number
    totalItems: number
    pageSize: number
    hasPrev: boolean
    hasNext: boolean
    prev: () => void
    next: () => void
}

export const AdminPaginationBar: React.FC<PaginationBarProps> = ({
    currentPage, totalPages, totalItems, pageSize,
    hasPrev, hasNext, prev, next,
}) => {
    if (totalPages <= 1) return null

    const start = (currentPage - 1) * pageSize + 1
    const end = Math.min(currentPage * pageSize, totalItems)

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-4 py-3 border-t border-(--vct-border-subtle)">
            <span className="text-xs text-(--vct-text-tertiary)">
                Hiển thị {start}–{end} / {totalItems}
            </span>
            <div className="flex gap-2">
                <button
                    onClick={prev}
                    disabled={!hasPrev}
                    className="px-3 py-1 text-xs rounded-lg bg-(--vct-bg-elevated) text-(--vct-text-secondary) disabled:opacity-30 hover:bg-(--vct-bg-base) transition-colors"
                >
                    ← Trước
                </button>
                <span className="px-3 py-1 text-xs text-(--vct-text-tertiary)">
                    {currentPage}/{totalPages}
                </span>
                <button
                    onClick={next}
                    disabled={!hasNext}
                    className="px-3 py-1 text-xs rounded-lg bg-(--vct-bg-elevated) text-(--vct-text-secondary) disabled:opacity-30 hover:bg-(--vct-bg-base) transition-colors"
                >
                    Sau →
                </button>
            </div>
        </div>
    )
}
