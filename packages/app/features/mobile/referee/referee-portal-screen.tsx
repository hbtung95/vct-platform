import * as React from 'react'
import { ScrollView, StyleSheet, Text, View, Pressable, RefreshControl } from 'react-native'
import { useRouter } from 'solito/navigation'
import { useAuth } from '../../auth/AuthProvider'
import { Colors, FontWeight, Radius, Space, SharedStyles, Touch } from '../mobile-theme'
import { Icon, VCTIcons } from '../icons'
import { AnimatedCard, StatCard, showComingSoon } from '../mobile-ui'
import { hapticLight, hapticSelection } from '../haptics'
import { useRefereeStats } from './useRefereeData'

// ═══════════════════════════════════════════════════════════════
// REFEREE PORTAL SCREEN
// ═══════════════════════════════════════════════════════════════

const s = StyleSheet.create({
  headerArea: { paddingHorizontal: Space.xl, paddingTop: Space.xxl, paddingBottom: Space.xl },
  greeting: { fontSize: 24, fontWeight: FontWeight.black, color: Colors.textWhite, marginBottom: 4 },
  subGreeting: { fontSize: 14, color: Colors.accent, fontWeight: FontWeight.bold },
  
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.md, paddingHorizontal: Space.xl, marginBottom: Space.xxl },
  
  alertBox: {
    marginHorizontal: Space.xl, marginBottom: Space.xxl,
    padding: Space.lg, borderRadius: Radius.lg,
    backgroundColor: Colors.overlay(Colors.accent, 0.1),
    borderWidth: 1, borderColor: Colors.overlay(Colors.accent, 0.2),
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  alertText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  alertHighlight: { fontWeight: FontWeight.bold, color: Colors.textPrimary },
  
  quickActions: { paddingHorizontal: Space.xl, marginBottom: Space.xxl },
})

export function RefereePortalMobileScreen() {
  const router = useRouter()
  const { currentUser } = useAuth()
  const { stats, isLoading } = useRefereeStats()
  const [refreshing, setRefreshing] = React.useState(false)

  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
    hapticLight()
  }, [])

  if (isLoading && !refreshing) return <View style={SharedStyles.page} />

  return (
    <ScrollView 
      style={SharedStyles.page} 
      contentContainerStyle={{ paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
    >
      <View style={s.headerArea}>
        <Text style={s.greeting}>Xin chào, Trọng tài</Text>
        <Text style={s.subGreeting}>{currentUser.name || 'Người dùng'}</Text>
      </View>

      <View style={s.cardGrid}>
        <View style={{ width: '47%' }}><StatCard label="Tổng số trận" value={stats.totalAssigned} icon={VCTIcons.clipboard} color={Colors.textPrimary} /></View>
        <View style={{ width: '47%' }}><StatCard label="Trận chờ xử lý" value={stats.pending} icon={VCTIcons.time} color={Colors.accent} /></View>
        <View style={{ width: '47%' }}><StatCard label="Đã hoàn thành" value={stats.completed} icon={VCTIcons.checkmark} color={Colors.green} /></View>
        <View style={{ width: '47%' }}><StatCard label="Thảm thi đấu" value={stats.currentArena} icon={VCTIcons.location} color={Colors.purple} /></View>
      </View>

      {stats.pending > 0 && (
        <View style={s.alertBox}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.overlay(Colors.accent, 0.2), justifyContent: 'center', alignItems: 'center' }}>
            <Icon name={VCTIcons.alert} size={20} color={Colors.accent} />
          </View>
          <Text style={s.alertText}>
            Bạn có <Text style={s.alertHighlight}>{stats.pending} trận đấu</Text> đang chờ điều hành. Trận tiếp theo bắt đầu lúc <Text style={s.alertHighlight}>{stats.nextMatchTime}</Text>.
          </Text>
        </View>
      )}

      <View style={s.quickActions}>
        <Text style={SharedStyles.sectionTitle}>Tác vụ nhanh</Text>
        <AnimatedCard 
          onPress={() => { hapticSelection(); router.push('/referee-scoring') }}
          style={{ marginBottom: Space.md }}
        >
          <View style={[SharedStyles.row, { padding: Space.lg }]}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.overlay(Colors.gold, 0.15), justifyContent: 'center', alignItems: 'center', marginRight: Space.md }}>
              <Icon name={VCTIcons.flash} size={24} color={Colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: FontWeight.bold, color: Colors.textWhite, marginBottom: 2 }}>Màn hình Chấm Điểm</Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary }}>Truy cập nhanh vào hệ thống Livescoring</Text>
            </View>
            <Icon name={VCTIcons.forward} size={20} color={Colors.textMuted} />
          </View>
        </AnimatedCard>

        <AnimatedCard 
          onPress={() => { hapticSelection(); router.push('/referee-schedule') }}
          style={{ marginBottom: Space.md }}
        >
          <View style={[SharedStyles.row, { padding: Space.lg }]}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.overlay(Colors.accent, 0.15), justifyContent: 'center', alignItems: 'center', marginRight: Space.md }}>
              <Icon name={VCTIcons.calendar} size={24} color={Colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: FontWeight.bold, color: Colors.textWhite, marginBottom: 2 }}>Lịch làm việc</Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary }}>Xem danh sách các trận đã phân công</Text>
            </View>
            <Icon name={VCTIcons.forward} size={20} color={Colors.textMuted} />
          </View>
        </AnimatedCard>

        <AnimatedCard onPress={() => showComingSoon('Luật Thi Đấu')}>
          <View style={[SharedStyles.row, { padding: Space.lg }]}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.overlay(Colors.textSecondary, 0.15), justifyContent: 'center', alignItems: 'center', marginRight: Space.md }}>
              <Icon name={VCTIcons.book} size={24} color={Colors.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: FontWeight.bold, color: Colors.textWhite, marginBottom: 2 }}>Luật Thi Đấu</Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary }}>Tra cứu nhanh bộ luật chuẩn 2026</Text>
            </View>
            <Icon name={VCTIcons.forward} size={20} color={Colors.textMuted} />
          </View>
        </AnimatedCard>
      </View>
    </ScrollView>
  )
}
