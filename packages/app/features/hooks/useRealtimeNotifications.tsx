'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWebSocket } from './useWebSocket'

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type ToastType = 'success' | 'warning' | 'info' | 'error'

export interface ToastMessage {
    id: string
    title: string
    description: string
    type: ToastType
    channel?: string
    timestamp: number
}

interface UseRealtimeNotificationsOptions {
    /** Channels to subscribe for notifications (default: ['notifications', 'system']) */
    channels?: string[]
    /** Maximum number of visible toasts (default: 5) */
    maxVisible?: number
    /** Auto-dismiss duration in ms (default: 6000) */
    dismissAfter?: number
    /** Enable vibration on warning/error (default: true) */
    vibrate?: boolean
    /** Only connect when true (default: true) */
    enabled?: boolean
}

// ═══════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════

const DEFAULT_CHANNELS = ['notifications', 'system']
const MAX_VISIBLE = 5
const DISMISS_AFTER = 6000

const TOAST_ICON: Record<ToastType, string> = {
    success: '✅',
    warning: '⚠️',
    info: 'ℹ️',
    error: '🚨',
}

const TOAST_STYLE: Record<ToastType, string> = {
    success: 'bg-emerald-500/10 border-emerald-500/30',
    warning: 'bg-amber-500/10 border-amber-500/30',
    info: 'bg-sky-500/10 border-sky-500/30',
    error: 'bg-red-500/10 border-red-500/30',
}

// ═══════════════════════════════════════════════════════════════
// Helper: map backend EntityChangeEvent → ToastMessage
// ═══════════════════════════════════════════════════════════════

function mapEventToToast(event: {
    type?: string
    entity?: string
    action?: string
    itemId?: string
    payload?: Record<string, unknown>
    channel?: string
}): ToastMessage | null {
    const action = event.action ?? event.type ?? 'update'
    const entity = event.entity ?? 'item'

    // Derive toast type from action semantics
    let toastType: ToastType = 'info'
    if (action.includes('delete') || action.includes('error') || action.includes('fail')) {
        toastType = 'error'
    } else if (action.includes('warn') || action.includes('alert') || action.includes('budget')) {
        toastType = 'warning'
    } else if (action.includes('create') || action.includes('approve') || action.includes('success')) {
        toastType = 'success'
    }

    // Use payload title/description if provided, else generate from entity+action
    const title = (event.payload?.title as string) ?? `${capitalize(entity)}`
    const description = (event.payload?.description as string) ??
        (event.payload?.message as string) ??
        `${capitalize(action)} — ${entity}${event.itemId ? ` #${event.itemId}` : ''}`

    return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title,
        description,
        type: toastType,
        channel: event.channel,
        timestamp: Date.now(),
    }
}

function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')
}

// ═══════════════════════════════════════════════════════════════
// Hook
// ═══════════════════════════════════════════════════════════════

export function useRealtimeNotifications(options: UseRealtimeNotificationsOptions = {}) {
    const {
        channels = DEFAULT_CHANNELS,
        maxVisible = MAX_VISIBLE,
        dismissAfter = DISMISS_AFTER,
        vibrate: enableVibrate = true,
        enabled = true,
    } = options

    const [toasts, setToasts] = useState<ToastMessage[]>([])
    const dismissTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

    // ── Auto-dismiss scheduler ──
    const scheduleDismiss = useCallback((id: string) => {
        const timer = setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
            dismissTimers.current.delete(id)
        }, dismissAfter)
        dismissTimers.current.set(id, timer)
    }, [dismissAfter])

    // ── Add toast with FIFO eviction ──
    const addToast = useCallback((toast: ToastMessage) => {
        // Haptic feedback for urgent notifications
        if (enableVibrate && (toast.type === 'warning' || toast.type === 'error')) {
            try { navigator?.vibrate?.(200) } catch { /* not supported */ }
        }

        setToasts(prev => {
            const next = [...prev, toast]
            // FIFO eviction: remove oldest if over limit
            if (next.length > maxVisible) {
                const evicted = next.slice(0, next.length - maxVisible)
                for (const removed of evicted) {
                    const timer = dismissTimers.current.get(removed.id)
                    if (timer) { clearTimeout(timer); dismissTimers.current.delete(removed.id) }
                }
                return next.slice(-maxVisible)
            }
            return next
        })

        scheduleDismiss(toast.id)
    }, [maxVisible, enableVibrate, scheduleDismiss])

    // ── Manual dismiss ──
    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
        const timer = dismissTimers.current.get(id)
        if (timer) { clearTimeout(timer); dismissTimers.current.delete(id) }
    }, [])

    // ── Programmatic push (for non-WS toasts) ──
    const pushToast = useCallback((title: string, description: string, type: ToastType = 'info') => {
        addToast({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            title,
            description,
            type,
            timestamp: Date.now(),
        })
    }, [addToast])

    // ── WebSocket integration ──
    const { status } = useWebSocket({
        channels,
        enabled,
        onEntityChange: useCallback((event: { type?: string; entity?: string; action?: string; itemId?: string; payload?: Record<string, unknown>; channel?: string }) => {
            const toast = mapEventToToast(event)
            if (toast) addToast(toast)
        }, [addToast]),
    })

    // ── Cleanup timers on unmount ──
    useEffect(() => {
        return () => {
            Array.from(dismissTimers.current.values()).forEach(timer => {
                clearTimeout(timer)
            })
            dismissTimers.current.clear()
        }
    }, [])

    // ── Toast Container Component ──
    const ToastContainer = useCallback(() => (
        <div
            className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none"
            role="log"
            aria-live="polite"
            aria-label="Notifications"
        >
            <AnimatePresence mode="popLayout">
                {toasts.map(t => (
                    <motion.div
                        key={t.id}
                        layout
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 80, scale: 0.9, transition: { duration: 0.2 } }}
                        className={`p-4 rounded-xl shadow-lg border backdrop-blur-md min-w-[300px] max-w-[400px] pointer-events-auto cursor-pointer ${TOAST_STYLE[t.type]}`}
                        style={{ background: 'var(--vct-bg-elevated, rgba(30,30,40,0.95))' }}
                        onClick={() => dismissToast(t.id)}
                        role="alert"
                        aria-atomic="true"
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-xl shrink-0" aria-hidden="true">
                                {TOAST_ICON[t.type]}
                            </span>
                            <div className="flex-1 min-w-0">
                                <h4
                                    className="text-sm font-bold truncate"
                                    style={{ color: 'var(--vct-text-primary, #fff)' }}
                                >
                                    {t.title}
                                </h4>
                                <p
                                    className="text-xs mt-0.5 line-clamp-2"
                                    style={{ color: 'var(--vct-text-secondary, #aaa)' }}
                                >
                                    {t.description}
                                </p>
                            </div>
                            <button
                                className="text-xs opacity-50 hover:opacity-100 transition-opacity shrink-0"
                                style={{ color: 'var(--vct-text-secondary, #aaa)' }}
                                onClick={(e) => { e.stopPropagation(); dismissToast(t.id) }}
                                aria-label="Đóng thông báo"
                            >
                                ✕
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    ), [toasts, dismissToast])

    return {
        /** Rendered toast stack — place in your layout */
        ToastContainer,
        /** WebSocket connection status */
        connectionStatus: status,
        /** Current visible toasts */
        toasts,
        /** Programmatically push a toast (independent of WS) */
        pushToast,
        /** Dismiss a specific toast by ID */
        dismissToast,
    }
}
