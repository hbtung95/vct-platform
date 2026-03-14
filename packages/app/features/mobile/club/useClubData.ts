import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../auth/AuthProvider'
import {
  fetchClubDashboard,
  fetchClubMembers,
  fetchClubClasses,
  fetchClubFinance,
  fetchClubFinanceSummary,
  fetchClubAttendance as fetchClubAttendanceAPI,
  fetchClubAttendanceSummary,
  isApiAvailable,
  type ClubDashboardAPI,
  type ClubMemberAPI,
  type ClubClassAPI,
  type ClubFinanceEntryAPI,
  type ClubFinanceSummaryAPI,
  type ClubAttendanceAPI,
  type ClubAttendanceSummaryAPI,
  type DelegationStatsAPI,
  type DelegationMatchAPI,
  type DelegationResultAPI,
} from './club-api'
import {
  MOCK_DASHBOARD,
  MOCK_MEMBERS,
  MOCK_CLASSES,
  MOCK_FINANCE,
  MOCK_FINANCE_SUMMARY,
  MOCK_ATTENDANCE,
  MOCK_ATTENDANCE_SUMMARY,
  MOCK_DELEGATION_STATS,
  MOCK_DELEGATION_SCHEDULE,
  MOCK_DELEGATION_RESULTS,
} from './club-mock-data'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Club Manager Data Hooks
// API-first with mock fallback for offline / demo mode
// ═══════════════════════════════════════════════════════════════

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
    } catch {
      setData(mockData)
    } finally {
      setIsLoading(false)
    }
  }, [token, fetchFn, mockData])

  useEffect(() => { refetch() }, [refetch])

  return { data: data as T, isLoading, error, refetch }
}

// ── Hooks ──

export function useClubDashboard() {
  return useDataHook<ClubDashboardAPI>(
    (token) => fetchClubDashboard(token),
    MOCK_DASHBOARD,
  )
}

export function useClubMembers() {
  return useDataHook<ClubMemberAPI[]>(
    (token) => fetchClubMembers(token),
    MOCK_MEMBERS,
  )
}

export function useClubClasses() {
  return useDataHook<ClubClassAPI[]>(
    (token) => fetchClubClasses(token),
    MOCK_CLASSES,
  )
}

export function useClubFinance() {
  return useDataHook<ClubFinanceEntryAPI[]>(
    (token) => fetchClubFinance(token),
    MOCK_FINANCE,
  )
}

export function useClubFinanceSummary() {
  return useDataHook<ClubFinanceSummaryAPI>(
    (token) => fetchClubFinanceSummary(token),
    MOCK_FINANCE_SUMMARY,
  )
}

export function useClubAttendance(classId?: string, date?: string) {
  const { token } = useAuth()
  const [data, setData] = useState<ClubAttendanceAPI[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    try {
      if (isApiAvailable()) {
        const result = await fetchClubAttendanceAPI(token, classId, date)
        setData(result)
      } else {
        await new Promise(r => setTimeout(r, 400))
        let filtered = [...MOCK_ATTENDANCE]
        if (classId) filtered = filtered.filter(a => a.class_id === classId)
        if (date) filtered = filtered.filter(a => a.date === date)
        setData(filtered)
      }
    } catch {
      setData(MOCK_ATTENDANCE)
    } finally {
      setIsLoading(false)
    }
  }, [token, classId, date])

  useEffect(() => { refetch() }, [refetch])
  return { data, isLoading, refetch }
}

export function useClubAttendanceSummary() {
  return useDataHook<ClubAttendanceSummaryAPI>(
    (token) => fetchClubAttendanceSummary(token),
    MOCK_ATTENDANCE_SUMMARY,
  )
}

// ── Delegation Hooks ──

export function useDelegationStats() {
  const [data, setData] = useState<DelegationStatsAPI>(MOCK_DELEGATION_STATS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(MOCK_DELEGATION_STATS)
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return { stats: data, isLoading }
}

export function useDelegationSchedule() {
  const [data, setData] = useState<DelegationMatchAPI[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(MOCK_DELEGATION_SCHEDULE as DelegationMatchAPI[])
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return { schedule: data, isLoading }
}

export function useDelegationResults() {
  const [data, setData] = useState<DelegationResultAPI[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(MOCK_DELEGATION_RESULTS as DelegationResultAPI[])
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return { results: data, isLoading }
}
