import * as React from 'react'
import { StyleSheet, Text, View, RefreshControl, ScrollView } from 'react-native'
import { useRouter } from 'solito/navigation'
import { useAuth } from '../../auth/AuthProvider'
import { Colors, FontWeight, Radius, Space, SharedStyles } from '../mobile-theme'
import { Icon, VCTIcons } from '../icons'
import { AnimatedCard, ScreenSkeleton, StatsCounter, GoalBar } from '../mobile-ui'
import { hapticLight, hapticSelection } from '../haptics'
import { useAdminDashboard } from './useAdminData'

const s = StyleSheet.create({
  heroHeader: {
    paddingHorizontal: Space.xl, paddingTop: Space.xxxl, paddingBottom: Space.xxl,
    backgroundColor: Colors.bgDark, borderBottomLeftRadius: Radius.xl, borderBottomRightRadius: Radius.xl,
    marginBottom: Space.lg,
  },
  greeting: { fontSize: 26, fontWeight: FontWeight.black, color: '#ffffff', marginBottom: 4 },
  subGreeting: { fontSize: 14, color: Colors.accent, fontWeight: FontWeight.bold },
  statsRow: { flexDirection: 'row', gap: Space.sm, marginTop: Space.lg },
  healthCard: {
    padding: Space.lg, borderRadius: Radius.lg, marginHorizontal: Space.xl, marginBottom: Space.lg,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
  },
  healthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Space.sm },
  healthLabel: { fontSize: 12, fontWeight: FontWeight.bold, color: Colors.textSecondary },
  healthValue: { fontSize: 14, fontWeight: FontWeight.black },
})

export function AdminPortalMobileScreen() {
  const router = useRouter()
  const { currentUser } = useAuth()
  const { data: dash, isLoading, refetch } = useAdminDashboard()
  const [refreshing, setRefreshing] = React.useState(false)

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true)
    hapticLight()
    await refetch()
    setRefreshing(false)
  }, [refetch])

  if (isLoading && !refreshing) return <ScreenSkeleton />

  const uptimePercent = Math.min(100, ((dash?.system_uptime_hours ?? 0) / 720) * 100)
  const errorRate = dash?.api_error_rate ?? 0
  const errorColor = errorRate < 0.01 ? Colors.green : errorRate < 0.05 ? Colors.gold : Colors.red

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.bgBase }}
      contentContainerStyle={{ paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
    >
      {/* ── Hero Header ── */}
      <View style={s.heroHeader}>
        <Text style={s.greeting}>Quản trị Hệ thống</Text>
        <Text style={s.subGreeting}>{currentUser.name || 'System Admin'}</Text>

        <View style={s.statsRow}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <StatsCounter value={dash?.total_users ?? 0} label="Users" color={Colors.accent} icon={VCTIcons.people} />
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <StatsCounter value={dash?.active_sessions ?? 0} label="Sessions" color={Colors.green} icon={VCTIcons.flash} />
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <StatsCounter value={dash?.total_logins_today ?? 0} label="Login" color={Colors.purple} icon={VCTIcons.trending} />
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <StatsCounter value={dash?.pending_registrations ?? 0} label="Chờ duyệt" color={Colors.gold} icon={VCTIcons.time} />
          </View>
        </View>
      </View>

      {/* ── System Health ── */}
      <View style={s.healthCard}>
        <Text style={[SharedStyles.sectionTitle, { marginTop: 0, marginBottom: Space.md }]}>System Health</Text>
        <GoalBar title="Uptime (30 ngày)" progress={Math.round(uptimePercent)} color={Colors.green} />
        <View style={s.healthRow}>
          <Text style={s.healthLabel}>Uptime</Text>
          <Text style={[s.healthValue, { color: Colors.green }]}>{dash?.system_uptime_hours ?? 0}h</Text>
        </View>
        <View style={s.healthRow}>
          <Text style={s.healthLabel}>API Error Rate</Text>
          <Text style={[s.healthValue, { color: errorColor }]}>{(errorRate * 100).toFixed(1)}%</Text>
        </View>
        <View style={s.healthRow}>
          <Text style={s.healthLabel}>Trạng thái</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: errorRate < 0.05 ? Colors.green : Colors.red }} />
            <Text style={[s.healthValue, { color: errorRate < 0.05 ? Colors.green : Colors.red }]}>
              {errorRate < 0.05 ? 'Healthy' : 'Degraded'}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Navigation Cards ── */}
      <View style={{ paddingHorizontal: Space.xl, marginBottom: Space.xxl }}>
        <Text style={SharedStyles.sectionTitle}>Giám sát</Text>

        {[
          { route: '/admin-users', icon: VCTIcons.people, color: Colors.accent, title: 'Quản lý Người dùng', sub: 'Danh sách tài khoản & trạng thái' },
          { route: '/admin-audit', icon: VCTIcons.document, color: Colors.gold, title: 'Nhật ký Hệ thống', sub: 'Audit log đăng nhập & thao tác' },
        ].map(item => (
          <AnimatedCard key={item.route} onPress={() => { hapticSelection(); router.push(item.route) }} style={{ marginBottom: Space.md }}>
            <View style={[SharedStyles.row, { padding: Space.lg }]}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.overlay(item.color, 0.15), justifyContent: 'center', alignItems: 'center', marginRight: Space.md }}>
                <Icon name={item.icon} size={24} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 2 }}>{item.title}</Text>
                <Text style={{ fontSize: 13, color: Colors.textSecondary }}>{item.sub}</Text>
              </View>
              <Icon name={VCTIcons.forward} size={20} color={Colors.textMuted} />
            </View>
          </AnimatedCard>
        ))}
      </View>
    </ScrollView>
  )
}
