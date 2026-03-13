import { useState, useEffect, useCallback } from 'react'
import {
  MOCK_SKILLS, MOCK_GOALS, MOCK_BELT_HISTORY,
  MOCK_TOURNAMENTS, MOCK_TRAINING, MOCK_RESULTS,
  MOCK_ATTENDANCE_STATS, MOCK_MEDALS, MOCK_NOTIFICATIONS,
  type MockSkill, type MockGoal, type MockBelt,
  type MockTournament, type MockTraining, type MockResult,
  type MockNotification,
} from './mock-data'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Mobile API Hooks
// Data-fetching hooks with loading/error states.
// Currently use mock data; replace internals with real API calls.
// ═══════════════════════════════════════════════════════════════

/** Generic async data hook */
function useAsyncData<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    fetcher()
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Có lỗi xảy ra'))
      .finally(() => setIsLoading(false))
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { refetch() }, [refetch])

  return { data, isLoading, error, refetch }
}

/** Simulate network delay for realistic loading states */
function mockDelay<T>(data: T, ms = 600): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(data), ms))
}

// ── Athlete Profile ──

export interface AthleteProfileData {
  name: string; club: string; belt: string; elo: number
  isActive: boolean; tournamentCount: number; medalCount: number; attendanceRate: number
  skills: MockSkill[]; goals: MockGoal[]; beltHistory: MockBelt[]
}

export function useAthleteProfile() {
  return useAsyncData<AthleteProfileData>(() => mockDelay({
    name: 'VĐV Demo', club: 'CLB Tân Bình', belt: 'Lam đai 3', elo: 1450,
    isActive: true, tournamentCount: 12, medalCount: 5, attendanceRate: 87,
    skills: MOCK_SKILLS, goals: MOCK_GOALS, beltHistory: MOCK_BELT_HISTORY,
  }))
}

// ── Tournaments ──

export function useAthleteTournaments() {
  return useAsyncData<MockTournament[]>(() => mockDelay(MOCK_TOURNAMENTS))
}

// ── Training ──

export interface TrainingData {
  sessions: MockTraining[]
  stats: typeof MOCK_ATTENDANCE_STATS
}

export function useAthleteTraining() {
  return useAsyncData<TrainingData>(() => mockDelay({
    sessions: MOCK_TRAINING,
    stats: MOCK_ATTENDANCE_STATS,
  }))
}

// ── Results ──

export interface ResultsData {
  results: MockResult[]
  medals: typeof MOCK_MEDALS
  eloRating: number
  totalTournaments: number
}

export function useAthleteResults() {
  return useAsyncData<ResultsData>(() => mockDelay({
    results: MOCK_RESULTS,
    medals: MOCK_MEDALS,
    eloRating: 1450,
    totalTournaments: 12,
  }))
}

// ── Notifications ──

export function useNotifications() {
  const [notifications, setNotifications] = useState<MockNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    mockDelay(MOCK_NOTIFICATIONS).then(data => {
      setNotifications(data)
      setIsLoading(false)
    })
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const refetch = useCallback(() => {
    setIsLoading(true)
    mockDelay(MOCK_NOTIFICATIONS).then(data => {
      setNotifications(data)
      setIsLoading(false)
    })
  }, [])

  return { notifications, isLoading, markAsRead, markAllRead, refetch }
}
