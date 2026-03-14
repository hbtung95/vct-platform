import { useState, useMemo, useCallback } from 'react'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — usePagination Hook
// Reusable pagination state and helpers for list pages.
// ═══════════════════════════════════════════════════════════════

interface PaginationOptions {
  /** Items per page (default: 20) */
  pageSize?: number
  /** Initial page (default: 1) */
  initialPage?: number
}

interface PaginationResult<T> {
  /** Current page items */
  items: T[]
  /** Current page number (1-indexed) */
  page: number
  /** Items per page */
  pageSize: number
  /** Total number of pages */
  totalPages: number
  /** Total number of items */
  totalItems: number
  /** Whether there's a next page */
  hasNext: boolean
  /** Whether there's a previous page */
  hasPrev: boolean
  /** Go to the next page */
  nextPage: () => void
  /** Go to the previous page */
  prevPage: () => void
  /** Go to a specific page */
  goToPage: (page: number) => void
  /** Change page size */
  setPageSize: (size: number) => void
}

export function usePagination<T>(
  allItems: T[],
  options: PaginationOptions = {}
): PaginationResult<T> {
  const { pageSize: defaultPageSize = 20, initialPage = 1 } = options

  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSizeState] = useState(defaultPageSize)

  const totalItems = allItems.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  // Clamp current page
  const clampedPage = Math.min(page, totalPages)

  const items = useMemo(() => {
    const start = (clampedPage - 1) * pageSize
    return allItems.slice(start, start + pageSize)
  }, [allItems, clampedPage, pageSize])

  const nextPage = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages))
  }, [totalPages])

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1))
  }, [])

  const goToPage = useCallback(
    (target: number) => {
      setPage(Math.max(1, Math.min(target, totalPages)))
    },
    [totalPages]
  )

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size)
    setPage(1) // reset to first page on size change
  }, [])

  return {
    items,
    page: clampedPage,
    pageSize,
    totalPages,
    totalItems,
    hasNext: clampedPage < totalPages,
    hasPrev: clampedPage > 1,
    nextPage,
    prevPage,
    goToPage,
    setPageSize,
  }
}
