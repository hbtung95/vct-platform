import { describe, expect, it, vi } from 'vitest'

vi.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: (options: Record<string, unknown>) => options.ios ?? options.default ?? null,
  },
  BackHandler: {
    addEventListener: vi.fn(() => ({ remove: vi.fn() })),
  },
}))

vi.mock('../crash-reporter', () => ({
  crashReporter: {
    trackNavigation: vi.fn(),
  },
}))

vi.mock('../useAnalytics', () => ({
  useAnalytics: () => ({
    trackScreen: vi.fn(),
  }),
}))

import {
  getScreenGroup,
  getScreenTitleEn,
  isAuthScreen,
  isMainScreen,
  isValidScreen,
  parseDeepLinkParams,
} from '../navigation-helpers'

describe('navigation-helpers', () => {
  describe('isValidScreen', () => {
    it('returns true for known screens', () => {
      expect(isValidScreen('Home')).toBe(true)
      expect(isValidScreen('Login')).toBe(true)
      expect(isValidScreen('TournamentDetail')).toBe(true)
    })

    it('returns false for unknown screens', () => {
      expect(isValidScreen('UnknownScreen123')).toBe(false)
      expect(isValidScreen('')).toBe(false)
    })
  })

  describe('getScreenTitleEn', () => {
    it('returns the English title for known screens', () => {
      expect(getScreenTitleEn('Home')).toBe('Home')
      expect(getScreenTitleEn('TournamentDetail')).toBe('Tournament Details')
      expect(getScreenTitleEn('Login')).toBe('Login')
    })

    it('falls back to undefined for invalid runtime input', () => {
      expect(getScreenTitleEn('Unknown' as never)).toBeUndefined()
    })
  })

  describe('parseDeepLinkParams', () => {
    it('parses tournament links', () => {
      const result = parseDeepLinkParams('vctplatform://app/tournament/123')
      expect(result).toEqual({
        screen: 'TournamentDetail',
        params: { tournamentId: '123' },
      })
    })

    it('parses bracket links with optional category id', () => {
      const result = parseDeepLinkParams('vctplatform://app/tournament/123/bracket/456')
      expect(result).toEqual({
        screen: 'TournamentBracket',
        params: { tournamentId: '123', categoryId: '456' },
      })
    })

    it('parses live scoring links', () => {
      const result = parseDeepLinkParams('vctplatform://app/scoring/789')
      expect(result).toEqual({
        screen: 'LiveScoring',
        params: { matchId: '789' },
      })
    })

    it('returns null for unknown links', () => {
      expect(parseDeepLinkParams('vctplatform://app/unknown/route')).toBeNull()
      expect(parseDeepLinkParams('https://google.com')).toBeNull()
    })
  })

  describe('screen groups', () => {
    it('maps screen groups correctly', () => {
      expect(getScreenGroup('Login')).toBe('auth')
      expect(getScreenGroup('Home')).toBe('main')
      expect(getScreenGroup('TournamentDetail')).toBe('tournament')
      expect(getScreenGroup('AdminPortal')).toBe('portal')
      expect(getScreenGroup('Settings')).toBe('settings')
    })

    it('identifies auth screens', () => {
      expect(isAuthScreen('Login')).toBe(true)
      expect(isAuthScreen('Register')).toBe(true)
      expect(isAuthScreen('Home')).toBe(false)
    })

    it('identifies main screens', () => {
      expect(isMainScreen('Home')).toBe(true)
      expect(isMainScreen('Tournaments')).toBe(true)
      expect(isMainScreen('Login')).toBe(false)
    })
  })
})
