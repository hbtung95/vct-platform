import * as React from 'react'
import { StyleSheet, Text, View, RefreshControl, ScrollView } from 'react-native'
import { Colors, FontWeight, Radius, Space, SharedStyles } from '../mobile-theme'
import { Icon, VCTIcons } from '../icons'
import { SearchBar } from '../mobile-ui'
import { hapticLight } from '../haptics'
import { useProvincialFederations } from './useNationalFederationData'

// ═══════════════════════════════════════════════════════════════
// NATIONAL FEDERATION — PROVINCIAL FEDERATIONS DIRECTORY
// ═══════════════════════════════════════════════════════════════

const s = StyleSheet.create({
  card: {
    padding: Space.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgCard,
    marginBottom: Space.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Space.sm },
  name: { fontSize: 16, fontWeight: FontWeight.black, color: Colors.textWhite, flex: 1, marginRight: Space.md },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.sm },
  statusText: { fontSize: 11, fontWeight: FontWeight.bold },
  badgeActive: { backgroundColor: Colors.overlay(Colors.green, 0.15) },
  textActive: { color: Colors.green },
  badgeInactive: { backgroundColor: Colors.overlay(Colors.red, 0.15) },
  textInactive: { color: Colors.red },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: Space.md, paddingTop: Space.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: FontWeight.bold, color: Colors.textWhite },
  statLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: Space.sm },
  infoLabel: { fontSize: 13, color: Colors.textSecondary, marginLeft: Space.sm },
})

export function NFProvincesMobileScreen() {
  const { data: federations, isLoading } = useProvincialFederations()
  const [refreshing, setRefreshing] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
    hapticLight()
  }, [])

  if (isLoading && !refreshing) return <View style={SharedStyles.page} />

  const filtered = federations.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.province.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <ScrollView
      style={SharedStyles.page}
      contentContainerStyle={{ padding: Space.xl, paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ marginBottom: Space.xl }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Tìm tỉnh/thành, tên liên đoàn..." />
      </View>

      <Text style={[SharedStyles.sectionTitle, { marginBottom: 16 }]}>Liên đoàn cấp Tỉnh ({filtered.length})</Text>

      {filtered.map(f => {
        const isActive = f.status === 'active'
        return (
          <View key={f.id} style={s.card}>
            <View style={s.headerRow}>
              <Text style={s.name}>{f.name}</Text>
              <View style={[s.statusBadge, isActive ? s.badgeActive : s.badgeInactive]}>
                <Text style={[s.statusText, isActive ? s.textActive : s.textInactive]}>
                  {isActive ? 'Hoạt động' : 'Tạm dừng'}
                </Text>
              </View>
            </View>

            <View style={s.infoRow}>
              <Icon name={VCTIcons.person} size={15} color={Colors.textMuted} />
              <Text style={s.infoLabel}>CT: {f.president_name}</Text>
            </View>

            <View style={s.statsRow}>
              <View style={s.statItem}>
                <Text style={s.statValue}>{f.club_count}</Text>
                <Text style={s.statLabel}>CLB</Text>
              </View>
              <View style={s.statItem}>
                <Text style={s.statValue}>{f.athlete_count}</Text>
                <Text style={s.statLabel}>VĐV</Text>
              </View>
              <View style={s.statItem}>
                <Text style={s.statValue}>{f.referee_count}</Text>
                <Text style={s.statLabel}>Trọng tài</Text>
              </View>
            </View>
          </View>
        )
      })}
      {filtered.length === 0 && (
        <Text style={{ color: Colors.textMuted, textAlign: 'center', marginTop: Space.xxl }}>Không tìm thấy kết quả</Text>
      )}
    </ScrollView>
  )
}
