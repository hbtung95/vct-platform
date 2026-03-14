import * as React from 'react'
import { StyleSheet, Text, View, RefreshControl, ScrollView } from 'react-native'
import { useRouter } from 'solito/navigation'
import { useAuth } from '../../auth/AuthProvider'
import { Colors, FontWeight, Radius, Space, SharedStyles } from '../mobile-theme'
import { Icon, VCTIcons } from '../icons'
import { AnimatedCard, StatCard, ScreenSkeleton, StatsCounter } from '../mobile-ui'
import { hapticLight, hapticSelection } from '../haptics'
import { useTDDashboard } from './useTDData'

const s = StyleSheet.create({
  heroHeader: {
    paddingHorizontal: Space.xl, paddingTop: Space.xxxl, paddingBottom: Space.xxl,
    backgroundColor: Colors.bgDark, borderBottomLeftRadius: Radius.xl, borderBottomRightRadius: Radius.xl,
    marginBottom: Space.lg,
  },
  greeting: { fontSize: 26, fontWeight: FontWeight.black, color: '#ffffff', marginBottom: 4 },
  subGreeting: { fontSize: 14, color: Colors.accent, fontWeight: FontWeight.bold },
  statsRow: { flexDirection: 'row', gap: Space.sm, marginTop: Space.lg },
  cardGrid: { paddingHorizontal: Space.xl, marginBottom: Space.xxl },
  alertCard: {
    flexDirection: 'row', alignItems: 'center', gap: Space.md,
    padding: Space.lg, borderRadius: Radius.lg, marginHorizontal: Space.xl, marginBottom: Space.lg,
    backgroundColor: Colors.overlay(Colors.gold, 0.08),
    borderWidth: 1, borderColor: Colors.overlay(Colors.gold, 0.2),
  },
})

export function TDPortalMobileScreen() {
  const router = useRouter()
  const { currentUser } = useAuth()
  const { data: dash, isLoading, refetch } = useTDDashboard()
  const [refreshing, setRefreshing] = React.useState(false)

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true)
    hapticLight()
    await refetch()
    setRefreshing(false)
  }, [refetch])

  if (isLoading && !refreshing) return <ScreenSkeleton />

  const pendingReviews = dash?.pending_standard_reviews ?? 0

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.bgBase }}
      contentContainerStyle={{ paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
    >
      {/* ── Hero Header (dark bg = visible white text) ── */}
      <View style={s.heroHeader}>
        <Text style={s.greeting}>Giám đốc Kỹ thuật</Text>
        <Text style={s.subGreeting}>{currentUser.name || 'Ban Chuyên môn'}</Text>

        <View style={s.statsRow}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <StatsCounter value={dash?.total_weight_classes ?? 0} label="Hạng cân" color={Colors.accent} icon={VCTIcons.barbell} />
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <StatsCounter value={dash?.total_age_groups ?? 0} label="Nhóm tuổi" color={Colors.purple} icon={VCTIcons.people} />
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <StatsCounter value={dash?.total_competition_contents ?? 0} label="Nội dung" color={Colors.gold} icon={VCTIcons.trophy} />
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <StatsCounter value={dash?.total_certified_referees ?? 0} label="Trọng tài" color={Colors.green} icon={VCTIcons.shield} />
          </View>
        </View>
      </View>

      {/* ── Pending Reviews Alert ── */}
      {pendingReviews > 0 && (
        <View style={s.alertCard}>
          <Icon name={VCTIcons.alert} size={20} color={Colors.gold} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: FontWeight.bold, color: Colors.textPrimary }}>
              {pendingReviews} quy chuẩn chờ duyệt
            </Text>
            <Text style={{ fontSize: 11, color: Colors.textSecondary }}>Cần xem xét và phê duyệt</Text>
          </View>
          <Icon name={VCTIcons.forward} size={16} color={Colors.textMuted} />
        </View>
      )}

      {/* ── Avg Referee Score ── */}
      <View style={{ paddingHorizontal: Space.xl, marginBottom: Space.lg }}>
        <View style={[SharedStyles.card, { flexDirection: 'row', alignItems: 'center', gap: Space.md }]}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.overlay(Colors.green, 0.1), justifyContent: 'center', alignItems: 'center' }}>
            <Icon name={VCTIcons.star} size={22} color={Colors.green} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: Colors.textSecondary, fontWeight: FontWeight.bold, textTransform: 'uppercase' }}>Điểm TB trọng tài</Text>
            <Text style={{ fontSize: 22, fontWeight: FontWeight.black, color: Colors.green }}>{dash?.avg_referee_score ?? '–'}/10</Text>
          </View>
        </View>
      </View>

      {/* ── Navigation Cards ── */}
      <View style={s.cardGrid}>
        <Text style={SharedStyles.sectionTitle}>Quản lý Chuyên môn</Text>

        {[
          { route: '/td-standards', icon: VCTIcons.clipboard, color: Colors.accent, title: 'Quy chuẩn Kỹ thuật', sub: 'Hạng cân, nhóm tuổi, nội dung thi đấu' },
          { route: '/td-quality', icon: VCTIcons.shield, color: Colors.gold, title: 'Chất lượng Trọng tài', sub: 'Đánh giá năng lực & phản hồi' },
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
