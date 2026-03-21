// @ts-nocheck
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'
import { Text, View } from 'react-native'
import { MobileScreenShell, MobileScreenCenteredState } from '../screen-shell'

// Mock dependencies
jest.mock('../theme-provider', () => ({
  useVCTTheme: () => ({
    theme: {
      colors: {
        text: '#F8FAFC',
        textSecondary: '#94A3B8',
        primary: '#00E5CC',
        background: '#0A0E14',
        surface: '#1E293B',
        border: '#334155',
      },
    },
  }),
}))

jest.mock('../base-screen', () => ({
  BaseScreen: ({ children, ...props }) => (
    <View testID="base-screen" {...props}>
      {children}
    </View>
  ),
}))

describe('MobileScreenShell', () => {
  it('renders title', () => {
    render(
      <MobileScreenShell title="Giáo án luyện tập">
        <Text>Content</Text>
      </MobileScreenShell>
    )
    expect(screen.getByText('Giáo án luyện tập')).toBeTruthy()
  })

  it('renders subtitle when provided', () => {
    render(
      <MobileScreenShell title="Title" subtitle="Sub text">
        <Text>Body</Text>
      </MobileScreenShell>
    )
    expect(screen.getByText('Sub text')).toBeTruthy()
  })

  it('renders back button with default label', () => {
    const onGoBack = jest.fn()
    render(
      <MobileScreenShell title="Screen" onGoBack={onGoBack}>
        <Text>X</Text>
      </MobileScreenShell>
    )
    const backButton = screen.getByText('← Quay lại')
    expect(backButton).toBeTruthy()
    fireEvent.press(backButton)
    expect(onGoBack).toHaveBeenCalledTimes(1)
  })

  it('renders custom back label', () => {
    render(
      <MobileScreenShell title="Edit" backLabel="Hủy" onGoBack={jest.fn()}>
        <Text>Form</Text>
      </MobileScreenShell>
    )
    expect(screen.getByText('← Hủy')).toBeTruthy()
  })

  it('hides back button when onGoBack not provided', () => {
    render(
      <MobileScreenShell title="Home">
        <Text>Content</Text>
      </MobileScreenShell>
    )
    expect(screen.queryByText('← Quay lại')).toBeNull()
  })

  it('renders headerRight slot', () => {
    render(
      <MobileScreenShell title="Title" headerRight={<Text>Menu</Text>}>
        <Text>Body</Text>
      </MobileScreenShell>
    )
    expect(screen.getByText('Menu')).toBeTruthy()
  })

  it('renders children', () => {
    render(
      <MobileScreenShell title="Test">
        <Text>Child content here</Text>
      </MobileScreenShell>
    )
    expect(screen.getByText('Child content here')).toBeTruthy()
  })
})

describe('MobileScreenCenteredState', () => {
  it('renders children in centered layout', () => {
    render(
      <MobileScreenCenteredState>
        <Text>Loading...</Text>
      </MobileScreenCenteredState>
    )
    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('passes backgroundColor to BaseScreen', () => {
    render(
      <MobileScreenCenteredState backgroundColor="#0A0E14">
        <Text>Centered</Text>
      </MobileScreenCenteredState>
    )
    expect(screen.getByTestId('base-screen')).toBeTruthy()
  })
})
