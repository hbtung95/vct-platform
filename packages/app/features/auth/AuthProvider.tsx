'use client'
import * as React from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { isRouteAccessible } from '../layout/route-registry'
import { authClient } from './auth-client'
import type { AuthSession, AuthUser, LoginInput, UserRole } from './types'

interface AuthContextValue {
  currentUser: AuthUser
  isAuthenticated: boolean
  isHydrating: boolean
  token: string | null
  tournamentCode: string
  operationShift: 'sang' | 'chieu' | 'toi'
  login: (input: LoginInput) => Promise<void>
  logout: () => Promise<void>
  setRole: (role: UserRole) => void
  canAccessRoute: (path: string) => boolean
}

const STORAGE_KEY = 'vct:auth-session'
const GUEST_ROLE_KEY = 'vct:guest-role'

const DEFAULT_USER: AuthUser = {
  id: 'guest',
  name: 'Khách vận hành',
  username: 'guest',
  role: 'delegate',
}

const AuthContext = createContext<AuthContextValue>({
  currentUser: DEFAULT_USER,
  isAuthenticated: false,
  isHydrating: true,
  token: null,
  tournamentCode: 'VCT-2026',
  operationShift: 'sang',
  login: async () => undefined,
  logout: async () => undefined,
  setRole: () => undefined,
  canAccessRoute: () => true,
})

const readStoredSession = (): AuthSession | null => {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as AuthSession
    if (!parsed?.token || !parsed?.user?.id || !parsed?.user?.role) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [guestRole, setGuestRole] = useState<UserRole>('delegate')
  const [isHydrating, setIsHydrating] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsHydrating(false)
      return
    }

    const savedGuestRole = window.localStorage.getItem(GUEST_ROLE_KEY) as
      | UserRole
      | null
    if (savedGuestRole) {
      setGuestRole(savedGuestRole)
    }

    const stored = readStoredSession()
    if (!stored?.token) {
      setIsHydrating(false)
      return
    }

    setSession(stored)

    let cancelled = false

    const verify = async () => {
      try {
        const me = await authClient.me(stored.token)
        if (cancelled) return
        setSession({
          ...stored,
          user: me.user,
          tournamentCode: me.tournamentCode,
          operationShift: me.operationShift,
          expiresAt: me.expiresAt,
        })
      } catch {
        if (!cancelled) {
          const expiresAt = stored.expiresAt
            ? new Date(stored.expiresAt).getTime()
            : Date.now() + 5 * 60 * 1000
          if (Number.isFinite(expiresAt) && expiresAt > Date.now()) {
            setSession(stored)
          } else {
            window.localStorage.removeItem(STORAGE_KEY)
            setSession(null)
          }
        }
      } finally {
        if (!cancelled) {
          setIsHydrating(false)
        }
      }
    }

    void verify()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isHydrating) return
    if (!session) {
      window.localStorage.removeItem(STORAGE_KEY)
      return
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  }, [isHydrating, session])

  const login = useCallback(async (input: LoginInput) => {
    const nextSession = await authClient.login(input)
    setSession(nextSession)
    setGuestRole(nextSession.user.role)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession))
      window.localStorage.setItem(GUEST_ROLE_KEY, nextSession.user.role)
    }
  }, [])

  const logout = useCallback(async () => {
    const token = session?.token
    if (token) {
      try {
        await authClient.logout(token)
      } catch {
        // ignore network logout failure
      }
    }
    setSession(null)
  }, [session?.token])

  const setRole = useCallback((role: UserRole) => {
    if (session) {
      setSession((prev) =>
        prev
          ? {
              ...prev,
              user: {
                ...prev.user,
                role,
              },
            }
          : prev
      )
    } else {
      setGuestRole(role)
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(GUEST_ROLE_KEY, role)
    }
  }, [session])

  const currentUser: AuthUser = useMemo(() => {
    if (session?.user) return session.user
    return {
      ...DEFAULT_USER,
      role: guestRole,
    }
  }, [guestRole, session?.user])

  const canAccessRoute = useCallback(
    (path: string) => isRouteAccessible(path, currentUser.role),
    [currentUser.role]
  )

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(session?.token),
      isHydrating,
      token: session?.token ?? null,
      tournamentCode: session?.tournamentCode ?? 'VCT-2026',
      operationShift: session?.operationShift ?? 'sang',
      login,
      logout,
      setRole,
      canAccessRoute,
    }),
    [
      canAccessRoute,
      currentUser,
      isHydrating,
      login,
      logout,
      setRole,
      session?.operationShift,
      session?.token,
      session?.tournamentCode,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
