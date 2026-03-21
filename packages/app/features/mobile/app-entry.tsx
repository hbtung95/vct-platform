// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — App Entry Point
// The final wiring file that composes AppWrapper, Root Navigator,
// and all providers into a ready-to-mount React tree.
// ═══════════════════════════════════════════════════════════════

import React, { Suspense } from 'react'
import { DefaultTheme, NavigationContainer } from '@react-navigation/native'
import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from '@react-navigation/native-stack'
import { View, ActivityIndicator, StyleSheet } from 'react-native'

import { AppWrapper } from './app-wrapper'
import { AuthNavigator } from './auth-navigator'
import {
  useRootNavigator,
  RootStatusBar,
  RootLoadingScreen,
  createNavigationTheme,
} from './root-navigator'
import { MainTabNavigator } from './tab-navigator'
import type { MainStackParamList } from './route-types'
import { useVCTTheme } from './theme-provider'
import { MAIN_SCREEN_COMPONENTS } from './screen-registry'

const MainStack = createNativeStackNavigator<MainStackParamList>()

// ── Suspense Fallback ────────────────────────────────────────

function ScreenFallback() {
  return (
    <View style={styles.fallback}>
      <ActivityIndicator size="large" color="#00E5CC" />
    </View>
  )
}

function createMainStackScreenOptions(
  theme: ReturnType<typeof useVCTTheme>['theme'],
): NativeStackNavigationOptions {
  return {
    headerShown: false,
    contentStyle: {
      backgroundColor: theme.colors.background,
    },
  }
}

export function MainStackNavigator() {
  const { theme } = useVCTTheme()

  return (
    <MainStack.Navigator screenOptions={createMainStackScreenOptions(theme)}>
      <MainStack.Screen name="Tabs" component={MainTabNavigator} />
      <MainStack.Screen name="TournamentDetail">
        {({ navigation, route }) => (
          <Suspense fallback={<ScreenFallback />}>
            <MAIN_SCREEN_COMPONENTS.TournamentDetail
              tournamentId={route.params.tournamentId}
              onGoBack={() => navigation.goBack()}
            />
          </Suspense>
        )}
      </MainStack.Screen>
      <MainStack.Screen name="Settings">
        {({ navigation }) => (
          <Suspense fallback={<ScreenFallback />}>
            <MAIN_SCREEN_COMPONENTS.Settings onGoBack={() => navigation.goBack()} />
          </Suspense>
        )}
      </MainStack.Screen>
    </MainStack.Navigator>
  )
}

// ── Root App Content ─────────────────────────────────────────

function AppContent() {
  const { state, initialAuthRoute, theme, isDark, deepLinkConfig } =
    useRootNavigator()

  const navTheme = {
    ...DefaultTheme,
    ...createNavigationTheme(theme, isDark),
    fonts: DefaultTheme.fonts,
  }

  if (state === 'loading') {
    return <RootLoadingScreen />
  }

  return (
    <NavigationContainer linking={deepLinkConfig} theme={navTheme}>
      {state === 'authenticated' ? (
        <MainStackNavigator />
      ) : (
        <AuthNavigator initialRouteName={initialAuthRoute} />
      )}
    </NavigationContainer>
  )
}

// ── App Entry ────────────────────────────────────────────────

export function VCTApp() {
  return (
    <AppWrapper>
      <RootStatusBar />
      <AppContent />
    </AppWrapper>
  )
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    backgroundColor: '#0A0E14',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
