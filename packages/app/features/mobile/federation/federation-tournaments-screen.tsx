import * as React from 'react'
import { StyleSheet, Text, View, RefreshControl, ScrollView } from 'react-native'
import { Colors, FontWeight, Radius, Space, SharedStyles } from '../mobile-theme'
import { Icon, VCTIcons } from '../icons'
import { SearchBar } from '../mobile-ui'
import { hapticLight } from '../haptics'
import { useFederationTournaments } from './useFederationData'

// ═══════════════════════════════════════════════════════════════
// FEDERATION TOURNAMENTS SCREEN
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
  title: { fontSize: 16, fontWeight: FontWeight.black, color: Colors.textWhite, flex: 1, marginRight: Space.md },
  
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.sm },
  statusText: { fontSize: 11, fontWeight: FontWeight.bold },
  
  badgeUpcoming: { backgroundColor: Colors.overlay(Colors.purple, 0.15) },
  textUpcoming: { color: Colors.purple },
  badgeOngoing: { backgroundColor: Colors.overlay(Colors.green, 0.15) },
  textOngoing: { color: Colors.green },
  badgeCompleted: { backgroundColor: Colors.bgBase },
  textCompleted: { color: Colors.textMuted },

  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: Space.sm },
  infoLabel: { fontSize: 13, color: Colors.textSecondary, marginLeft: Space.sm },
})

export function FederationTournamentsMobileScreen() {
  const { data: tournaments, isLoading } = useFederationTournaments()
  const [refreshing, setRefreshing] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
    hapticLight()
  }, [])

  if (isLoading && !refreshing) return <View style={SharedStyles.page} />

  const filtered = tournaments.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusDisplay = (status: string) => {
    if (status === 'upcoming') return { text: 'Sắp diễn ra', badge: s.badgeUpcoming, color: s.textUpcoming }
    if (status === 'ongoing') return { text: 'Đang diễn ra', badge: s.badgeOngoing, color: s.textOngoing }
    return { text: 'Đã kết thúc', badge: s.badgeCompleted, color: s.textCompleted }
  }

  return (
    <ScrollView 
      style={SharedStyles.page} 
      contentContainerStyle={{ padding: Space.xl, paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ marginBottom: Space.xl }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Tìm tên giải đấu..." />
      </View>

      <Text style={[SharedStyles.sectionTitle, { marginBottom: 16 }]}>Lịch Giải đấu ({filtered.length})</Text>

      {filtered.map(t => {
        const status = getStatusDisplay(t.status)
        return (
          <View key={t.id} style={s.card}>
            <View style={s.headerRow}>
              <Text style={s.title}>{t.name}</Text>
              <View style={[s.statusBadge, status.badge]}>
                <Text style={[s.statusText, status.color]}>{status.text}</Text>
              </View>
            </View>

            <View style={s.infoRow}>
              <Icon name={VCTIcons.location} size={15} color={Colors.textMuted} />
              <Text style={s.infoLabel} numberOfLines={1}>{t.location}</Text>
            </View>
            
            <View style={s.infoRow}>
              <Icon name={VCTIcons.calendarOutline} size={15} color={Colors.textMuted} />
              <Text style={s.infoLabel}>{t.start_date} - {t.end_date}</Text>
            </View>

            <View style={s.infoRow}>
              <Icon name={VCTIcons.people} size={15} color={Colors.textMuted} />
              <Text style={s.infoLabel}>{t.athlete_count} VĐV tham dự</Text>
            </View>
          </View>
        )
      })}
      {filtered.length === 0 && (
        <Text style={{ color: Colors.textMuted, textAlign: 'center', marginTop: Space.xxl }}>Không tìm thấy giải đấu</Text>
      )}
    </ScrollView>
  )
}
