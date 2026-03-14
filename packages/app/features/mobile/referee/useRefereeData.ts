import { useState, useEffect } from 'react'
import { MOCK_REFEREE_ASSIGNMENTS, REFEREE_DASHBOARD_STATS } from './referee-mock-data'

export function useRefereeAssignments() {
  const [data, setData] = useState(MOCK_REFEREE_ASSIGNMENTS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate network delay
    const timer = setTimeout(() => {
      setData(MOCK_REFEREE_ASSIGNMENTS)
      setIsLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  return { assignments: data, isLoading }
}

export function useRefereeStats() {
  const [data, setData] = useState(REFEREE_DASHBOARD_STATS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(REFEREE_DASHBOARD_STATS)
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return { stats: data, isLoading }
}
