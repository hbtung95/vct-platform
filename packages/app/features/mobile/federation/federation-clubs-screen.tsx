import * as React from 'react'
import { StyleSheet, Text, View, RefreshControl, ScrollView } from 'react-native'
import { Colors, FontWeight, Radius, Space, SharedStyles } from '../mobile-theme'
import { Icon, VCTIcons } from '../icons'
import { SearchBar } from '../mobile-ui'
import { hapticLight } from '../haptics'
import { useFederationClubs } from './useFederationData'

// ═══════════════════════════════════════════════════════════════
// FEDERATION CLUBS DIRECTORY SCREEN
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
  clubName: { fontSize: 16, fontWeight: FontWeight.black, color: Colors.textWhite, flex: 1, marginRight: Space.md },
  
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.sm },
  statusText: { fontSize: 11, fontWeight: FontWeight.bold },
  badgeActive: { backgroundColor: Colors.overlay(Colors.green, 0.15) },
  textActive: { color: Colors.green },
  badgeInactive: { backgroundColor: Colors.overlay(Colors.red, 0.15) },
  textInactive: { color: Colors.red },

  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: Space.sm },
  infoLabel: { fontSize: 13, color: Colors.textSecondary, marginLeft: Space.sm },
})

export function FederationClubsMobileScreen() {
  const { data: clubs, isLoading } = useFederationClubs()
  const [refreshing, setRefreshing] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
    hapticLight()
  }, [])

  if (isLoading && !refreshing) return <View style={SharedStyles.page} />

  const filtered = clubs.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.coach_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <ScrollView 
      style={SharedStyles.page} 
      contentContainerStyle={{ padding: Space.xl, paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ marginBottom: Space.xl }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Tìm CLB, võ đường, tên HLV..." />
      </View>

      <Text style={[SharedStyles.sectionTitle, { marginBottom: 16 }]}>Danh bạ trực thuộc ({filtered.length})</Text>

      {filtered.map(club => {
        const isActive = club.status === 'active'
        return (
          <View key={club.id} style={s.card}>
            <View style={s.headerRow}>
              <Text style={s.clubName}>{club.name}</Text>
              <View style={[s.statusBadge, isActive ? s.badgeActive : s.badgeInactive]}>
                <Text style={[s.statusText, isActive ? s.textActive : s.textInactive]}>
                  {isActive ? 'Hoạt động' : 'Tạm dừng'}
                </Text>
              </View>
            </View>

            <View style={s.infoRow}>
              <Icon name={VCTIcons.location} size={15} color={Colors.textMuted} />
              <Text style={s.infoLabel} numberOfLines={1}>{club.address}</Text>
            </View>
            
            <View style={s.infoRow}>
              <Icon name={VCTIcons.person} size={15} color={Colors.textMuted} />
              <Text style={s.infoLabel}>CN: {club.coach_name} - {club.contact_phone}</Text>
            </View>

            <View style={s.infoRow}>
              <Icon name={VCTIcons.people} size={15} color={Colors.textMuted} />
              <Text style={s.infoLabel}>{club.member_count} võ sinh</Text>
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
