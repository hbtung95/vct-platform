import * as React from 'react'
import { ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native'
import { useRouter } from 'solito/navigation'
import { useAuth } from '../../auth/AuthProvider'
import { Colors, FontWeight, Radius, Space, SharedStyles } from '../mobile-theme'
import { Icon, VCTIcons } from '../icons'
import { AnimatedCard, StatCard } from '../mobile-ui'
import { hapticLight, hapticSelection } from '../haptics'
import { useMedicalStats } from './useMedicalData'

// ═══════════════════════════════════════════════════════════════
// MEDICAL PORTAL SCREEN
// ═══════════════════════════════════════════════════════════════

const s = StyleSheet.create({
  headerArea: { paddingHorizontal: Space.xl, paddingTop: Space.xxl, paddingBottom: Space.xl },
  greeting: { fontSize: 24, fontWeight: FontWeight.black, color: Colors.textWhite, marginBottom: 4 },
  subGreeting: { fontSize: 14, color: Colors.accent, fontWeight: FontWeight.bold },
  
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.md, paddingHorizontal: Space.xl, marginBottom: Space.xxl },
  quickActions: { paddingHorizontal: Space.xl, marginBottom: Space.xxl },
})

export function MedicalPortalMobileScreen() {
  const router = useRouter()
  const { currentUser } = useAuth()
  const { stats, isLoading } = useMedicalStats()
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
        <Text style={s.greeting}>Xin chào, Y tế</Text>
        <Text style={s.subGreeting}>{currentUser.name || 'Người dùng'}</Text>
      </View>

      <View style={s.cardGrid}>
        <View style={{ width: '47%' }}><StatCard label="Tổng sự cố" value={stats.totalIncidents} icon={VCTIcons.alert} color={Colors.textPrimary} /></View>
        <View style={{ width: '47%' }}><StatCard label="Chờ xử lý" value={stats.pendingReview} icon={VCTIcons.time} color={Colors.accent} /></View>
        <View style={{ width: '47%' }}><StatCard label="Đã sơ cứu" value={stats.cleared} icon={VCTIcons.checkmark} color={Colors.green} /></View>
        <View style={{ width: '47%' }}><StatCard label="Chấn thương" value={stats.withdrawn} icon={VCTIcons.close} color={Colors.red} /></View>
      </View>

      <View style={s.quickActions}>
        <Text style={SharedStyles.sectionTitle}>Tác vụ nhanh</Text>
        
        <AnimatedCard 
          onPress={() => { hapticSelection(); router.push('/medical-incidents') }}
          style={{ marginBottom: Space.md }}
        >
          <View style={[SharedStyles.row, { padding: Space.lg }]}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.overlay(Colors.red, 0.15), justifyContent: 'center', alignItems: 'center', marginRight: Space.md }}>
              <Icon name={VCTIcons.alert} size={24} color={Colors.red} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: FontWeight.bold, color: Colors.textWhite, marginBottom: 2 }}>Danh sách sự cố</Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary }}>Biên bản y tế & chấn thương gần đây</Text>
            </View>
            <Icon name={VCTIcons.forward} size={20} color={Colors.textMuted} />
          </View>
        </AnimatedCard>

        <AnimatedCard 
          onPress={() => { hapticSelection(); router.push('/medical-records') }}
          style={{ marginBottom: Space.md }}
        >
          <View style={[SharedStyles.row, { padding: Space.lg }]}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.overlay(Colors.accent, 0.15), justifyContent: 'center', alignItems: 'center', marginRight: Space.md }}>
              <Icon name={VCTIcons.clipboard} size={24} color={Colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: FontWeight.bold, color: Colors.textWhite, marginBottom: 2 }}>Khám sức khỏe</Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary }}>Hồ sơ cân ký & tình trạng VĐV</Text>
            </View>
            <Icon name={VCTIcons.forward} size={20} color={Colors.textMuted} />
          </View>
        </AnimatedCard>
      </View>
    </ScrollView>
  )
}
