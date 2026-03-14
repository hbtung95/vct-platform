import * as React from 'react'
import { StyleSheet, Text, View, RefreshControl, ScrollView } from 'react-native'
import { Colors, FontWeight, Radius, Space, SharedStyles } from '../mobile-theme'
import { Icon, VCTIcons } from '../icons'
import { hapticLight } from '../haptics'
import { useMedicalIncidents } from './useMedicalData'

const s = StyleSheet.create({
  card: { padding: Space.lg, borderRadius: Radius.lg, backgroundColor: Colors.bgCard, marginBottom: Space.md, borderWidth: 1, borderColor: Colors.border },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Space.sm },
  timeText: { fontSize: 13, color: Colors.textSecondary, fontWeight: FontWeight.bold },
  arenaText: { fontSize: 13, color: Colors.textMuted },
  
  athleteName: { fontSize: 16, fontWeight: FontWeight.black, color: Colors.textWhite, marginBottom: 4 },
  athleteSub: { fontSize: 13, color: Colors.textSecondary, marginBottom: Space.md },
  
  descBox: { backgroundColor: Colors.bgDark, padding: Space.md, borderRadius: Radius.md, marginBottom: Space.md },
  descText: { fontSize: 14, color: Colors.textWhite, lineHeight: 20 },
  
  actionText: { fontSize: 13, color: Colors.accent, fontWeight: FontWeight.bold, marginTop: Space.sm },
  
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill },
  statusCleared: { backgroundColor: Colors.overlay(Colors.green, 0.15) },
  statusWithdrawn: { backgroundColor: Colors.overlay(Colors.red, 0.15) },
  statusTextCleared: { color: Colors.green, fontSize: 12, fontWeight: FontWeight.bold },
  statusTextWithdrawn: { color: Colors.red, fontSize: 12, fontWeight: FontWeight.bold },
})

export function MedicalIncidentsMobileScreen() {
  const { incidents, isLoading } = useMedicalIncidents()
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
      <Text style={[SharedStyles.sectionTitle, { marginBottom: 16 }]}>Lịch sử sự cố</Text>

      {incidents.map(inc => {
        const isCleared = inc.status === 'cleared'
        return (
          <View key={inc.id} style={s.card}>
            <View style={s.headerRow}>
              <Text style={s.timeText}>{inc.time}</Text>
              <Text style={s.arenaText}>{inc.arena}</Text>
            </View>
            
            <Text style={s.athleteName}>{inc.athleteName}</Text>
            <Text style={s.athleteSub}>{inc.teamName}</Text>
            
            <View style={s.descBox}>
              <Text style={s.descText}>{inc.description}</Text>
              <Text style={s.actionText}>Xử lý: {inc.action}</Text>
            </View>
            
            <View style={[s.statusBadge, isCleared ? s.statusCleared : s.statusWithdrawn]}>
              <Text style={isCleared ? s.statusTextCleared : s.statusTextWithdrawn}>
                {isCleared ? 'Đã sơ cứu / Có thể tiếp tục' : 'Chấn thương / Rút lui'}
              </Text>
            </View>
          </View>
        )
      })}
    </ScrollView>
  )
}
