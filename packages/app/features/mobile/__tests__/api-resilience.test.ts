import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createResilientFetch,
  ResilientFetchError,
} from '../api-resilience'

const originalFetch = globalThis.fetch

describe('createResilientFetch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('circuit breaker', () => {
    it('opens after the failure threshold', async () => {
      let callCount = 0
      globalThis.fetch = vi.fn().mockImplementation(() => {
        callCount += 1
        return Promise.resolve(new Response('error', { status: 500 }))
      }) as typeof fetch

      const fetcher = createResilientFetch({
        retry: { maxRetries: 0, baseDelay: 10, maxDelay: 100, jitter: 0, retryableStatuses: [500] },
        circuitBreaker: { failureThreshold: 3, successThreshold: 1, timeout: 5000, windowSize: 60000 },
        requestTimeout: 5000,
      })

      for (let i = 0; i < 3; i++) {
        await expect(fetcher('https://api.example.com/test')).rejects.toThrow(ResilientFetchError)
      }

      await expect(fetcher('https://api.example.com/test')).rejects.toThrow(/circuit breaker is open/i)
      expect(callCount).toBe(3)
    })

    it('recovers after the open timeout expires', async () => {
      let callCount = 0
      globalThis.fetch = vi.fn().mockImplementation(() => {
        callCount += 1
        if (callCount <= 3) {
          return Promise.resolve(new Response('error', { status: 500 }))
        }
        return Promise.resolve(new Response('ok', { status: 200 }))
      }) as typeof fetch

      const fetcher = createResilientFetch({
        retry: { maxRetries: 0, baseDelay: 10, maxDelay: 100, jitter: 0, retryableStatuses: [500] },
        circuitBreaker: { failureThreshold: 3, successThreshold: 1, timeout: 100, windowSize: 60000 },
        requestTimeout: 5000,
      })

      for (let i = 0; i < 3; i++) {
        await expect(fetcher('https://api.example.com/test')).rejects.toThrow()
      }

      vi.advanceTimersByTime(150)

      const response = await fetcher('https://api.example.com/test')
      expect(response.ok).toBe(true)
      expect(callCount).toBe(4)
    })
  })

  describe('retry', () => {
    it('retries on 500 errors', async () => {
      let attempt = 0
      globalThis.fetch = vi.fn().mockImplementation(() => {
        attempt += 1
        if (attempt < 3) {
          return Promise.resolve(new Response('fail', { status: 500 }))
        }
        return Promise.resolve(new Response('ok', { status: 200 }))
      }) as typeof fetch

      const fetcher = createResilientFetch({
        retry: { maxRetries: 3, baseDelay: 10, maxDelay: 100, jitter: 0, retryableStatuses: [500] },
        circuitBreaker: { failureThreshold: 10, successThreshold: 1, timeout: 5000, windowSize: 60000 },
        requestTimeout: 5000,
      })

      const responsePromise = fetcher('https://api.example.com/test')
      await vi.runAllTimersAsync()
      const response = await responsePromise

      expect(response.ok).toBe(true)
      expect(attempt).toBe(3)
    })

    it('does not retry non-retryable status codes', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response('not found', { status: 404 }),
      ) as typeof fetch

      const fetcher = createResilientFetch({
        retry: { maxRetries: 3, baseDelay: 10, maxDelay: 100, jitter: 0, retryableStatuses: [500] },
        circuitBreaker: { failureThreshold: 10, successThreshold: 1, timeout: 5000, windowSize: 60000 },
        requestTimeout: 5000,
      })

      await expect(fetcher('https://api.example.com/test')).rejects.toThrow(ResilientFetchError)
      expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('success path', () => {
    it('returns the response on success', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ data: 'test' }), { status: 200 }),
      ) as typeof fetch

      const fetcher = createResilientFetch({
        requestTimeout: 5000,
        retry: { maxRetries: 0, baseDelay: 10, maxDelay: 100, jitter: 0, retryableStatuses: [] },
        circuitBreaker: { failureThreshold: 5, successThreshold: 2, timeout: 30000, windowSize: 60000 },
      })

      const response = await fetcher('https://api.example.com/test')
      expect(response.ok).toBe(true)
      await expect(response.json()).resolves.toEqual({ data: 'test' })
    })
  })
})
