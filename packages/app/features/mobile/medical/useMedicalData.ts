import { useState, useEffect } from 'react'
import { MOCK_MEDICAL_INCIDENTS, MEDICAL_DASHBOARD_STATS, MOCK_MEDICAL_RECORDS } from './medical-mock-data'

export function useMedicalIncidents() {
  const [data, setData] = useState(MOCK_MEDICAL_INCIDENTS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(MOCK_MEDICAL_INCIDENTS)
      setIsLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  return { incidents: data, isLoading }
}

export function useMedicalStats() {
  const [data, setData] = useState(MEDICAL_DASHBOARD_STATS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(MEDICAL_DASHBOARD_STATS)
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return { stats: data, isLoading }
}

export function useMedicalRecords() {
  const [data, setData] = useState(MOCK_MEDICAL_RECORDS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(MOCK_MEDICAL_RECORDS)
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return { records: data, isLoading }
}
