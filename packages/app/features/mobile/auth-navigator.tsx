// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Auth Navigator
// Stack navigator for the authentication flow:
// Onboarding → Login → Register → ForgotPassword → ResetPassword
// ═══════════════════════════════════════════════════════════════

import React, { Suspense } from 'react'
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native'
import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from '@react-navigation/native-stack'

import { useVCTTheme } from './theme-provider'
import {
  LazyScreenLogin,
  LazyScreenOnboarding,
  LazyScreenRegister,
} from './screen-registry'
import type { AuthStackParamList } from './route-types'

type AuthScreenComponent =
  | React.ComponentType<any>
  | React.LazyExoticComponent<React.ComponentType<any>>

const Stack = createNativeStackNavigator<AuthStackParamList>()

// ── Screen Options Factory ───────────────────────────────────

/**
 * Shared screen options for all auth-flow screens.
 * Apply as `screenOptions` on your Stack.Navigator.
 */
export function createAuthScreenOptions(
  theme: ReturnType<typeof useVCTTheme>['theme'],
): NativeStackNavigationOptions {
  return {
    headerShown: false,
    contentStyle: { backgroundColor: theme.colors.background },
    animation: Platform.OS === 'ios' ? 'slide_from_right' : 'fade_from_bottom',
    gestureEnabled: true,
    gestureDirection: 'horizontal',
  }
}

// ── Auth Screen Registry ─────────────────────────────────────

export interface AuthScreenConfig {
  name: keyof AuthStackParamList
  component: AuthScreenComponent
  options?: NativeStackNavigationOptions
}

function AuthFallback() {
  const { theme } = useVCTTheme()
  return (
    <View style={[styles.fallback, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  )
}

function buildAuthPlaceholder(title: string, description: string) {
  function AuthPlaceholderScreen() {
    const { theme } = useVCTTheme()
    return (
      <View
        style={[
          styles.placeholder,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text style={[styles.placeholderTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        <Text
          style={[
            styles.placeholderDescription,
            { color: theme.colors.textSecondary },
          ]}
        >
          {description}
        </Text>
      </View>
    )
  }

  return AuthPlaceholderScreen
}

const ForgotPasswordScreen = buildAuthPlaceholder(
  'Quên mật khẩu',
  'Luồng khôi phục mật khẩu sẽ được hoàn thiện ở đợt mobile tiếp theo.',
)

const ResetPasswordScreen = buildAuthPlaceholder(
  'Đặt lại mật khẩu',
  'Màn hình đặt lại mật khẩu đang được kết nối với backend xác thực.',
)

const VerifyOTPScreen = buildAuthPlaceholder(
  'Xác thực OTP',
  'Bước xác thực OTP sẽ sớm thay placeholder bằng flow xác thực thật.',
)

/**
 * Ordered list of auth screens.
 * The navigator iterates this to register screens.
 */
export const AUTH_SCREENS: AuthScreenConfig[] = [
  {
    name: 'Onboarding',
    component: LazyScreenOnboarding,
    options: {
      gestureEnabled: false,
    },
  },
  {
    name: 'Login',
    component: LazyScreenLogin,
    options: {
      animationTypeForReplace: 'pop',
    },
  },
  {
    name: 'Register',
    component: LazyScreenRegister,
  },
  {
    name: 'ForgotPassword',
    component: ForgotPasswordScreen,
    options: {
      presentation: 'modal',
      headerShown: true,
      headerTitle: 'Quên mật khẩu',
    },
  },
  {
    name: 'ResetPassword',
    component: ResetPasswordScreen,
    options: {
      presentation: 'modal',
      headerShown: true,
      headerTitle: 'Đặt lại mật khẩu',
    },
  },
  {
    name: 'VerifyOTP',
    component: VerifyOTPScreen,
    options: {
      presentation: 'modal',
      headerShown: true,
      headerTitle: 'Xác thực OTP',
    },
  },
]

// ── Initial Route Logic ──────────────────────────────────────

/**
 * Determines the initial auth route based on stored state.
 * Call this during app bootstrap to decide where to start.
 */
export async function getInitialAuthRoute(): Promise<
  keyof AuthStackParamList
> {
  try {
    const { secureStorage } = await import('./secure-storage')
    const hasOnboarded = await secureStorage.getItem('has_onboarded')

    if (!hasOnboarded) {
      return 'Onboarding'
    }

    return 'Login'
  } catch {
    return 'Onboarding'
  }
}

export function AuthNavigator({
  initialRouteName = 'Login',
}: {
  initialRouteName?: keyof AuthStackParamList
}) {
  const { theme } = useVCTTheme()

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={createAuthScreenOptions(theme)}
    >
      {AUTH_SCREENS.map((config) => (
        <Stack.Screen
          key={config.name}
          name={config.name}
          options={config.options}
        >
          {({ navigation }) => {
            const ScreenComponent = config.component

            return (
              <Suspense fallback={<AuthFallback />}>
                {config.name === 'Onboarding' ? (
                  <ScreenComponent
                    onComplete={() => navigation.replace('Login')}
                    onSkip={() => navigation.replace('Login')}
                  />
                ) : null}
                {config.name === 'Login' ? (
                  <ScreenComponent
                    onNavigateRegister={() => navigation.navigate('Register')}
                    onNavigateForgotPassword={() =>
                      navigation.navigate('ForgotPassword')
                    }
                  />
                ) : null}
                {config.name === 'Register' ? (
                  <ScreenComponent
                    onNavigateLogin={() => navigation.replace('Login')}
                    onRegisterSuccess={() => navigation.replace('Login')}
                  />
                ) : null}
                {!['Onboarding', 'Login', 'Register'].includes(config.name) ? (
                  <ScreenComponent />
                ) : null}
              </Suspense>
            )
          }}
        </Stack.Screen>
      ))}
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  placeholderDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
})
