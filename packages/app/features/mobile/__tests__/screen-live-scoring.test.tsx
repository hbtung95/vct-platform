// @ts-nocheck
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'
import { ScreenLiveScoring } from '../screens/competition/screen-live-scoring'

// ── Mocks ────────────────────────────────────────────────────

const mockMatchData = {
  id: 'match-1',
  status: 'round_active',
  currentRound: 2,
  totalRounds: 3,
  athleteRed: { id: 'r1', name: 'Nguyễn Văn A', club: 'CLB Tân Phú' },
  athleteBlue: { id: 'b1', name: 'Trần Văn B', club: 'CLB Bình Thạnh' },
  scoreRed: 5,
  scoreBlue: 3,
  roundScores: [{ round: 1, red: 3, blue: 2 }],
  penalties: [],
  timer: 125,
  category: 'Đối kháng',
  weightClass: '60kg',
}

jest.mock('../../theme-provider', () => ({
  useVCTTheme: () => ({
    theme: {
      colors: {
        background: '#0A0E14',
        primary: '#00E5CC',
        text: '#F8FAFC',
        textSecondary: '#94A3B8',
        surface: '#1E293B',
        surfaceElevated: '#334155',
        border: '#334155',
        error: '#EF4444',
        success: '#22C55E',
        warning: '#F59E0B',
        info: '#3B82F6',
        primaryDark: '#00B3A0',
        textMuted: '#64748B',
      },
      spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
      radius: { sm: 6, md: 10, lg: 14, full: 9999 },
      shadows: { sm: {} },
      typography: { body: { fontSize: 16 }, button: { fontSize: 16, fontWeight: '600' } },
    },
    isDark: true,
  }),
}))

jest.mock('../../haptic-feedback', () => ({
  triggerHaptic: jest.fn(),
  haptic: jest.fn(),
}))

jest.mock('../../data-hooks', () => ({
  useQuery: jest.fn().mockReturnValue({
    data: mockMatchData,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}))

jest.mock('../../skeleton-loader', () => ({
  SkeletonLoader: () => null,
}))

jest.mock('../../error-states', () => ({
  ErrorState: ({ title }) => {
    const { Text } = require('react-native')
    return <Text>{title}</Text>
  },
}))

describe('ScreenLiveScoring', () => {
  it('renders athlete names', () => {
    render(<ScreenLiveScoring matchId="match-1" />)
    expect(screen.getByText('Nguyễn Văn A')).toBeTruthy()
    expect(screen.getByText('Trần Văn B')).toBeTruthy()
  })

  it('renders corner labels', () => {
    render(<ScreenLiveScoring matchId="match-1" />)
    expect(screen.getByText('ĐỎ')).toBeTruthy()
    expect(screen.getByText('XANH')).toBeTruthy()
  })

  it('renders VS separator', () => {
    render(<ScreenLiveScoring matchId="match-1" />)
    expect(screen.getByText('VS')).toBeTruthy()
  })

  it('renders live status text', () => {
    render(<ScreenLiveScoring matchId="match-1" />)
    expect(screen.getByText('TRỰC TIẾP')).toBeTruthy()
  })

  it('renders round info', () => {
    render(<ScreenLiveScoring matchId="match-1" />)
    expect(screen.getByText('Hiệp 2/3')).toBeTruthy()
  })

  it('renders timer in M:SS format', () => {
    render(<ScreenLiveScoring matchId="match-1" />)
    expect(screen.getByText('2:05')).toBeTruthy() // 125 secs = 2:05
  })

  it('renders category and weight class', () => {
    render(<ScreenLiveScoring matchId="match-1" />)
    expect(screen.getByText('Đối kháng • 60kg')).toBeTruthy()
  })

  it('shows referee controls when isReferee and live', () => {
    render(<ScreenLiveScoring matchId="match-1" isReferee />)
    // +1 buttons (2 of them, one per corner)
    const plusOneButtons = screen.getAllByText('+1')
    expect(plusOneButtons.length).toBe(2)

    const plusTwoButtons = screen.getAllByText('+2')
    expect(plusTwoButtons.length).toBe(2)
  })

  it('hides referee controls when not referee', () => {
    render(<ScreenLiveScoring matchId="match-1" isReferee={false} />)
    expect(screen.queryAllByText('+1')).toHaveLength(0)
  })

  it('renders round history', () => {
    render(<ScreenLiveScoring matchId="match-1" />)
    expect(screen.getByText('Lịch sử hiệp')).toBeTruthy()
    expect(screen.getByText('Hiệp 1')).toBeTruthy()
  })
})
