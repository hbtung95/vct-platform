import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { useMemo } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { USER_ROLE_OPTIONS } from '../auth/types'
import { getAccessibleMobileRoutes } from '../mobile/mobile-routes'
import { MobileModuleCard } from '../mobile/tournament-screens'

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  content: {
    padding: 16,
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 6,
  },
  roleWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  roleButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },
  roleButtonActive: {
    borderColor: '#0ea5e9',
    backgroundColor: '#e0f2fe',
  },
  roleButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  roleButtonTextActive: {
    color: '#0369a1',
  },
})

export function HomeScreen() {
  const router = useRouter()
  const { currentUser, setRole } = useAuth()

  const modules = useMemo(
    () => getAccessibleMobileRoutes(currentUser.role),
    [currentUser.role]
  )

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View>
        <Text style={styles.title}>VCT Platform</Text>
        <Text style={styles.subtitle}>
          Điều hướng nhanh các module chính trên mobile
        </Text>
      </View>

      <View>
        <Text style={[styles.subtitle, { marginBottom: 8 }]}>
          Quyền hiện tại: {USER_ROLE_OPTIONS.find((item) => item.value === currentUser.role)?.label}
        </Text>
        <View style={styles.roleWrap}>
          {USER_ROLE_OPTIONS.map((roleOption) => {
            const active = roleOption.value === currentUser.role
            return (
              <Pressable
                key={roleOption.value}
                style={[styles.roleButton, active && styles.roleButtonActive]}
                onPress={() => setRole(roleOption.value)}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    active && styles.roleButtonTextActive,
                  ]}
                >
                  {roleOption.label}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </View>

      {modules.length === 0 ? (
        <View
          style={{
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#fecaca',
            backgroundColor: '#fef2f2',
            padding: 14,
          }}
        >
          <Text style={{ color: '#991b1b', fontWeight: '700', marginBottom: 6 }}>
            Role hiện tại chưa được cấp module mobile.
          </Text>
          <Text style={{ color: '#b91c1c', fontSize: 12 }}>
            Hãy đổi sang role khác để tiếp tục.
          </Text>
        </View>
      ) : (
        modules.map((module) => (
          <MobileModuleCard
            key={module.key}
            title={module.title}
            subtitle={module.subtitle}
            onPress={() => router.push(`/${module.nativePath}`)}
          />
        ))
      )}
    </ScrollView>
  )
}
