'use client'

const SESSION_STORAGE_KEY = 'vct:auth-session'
const LEGACY_ACCESS_KEYS = ['vct_access_token', 'access_token'] as const
const LEGACY_REFRESH_KEYS = ['vct_refresh_token', 'refresh_token'] as const

const canUseStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const readRaw = (key: string): string | null => {
  if (!canUseStorage()) return null
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

const writeRaw = (key: string, value: string) => {
  if (!canUseStorage()) return
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // best-effort
  }
}

const removeRaw = (key: string) => {
  if (!canUseStorage()) return
  try {
    window.localStorage.removeItem(key)
  } catch {
    // best-effort
  }
}

export interface StoredTokens {
  accessToken: string
  refreshToken: string
}

export const readStoredTokens = (): StoredTokens => {
  const fromSession = readRaw(SESSION_STORAGE_KEY)
  if (fromSession) {
    try {
      const parsed = JSON.parse(fromSession) as {
        accessToken?: string
        refreshToken?: string
        token?: string
      }
      const accessToken =
        (typeof parsed.accessToken === 'string' && parsed.accessToken.trim()) ||
        (typeof parsed.token === 'string' && parsed.token.trim()) ||
        ''
      const refreshToken =
        typeof parsed.refreshToken === 'string' ? parsed.refreshToken.trim() : ''
      if (accessToken) {
        return { accessToken, refreshToken }
      }
    } catch {
      // fallback to legacy keys below
    }
  }

  const accessToken =
    LEGACY_ACCESS_KEYS.map((key) => readRaw(key)).find(
      (value): value is string => Boolean(value && value.trim())
    ) ?? ''
  const refreshToken =
    LEGACY_REFRESH_KEYS.map((key) => readRaw(key)).find(
      (value): value is string => Boolean(value && value.trim())
    ) ?? ''

  return { accessToken, refreshToken }
}

export const persistLegacyTokens = (
  accessToken: string,
  refreshToken?: string
) => {
  const nextAccess = accessToken.trim()
  const nextRefresh = refreshToken?.trim() ?? ''

  for (const key of LEGACY_ACCESS_KEYS) {
    if (nextAccess) {
      writeRaw(key, nextAccess)
    } else {
      removeRaw(key)
    }
  }

  for (const key of LEGACY_REFRESH_KEYS) {
    if (nextRefresh) {
      writeRaw(key, nextRefresh)
    } else {
      removeRaw(key)
    }
  }
}

export const clearLegacyTokens = () => {
  for (const key of LEGACY_ACCESS_KEYS) {
    removeRaw(key)
  }
  for (const key of LEGACY_REFRESH_KEYS) {
    removeRaw(key)
  }
}

export const getAccessToken = () => readStoredTokens().accessToken
