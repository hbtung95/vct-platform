import * as React from 'react'
import { StyleSheet, Text, View, RefreshControl, ScrollView } from 'react-native'
import { useRouter } from 'solito/navigation'
import { useAuth } from '../../auth/AuthProvider'
import { Colors, FontWeight, Space, SharedStyles } from '../mobile-theme'
import { Icon, VCTIcons } from '../icons'
import { AnimatedCard, StatCard } from '../mobile-ui'
import { hapticLight, hapticSelection } from '../haptics'
import { useFederationDashboard } from './useFederationData'

// ═══════════════════════════════════════════════════════════════
// FEDERATION PORTAL SCREEN
// ═══════════════════════════════════════════════════════════════

const s = StyleSheet.create({
  headerArea: { paddingHorizontal: Space.xl, paddingTop: Space.xxl, paddingBottom: Space.xl },
  greeting: { fontSize: 24, fontWeight: FontWeight.black, color: Colors.textWhite, marginBottom: 4 },
  subGreeting: { fontSize: 14, color: Colors.accent, fontWeight: FontWeight.bold },
  
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.md, paddingHorizontal: Space.xl, marginBottom: Space.xxl },
  quickActions: { paddingHorizontal: Space.xl, marginBottom: Space.xxl },
  
  alertBadge: {
    position: 'absolute', top: -6, right: -6,
    backgroundColor: Colors.red,
    minWidth: 20, height: 20, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 4, zIndex: 10,
  },
  alertText: { color: Colors.textWhite, fontSize: 11, fontWeight: FontWeight.black },
})

export function FederationPortalMobileScreen() {
  const router = useRouter()
  const { currentUser } = useAuth()
  const { data: dashboard, isLoading } = useFederationDashboard()
  const [refreshing, setRefreshing] = React.useState(false)

  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
    hapticLight()
  }, [])

  if (isLoading && !refreshing) return <View style={SharedStyles.page} />

  // Ensure dashboard is defined, fallback to 0 if undefined during transition
  const pendingApprovals = dashboard?.pending_approvals ?? 0

  return (
    <ScrollView 
      style={SharedStyles.page} 
      contentContainerStyle={{ paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
    >
      <View style={s.headerArea}>
        <Text style={s.greeting}>LĐVTCT Thành phố</Text>
        <Text style={s.subGreeting}>{currentUser.name || 'Quản lý Liên đoàn'}</Text>
      </View>

      <View style={s.cardGrid}>
        <View style={{ width: '47%' }}>
          <StatCard label="Tổng CLB" value={dashboard?.total_clubs ?? 0} icon={VCTIcons.homeOutline} color={Colors.textPrimary} />
        </View>
        <View style={{ width: '47%' }}>
          <StatCard label="Tổng Môn sinh" value={dashboard?.total_athletes ?? 0} icon={VCTIcons.people} color={Colors.accent} />
        </View>
        <View style={{ width: '47%' }}>
          <StatCard label="Số Trọng tài" value={dashboard?.total_referees ?? 0} icon={VCTIcons.star} color={Colors.gold} />
        </View>
        <View style={{ width: '47%' }}>
          <StatCard label="Giải đấu" value={dashboard?.active_tournaments ?? 0} icon={VCTIcons.trophy} color={Colors.purple} />
        </View>
      </View>

      <View style={s.quickActions}>
        <Text style={SharedStyles.sectionTitle}>Quản lý chuyên môn</Text>
        
        <AnimatedCard 
          onPress={() => { hapticSelection(); router.push('/federation-clubs') }}
          style={{ marginBottom: Space.md }}
        >
          <View style={[SharedStyles.row, { padding: Space.lg }]}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.overlay(Colors.accent, 0.15), justifyContent: 'center', alignItems: 'center', marginRight: Space.md }}>
              <Icon name={VCTIcons.homeFilled} size={24} color={Colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: FontWeight.bold, color: Colors.textWhite, marginBottom: 2 }}>Câu lạc bộ trực thuộc</Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary }}>Danh bạ & tình trạng hoạt động CLB</Text>
            </View>
            <Icon name={VCTIcons.forward} size={20} color={Colors.textMuted} />
          </View>
        </AnimatedCard>

        <AnimatedCard 
          onPress={() => { hapticSelection(); router.push('/federation-approvals') }}
          style={{ marginBottom: Space.md }}
        >
          <View style={[SharedStyles.row, { padding: Space.lg }]}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.overlay(Colors.gold, 0.15), justifyContent: 'center', alignItems: 'center', marginRight: Space.md }}>
              <Icon name={VCTIcons.document} size={24} color={Colors.gold} />
              {pendingApprovals > 0 && (
                <View style={s.alertBadge}>
                  <Text style={s.alertText}>{pendingApprovals}</Text>
                </View>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: FontWeight.bold, color: Colors.textWhite, marginBottom: 2 }}>Duyệt hồ sơ</Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary }}>Gia nhập, Thăng cấp, Chuyển nhượng</Text>
            </View>
            <Icon name={VCTIcons.forward} size={20} color={Colors.textMuted} />
          </View>
        </AnimatedCard>

        <Text style={[SharedStyles.sectionTitle, { marginTop: Space.md }]}>Mở rộng</Text>

        <AnimatedCard 
          onPress={() => { hapticSelection(); router.push('/federation-tournaments') }}
          style={{ marginBottom: Space.md }}
        >
          <View style={[SharedStyles.row, { padding: Space.lg }]}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.overlay(Colors.purple, 0.15), justifyContent: 'center', alignItems: 'center', marginRight: Space.md }}>
              <Icon name={VCTIcons.trophy} size={24} color={Colors.purple} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: FontWeight.bold, color: Colors.textWhite, marginBottom: 2 }}>Giải đấu cấp Tỉnh/Thành</Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary }}>Lịch trình & quy mô tổ chức</Text>
            </View>
            <Icon name={VCTIcons.forward} size={20} color={Colors.textMuted} />
          </View>
        </AnimatedCard>

        <AnimatedCard 
          onPress={() => { hapticSelection(); router.push('/federation-referees') }}
          style={{ marginBottom: Space.md }}
        >
          <View style={[SharedStyles.row, { padding: Space.lg }]}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.overlay('#3b82f6', 0.15), justifyContent: 'center', alignItems: 'center', marginRight: Space.md }}>
              <Icon name={VCTIcons.star} size={24} color="#3b82f6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: FontWeight.bold, color: Colors.textWhite, marginBottom: 2 }}>Danh bạ Trọng tài</Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary }}>Quản lý cấp bậc & phân công</Text>
            </View>
            <Icon name={VCTIcons.forward} size={20} color={Colors.textMuted} />
          </View>
        </AnimatedCard>

        <AnimatedCard 
          onPress={() => { hapticSelection(); router.push('/federation-finance') }}
          style={{ marginBottom: Space.md }}
        >
          <View style={[SharedStyles.row, { padding: Space.lg }]}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.overlay(Colors.green, 0.15), justifyContent: 'center', alignItems: 'center', marginRight: Space.md }}>
              <Icon name={VCTIcons.stats} size={24} color={Colors.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: FontWeight.bold, color: Colors.textWhite, marginBottom: 2 }}>Tài chính & Hội phí</Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary }}>Doanh thu, đóng phí định kỳ</Text>
            </View>
            <Icon name={VCTIcons.forward} size={20} color={Colors.textMuted} />
          </View>
        </AnimatedCard>
      </View>
    </ScrollView>
  )
}
