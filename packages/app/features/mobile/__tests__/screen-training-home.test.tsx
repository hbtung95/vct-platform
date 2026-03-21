// @ts-nocheck
import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { ScreenTrainingHome } from '../screens/training/screen-training-home'

// ── Mocks ────────────────────────────────────────────────────

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
        primaryDark: '#00B3A0',
        error: '#EF4444',
        success: '#22C55E',
        warning: '#F59E0B',
        info: '#3B82F6',
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
    data: [
      { id: '1', title: 'Giáo án nâng cao', level: 'Nâng cao', duration: '12 tuần', progress: 65 },
      { id: '2', title: 'Cơ bản quyền thuật', level: 'Cơ bản', duration: '8 tuần', progress: 30 },
    ],
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}))

jest.mock('../../skeleton-loader', () => ({
  SkeletonLoader: () => null,
}))

describe('ScreenTrainingHome', () => {
  it('renders the training home header', () => {
    render(<ScreenTrainingHome />)
    expect(screen.getByText('Huấn luyện')).toBeTruthy()
    expect(screen.getByText('Nâng cao kỹ năng võ thuật cổ truyền')).toBeTruthy()
  })

  it('renders all 6 category tiles', () => {
    render(<ScreenTrainingHome />)
    expect(screen.getByText('Giáo án')).toBeTruthy()
    expect(screen.getByText('Bài quyền')).toBeTruthy()
    expect(screen.getByText('Đối kháng')).toBeTruthy()
    expect(screen.getByText('Binh khí')).toBeTruthy()
    expect(screen.getByText('Thi đai')).toBeTruthy()
    expect(screen.getByText('E-Learning')).toBeTruthy()
  })

  it('renders section titles', () => {
    render(<ScreenTrainingHome />)
    expect(screen.getByText('Giáo án của tôi')).toBeTruthy()
    expect(screen.getByText('Kỹ thuật')).toBeTruthy()
  })

  it('renders training plan cards from mock data', () => {
    render(<ScreenTrainingHome />)
    expect(screen.getByText('Giáo án nâng cao')).toBeTruthy()
    expect(screen.getByText('Cơ bản quyền thuật')).toBeTruthy()
  })
})
