// @ts-nocheck
import { renderHook, act, waitFor } from '@testing-library/react-native'
import { useQuery, useMutation } from '../data-hooks'

// Mock dependencies
const mockRequestJson = jest.fn()
jest.mock('../api-client', () => ({
  requestJson: (...args: any[]) => mockRequestJson(...args),
}))

jest.mock('../offline/useNetworkStatus', () => ({
  useNetworkStatus: () => ({ isOnline: true }),
}))

jest.mock('../offline/offline-manager', () => ({
  offlineManager: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
  },
}))

jest.mock('../auth-storage', () => ({
  getAccessToken: jest.fn().mockResolvedValue('mock-token-123'),
}))

describe('useQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('starts in loading state', () => {
    mockRequestJson.mockImplementation(() => new Promise(() => {})) // never resolves
    const { result } = renderHook(() => useQuery('/api/v1/athletes'))
    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('fetches data successfully', async () => {
    const mockData = [{ id: '1', name: 'Nguyễn Văn A' }]
    mockRequestJson.mockResolvedValueOnce(mockData)

    const { result } = renderHook(() => useQuery('/api/v1/athletes'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBeNull()
    expect(mockRequestJson).toHaveBeenCalledWith(
      '/api/v1/athletes',
      'mock-token-123',
      { method: 'GET' }
    )
  })

  it('handles fetch error', async () => {
    mockRequestJson.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useQuery('/api/v1/bad'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.data).toBeNull()
  })

  it('skips fetch when enabled is false', () => {
    const { result } = renderHook(() =>
      useQuery('/api/v1/athletes', { enabled: false })
    )
    expect(result.current.isLoading).toBe(false)
    expect(mockRequestJson).not.toHaveBeenCalled()
  })

  it('uses initialData and skips loading state', () => {
    const initial = [{ id: '1', name: 'Test' }]
    const { result } = renderHook(() =>
      useQuery('/api/v1/athletes', { initialData: initial })
    )
    expect(result.current.data).toEqual(initial)
  })
})

describe('useMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('starts with isLoading false', () => {
    const { result } = renderHook(() => useMutation('/api/v1/users'))
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('sends POST request and returns data', async () => {
    const responseData = { id: '1', name: 'New User' }
    mockRequestJson.mockResolvedValueOnce(responseData)

    const { result } = renderHook(() => useMutation('/api/v1/users', 'POST'))

    let data: any
    await act(async () => {
      data = await result.current.mutate({ name: 'New User' })
    })

    expect(data).toEqual(responseData)
    expect(mockRequestJson).toHaveBeenCalledWith(
      '/api/v1/users',
      'mock-token-123',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New User' }),
      }
    )
  })

  it('sends PUT request', async () => {
    mockRequestJson.mockResolvedValueOnce({ ok: true })

    const { result } = renderHook(() => useMutation('/api/v1/users/1', 'PUT'))

    await act(async () => {
      await result.current.mutate({ name: 'Updated' })
    })

    expect(mockRequestJson).toHaveBeenCalledWith(
      '/api/v1/users/1',
      'mock-token-123',
      expect.objectContaining({ method: 'PUT' })
    )
  })

  it('handles mutation error', async () => {
    mockRequestJson.mockRejectedValueOnce(new Error('Server error'))

    const { result } = renderHook(() => useMutation('/api/v1/fail'))

    await act(async () => {
      try {
        await result.current.mutate({ bad: true })
      } catch {
        // expected
      }
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.error?.message).toBe('Server error')
  })

  it('DELETE does not send body', async () => {
    mockRequestJson.mockResolvedValueOnce({ ok: true })

    const { result } = renderHook(() => useMutation('/api/v1/items/1', 'DELETE'))

    await act(async () => {
      await result.current.mutate({})
    })

    expect(mockRequestJson).toHaveBeenCalledWith(
      '/api/v1/items/1',
      'mock-token-123',
      expect.objectContaining({
        method: 'DELETE',
        body: undefined,
      })
    )
  })
})
