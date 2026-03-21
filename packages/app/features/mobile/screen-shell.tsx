import React, { type ReactNode } from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'

import { BaseScreen } from './base-screen'
import { useVCTTheme } from './theme-provider'

interface MobileScreenShellProps {
  children: ReactNode
  title: string
  subtitle?: string
  onGoBack?: () => void
  backLabel?: string
  headerRight?: ReactNode
  scrollable?: boolean
  contentContainerStyle?: StyleProp<ViewStyle>
  backgroundColor?: string
  hideOfflineState?: boolean
}

export function MobileScreenShell({
  children,
  title,
  subtitle,
  onGoBack,
  backLabel = 'Quay lại',
  headerRight,
  scrollable = true,
  contentContainerStyle,
  backgroundColor,
  hideOfflineState = false,
}: MobileScreenShellProps) {
  const { theme } = useVCTTheme()

  return (
    <BaseScreen
      backgroundColor={backgroundColor}
      contentContainerStyle={[
        styles.content,
        contentContainerStyle,
      ]}
      hideOfflineState={hideOfflineState}
      noPadding
      scrollable={scrollable}
    >
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          {onGoBack ? (
            <TouchableOpacity onPress={onGoBack} style={styles.backBtn}>
              <Text style={[styles.backText, { color: theme.colors.text }]}>
                ← {backLabel}
              </Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}
          {headerRight ? (
            <View style={styles.headerRight}>
              {headerRight}
            </View>
          ) : null}
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {children}
    </BaseScreen>
  )
}

export function MobileScreenCenteredState({
  children,
  backgroundColor,
}: {
  children: ReactNode
  backgroundColor?: string
}) {
  return (
    <BaseScreen
      backgroundColor={backgroundColor}
      contentContainerStyle={styles.centeredState}
      noPadding
      scrollable={false}
    >
      {children}
    </BaseScreen>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTopRow: {
    minHeight: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  backBtn: {
    paddingVertical: 8,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
})
