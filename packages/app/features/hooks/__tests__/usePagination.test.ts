import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePagination } from '../usePagination'

function items(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i + 1)
}

describe('usePagination', () => {
    it('returns first page by default', () => {
        const { result } = renderHook(() => usePagination(items(25)))
        expect(result.current.currentPage).toBe(1)
        expect(result.current.paginatedItems).toEqual(items(10))
        expect(result.current.totalPages).toBe(3)
        expect(result.current.totalItems).toBe(25)
    })

    it('respects custom pageSize', () => {
        const { result } = renderHook(() =>
            usePagination(items(50), { pageSize: 20 })
        )
        expect(result.current.paginatedItems.length).toBe(20)
        expect(result.current.totalPages).toBe(3)
    })

    it('navigates to next and prev page', () => {
        const { result } = renderHook(() => usePagination(items(30)))

        act(() => result.current.next())
        expect(result.current.currentPage).toBe(2)
        expect(result.current.hasPrev).toBe(true)

        act(() => result.current.next())
        expect(result.current.currentPage).toBe(3)
        expect(result.current.hasNext).toBe(false)

        act(() => result.current.prev())
        expect(result.current.currentPage).toBe(2)
    })

    it('does not go below page 1', () => {
        const { result } = renderHook(() => usePagination(items(5)))
        act(() => result.current.prev())
        expect(result.current.currentPage).toBe(1)
        expect(result.current.hasPrev).toBe(false)
    })

    it('does not go above total pages', () => {
        const { result } = renderHook(() => usePagination(items(15)))
        // totalPages = 2
        act(() => result.current.goToPage(99))
        expect(result.current.currentPage).toBe(2)
    })

    it('goToPage clamps to valid range', () => {
        const { result } = renderHook(() => usePagination(items(50)))
        act(() => result.current.goToPage(-5))
        expect(result.current.currentPage).toBe(1)

        act(() => result.current.goToPage(999))
        expect(result.current.currentPage).toBe(5)
    })

    it('resets to page 1', () => {
        const { result } = renderHook(() => usePagination(items(30)))
        act(() => result.current.goToPage(3))
        expect(result.current.currentPage).toBe(3)

        act(() => result.current.reset())
        expect(result.current.currentPage).toBe(1)
    })

    it('handles empty array', () => {
        const { result } = renderHook(() => usePagination([]))
        expect(result.current.totalPages).toBe(1)
        expect(result.current.paginatedItems).toEqual([])
        expect(result.current.hasNext).toBe(false)
        expect(result.current.hasPrev).toBe(false)
    })

    it('last page has correct number of items', () => {
        const { result } = renderHook(() => usePagination(items(23)))
        // totalPages = 3, last page has 3 items
        act(() => result.current.goToPage(3))
        expect(result.current.paginatedItems.length).toBe(3)
        expect(result.current.paginatedItems).toEqual([21, 22, 23])
    })

    it('supports initialPage option', () => {
        const { result } = renderHook(() =>
            usePagination(items(30), { initialPage: 2 })
        )
        expect(result.current.currentPage).toBe(2)
        expect(result.current.paginatedItems[0]).toBe(11)
    })
})
