import { NavigationContainer } from '@react-navigation/native'
import * as Linking from 'expo-linking'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { MOBILE_ROUTE_REGISTRY } from 'app/features/mobile/mobile-routes'

export function NavigationProvider({
  children,
}: {
  children: ReactNode
}) {
  const linkingConfig = useMemo(() => {
    const moduleScreens = MOBILE_ROUTE_REGISTRY.reduce<Record<string, string>>(
      (acc, route) => {
        acc[route.key] = route.nativePath
        return acc
      },
      {}
    )

    return {
      prefixes: [Linking.createURL('/')],
      config: {
        screens: {
          home: '',
          ...moduleScreens,
          'user-detail': 'users/:id',
        },
      },
    }
  }, [])

  return (
    <NavigationContainer linking={linkingConfig}>
      {children}
    </NavigationContainer>
  )
}
