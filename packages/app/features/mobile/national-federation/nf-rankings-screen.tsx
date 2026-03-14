import * as React from 'react'
import { StyleSheet, Text, View, RefreshControl, ScrollView, Pressable } from 'react-native'
import { Colors, FontWeight, Radius, Space, SharedStyles } from '../mobile-theme'
import { Icon, VCTIcons } from '../icons'
import { hapticLight, hapticSelection } from '../haptics'
import { useNationalRankings } from './useNationalFederationData'

// ═══════════════════════════════════════════════════════════════
// NATIONAL FEDERATION — NATIONAL RANKINGS
// ═══════════════════════════════════════════════════════════════

const s = StyleSheet.create({
  filterRow: { flexDirection: 'row', gap: Space.sm, marginBottom: Space.xl, flexWrap: 'wrap' },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  filterText: { fontSize: 13, color: Colors.textSecondary, fontWeight: FontWeight.bold },
  filterTextActive: { color: Colors.bgDark },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Space.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgCard,
    marginBottom: Space.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rankBadge: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    marginRight: Space.md,
  },
  rankText: { fontSize: 16, fontWeight: FontWeight.black },
  content: { flex: 1 },
  athleteName: { fontSize: 15, fontWeight: FontWeight.bold, color: Colors.textWhite, marginBottom: 2 },
  province: { fontSize: 12, color: Colors.textMuted },
  eloContainer: { alignItems: 'flex-end' },
  eloValue: { fontSize: 18, fontWeight: FontWeight.black, color: Colors.accent },
  eloLabel: { fontSize: 10, color: Colors.textMuted },
  recordText: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
})

const CATEGORIES = [
  { key: 'all', label: 'Tất cả' },
  { key: 'doi_khang', label: 'Đối kháng' },
  { key: 'quyen_thuat', label: 'Quyền thuật' },
]

export function NFRankingsMobileScreen() {
  const { data: rankings, isLoading } = useNationalRankings()
  const [refreshing, setRefreshing] = React.useState(false)
  const [activeCategory, setActiveCategory] = React.useState('all')

  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
    hapticLight()
  }, [])

  if (isLoading && !refreshing) return <View style={SharedStyles.page} />

  const filtered = activeCategory === 'all'
    ? rankings
    : rankings.filter(r => r.category === activeCategory)

  const getRankColor = (rank: number) => {
    if (rank === 1) return Colors.gold
    if (rank === 2) return '#C0C0C0'
    if (rank === 3) return '#CD7F32'
    return Colors.textMuted
  }

  return (
    <ScrollView
      style={SharedStyles.page}
      contentContainerStyle={{ padding: Space.xl, paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
    >
      <Text style={[SharedStyles.sectionTitle, { marginBottom: 16 }]}>Bảng xếp hạng Toàn quốc</Text>

      <View style={s.filterRow}>
        {CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.key
          return (
            <Pressable
              key={cat.key}
              style={[s.filterChip, isActive && s.filterChipActive]}
              onPress={() => { hapticSelection(); setActiveCategory(cat.key) }}
            >
              <Text style={[s.filterText, isActive && s.filterTextActive]}>{cat.label}</Text>
            </Pressable>
          )
        })}
      </View>

      {filtered.map((r, idx) => {
        const rankColor = getRankColor(r.rank)
        return (
          <View key={`${r.category}-${r.rank}-${idx}`} style={s.card}>
            <View style={[s.rankBadge, { backgroundColor: Colors.overlay(rankColor, 0.15) }]}>
              <Text style={[s.rankText, { color: rankColor }]}>#{r.rank}</Text>
            </View>
            <View style={s.content}>
              <Text style={s.athleteName}>{r.athlete_name}</Text>
              <Text style={s.province}>{r.province} • {r.weight_class}</Text>
            </View>
            <View style={s.eloContainer}>
              <Text style={s.eloValue}>{r.elo_rating}</Text>
              <Text style={s.eloLabel}>ELO</Text>
              <Text style={s.recordText}>{r.wins}W - {r.losses}L</Text>
            </View>
          </View>
        )
      })}
      {filtered.length === 0 && (
        <Text style={{ color: Colors.textMuted, textAlign: 'center', marginTop: Space.xxl }}>Không có dữ liệu</Text>
      )}
    </ScrollView>
  )
}
