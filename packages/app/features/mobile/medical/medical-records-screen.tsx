import * as React from 'react'
import { StyleSheet, Text, View, RefreshControl, ScrollView } from 'react-native'
import { Colors, FontWeight, Radius, Space, SharedStyles } from '../mobile-theme'
import { Icon, VCTIcons } from '../icons'
import { SearchBar } from '../mobile-ui'
import { hapticLight } from '../haptics'
import { useMedicalRecords } from './useMedicalData'

const s = StyleSheet.create({
  card: { padding: Space.lg, borderRadius: Radius.lg, backgroundColor: Colors.bgCard, marginBottom: Space.md, flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: Space.md },
  infoBox: { flex: 1 },
  nameLine: { fontSize: 16, fontWeight: FontWeight.black, color: Colors.textWhite, marginBottom: 2 },
  subLine: { fontSize: 13, color: Colors.textSecondary },
  statusText: { fontSize: 11, fontWeight: FontWeight.bold, marginTop: 4 },
})

export function MedicalRecordsMobileScreen() {
  const { records, isLoading } = useMedicalRecords()
  const [search, setSearch] = React.useState('')
  const [refreshing, setRefreshing] = React.useState(false)

  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
    hapticLight()
  }, [])

  const filtered = records.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.team.toLowerCase().includes(search.toLowerCase()))

  if (isLoading && !refreshing) return <View style={SharedStyles.page} />

  return (
    <ScrollView 
      style={SharedStyles.page} 
      contentContainerStyle={{ padding: Space.xl, paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
    >
      <View style={{ marginBottom: Space.xl }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Tìm vận động viên, đoàn..." />
      </View>

      <Text style={[SharedStyles.sectionTitle, { marginBottom: 16 }]}>Hồ sơ xếp hạng ({filtered.length})</Text>

      {filtered.map(rec => {
        const isGreen = rec.status === 'green'
        const color = isGreen ? Colors.green : Colors.red
        const icon = isGreen ? VCTIcons.checkmark : VCTIcons.close
        
        return (
          <View key={rec.id} style={s.card}>
            <View style={[s.iconBox, { backgroundColor: Colors.overlay(color, 0.15) }]}>
              <Icon name={icon} size={24} color={color} />
            </View>
            <View style={s.infoBox}>
              <Text style={s.nameLine}>{rec.name}</Text>
              <Text style={s.subLine}>{rec.team} • {rec.category}</Text>
              <Text style={[s.statusText, { color }]}>Cập nhật: {rec.lastCheck}</Text>
            </View>
          </View>
        )
      })}
    </ScrollView>
  )
}
