import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../auth/AuthProvider'
import {
  fetchBTCStats, fetchRegistrations, fetchSchedule,
  fetchWeighIns, fetchDraws, fetchRefereeAssignments,
  fetchResults, fetchStandings, fetchProtests, fetchMeetings,
} from './btc-api'
import type {
  BTCStatsAPI, RegistrationAPI, ScheduleSlotAPI, WeighInAPI,
  DrawAPI, RefereeAssignmentAPI, MatchResultAPI, TeamStandingAPI,
  ProtestAPI, MeetingAPI,
} from './btc-api'
import {
  MOCK_BTC_STATS, MOCK_REGISTRATIONS, MOCK_SCHEDULE,
  MOCK_WEIGH_INS, MOCK_DRAWS, MOCK_REFEREE_ASSIGNMENTS,
  MOCK_RESULTS, MOCK_STANDINGS, MOCK_PROTESTS, MOCK_MEETINGS,
} from './btc-mock-data'
import { isApiAvailable } from '../api-client'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — BTC Data Hooks
// API-first with mock fallback for offline/demo
// ═══════════════════════════════════════════════════════════════

function useData<T>(fetcher: (token?: string | null) => Promise<T>, mockData: T) {
  const { token } = useAuth()
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refetch = useCallback(async () => {
    setIsLoading(true)
    try {
      if (isApiAvailable()) {
        const result = await fetcher(token)
        setData(result)
      } else {
        await new Promise(r => setTimeout(r, 400))
        setData(mockData)
      }
    } catch {
      setData(mockData)
    } finally {
      setIsLoading(false)
    }
  }, [token, fetcher, mockData])

  useEffect(() => { refetch() }, [refetch])
  return { data, isLoading, refetch }
}

export function useBTCStats() {
  return useData(() => fetchBTCStats(), MOCK_BTC_STATS)
}

export function useBTCRegistrations() {
  const result = useData(
    () => fetchRegistrations().then(r => r.registrations),
    MOCK_REGISTRATIONS
  )
  return { ...result, data: result.data as RegistrationAPI[] | null }
}

export function useBTCSchedule() {
  const result = useData(
    () => fetchSchedule().then(r => r.schedule),
    MOCK_SCHEDULE
  )
  return { ...result, data: result.data as ScheduleSlotAPI[] | null }
}

export function useBTCWeighIns() {
  return useData(() => fetchWeighIns(), MOCK_WEIGH_INS) as { data: WeighInAPI[] | null; isLoading: boolean; refetch: () => Promise<void> }
}

export function useBTCDraws() {
  return useData(() => fetchDraws(), MOCK_DRAWS) as { data: DrawAPI[] | null; isLoading: boolean; refetch: () => Promise<void> }
}

export function useBTCRefereeAssignments() {
  return useData(() => fetchRefereeAssignments(), MOCK_REFEREE_ASSIGNMENTS) as { data: RefereeAssignmentAPI[] | null; isLoading: boolean; refetch: () => Promise<void> }
}

export function useBTCResults() {
  const result = useData(
    () => fetchResults().then(r => r.results),
    MOCK_RESULTS
  )
  return { ...result, data: result.data as MatchResultAPI[] | null }
}

export function useBTCStandings() {
  const result = useData(
    () => fetchStandings().then(r => r.standings),
    MOCK_STANDINGS
  )
  return { ...result, data: result.data as TeamStandingAPI[] | null }
}

export function useBTCProtests() {
  return useData(() => fetchProtests(), MOCK_PROTESTS) as { data: ProtestAPI[] | null; isLoading: boolean; refetch: () => Promise<void> }
}

export function useBTCMeetings() {
  return useData(() => fetchMeetings(), MOCK_MEETINGS) as { data: MeetingAPI[] | null; isLoading: boolean; refetch: () => Promise<void> }
}
