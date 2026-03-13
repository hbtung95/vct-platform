import * as React from 'react'
import { Platform, Text, View } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { HomeScreen } from 'app/features/home/screen'
import { ProfileMobileScreen } from 'app/features/mobile/profile-screen'
import { SettingsMobileScreen } from 'app/features/mobile/settings-screen'
import { NotificationsMobileScreen } from 'app/features/mobile/notifications-screen'
import { Colors, FontWeight, Radius } from 'app/features/mobile/mobile-theme'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Bottom Tab Navigator
// 4 tabs: Home, Notifications, Profile, Settings
// Uses centralized design system
// ═══════════════════════════════════════════════════════════════

const Tab = createBottomTabNavigator()

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={{
      width: 36, height: 36, borderRadius: Radius.md,
      justifyContent: 'center', alignItems: 'center',
      backgroundColor: focused ? Colors.overlay(Colors.accent, 0.12) : 'transparent',
    }}>
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
    </View>
  )
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: Platform.OS === 'android' ? 64 : 72,
          paddingBottom: Platform.OS === 'android' ? 8 : 12,
          paddingTop: 8,
          backgroundColor: Colors.bgDark,
          borderTopWidth: 1,
          borderTopColor: Colors.borderLight,
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: FontWeight.extrabold,
          marginTop: 2,
          letterSpacing: 0.3,
        },
      }}
    >
      <Tab.Screen
        name="home-tab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Trang chủ',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="notifications-tab"
        component={NotificationsMobileScreen}
        options={{
          tabBarLabel: 'Thông báo',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔔" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="profile-tab"
        component={ProfileMobileScreen}
        options={{
          tabBarLabel: 'Hồ sơ',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="settings-tab"
        component={SettingsMobileScreen}
        options={{
          tabBarLabel: 'Cài đặt',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  )
}
