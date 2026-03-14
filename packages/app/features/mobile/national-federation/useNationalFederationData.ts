import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../auth/AuthProvider'
import {
  fetchNationalDashboard,
  fetchProvincialFederations,
  fetchNationalTournaments,
  fetchNationalReferees,
  fetchNationalRankings,
  isApiAvailable,
  type NationalDashboardAPI,
  type ProvincialFederationAPI,
  type NationalTournamentAPI,
  type NationalRefereeAPI,
  type NationalRankingAPI,
} from './national-federation-api'
import {
  MOCK_NF_DASHBOARD,
  MOCK_PROVINCIAL_FEDERATIONS,
  MOCK_NF_TOURNAMENTS,
  MOCK_NF_REFEREES,
  MOCK_NF_RANKINGS,
} from './national-federation-mock-data'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — National Federation Data Hooks
// API-first with mock fallback for offline / demo mode
// ═══════════════════════════════════════════════════════════════

function useNFDataHook<T>(
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

export function useNationalDashboard() {
  return useNFDataHook<NationalDashboardAPI>(
    (token) => fetchNationalDashboard(token),
    MOCK_NF_DASHBOARD,
  )
}

export function useProvincialFederations() {
  return useNFDataHook<ProvincialFederationAPI[]>(
    (token) => fetchProvincialFederations(token),
    MOCK_PROVINCIAL_FEDERATIONS,
  )
}

export function useNationalTournaments() {
  return useNFDataHook<NationalTournamentAPI[]>(
    (token) => fetchNationalTournaments(token),
    MOCK_NF_TOURNAMENTS,
  )
}

export function useNationalReferees() {
  return useNFDataHook<NationalRefereeAPI[]>(
    (token) => fetchNationalReferees(token),
    MOCK_NF_REFEREES,
  )
}

export function useNationalRankings() {
  return useNFDataHook<NationalRankingAPI[]>(
    (token) => fetchNationalRankings(token),
    MOCK_NF_RANKINGS,
  )
}
