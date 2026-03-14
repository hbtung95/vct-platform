import * as React from 'react'
import { ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native'
import { useRouter } from 'solito/navigation'
import { useAuth } from '../../auth/AuthProvider'
import { Colors, FontWeight, Radius, Space, SharedStyles } from '../mobile-theme'
import { Icon, VCTIcons } from '../icons'
import { AnimatedCard, StatCard, showComingSoon } from '../mobile-ui'
import { hapticLight, hapticSelection } from '../haptics'
import { useDelegationStats } from './useClubData'

// ═══════════════════════════════════════════════════════════════
// DELEGATION PORTAL SCREEN
// ═══════════════════════════════════════════════════════════════

const s = StyleSheet.create({
  headerArea: { paddingHorizontal: Space.xl, paddingTop: Space.xxl, paddingBottom: Space.xl },
  greeting: { fontSize: 24, fontWeight: FontWeight.black, color: Colors.textWhite, marginBottom: 4 },
  subGreeting: { fontSize: 14, color: Colors.accent, fontWeight: FontWeight.bold },
  
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.md, paddingHorizontal: Space.xl, marginBottom: Space.xxl },
  quickActions: { paddingHorizontal: Space.xl, marginBottom: Space.xxl },
})

export function ClubDelegationPortalMobileScreen() {
  const router = useRouter()
  const { currentUser } = useAuth()
  const { stats, isLoading } = useDelegationStats()
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
        <Text style={s.greeting}>Trưởng đoàn / HLV</Text>
        <Text style={s.subGreeting}>{currentUser.name || 'Người dùng'}</Text>
      </View>

      <View style={s.cardGrid}>
        <View style={{ width: '47%' }}><StatCard label="Tổng VĐV thi đấu" value={stats.total_athletes} icon={VCTIcons.people} color={Colors.textPrimary} /></View>
        <View style={{ width: '47%' }}><StatCard label="Trận đang diễn ra" value={stats.active_matches} icon={VCTIcons.time} color={Colors.accent} /></View>
        <View style={{ width: '47%' }}><StatCard label="Tổng Huy Chương" value={stats.gold_medals + stats.silver_medals + stats.bronze_medals} icon={VCTIcons.star} color={Colors.gold} /></View>
        <View style={{ width: '47%' }}><StatCard label="Thứ hạng đoàn" value={`#${stats.team_rank}`} icon={VCTIcons.stats} color={Colors.purple} /></View>
      </View>

      <View style={s.quickActions}>
        <Text style={SharedStyles.sectionTitle}>Chức năng nghiệp vụ</Text>
        
        <AnimatedCard 
          onPress={() => { hapticSelection(); router.push('/club-delegation-schedule') }}
          style={{ marginBottom: Space.md }}
        >
          <View style={[SharedStyles.row, { padding: Space.lg }]}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.overlay(Colors.accent, 0.15), justifyContent: 'center', alignItems: 'center', marginRight: Space.md }}>
              <Icon name={VCTIcons.calendar} size={24} color={Colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: FontWeight.bold, color: Colors.textWhite, marginBottom: 2 }}>Lịch thi đấu đoàn</Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary }}>Theo dõi lịch thi đấu của VĐV trong đoàn</Text>
            </View>
            <Icon name={VCTIcons.forward} size={20} color={Colors.textMuted} />
          </View>
        </AnimatedCard>

        <AnimatedCard 
          onPress={() => { hapticSelection(); router.push('/club-delegation-results') }}
          style={{ marginBottom: Space.md }}
        >
          <View style={[SharedStyles.row, { padding: Space.lg }]}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.overlay(Colors.gold, 0.15), justifyContent: 'center', alignItems: 'center', marginRight: Space.md }}>
              <Icon name={VCTIcons.star} size={24} color={Colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: FontWeight.bold, color: Colors.textWhite, marginBottom: 2 }}>Bảng thành tích</Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary }}>Huy chương & kết quả giải đấu</Text>
            </View>
            <Icon name={VCTIcons.forward} size={20} color={Colors.textMuted} />
          </View>
        </AnimatedCard>
      </View>
    </ScrollView>
  )
}
