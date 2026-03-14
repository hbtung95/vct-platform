import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../auth/AuthProvider'
import {
  fetchParentDashboard,
  fetchParentChildren,
  fetchConsents as fetchConsentsAPI,
  fetchChildAttendance as fetchChildAttendanceAPI,
  fetchChildResults as fetchChildResultsAPI,
  isApiAvailable,
  type ParentDashboardAPI,
  type ChildLinkAPI,
  type ConsentRecordAPI,
  type AttendanceRecordAPI,
  type ChildResultAPI,
} from './parent-api'
import {
  MOCK_DASHBOARD,
  MOCK_CHILDREN,
  MOCK_CONSENTS,
  MOCK_ATTENDANCE,
  MOCK_CHILD_RESULTS,
} from './parent-mock-data'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Parent Data Hooks
// API-first with mock fallback for offline / demo mode
// ═══════════════════════════════════════════════════════════════

const toErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback

/** Generic hook with API-first, mock-fallback pattern */
function useDataHook<T>(
  fetchFn: (token: string | null) => Promise<T>,
  mockData: T,
) {
  const { token } = useAuth()
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      if (isApiAvailable()) {
        const result = await fetchFn(token)
        setData(result)
      } else {
        await new Promise(r => setTimeout(r, 600))
        setData(mockData)
      }
    } catch (error: unknown) {
      setData(null)
      setError(toErrorMessage(error, 'Không thể tải dữ liệu'))
    } finally {
      setIsLoading(false)
    }
  }, [token, fetchFn, mockData])

  useEffect(() => { refetch() }, [refetch])

  return { data, isLoading, error, refetch }
}

// ── Hooks ──

export function useParentDashboard() {
  return useDataHook<ParentDashboardAPI>(
    (token) => fetchParentDashboard(token),
    MOCK_DASHBOARD,
  )
}

export function useParentChildren() {
  return useDataHook<ChildLinkAPI[]>(
    (token) => fetchParentChildren(token),
    MOCK_CHILDREN,
  )
}

export function useParentConsents() {
  return useDataHook<ConsentRecordAPI[]>(
    (token) => fetchConsentsAPI(token),
    MOCK_CONSENTS,
  )
}

export function useChildAttendance(athleteId: string) {
  const { token } = useAuth()
  const [data, setData] = useState<AttendanceRecordAPI[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!athleteId) {
      setData([])
      setError(null)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      if (isApiAvailable()) {
        const result = await fetchChildAttendanceAPI(token, athleteId)
        setData(result)
      } else {
        await new Promise(r => setTimeout(r, 400))
        setData(MOCK_ATTENDANCE[athleteId] ?? [])
      }
    } catch (error: unknown) {
      setData([])
      setError(toErrorMessage(error, 'Không thể tải dữ liệu điểm danh'))
    } finally {
      setIsLoading(false)
    }
  }, [token, athleteId])

  useEffect(() => { refetch() }, [refetch])
  return { data, isLoading, error, refetch }
}

export function useChildResults(athleteId: string) {
  const { token } = useAuth()
  const [data, setData] = useState<ChildResultAPI[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!athleteId) {
      setData([])
      setError(null)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      if (isApiAvailable()) {
        const result = await fetchChildResultsAPI(token, athleteId)
        setData(result)
      } else {
        await new Promise(r => setTimeout(r, 400))
        setData(MOCK_CHILD_RESULTS[athleteId] ?? [])
      }
    } catch (error: unknown) {
      setData([])
      setError(toErrorMessage(error, 'Không thể tải dữ liệu thành tích'))
    } finally {
      setIsLoading(false)
    }
  }, [token, athleteId])

  useEffect(() => { refetch() }, [refetch])
  return { data, isLoading, error, refetch }
}
