import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// ── Mock useWebSocket before importing the hook ──
const mockUseWebSocket = vi.fn()

vi.mock('../useWebSocket', () => ({
    useWebSocket: (...args: unknown[]) => mockUseWebSocket(...args),
}))

// ── Mock useAuth ──
vi.mock('../../auth/AuthProvider', () => ({
    useAuth: () => ({ token: 'test-token', user: { id: '1' } }),
}))

import { useRealtimeNotifications } from '../useRealtimeNotifications'

describe('useRealtimeNotifications', () => {
    let capturedOnEntityChange: ((event: Record<string, unknown>) => void) | null = null

    beforeEach(() => {
        vi.useFakeTimers()
        capturedOnEntityChange = null

        mockUseWebSocket.mockImplementation((opts: { onEntityChange?: (event: unknown) => void }) => {
            capturedOnEntityChange = opts.onEntityChange as typeof capturedOnEntityChange
            return { status: 'connected', send: vi.fn(), lastEvent: null }
        })
    })

    afterEach(() => {
        vi.useRealTimers()
        vi.restoreAllMocks()
    })

    it('starts with empty toast list', () => {
        const { result } = renderHook(() => useRealtimeNotifications())
        expect(result.current.toasts).toEqual([])
        expect(result.current.connectionStatus).toBe('connected')
    })

    it('adds toast from WebSocket entity change event', () => {
        const { result } = renderHook(() => useRealtimeNotifications())

        act(() => {
            capturedOnEntityChange?.({
                type: 'entity.changed',
                entity: 'athlete',
                action: 'create',
                itemId: '123',
                payload: { title: 'Tỉnh Bình Định', description: 'Đăng ký CLB mới' },
            })
        })

        expect(result.current.toasts).toHaveLength(1)
        const toast = result.current.toasts[0]!
        expect(toast.title).toBe('Tỉnh Bình Định')
        expect(toast.type).toBe('success')
    })

    it('maps delete actions to error type', () => {
        const { result } = renderHook(() => useRealtimeNotifications())

        act(() => {
            capturedOnEntityChange?.({
                entity: 'club',
                action: 'delete',
                payload: {},
            })
        })

        expect(result.current.toasts[0]!.type).toBe('error')
    })

    it('maps warning actions correctly', () => {
        const { result } = renderHook(() => useRealtimeNotifications())

        act(() => {
            capturedOnEntityChange?.({
                entity: 'budget',
                action: 'budget_alert',
                payload: {},
            })
        })

        expect(result.current.toasts[0]!.type).toBe('warning')
    })

    it('enforces max visible limit with FIFO eviction', () => {
        const { result } = renderHook(() =>
            useRealtimeNotifications({ maxVisible: 3 })
        )

        // Push 5 toasts
        for (let i = 0; i < 5; i++) {
            act(() => {
                capturedOnEntityChange?.({
                    entity: `item${i}`,
                    action: 'update',
                    payload: { title: `Toast ${i}` },
                })
            })
        }

        // Only 3 should be visible (FIFO: toast 2, 3, 4)
        expect(result.current.toasts).toHaveLength(3)
        expect(result.current.toasts[0]!.title).toBe('Toast 2')
        expect(result.current.toasts[2]!.title).toBe('Toast 4')
    })

    it('auto-dismisses after specified duration', () => {
        const { result } = renderHook(() =>
            useRealtimeNotifications({ dismissAfter: 3000 })
        )

        act(() => {
            capturedOnEntityChange?.({
                entity: 'test',
                action: 'update',
                payload: { title: 'Auto-dismiss' },
            })
        })

        expect(result.current.toasts).toHaveLength(1)

        act(() => { vi.advanceTimersByTime(3000) })

        expect(result.current.toasts).toHaveLength(0)
    })

    it('dismissToast removes a specific toast', () => {
        const { result } = renderHook(() => useRealtimeNotifications())

        act(() => {
            capturedOnEntityChange?.({
                entity: 'a',
                action: 'update',
                payload: { title: 'First' },
            })
        })
        act(() => {
            capturedOnEntityChange?.({
                entity: 'b',
                action: 'update',
                payload: { title: 'Second' },
            })
        })

        const firstId = result.current.toasts[0]!.id

        act(() => {
            result.current.dismissToast(firstId)
        })

        expect(result.current.toasts).toHaveLength(1)
        expect(result.current.toasts[0]!.title).toBe('Second')
    })

    it('pushToast adds a programmatic toast', () => {
        const { result } = renderHook(() => useRealtimeNotifications())

        act(() => {
            result.current.pushToast('Manual', 'This is programmatic', 'warning')
        })

        expect(result.current.toasts).toHaveLength(1)
        expect(result.current.toasts[0]!.title).toBe('Manual')
        expect(result.current.toasts[0]!.type).toBe('warning')
    })

    it('passes channels to useWebSocket', () => {
        renderHook(() =>
            useRealtimeNotifications({ channels: ['scoring', 'admin'] })
        )

        expect(mockUseWebSocket).toHaveBeenCalledWith(
            expect.objectContaining({ channels: ['scoring', 'admin'] })
        )
    })
})
