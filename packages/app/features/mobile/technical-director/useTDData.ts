import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../auth/AuthProvider'
import {
  fetchTDDashboard, fetchTDStandards, fetchTDRefereeQuality, isApiAvailable,
  type TDDashboardAPI, type TDStandardAPI, type TDRefereeQualityAPI,
} from './td-api'
import { MOCK_TD_DASHBOARD, MOCK_TD_STANDARDS, MOCK_TD_REFEREE_QUALITY } from './td-mock-data'

function useTDHook<T>(fetchFn: (token: string | null) => Promise<T>, mockData: T) {
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

export function useTDDashboard() {
  return useTDHook<TDDashboardAPI>(t => fetchTDDashboard(t), MOCK_TD_DASHBOARD)
}
export function useTDStandards() {
  return useTDHook<TDStandardAPI[]>(t => fetchTDStandards(t), MOCK_TD_STANDARDS)
}
export function useTDRefereeQuality() {
  return useTDHook<TDRefereeQualityAPI[]>(t => fetchTDRefereeQuality(t), MOCK_TD_REFEREE_QUALITY)
}
