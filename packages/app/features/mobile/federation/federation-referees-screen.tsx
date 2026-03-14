import * as React from 'react'
import { StyleSheet, Text, View, RefreshControl, ScrollView } from 'react-native'
import { Colors, FontWeight, Radius, Space, SharedStyles } from '../mobile-theme'
import { Icon, VCTIcons } from '../icons'
import { SearchBar } from '../mobile-ui'
import { hapticLight } from '../haptics'
import { useFederationReferees } from './useFederationData'

// ═══════════════════════════════════════════════════════════════
// FEDERATION REFEREES DIRECTORY SCREEN
// ═══════════════════════════════════════════════════════════════

const s = StyleSheet.create({
  card: {
    padding: Space.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgCard,
    marginBottom: Space.md,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.overlay(Colors.textPrimary, 0.1),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Space.md,
  },
  content: { flex: 1 },
  name: { fontSize: 16, fontWeight: FontWeight.black, color: Colors.textWhite, marginBottom: 4 },
  
  gradeBadge: { 
    paddingHorizontal: 6, paddingVertical: 2, 
    borderRadius: Radius.sm, 
    backgroundColor: Colors.overlay(Colors.gold, 0.15),
    alignSelf: 'flex-start',
    marginBottom: Space.xs,
  },
  gradeText: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.gold },

  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  infoLabel: { fontSize: 13, color: Colors.textSecondary, marginLeft: Space.xs },
})

const GRADE_LABELS: Record<string, string> = {
  '1': 'Cấp 1 Tỉnh',
  '2': 'Cấp 2 Tỉnh',
  '3': 'Cấp 3 Tỉnh',
  'national': 'Cấp Quốc gia',
  'international': 'Cấp Quốc tế',
}

export function FederationRefereesMobileScreen() {
  const { data: referees, isLoading } = useFederationReferees()
  const [refreshing, setRefreshing] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
    hapticLight()
  }, [])

  if (isLoading && !refreshing) return <View style={SharedStyles.page} />

  const filtered = referees.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.club_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <ScrollView 
      style={SharedStyles.page} 
      contentContainerStyle={{ padding: Space.xl, paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ marginBottom: Space.xl }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Tìm trọng tài, cấp bậc..." />
      </View>

      <Text style={[SharedStyles.sectionTitle, { marginBottom: 16 }]}>Danh bạ Trọng tài ({filtered.length})</Text>

      {filtered.map(r => {
        const isSuspended = r.status === 'suspended'
        return (
          <View key={r.id} style={[s.card, isSuspended && { opacity: 0.5 }]}>
            <View style={s.avatar}>
              <Icon name={VCTIcons.person} size={24} color={Colors.textMuted} />
            </View>
            <View style={s.content}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={s.name}>{r.name}</Text>
                {isSuspended && <Icon name={VCTIcons.alert} size={16} color={Colors.red} />}
              </View>
              
              <View style={s.gradeBadge}>
                <Text style={s.gradeText}>{GRADE_LABELS[r.grade] || r.grade}</Text>
              </View>

              <View style={s.infoRow}>
                <Icon name={VCTIcons.homeOutline} size={13} color={Colors.textMuted} />
                <Text style={s.infoLabel} numberOfLines={1}>{r.club_name}</Text>
              </View>
              
              <View style={s.infoRow}>
                <Icon name={VCTIcons.phone} size={13} color={Colors.textMuted} />
                <Text style={s.infoLabel}>{r.phone}</Text>
              </View>
            </View>
          </View>
        )
      })}
      {filtered.length === 0 && (
        <Text style={{ color: Colors.textMuted, textAlign: 'center', marginTop: Space.xxl }}>Không tìm thấy trọng tài</Text>
      )}
    </ScrollView>
  )
}
