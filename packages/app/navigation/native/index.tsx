import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { ReactNode } from 'react'

import { AuthProvider, useAuth } from 'app/features/auth/AuthProvider'
import { HomeScreen } from 'app/features/home/screen'
import { canAccessMobileRoute, type MobileRouteKey } from 'app/features/mobile/mobile-routes'
import {
  AccessDeniedMobileScreen,
  AthletesMobileScreen,
  RegistrationMobileScreen,
  ResultsMobileScreen,
  ScheduleMobileScreen,
  TeamsMobileScreen,
} from 'app/features/mobile/tournament-screens'
import { UserDetailScreen } from 'app/features/user/detail-screen'

const Stack = createNativeStackNavigator<{
  home: undefined
  teams: undefined
  athletes: undefined
  registration: undefined
  results: undefined
  schedule: undefined
  'user-detail': {
    id: string
  }
}>()

function GuardedScreen({
  routeKey,
  children,
}: {
  routeKey: MobileRouteKey
  children: ReactNode
}) {
  const { currentUser } = useAuth()
  if (!canAccessMobileRoute(routeKey, currentUser.role)) {
    return <AccessDeniedMobileScreen />
  }
  return <>{children}</>
}

export function NativeNavigation() {
  return (
    <AuthProvider>
      <Stack.Navigator>
        <Stack.Screen
          name="home"
          component={HomeScreen}
          options={{
            title: 'VCT Platform',
          }}
        />
        <Stack.Screen name="teams" options={{ title: 'Đơn vị tham gia' }}>
          {() => (
            <GuardedScreen routeKey="teams">
              <TeamsMobileScreen />
            </GuardedScreen>
          )}
        </Stack.Screen>
        <Stack.Screen name="athletes" options={{ title: 'Vận động viên' }}>
          {() => (
            <GuardedScreen routeKey="athletes">
              <AthletesMobileScreen />
            </GuardedScreen>
          )}
        </Stack.Screen>
        <Stack.Screen
          name="registration"
          options={{ title: 'Đăng ký nội dung' }}
        >
          {() => (
            <GuardedScreen routeKey="registration">
              <RegistrationMobileScreen />
            </GuardedScreen>
          )}
        </Stack.Screen>
        <Stack.Screen name="results" options={{ title: 'Kết quả' }}>
          {() => (
            <GuardedScreen routeKey="results">
              <ResultsMobileScreen />
            </GuardedScreen>
          )}
        </Stack.Screen>
        <Stack.Screen name="schedule" options={{ title: 'Lịch thi đấu' }}>
          {() => (
            <GuardedScreen routeKey="schedule">
              <ScheduleMobileScreen />
            </GuardedScreen>
          )}
        </Stack.Screen>
        <Stack.Screen
          name="user-detail"
          component={UserDetailScreen}
          options={{
            title: 'User',
          }}
        />
      </Stack.Navigator>
    </AuthProvider>
  )
}
