import { useState, useCallback } from 'react'

type ToastType = 'success' | 'warning' | 'error' | 'info'

interface ToastState {
    show: boolean
    msg: string
    type: ToastType
}

/**
 * Shared toast hook for admin pages.
 * Returns [state, showToast, dismiss] tuple.
 */
export function useAdminToast(duration = 3500) {
    const [toast, setToast] = useState<ToastState>({ show: false, msg: '', type: 'success' })

    const showToast = useCallback((msg: string, type: ToastType = 'success') => {
        setToast({ show: true, msg, type })
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), duration)
    }, [duration])

    const dismiss = useCallback(() => {
        setToast(prev => ({ ...prev, show: false }))
    }, [])

    return { toast, showToast, dismiss } as const
}
