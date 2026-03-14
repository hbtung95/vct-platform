import * as React from 'react'
import { StyleSheet, Text, View, RefreshControl, ScrollView, Pressable } from 'react-native'
import { Colors, FontWeight, Radius, Space, SharedStyles } from '../mobile-theme'
import { Icon, VCTIcons } from '../icons'
import { SearchBar, ScreenSkeleton } from '../mobile-ui'
import { hapticLight, hapticSelection } from '../haptics'
import { useTDStandards } from './useTDData'

const s = StyleSheet.create({
  filterRow: { flexDirection: 'row', gap: Space.sm, marginBottom: Space.lg, flexWrap: 'wrap' },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  filterText: { fontSize: 12, color: Colors.textSecondary, fontWeight: FontWeight.bold },
  filterTextActive: { color: Colors.bgDark },
  card: { padding: Space.lg, borderRadius: Radius.lg, backgroundColor: Colors.bgCard, marginBottom: Space.md, borderWidth: 1, borderColor: Colors.border },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Space.sm },
  name: { fontSize: 15, fontWeight: FontWeight.black, color: Colors.textWhite, flex: 1, marginRight: Space.md },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.sm },
  badgeText: { fontSize: 10, fontWeight: FontWeight.bold },
  desc: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: Space.sm },
  metaText: { fontSize: 11, color: Colors.textMuted, marginLeft: 4 },
})

const TYPES = [
  { key: 'all', label: 'Tất cả' },
  { key: 'weight_class', label: 'Hạng cân' },
  { key: 'age_group', label: 'Nhóm tuổi' },
  { key: 'competition_content', label: 'Nội dung' },
]

export function TDStandardsMobileScreen() {
  const { data: standards, isLoading, refetch } = useTDStandards()
  const [refreshing, setRefreshing] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [activeType, setActiveType] = React.useState('all')

  const onRefresh = React.useCallback(async () => { setRefreshing(true); hapticLight(); await refetch(); setRefreshing(false) }, [refetch])

  if (isLoading && !refreshing) return <ScreenSkeleton />

  const filtered = standards
    .filter(st => activeType === 'all' || st.type === activeType)
    .filter(st => st.name.toLowerCase().includes(search.toLowerCase()))

  const getStatusStyle = (status: string) => {
    if (status === 'active') return { bg: Colors.overlay(Colors.green, 0.15), color: Colors.green, text: 'Hiệu lực' }
    if (status === 'draft') return { bg: Colors.overlay(Colors.purple, 0.15), color: Colors.purple, text: 'Dự thảo' }
    return { bg: Colors.bgBase, color: Colors.textMuted, text: 'Hết hiệu lực' }
  }

  return (
    <ScrollView style={SharedStyles.page} contentContainerStyle={{ padding: Space.xl, paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
      keyboardShouldPersistTaps="handled"
    >
      <SearchBar value={search} onChangeText={setSearch} placeholder="Tìm quy chuẩn..." />

      <View style={[s.filterRow, { marginTop: Space.lg }]}>
        {TYPES.map(t => {
          const active = activeType === t.key
          return (
            <Pressable key={t.key} style={[s.filterChip, active && s.filterChipActive]}
              onPress={() => { hapticSelection(); setActiveType(t.key) }}>
              <Text style={[s.filterText, active && s.filterTextActive]}>{t.label}</Text>
            </Pressable>
          )
        })}
      </View>

      <Text style={[SharedStyles.sectionTitle, { marginBottom: 16 }]}>Quy chuẩn ({filtered.length})</Text>

      {filtered.map(st => {
        const statusStyle = getStatusStyle(st.status)
        return (
          <View key={st.id} style={s.card}>
            <View style={s.headerRow}>
              <Text style={s.name}>{st.name}</Text>
              <View style={[s.badge, { backgroundColor: statusStyle.bg }]}>
                <Text style={[s.badgeText, { color: statusStyle.color }]}>{statusStyle.text}</Text>
              </View>
            </View>
            <View style={[s.badge, { backgroundColor: Colors.bgBase, alignSelf: 'flex-start', marginBottom: 4 }]}>
              <Text style={[s.badgeText, { color: Colors.textSecondary }]}>{st.scope === 'national' ? '🇻🇳 Quốc gia' : '🏛️ Tỉnh'}</Text>
            </View>
            <Text style={s.desc}>{st.description}</Text>
            <View style={s.meta}>
              <Icon name={VCTIcons.time} size={13} color={Colors.textMuted} />
              <Text style={s.metaText}>Cập nhật: {st.last_updated}</Text>
            </View>
          </View>
        )
      })}
      {filtered.length === 0 && <Text style={{ color: Colors.textMuted, textAlign: 'center', marginTop: Space.xxl }}>Không tìm thấy</Text>}
    </ScrollView>
  )
}
