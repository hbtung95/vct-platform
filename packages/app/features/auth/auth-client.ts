import type { AuthSession, AuthUser, LoginInput } from './types'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ??
  'http://localhost:18080'

interface BackendLoginResponse {
  token: string
  user: {
    id: string
    username: string
    displayName: string
    role: AuthUser['role']
  }
  tournamentCode?: string
  operationShift?: 'sang' | 'chieu' | 'toi'
  expiresAt?: string
}

interface BackendMeResponse {
  user: {
    id: string
    username: string
    displayName: string
    role: AuthUser['role']
  }
  tournamentCode?: string
  operationShift?: 'sang' | 'chieu' | 'toi'
  expiresAt?: string
}

const toAuthUser = (payload: BackendLoginResponse['user']): AuthUser => ({
  id: payload.id,
  username: payload.username,
  name: payload.displayName,
  role: payload.role,
})

const parseError = async (response: Response) => {
  try {
    const payload = (await response.json()) as { message?: string }
    if (payload?.message) return payload.message
  } catch {
    // ignore invalid JSON
  }
  return `HTTP ${response.status}`
}

export const authClient = {
  baseUrl: API_BASE_URL,
  async login(input: LoginInput): Promise<AuthSession> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      throw new Error(await parseError(response))
    }

    const payload = (await response.json()) as BackendLoginResponse
    return {
      token: payload.token,
      user: toAuthUser(payload.user),
      tournamentCode: payload.tournamentCode ?? input.tournamentCode,
      operationShift: payload.operationShift ?? input.operationShift,
      expiresAt: payload.expiresAt ?? new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    }
  },
  async me(token: string): Promise<Omit<AuthSession, 'token'>> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(await parseError(response))
    }

    const payload = (await response.json()) as BackendMeResponse
    return {
      user: toAuthUser(payload.user),
      tournamentCode: payload.tournamentCode ?? 'VCT-2026',
      operationShift: payload.operationShift ?? 'sang',
      expiresAt: payload.expiresAt ?? new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    }
  },
  async logout(token: string): Promise<void> {
    if (!token) return
    await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
}
