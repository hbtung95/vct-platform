import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const originalEnv = { ...process.env }
const originalFetch = globalThis.fetch

async function loadApiClientModule() {
  vi.resetModules()
  return import('../api-client')
}

describe('api-client', () => {
  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  describe('getApiBaseUrl', () => {
    it('prefers EXPO_PUBLIC_API_BASE_URL', async () => {
      vi.stubEnv('EXPO_PUBLIC_API_BASE_URL', 'https://expo-api.example.com')
      vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://next-api.example.com')

      const mod = await loadApiClientModule()
      expect(mod.isApiAvailable()).toBe(true)
    })

    it('falls back to NEXT_PUBLIC_API_BASE_URL', async () => {
      delete process.env.EXPO_PUBLIC_API_BASE_URL
      vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://next-api.example.com')

      const mod = await loadApiClientModule()
      expect(mod.isApiAvailable()).toBe(true)
    })

    it('returns unavailable when no env vars are set', async () => {
      delete process.env.EXPO_PUBLIC_API_BASE_URL
      delete process.env.NEXT_PUBLIC_API_BASE_URL

      const mod = await loadApiClientModule()
      expect(mod.isApiAvailable()).toBe(false)
    })
  })

  describe('ApiError', () => {
    it('creates an error with message and status', async () => {
      const { ApiError } = await loadApiClientModule()
      const error = new ApiError('Not Found', 404)

      expect(error.message).toBe('Not Found')
      expect(error.status).toBe(404)
      expect(error.name).toBe('ApiError')
      expect(error).toBeInstanceOf(Error)
    })

    it('captures a stack trace', async () => {
      const { ApiError } = await loadApiClientModule()
      const error = new ApiError('Server Error', 500)

      expect(error.stack).toBeDefined()
    })
  })

  describe('requestJson (via fetchMyProfile)', () => {
    beforeEach(() => {
      vi.stubEnv('EXPO_PUBLIC_API_BASE_URL', 'https://api.test.com')
      globalThis.fetch = vi.fn()
    })

    it('throws ApiError on non-ok response', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ message: 'Unauthorized' }),
      } as unknown as Response)

      const { ApiError, fetchMyProfile } = await loadApiClientModule()
      await expect(fetchMyProfile('bad-token')).rejects.toBeInstanceOf(ApiError)
    })

    it('passes the Authorization header when token is provided', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => null },
        json: () => Promise.resolve({ id: '1', fullName: 'Test' }),
      } as unknown as Response)

      const { fetchMyProfile } = await loadApiClientModule()
      await fetchMyProfile('valid-token')

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.test.com/api/v1/athlete-profiles/me',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer valid-token',
          }),
        }),
      )
    })
  })
})
