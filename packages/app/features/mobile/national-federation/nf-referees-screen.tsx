import * as React from 'react'
import { StyleSheet, Text, View, RefreshControl, ScrollView } from 'react-native'
import { Colors, FontWeight, Radius, Space, SharedStyles } from '../mobile-theme'
import { Icon, VCTIcons } from '../icons'
import { SearchBar } from '../mobile-ui'
import { hapticLight } from '../haptics'
import { useNationalReferees } from './useNationalFederationData'

// ═══════════════════════════════════════════════════════════════
// NATIONAL FEDERATION — NATIONAL REFEREE DIRECTORY
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
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: Colors.overlay(Colors.gold, 0.1),
    justifyContent: 'center', alignItems: 'center',
    marginRight: Space.md,
  },
  content: { flex: 1 },
  name: { fontSize: 16, fontWeight: FontWeight.black, color: Colors.textWhite, marginBottom: 4 },
  gradeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.sm, alignSelf: 'flex-start', marginBottom: Space.xs },
  gradeText: { fontSize: 10, fontWeight: FontWeight.bold },
  certRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: Space.xs },
  certChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.sm, backgroundColor: Colors.bgBase },
  certText: { fontSize: 10, color: Colors.textSecondary },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  infoLabel: { fontSize: 13, color: Colors.textSecondary, marginLeft: Space.xs },
})

export function NFRefereesMobileScreen() {
  const { data: referees, isLoading } = useNationalReferees()
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
    r.province.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <ScrollView
      style={SharedStyles.page}
      contentContainerStyle={{ padding: Space.xl, paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ marginBottom: Space.xl }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Tìm trọng tài, tỉnh thành..." />
      </View>

      <Text style={[SharedStyles.sectionTitle, { marginBottom: 16 }]}>Trọng tài cấp QG & QT ({filtered.length})</Text>

      {filtered.map(r => {
        const isSuspended = r.status === 'suspended'
        const isInternational = r.grade === 'international'
        return (
          <View key={r.id} style={[s.card, isSuspended && { opacity: 0.5 }]}>
            <View style={s.avatar}>
              <Icon name={VCTIcons.star} size={24} color={Colors.gold} />
            </View>
            <View style={s.content}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={s.name}>{r.name}</Text>
                {isSuspended && <Icon name={VCTIcons.alert} size={16} color={Colors.red} />}
              </View>

              <View style={[s.gradeBadge, { backgroundColor: isInternational ? Colors.overlay(Colors.accent, 0.15) : Colors.overlay(Colors.gold, 0.15) }]}>
                <Text style={[s.gradeText, { color: isInternational ? Colors.accent : Colors.gold }]}>
                  {isInternational ? '🌐 Quốc tế' : '🇻🇳 Quốc gia'}
                </Text>
              </View>

              <View style={s.certRow}>
                {r.certifications.map(cert => (
                  <View key={cert} style={s.certChip}>
                    <Text style={s.certText}>{cert}</Text>
                  </View>
                ))}
              </View>

              <View style={s.infoRow}>
                <Icon name={VCTIcons.location} size={13} color={Colors.textMuted} />
                <Text style={s.infoLabel}>{r.province}</Text>
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
