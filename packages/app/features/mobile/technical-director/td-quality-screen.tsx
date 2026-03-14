import * as React from 'react'
import { StyleSheet, Text, View, RefreshControl, ScrollView } from 'react-native'
import { Colors, FontWeight, Radius, Space, SharedStyles } from '../mobile-theme'
import { Icon, VCTIcons } from '../icons'
import { SearchBar, ScreenSkeleton } from '../mobile-ui'
import { hapticLight } from '../haptics'
import { useTDRefereeQuality } from './useTDData'

const s = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', padding: Space.lg, borderRadius: Radius.lg, backgroundColor: Colors.bgCard, marginBottom: Space.md, borderWidth: 1, borderColor: Colors.border },
  avatar: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: Space.md },
  content: { flex: 1 },
  name: { fontSize: 15, fontWeight: FontWeight.black, color: Colors.textWhite, marginBottom: 2 },
  province: { fontSize: 12, color: Colors.textMuted, marginBottom: 4 },
  metricsRow: { flexDirection: 'row', gap: Space.md, marginTop: Space.xs },
  metric: { alignItems: 'center' },
  metricValue: { fontSize: 14, fontWeight: FontWeight.bold },
  metricLabel: { fontSize: 9, color: Colors.textMuted },
  scoreBadge: { alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.lg },
  scoreValue: { fontSize: 20, fontWeight: FontWeight.black },
  scoreLabel: { fontSize: 9, color: Colors.textMuted, marginTop: 2 },
})

export function TDQualityMobileScreen() {
  const { data: referees, isLoading, refetch } = useTDRefereeQuality()
  const [refreshing, setRefreshing] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const onRefresh = React.useCallback(async () => { setRefreshing(true); hapticLight(); await refetch(); setRefreshing(false) }, [refetch])

  if (isLoading && !refreshing) return <ScreenSkeleton />

  const filtered = referees.filter(r =>
    r.referee_name.toLowerCase().includes(search.toLowerCase()) ||
    r.province.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    if (status === 'excellent') return Colors.green
    if (status === 'good') return Colors.accent
    if (status === 'needs_improvement') return Colors.gold
    return Colors.red
  }

  return (
    <ScrollView style={SharedStyles.page} contentContainerStyle={{ padding: Space.xl, paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
      keyboardShouldPersistTaps="handled"
    >
      <SearchBar value={search} onChangeText={setSearch} placeholder="Tìm trọng tài..." />
      <Text style={[SharedStyles.sectionTitle, { marginBottom: 16, marginTop: Space.xl }]}>Đánh giá chất lượng ({filtered.length})</Text>

      {filtered.map(r => {
        const statusColor = getStatusColor(r.status)
        return (
          <View key={r.id} style={s.card}>
            <View style={[s.avatar, { backgroundColor: Colors.overlay(statusColor, 0.1) }]}>
              <Icon name={VCTIcons.shield} size={24} color={statusColor} />
            </View>
            <View style={s.content}>
              <Text style={s.name}>{r.referee_name}</Text>
              <Text style={s.province}>{r.province} • {r.grade === 'international' ? 'QT' : r.grade === 'national' ? 'QG' : 'Tỉnh'}</Text>
              <View style={s.metricsRow}>
                <View style={s.metric}>
                  <Text style={[s.metricValue, { color: Colors.textWhite }]}>{r.total_matches}</Text>
                  <Text style={s.metricLabel}>Trận</Text>
                </View>
                <View style={s.metric}>
                  <Text style={[s.metricValue, { color: Colors.accent }]}>{(r.accuracy_rate * 100).toFixed(0)}%</Text>
                  <Text style={s.metricLabel}>Chính xác</Text>
                </View>
                <View style={s.metric}>
                  <Text style={[s.metricValue, { color: r.complaints > 5 ? Colors.red : Colors.textSecondary }]}>{r.complaints}</Text>
                  <Text style={s.metricLabel}>Khiếu nại</Text>
                </View>
              </View>
            </View>
            <View style={[s.scoreBadge, { backgroundColor: Colors.overlay(statusColor, 0.1) }]}>
              <Text style={[s.scoreValue, { color: statusColor }]}>{r.avg_score}</Text>
              <Text style={s.scoreLabel}>Điểm</Text>
            </View>
          </View>
        )
      })}
      {filtered.length === 0 && <Text style={{ color: Colors.textMuted, textAlign: 'center', marginTop: Space.xxl }}>Không tìm thấy</Text>}
    </ScrollView>
  )
}
