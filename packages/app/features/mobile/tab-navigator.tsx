// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Tab Navigator
// Bottom tab bar with 4 main sections: Home, Tournaments,
// Training, Profile. Uses VCT theme colors and custom icons.
// ═══════════════════════════════════════════════════════════════

import React, { Suspense } from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { StyleSheet, View, Text, Platform, ActivityIndicator } from 'react-native'

import { useVCTTheme } from './theme-provider'
import {
  LazyScreenHome,
  LazyScreenProfile,
  LazyScreenTournamentList,
} from './screen-registry'
import type { MainTabParamList } from './route-types'

type TabScreenComponent =
  | React.ComponentType<any>
  | React.LazyExoticComponent<React.ComponentType<any>>

const Tab = createBottomTabNavigator<MainTabParamList>()

// ── Tab Bar Icon ─────────────────────────────────────────────

interface TabIconProps {
  focused: boolean
  label: string
  emoji: string
  color: string
}

function TabIcon({ focused, label, emoji, color }: TabIconProps) {
  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>
        {emoji}
      </Text>
      <Text style={[styles.tabLabel, { color }]}>{label}</Text>
      {focused ? (
        <View style={[styles.activeIndicator, { backgroundColor: color }]} />
      ) : null}
    </View>
  )
}

function TabFallback() {
  const { theme } = useVCTTheme()
  return (
    <View style={[styles.placeholder, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  )
}

// ── Tab Configuration ────────────────────────────────────────

export interface TabConfig {
  name: keyof MainTabParamList
  label: string
  emoji: string
  component: TabScreenComponent
}

function PlaceholderScreen() {
  const { theme } = useVCTTheme()
  return (
    <View
      style={[styles.placeholder, { backgroundColor: theme.colors.background }]}
    >
      <Text
        style={[
          styles.placeholderText,
          { color: theme.colors.textSecondary },
        ]}
      >
        Khu vực này đang được hoàn thiện cho mobile.
      </Text>
    </View>
  )
}

export const TAB_CONFIGS: TabConfig[] = [
  {
    name: 'HomeTab',
    label: 'Trang chủ',
    emoji: '🏠',
    component: LazyScreenHome,
  },
  {
    name: 'TournamentsTab',
    label: 'Giải đấu',
    emoji: '🏆',
    component: LazyScreenTournamentList,
  },
  {
    name: 'TrainingTab',
    label: 'Huấn luyện',
    emoji: '🥋',
    component: PlaceholderScreen,
  },
  {
    name: 'ProfileTab',
    label: 'Cá nhân',
    emoji: '👤',
    component: LazyScreenProfile,
  },
]

// ── Tab Bar Options Factory ──────────────────────────────────

/**
 * Creates the screen options for the bottom tab navigator.
 * Call this inside your Tab.Navigator's `screenOptions` prop.
 */
export function createTabScreenOptions(
  theme: ReturnType<typeof useVCTTheme>['theme'],
) {
  return {
    headerShown: false,
    tabBarActiveTintColor: theme.colors.primary,
    tabBarInactiveTintColor: theme.colors.textSecondary,
    tabBarStyle: {
      backgroundColor: theme.colors.surface,
      borderTopColor: theme.colors.border,
      borderTopWidth: StyleSheet.hairlineWidth,
      height: Platform.OS === 'ios' ? 88 : 64,
      paddingBottom: Platform.OS === 'ios' ? 28 : 8,
      paddingTop: 8,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    tabBarLabelStyle: {
      fontSize: 11,
      fontWeight: '600' as const,
      marginTop: 2,
    },
  }
}

/**
 * Creates individual tab screen options for a specific tab config.
 */
export function createTabItemOptions(
  config: TabConfig,
  theme: ReturnType<typeof useVCTTheme>['theme'],
) {
  return {
    tabBarLabel: config.label,
    tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => (
      <TabIcon
        focused={focused}
        label=""
        emoji={config.emoji}
        color={color}
      />
    ),
  }
}

export function MainTabNavigator() {
  const { theme } = useVCTTheme()

  return (
    <Tab.Navigator screenOptions={createTabScreenOptions(theme)}>
      {TAB_CONFIGS.map((config) => (
        <Tab.Screen
          key={config.name}
          name={config.name}
          options={createTabItemOptions(config, theme)}
        >
          {({ navigation }) => {
            const ScreenComponent = config.component
            const parentNavigation = navigation.getParent()

            return (
              <Suspense fallback={<TabFallback />}>
                {config.name === 'HomeTab' ? (
                  <ScreenComponent
                    onNavigateTournament={(id: string) =>
                      parentNavigation?.navigate('TournamentDetail' as never, {
                        tournamentId: id,
                      } as never)
                    }
                    onNavigateProfile={() =>
                      navigation.navigate('ProfileTab')
                    }
                  />
                ) : null}
                {config.name === 'TournamentsTab' ? (
                  <ScreenComponent
                    onNavigateDetail={(id: string) =>
                      parentNavigation?.navigate('TournamentDetail' as never, {
                        tournamentId: id,
                      } as never)
                    }
                  />
                ) : null}
                {config.name === 'ProfileTab' ? (
                  <ScreenComponent
                    onNavigateSettings={() =>
                      parentNavigation?.navigate('Settings' as never)
                    }
                  />
                ) : null}
                {config.name === 'TrainingTab' ? <ScreenComponent /> : null}
              </Suspense>
            )
          }}
        </Tab.Screen>
      ))}
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
  },
  tabEmoji: {
    fontSize: 22,
    opacity: 0.7,
  },
  tabEmojiActive: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 20,
    height: 3,
    borderRadius: 1.5,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
  },
})
