import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../auth/AuthProvider'
import {
  fetchAdminDashboard, fetchAdminUsers, fetchAdminAudit, isApiAvailable,
  type AdminDashboardAPI, type AdminUserAPI, type AdminAuditAPI,
} from './admin-api'
import { MOCK_ADMIN_DASHBOARD, MOCK_ADMIN_USERS, MOCK_ADMIN_AUDIT } from './admin-mock-data'

function useAdminHook<T>(fetchFn: (token: string | null) => Promise<T>, mockData: T) {
  const { token } = useAuth()
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    try {
      if (isApiAvailable()) { setData(await fetchFn(token)) }
      else { await new Promise(r => setTimeout(r, 600)); setData(mockData) }
    } catch { setData(mockData) }
    finally { setIsLoading(false) }
  }, [token, fetchFn, mockData])

  useEffect(() => { refetch() }, [refetch])
  return { data: data as T, isLoading, refetch }
}

export function useAdminDashboard() {
  return useAdminHook<AdminDashboardAPI>(t => fetchAdminDashboard(t), MOCK_ADMIN_DASHBOARD)
}
export function useAdminUsers() {
  return useAdminHook<AdminUserAPI[]>(t => fetchAdminUsers(t), MOCK_ADMIN_USERS)
}
export function useAdminAudit() {
  return useAdminHook<AdminAuditAPI[]>(t => fetchAdminAudit(t), MOCK_ADMIN_AUDIT)
}
