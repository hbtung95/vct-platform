import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '../useDebounce'

describe('useDebounce', () => {
    beforeEach(() => { vi.useFakeTimers() })
    afterEach(() => { vi.useRealTimers() })

    it('returns initial value immediately', () => {
        const { result } = renderHook(() => useDebounce('hello', 300))
        expect(result.current).toBe('hello')
    })

    it('does not update before delay', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: 'a', delay: 300 } }
        )

        rerender({ value: 'b', delay: 300 })
        act(() => { vi.advanceTimersByTime(200) })
        expect(result.current).toBe('a')
    })

    it('updates after delay', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: 'a', delay: 300 } }
        )

        rerender({ value: 'b', delay: 300 })
        act(() => { vi.advanceTimersByTime(300) })
        expect(result.current).toBe('b')
    })

    it('resets timer on rapid changes', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: 'a', delay: 300 } }
        )

        rerender({ value: 'b', delay: 300 })
        act(() => { vi.advanceTimersByTime(100) })

        rerender({ value: 'c', delay: 300 })
        act(() => { vi.advanceTimersByTime(100) })

        // Only 200ms since last change — should still be 'a'
        expect(result.current).toBe('a')

        act(() => { vi.advanceTimersByTime(200) })
        // Now 300ms since 'c' — should be 'c', never 'b'
        expect(result.current).toBe('c')
    })

    it('uses default delay of 300ms', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value),
            { initialProps: { value: 'x' } }
        )

        rerender({ value: 'y' })
        act(() => { vi.advanceTimersByTime(299) })
        expect(result.current).toBe('x')

        act(() => { vi.advanceTimersByTime(1) })
        expect(result.current).toBe('y')
    })

    it('handles non-string types', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 100),
            { initialProps: { value: 42 as number } }
        )

        rerender({ value: 99 })
        act(() => { vi.advanceTimersByTime(100) })
        expect(result.current).toBe(99)
    })
})
