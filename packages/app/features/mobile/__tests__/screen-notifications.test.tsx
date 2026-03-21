// @ts-nocheck
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'
import { ScreenNotifications } from '../screens/utility/screen-notifications'

// ── Mocks ────────────────────────────────────────────────────

const mockNotifications = [
  {
    id: 'n1',
    type: 'match',
    title: 'Trận đấu sắp bắt đầu',
    body: 'Trận đấu của bạn bắt đầu trong 15 phút.',
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60_000).toISOString(), // 5 min ago
    data: { matchId: 'm-1' },
  },
  {
    id: 'n2',
    type: 'tournament',
    title: 'Lịch giải đấu',
    body: 'Giải Võ Cổ Truyền TP.HCM đã cập nhật lịch thi.',
    isRead: true,
    createdAt: new Date(Date.now() - 48 * 3600_000).toISOString(), // 2 days ago
    data: { tournamentId: 't-1' },
  },
  {
    id: 'n3',
    type: 'system',
    title: 'Cập nhật ứng dụng',
    body: 'Phiên bản mới đã sẵn sàng.',
    isRead: true,
    createdAt: new Date(Date.now() - 72 * 3600_000).toISOString(),
  },
]

jest.mock('../../theme-provider', () => ({
  useVCTTheme: () => ({
    theme: {
      colors: {
        background: '#0A0E14',
        primary: '#00E5CC',
        text: '#F8FAFC',
        textSecondary: '#94A3B8',
        textMuted: '#64748B',
        surface: '#1E293B',
        surfaceElevated: '#334155',
        border: '#334155',
        error: '#EF4444',
        success: '#22C55E',
        warning: '#F59E0B',
        info: '#3B82F6',
        primaryDark: '#00B3A0',
      },
      spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
      radius: { sm: 6, md: 10, lg: 14, full: 9999 },
      shadows: { sm: {} },
      typography: { body: { fontSize: 16 } },
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
    data: mockNotifications,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}))

jest.mock('../../error-states', () => ({
  EmptyState: ({ title }) => {
    const { Text } = require('react-native')
    return <Text>{title}</Text>
  },
}))

describe('ScreenNotifications', () => {
  it('renders header title', () => {
    render(<ScreenNotifications />)
    expect(screen.getByText('Thông báo')).toBeTruthy()
  })

  it('renders back button', () => {
    const onGoBack = jest.fn()
    render(<ScreenNotifications onGoBack={onGoBack} />)
    const backBtn = screen.getByText('← Quay lại')
    expect(backBtn).toBeTruthy()
    fireEvent.press(backBtn)
    expect(onGoBack).toHaveBeenCalled()
  })

  it('renders all 4 filter tabs', () => {
    render(<ScreenNotifications />)
    expect(screen.getByText(/Tất cả/)).toBeTruthy()
    expect(screen.getByText(/Trận đấu/)).toBeTruthy()
    expect(screen.getByText(/Giải đấu/)).toBeTruthy()
    expect(screen.getByText(/Hệ thống/)).toBeTruthy()
  })

  it('shows unread count badge', () => {
    render(<ScreenNotifications />)
    // 1 unread notification → "1 mới"
    expect(screen.getByText('1 mới')).toBeTruthy()
  })

  it('renders notification items', () => {
    render(<ScreenNotifications />)
    expect(screen.getByText('Trận đấu sắp bắt đầu')).toBeTruthy()
    expect(screen.getByText('Lịch giải đấu')).toBeTruthy()
    expect(screen.getByText('Cập nhật ứng dụng')).toBeTruthy()
  })

  it('renders notification body text', () => {
    render(<ScreenNotifications />)
    expect(screen.getByText('Trận đấu của bạn bắt đầu trong 15 phút.')).toBeTruthy()
  })

  it('renders Vietnamese relative time', () => {
    render(<ScreenNotifications />)
    // 5 minutes ago → "5 phút trước"
    expect(screen.getByText('5 phút trước')).toBeTruthy()
  })
})
