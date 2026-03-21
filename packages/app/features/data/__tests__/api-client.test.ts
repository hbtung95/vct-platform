import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ApiClientError, apiClient } from '../api-client'

// ── Mock global fetch ──
const mockFetch = vi.fn()

beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch)
    mockFetch.mockReset()
})

afterEach(() => {
    vi.unstubAllGlobals()
})

function jsonResponse(data: unknown, status = 200) {
    return Promise.resolve(
        new Response(JSON.stringify(data), {
            status,
            headers: { 'Content-Type': 'application/json' },
        })
    )
}

function errorResponse(body: unknown, status: number) {
    return Promise.resolve(
        new Response(JSON.stringify(body), {
            status,
            headers: { 'Content-Type': 'application/json' },
        })
    )
}

// ═══════════════════════════════════════════════════════════════
// GET
// ═══════════════════════════════════════════════════════════════

describe('apiClient.get', () => {
    it('returns parsed JSON data', async () => {
        mockFetch.mockReturnValueOnce(jsonResponse({ id: 1, name: 'Test' }))

        const result = await apiClient.get<{ id: number; name: string }>('/api/v1/items')
        expect(result).toEqual({ id: 1, name: 'Test' })
    })

    it('sends Authorization header when token provided', async () => {
        mockFetch.mockReturnValueOnce(jsonResponse({ ok: true }))

        await apiClient.get('/api/v1/me', 'my-jwt-token')

        expect(mockFetch).toHaveBeenCalledTimes(1)
        const init = mockFetch.mock.calls[0]?.[1] as RequestInit & {
            headers: Record<string, string>
        }
        expect(init.headers['Authorization']).toBe('Bearer my-jwt-token')
    })

    it('does not send Authorization header without token', async () => {
        mockFetch.mockReturnValueOnce(jsonResponse({ ok: true }))

        await apiClient.get('/api/v1/public')

        expect(mockFetch).toHaveBeenCalledTimes(1)
        const init = mockFetch.mock.calls[0]?.[1] as RequestInit & {
            headers: Record<string, string>
        }
        expect(init.headers['Authorization']).toBeUndefined()
    })
})

// ═══════════════════════════════════════════════════════════════
// POST
// ═══════════════════════════════════════════════════════════════

describe('apiClient.post', () => {
    it('sends JSON body', async () => {
        mockFetch.mockReturnValueOnce(jsonResponse({ id: 2 }))

        await apiClient.post('/api/v1/items', { name: 'New' }, 'tok')

        expect(mockFetch).toHaveBeenCalledTimes(1)
        const init = mockFetch.mock.calls[0]?.[1] as RequestInit & {
            headers: Record<string, string>
            body: string
        }
        expect(init.method).toBe('POST')
        expect(init.headers['Content-Type']).toBe('application/json')
        expect(JSON.parse(init.body)).toEqual({ name: 'New' })
    })
})

// ═══════════════════════════════════════════════════════════════
// DELETE — 204 No Content
// ═══════════════════════════════════════════════════════════════

describe('apiClient.delete', () => {
    it('handles 204 No Content', async () => {
        mockFetch.mockReturnValueOnce(
            Promise.resolve(new Response(null, { status: 204 }))
        )

        const result = await apiClient.delete('/api/v1/items/1')
        expect(result).toBeUndefined()
    })
})

// ═══════════════════════════════════════════════════════════════
// Error Handling
// ═══════════════════════════════════════════════════════════════

describe('error handling', () => {
    it('throws ApiClientError on 4xx', async () => {
        mockFetch.mockReturnValue(
            errorResponse({ message: 'Not Found', code: 'NOT_FOUND' }, 404)
        )

        try {
            await apiClient.get('/api/v1/missing')
            expect.fail('should have thrown')
        } catch (err) {
            expect(err).toBeInstanceOf(ApiClientError)
            const apiErr = err as ApiClientError
            expect(apiErr.status).toBe(404)
            expect(apiErr.code).toBe('NOT_FOUND')
            expect(apiErr.message).toBe('Not Found')
        }
    })

    it('does NOT retry on 4xx errors', async () => {
        mockFetch.mockReturnValue(
            errorResponse({ message: 'Bad Request' }, 400)
        )

        try {
            await apiClient.get('/api/v1/bad')
        } catch { /* expected */ }

        // Should only call fetch once (no retries for client errors)
        expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('retries on 5xx errors (up to 3 attempts)', async () => {
        vi.useFakeTimers()

        mockFetch.mockReturnValue(
            errorResponse({ message: 'Internal Error' }, 500)
        )

        const promise = apiClient.get('/api/v1/flaky')

        // Advance through retry delays
        for (let i = 0; i < 5; i++) {
            await vi.advanceTimersByTimeAsync(1000)
        }

        try {
            await promise
        } catch { /* expected */ }

        // Default retries = 2, so total attempts = 3
        expect(mockFetch).toHaveBeenCalledTimes(3)

        vi.useRealTimers()
    })

    it('handles non-JSON error response', async () => {
        mockFetch.mockReturnValue(
            Promise.resolve(new Response('Gateway Timeout', {
                status: 504,
                headers: { 'Content-Type': 'text/plain' },
            }))
        )

        // Need to advance timers for retries
        vi.useFakeTimers()
        const promise = apiClient.get('/api/v1/timeout')
        for (let i = 0; i < 5; i++) {
            await vi.advanceTimersByTimeAsync(1000)
        }

        try {
            await promise
            expect.fail('should have thrown')
        } catch (err) {
            expect(err).toBeInstanceOf(Error)
        }

        vi.useRealTimers()
    })
})

// ═══════════════════════════════════════════════════════════════
// ApiClientError class
// ═══════════════════════════════════════════════════════════════

describe('ApiClientError', () => {
    it('has correct properties', () => {
        const err = new ApiClientError('Forbidden', 403, 'FORBIDDEN')
        expect(err.name).toBe('ApiClientError')
        expect(err.status).toBe(403)
        expect(err.code).toBe('FORBIDDEN')
        expect(err.message).toBe('Forbidden')
        expect(err).toBeInstanceOf(Error)
    })
})
