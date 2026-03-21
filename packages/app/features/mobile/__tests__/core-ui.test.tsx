// @ts-nocheck
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'
import { Text } from 'react-native'
import { VctButton, VctTextInput, VctCard, VctBadge } from '../core-ui'

// Mock theme-provider
jest.mock('../theme-provider', () => ({
  useVCTTheme: () => ({
    theme: {
      colors: {
        primary: '#00E5CC',
        primaryDark: '#00B3A0',
        surface: '#1E293B',
        surfaceElevated: '#334155',
        text: '#F8FAFC',
        textSecondary: '#94A3B8',
        textMuted: '#64748B',
        border: '#334155',
        borderLight: '#1E293B',
        error: '#EF4444',
        success: '#22C55E',
        warning: '#F59E0B',
        info: '#3B82F6',
        divider: '#1E293B',
      },
      spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
      radius: { sm: 6, md: 10, lg: 14, full: 9999 },
      shadows: { sm: { shadowColor: '#000', shadowOpacity: 0.1 } },
      typography: { body: { fontSize: 16 }, button: { fontSize: 16, fontWeight: '600' } },
    },
    isDark: true,
  }),
}))

// Mock haptic-feedback
jest.mock('../haptic-feedback', () => ({
  haptic: jest.fn(),
}))

describe('VctButton', () => {
  it('renders with title text', () => {
    render(<VctButton title="Lưu" />)
    expect(screen.getByText('Lưu')).toBeTruthy()
  })

  it('renders with label text (alias)', () => {
    render(<VctButton label="Đăng nhập" />)
    expect(screen.getByText('Đăng nhập')).toBeTruthy()
  })

  it('fires onPress callback', () => {
    const onPress = jest.fn()
    render(<VctButton title="Tap" onPress={onPress} />)
    fireEvent.press(screen.getByText('Tap'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('does not fire onPress when disabled', () => {
    const onPress = jest.fn()
    render(<VctButton title="Disabled" onPress={onPress} disabled />)
    fireEvent.press(screen.getByText('Disabled'))
    expect(onPress).not.toHaveBeenCalled()
  })

  it('shows ActivityIndicator when loading', () => {
    render(<VctButton title="Loading" isLoading />)
    // When loading, button text should NOT show
    expect(screen.queryByText('Loading')).toBeNull()
  })

  it('renders all variant styles without crashing', () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger'] as const
    variants.forEach((variant) => {
      const { unmount } = render(<VctButton title={variant} variant={variant} />)
      expect(screen.getByText(variant)).toBeTruthy()
      unmount()
    })
  })

  it('resolves legacy size aliases', () => {
    // 'small', 'medium', 'large' should map to 'sm', 'md', 'lg' — no crash
    const sizes = ['sm', 'md', 'lg', 'small', 'medium', 'large'] as const
    sizes.forEach((size) => {
      const { unmount } = render(<VctButton title={`Size ${size}`} size={size} />)
      expect(screen.getByText(`Size ${size}`)).toBeTruthy()
      unmount()
    })
  })
})

describe('VctTextInput', () => {
  it('renders with label', () => {
    render(<VctTextInput label="Họ tên" />)
    expect(screen.getByText('Họ tên')).toBeTruthy()
  })

  it('renders error message', () => {
    render(<VctTextInput label="Email" error="Email không hợp lệ" />)
    expect(screen.getByText('Email không hợp lệ')).toBeTruthy()
  })

  it('renders hint when no error', () => {
    render(<VctTextInput label="Ghi chú" hint="Tối đa 200 ký tự" />)
    expect(screen.getByText('Tối đa 200 ký tự')).toBeTruthy()
  })

  it('prefers error over hint when both present', () => {
    render(<VctTextInput label="X" error="Lỗi" hint="Gợi ý" />)
    expect(screen.getByText('Lỗi')).toBeTruthy()
    expect(screen.queryByText('Gợi ý')).toBeNull()
  })

  it('calls onChangeText', () => {
    const onChangeText = jest.fn()
    render(<VctTextInput label="Name" testID="input" onChangeText={onChangeText} />)
    fireEvent.changeText(screen.getByTestId('input'), 'Nguyễn')
    expect(onChangeText).toHaveBeenCalledWith('Nguyễn')
  })
})

describe('VctCard', () => {
  it('renders children', () => {
    render(
      <VctCard>
        <Text>Card Content</Text>
      </VctCard>
    )
    expect(screen.getByText('Card Content')).toBeTruthy()
  })

  it('is pressable when onPress provided', () => {
    const onPress = jest.fn()
    render(
      <VctCard onPress={onPress}>
        <Text>Pressable Card</Text>
      </VctCard>
    )
    fireEvent.press(screen.getByText('Pressable Card'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })
})

describe('VctBadge', () => {
  it('renders label', () => {
    render(<VctBadge label="Đang thi đấu" />)
    expect(screen.getByText('Đang thi đấu')).toBeTruthy()
  })

  it('handles all variant values without crash', () => {
    const variants = ['primary', 'success', 'warning', 'error', 'neutral', 'info', 'default'] as const
    variants.forEach((variant) => {
      const { unmount } = render(<VctBadge label={variant} variant={variant} />)
      expect(screen.getByText(variant)).toBeTruthy()
      unmount()
    })
  })
})
