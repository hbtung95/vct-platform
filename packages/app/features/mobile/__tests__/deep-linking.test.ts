// @ts-nocheck

import { afterEach, describe, expect, it, vi } from 'vitest'

const {
  mockGetInitialURL,
  mockAddEventListener,
  mockCreateURL,
  mockParse,
} = vi.hoisted(() => {
  return {
    mockGetInitialURL: vi.fn(),
    mockAddEventListener: vi.fn(() => ({ remove: vi.fn() })),
    mockCreateURL: vi.fn(() => 'exp://localhost:8081/--/'),
    mockParse: vi.fn((input: string) => {
      const url = new URL(input)
      const protocol = url.protocol.replace(':', '').toLowerCase()
      const queryParams = Object.fromEntries(url.searchParams.entries())

      let path = ''
      if (protocol === 'http' || protocol === 'https') {
        path = url.pathname.replace(/^\/+/, '')
      } else if (protocol === 'exp') {
        path = url.pathname.replace(/^\/+/, '').replace(/^--\//, '')
      } else {
        path = [url.hostname, url.pathname.replace(/^\/+/, '')]
          .filter(Boolean)
          .join('/')
      }

      return { path, queryParams }
    }),
  }
})

vi.mock('react-native', () => ({
  Linking: {
    getInitialURL: mockGetInitialURL,
    addEventListener: mockAddEventListener,
  },
}))

vi.mock('expo-linking', () => ({
  __esModule: true,
  createURL: mockCreateURL,
  parse: mockParse,
}))

import {
  buildDeepLink,
  buildUniversalLink,
  deepLinkConfig,
  handleDeepLink,
  listRoutes,
  registerRoute,
  removeRoute,
  validateDeepLink,
} from '../deep-linking'
import {
  DEEP_LINK_CONFIG,
  MOBILE_DEEP_LINK_PREFIXES,
  MOBILE_DEEP_LINK_ROUTES,
  SCREEN_NAMES,
} from '../route-types'

describe('deep-linking', () => {
  afterEach(() => {
    removeRoute('push/:notificationId')
    vi.clearAllMocks()
  })

  it('reuses the shared deep link config and manifest', () => {
    expect(deepLinkConfig).toBe(DEEP_LINK_CONFIG)
    expect(deepLinkConfig.prefixes).toEqual([...MOBILE_DEEP_LINK_PREFIXES])
    expect(listRoutes()).toHaveLength(MOBILE_DEEP_LINK_ROUTES.length)
    expect(MOBILE_DEEP_LINK_ROUTES).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          screen: SCREEN_NAMES.LOGIN,
          pattern: 'login',
        }),
        expect.objectContaining({
          screen: SCREEN_NAMES.TOURNAMENT_DETAIL,
          pattern: 'tournaments/:tournamentId',
        }),
      ]),
    )
  })

  it('validates only allowed protocols and blocks suspicious paths', () => {
    expect(validateDeepLink('vctplatform://tournaments/abc123')).toBe(true)
    expect(validateDeepLink('https://vct-platform.vn/settings')).toBe(true)
    expect(validateDeepLink('exp://localhost:8081/--/profile')).toBe(true)
    expect(validateDeepLink('javascript:alert(1)')).toBe(false)
    expect(validateDeepLink('https://vct-platform.vn/../admin')).toBe(false)
  })

  it('parses tournament deep links and merges query params', () => {
    const result = handleDeepLink(
      'vctplatform://tournaments/abc123?source=push&lang=vi',
    )

    expect(result).toEqual(
      expect.objectContaining({
        screen: SCREEN_NAMES.TOURNAMENT_DETAIL,
        tab: SCREEN_NAMES.TOURNAMENTS_TAB,
        queryParams: {
          source: 'push',
          lang: 'vi',
        },
        params: {
          tournamentId: 'abc123',
          source: 'push',
          lang: 'vi',
        },
      }),
    )
  })

  it('builds app and universal links from the same route manifest', () => {
    expect(
      buildDeepLink(SCREEN_NAMES.TOURNAMENT_DETAIL, {
        tournamentId: 'giai-2026',
      }),
    ).toBe('vctplatform://tournaments/giai-2026')

    expect(
      buildUniversalLink(
        SCREEN_NAMES.SETTINGS,
        {},
        { source: 'email', utm_campaign: 'spring' },
      ),
    ).toBe(
      'https://vct-platform.vn/settings?source=email&utm_campaign=spring',
    )
  })

  it('supports registering and removing runtime routes', () => {
    const initialCount = listRoutes().length

    registerRoute({
      pattern: 'push/:notificationId',
      screen: 'PushInbox',
      tab: SCREEN_NAMES.PROFILE_TAB,
      paramExtractor: (params) => ({
        notificationId: params.notificationId,
      }),
    })

    expect(listRoutes()).toHaveLength(initialCount + 1)
    expect(handleDeepLink('vctplatform://push/noti-001')).toEqual(
      expect.objectContaining({
        screen: 'PushInbox',
        tab: SCREEN_NAMES.PROFILE_TAB,
        params: {
          notificationId: 'noti-001',
        },
      }),
    )

    removeRoute('push/:notificationId')
    expect(listRoutes()).toHaveLength(initialCount)
  })
})
