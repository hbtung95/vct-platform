import * as React from 'react'
import { StyleSheet, Text, View, RefreshControl, ScrollView } from 'react-native'
import { Colors, FontWeight, Radius, Space, SharedStyles } from '../mobile-theme'
import { Icon, VCTIcons } from '../icons'
import { hapticLight } from '../haptics'
import { useFederationFinance } from './useFederationData'

// ═══════════════════════════════════════════════════════════════
// FEDERATION FINANCE SCREEN
// ═══════════════════════════════════════════════════════════════

const s = StyleSheet.create({
  summaryCard: {
    padding: Space.xl,
    borderRadius: Radius.lg,
    backgroundColor: Colors.overlay(Colors.green, 0.1),
    borderWidth: 1,
    borderColor: Colors.overlay(Colors.green, 0.3),
    marginBottom: Space.xl,
    alignItems: 'center',
  },
  summaryLabel: { fontSize: 14, color: Colors.textSecondary, marginBottom: Space.xs },
  summaryValue: { fontSize: 32, fontWeight: FontWeight.black, color: Colors.green, marginBottom: Space.md },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Space.md },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 16, fontWeight: FontWeight.bold, color: Colors.textWhite },
  statLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },

  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Space.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgCard,
    marginBottom: Space.md,
  },
  txIconContainer: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    marginRight: Space.md,
  },
  txContent: { flex: 1 },
  txDesc: { fontSize: 14, fontWeight: FontWeight.bold, color: Colors.textWhite, marginBottom: 2 },
  txDate: { fontSize: 12, color: Colors.textMuted },
  txAmount: { fontSize: 15, fontWeight: FontWeight.black },
})

const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export function FederationFinanceMobileScreen() {
  const { data: finance, isLoading } = useFederationFinance()
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
      contentContainerStyle={{ padding: Space.xl, paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
    >
      <View style={s.summaryCard}>
        <Text style={s.summaryLabel}>Tổng doanh thu (Năm nay)</Text>
        <Text style={s.summaryValue}>{formatVND(finance.total_revenue)}</Text>

        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Text style={s.statValue}>{formatVND(finance.total_club_dues)}</Text>
            <Text style={s.statLabel}>Thu hội phí CLB</Text>
          </View>
          <View style={s.statItem}>
            <Text style={s.statValue}>{formatVND(finance.total_sanction_fees)}</Text>
            <Text style={s.statLabel}>Cấp phép giải</Text>
          </View>
          <View style={s.statItem}>
            <Text style={[s.statValue, { color: Colors.red }]}>{finance.pending_dues_count}</Text>
            <Text style={s.statLabel}>CLB trễ hẹn</Text>
          </View>
        </View>
      </View>

      <Text style={[SharedStyles.sectionTitle, { marginBottom: 16 }]}>Giao dịch gần đây</Text>

      {finance.recent_transactions.map(tx => {
        const isIn = tx.type === 'in'
        return (
          <View key={tx.id} style={s.txCard}>
            <View style={[s.txIconContainer, { backgroundColor: isIn ? Colors.overlay(Colors.green, 0.15) : Colors.overlay(Colors.red, 0.15) }]}>
              <Icon 
                name={isIn ? VCTIcons.trending : VCTIcons.trendingDown} 
                size={20} 
                color={isIn ? Colors.green : Colors.red} 
              />
            </View>
            <View style={s.txContent}>
              <Text style={s.txDesc}>{tx.description}</Text>
              <Text style={s.txDate}>{tx.date}</Text>
            </View>
            <Text style={[s.txAmount, { color: isIn ? Colors.green : Colors.textPrimary }]}>
              {isIn ? '+' : '-'}{formatVND(tx.amount)}
            </Text>
          </View>
        )
      })}
    </ScrollView>
  )
}
