import * as React from 'react'
import { StyleSheet, Text, View, RefreshControl, ScrollView } from 'react-native'
import { useRouter } from 'solito/navigation'
import { useAuth } from '../../auth/AuthProvider'
import { Colors, FontWeight, Radius, Space, SharedStyles } from '../mobile-theme'
import { Icon, VCTIcons } from '../icons'
import { AnimatedCard, ScreenSkeleton, StatsCounter } from '../mobile-ui'
import { hapticLight, hapticSelection } from '../haptics'
import { useNationalDashboard } from './useNationalFederationData'

const s = StyleSheet.create({
  heroHeader: {
    paddingHorizontal: Space.xl, paddingTop: Space.xxxl, paddingBottom: Space.xxl,
    backgroundColor: Colors.bgDark, borderBottomLeftRadius: Radius.xl, borderBottomRightRadius: Radius.xl,
    marginBottom: Space.lg,
  },
  greeting: { fontSize: 26, fontWeight: FontWeight.black, color: '#ffffff', marginBottom: 4 },
  subGreeting: { fontSize: 14, color: Colors.accent, fontWeight: FontWeight.bold },
  statsRow: { flexDirection: 'row', gap: Space.sm, marginTop: Space.lg },
  quickActions: { paddingHorizontal: Space.xl, marginBottom: Space.xxl },
})

export function NFPortalMobileScreen() {
  const router = useRouter()
  const { currentUser } = useAuth()
  const { data: dashboard, isLoading, refetch } = useNationalDashboard()
  const [refreshing, setRefreshing] = React.useState(false)

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true)
    hapticLight()
    await refetch()
    setRefreshing(false)
  }, [refetch])

  if (isLoading && !refreshing) return <ScreenSkeleton />

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.bgBase }}
      contentContainerStyle={{ paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
    >
      {/* ── Hero Header ── */}
      <View style={s.heroHeader}>
        <Text style={s.greeting}>Liên đoàn VCT Việt Nam</Text>
        <Text style={s.subGreeting}>{currentUser.name || 'Ban Chấp hành Trung ương'}</Text>

        <View style={s.statsRow}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <StatsCounter value={dashboard?.provinces_count ?? 0} label="Tỉnh/Thành" color={Colors.accent} icon={VCTIcons.globe} />
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <StatsCounter value={dashboard?.total_clubs ?? 0} label="CLB" color={Colors.green} icon={VCTIcons.homeOutline} />
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <StatsCounter value={dashboard?.total_athletes ?? 0} label="VĐV" color={Colors.gold} icon={VCTIcons.people} suffix="" />
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <StatsCounter value={dashboard?.active_national_tournaments ?? 0} label="Giải QG" color={Colors.purple} icon={VCTIcons.trophy} />
          </View>
        </View>
      </View>

      {/* ── Navigation Cards ── */}
      <View style={s.quickActions}>
        <Text style={SharedStyles.sectionTitle}>Quản lý Toàn quốc</Text>

        {[
          { route: '/nf-provinces', icon: VCTIcons.globe, color: Colors.accent, title: 'Liên đoàn cấp Tỉnh/Thành', sub: 'Tổng quan hoạt động 63 đơn vị' },
          { route: '/nf-tournaments', icon: VCTIcons.trophy, color: Colors.purple, title: 'Giải đấu Quốc gia', sub: 'Lịch trình & quy mô các giải' },
          { route: '/nf-referees', icon: VCTIcons.star, color: Colors.gold, title: 'Trọng tài Quốc gia & Quốc tế', sub: 'Danh bạ & phân hạng chứng chỉ' },
          { route: '/nf-rankings', icon: VCTIcons.podium, color: Colors.green, title: 'Bảng xếp hạng VĐV', sub: 'Top VĐV theo hạng cân & quyền thuật' },
        ].map(item => (
          <AnimatedCard
            key={item.route}
            onPress={() => { hapticSelection(); router.push(item.route) }}
            style={{ marginBottom: Space.md }}
          >
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
