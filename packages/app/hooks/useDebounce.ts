import { useState, useEffect } from 'react'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — useDebounce Hook
// Delays value updates for search inputs and filters.
// ═══════════════════════════════════════════════════════════════

/**
 * Returns a debounced version of the input value.
 * The debounced value only updates after `delay` ms of inactivity.
 *
 * @example
 * const [search, setSearch] = useState('')
 * const debouncedSearch = useDebounce(search, 300)
 *
 * useEffect(() => {
 *   if (debouncedSearch) fetchResults(debouncedSearch)
 * }, [debouncedSearch])
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
