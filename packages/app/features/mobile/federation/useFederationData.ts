import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../auth/AuthProvider'
import {
  fetchFederationDashboard,
  fetchFederationClubs,
  fetchFederationApprovals,
  fetchFederationTournaments,
  fetchFederationReferees,
  fetchFederationFinance,
  processApproval as processApprovalAPI,
  isApiAvailable,
  type FederationDashboardAPI,
  type FederationClubAPI,
  type FederationApprovalAPI,
  type FederationTournamentAPI,
  type FederationRefereeAPI,
  type FederationFinanceAPI,
} from './federation-api'
import {
  MOCK_FEDERATION_DASHBOARD,
  MOCK_FEDERATION_CLUBS,
  MOCK_FEDERATION_APPROVALS,
  MOCK_FEDERATION_TOURNAMENTS,
  MOCK_FEDERATION_REFEREES,
  MOCK_FEDERATION_FINANCE,
} from './federation-mock-data'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Federation Manager Data Hooks
// API-first with mock fallback for offline / demo mode
// ═══════════════════════════════════════════════════════════════

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

export function useFederationDashboard() {
  return useDataHook<FederationDashboardAPI>(
    (token) => fetchFederationDashboard(token),
    MOCK_FEDERATION_DASHBOARD,
  )
}

export function useFederationClubs() {
  return useDataHook<FederationClubAPI[]>(
    (token) => fetchFederationClubs(token),
    MOCK_FEDERATION_CLUBS,
  )
}

export function useFederationTournaments() {
  return useDataHook<FederationTournamentAPI[]>(
    (token) => fetchFederationTournaments(token),
    MOCK_FEDERATION_TOURNAMENTS,
  )
}

export function useFederationReferees() {
  return useDataHook<FederationRefereeAPI[]>(
    (token) => fetchFederationReferees(token),
    MOCK_FEDERATION_REFEREES,
  )
}

export function useFederationFinance() {
  return useDataHook<FederationFinanceAPI>(
    (token) => fetchFederationFinance(token),
    MOCK_FEDERATION_FINANCE,
  )
}

export function useFederationApprovals() {
  const { token } = useAuth()
  const [data, setData] = useState<FederationApprovalAPI[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    try {
      if (isApiAvailable()) {
        const result = await fetchFederationApprovals(token)
        setData(result)
      } else {
        await new Promise(r => setTimeout(r, 600))
        setData(MOCK_FEDERATION_APPROVALS)
      }
    } catch {
      setData(MOCK_FEDERATION_APPROVALS)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => { refetch() }, [refetch])

  const processApp = async (approvalId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      if (isApiAvailable()) {
        await processApprovalAPI(token, approvalId, action, reason)
      } else {
        await new Promise(r => setTimeout(r, 400))
      }
      // Optimistic update
      setData(prev => prev.map(a => a.id === approvalId ? { ...a, status: action === 'approve' ? 'approved' : 'rejected' } : a))
    } catch (e) {
      console.error(e)
    }
  }

  return { data, isLoading, refetch, processApproval: processApp }
}
