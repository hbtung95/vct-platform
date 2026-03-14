import * as React from 'react'
import { StyleSheet, Text, View, RefreshControl, ScrollView } from 'react-native'
import { Colors, FontWeight, Radius, Space, SharedStyles, Touch } from '../mobile-theme'
import { Icon, VCTIcons } from '../icons'
import { hapticLight } from '../haptics'
import { useRefereeAssignments } from './useRefereeData'

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Space.lg,
    marginBottom: Space.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardActive: {
    borderColor: Colors.accent,
    borderLeftWidth: 4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeText: { fontSize: 13, fontWeight: FontWeight.bold, color: Colors.textSecondary },
  matchText: { fontSize: 13, fontWeight: FontWeight.bold, color: Colors.textMuted },
  categoryText: { fontSize: 16, fontWeight: FontWeight.black, color: Colors.textPrimary, marginBottom: 4 },
  roleBagde: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.overlay(Colors.accent, 0.1),
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    marginBottom: 12,
  },
  roleText: { fontSize: 11, fontWeight: FontWeight.bold, color: Colors.accent },
  versusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.bgDark, padding: Space.md, borderRadius: Radius.md },
  athleteBox: { flex: 1 },
  athleteTextReady: { fontSize: 13, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  vsCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.border, justifyContent: 'center', alignItems: 'center', marginHorizontal: 8 },
  vsText: { fontSize: 10, fontWeight: FontWeight.black, color: Colors.textMuted },
})

export function RefereeScheduleMobileScreen() {
  const { assignments, isLoading } = useRefereeAssignments()
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
      <Text style={[SharedStyles.sectionTitle, { marginBottom: 16 }]}>Hôm nay</Text>
      
      {assignments.map((asg) => {
        const isActive = asg.status === 'pending'
        return (
          <View key={asg.id} style={[s.card, isActive && s.cardActive]}>
            <View style={s.timeRow}>
              <Text style={[s.timeText, isActive && { color: Colors.accent }]}>{asg.time} • {asg.arena}</Text>
              <Text style={s.matchText}>Trận {asg.matchNo}</Text>
            </View>
            <Text style={s.categoryText}>{asg.category}</Text>
            <View style={s.roleBagde}>
              <Text style={s.roleText}>{asg.role}</Text>
            </View>
            
            <View style={s.versusRow}>
              <View style={[s.athleteBox, { alignItems: 'flex-start' }]}>
                <Text style={s.athleteTextReady}>{asg.redAthlete || '---'}</Text>
                <View style={{ width: 12, height: 4, backgroundColor: '#ef4444', borderRadius: 2, marginTop: 4 }} />
              </View>
              <View style={s.vsCircle}>
                <Text style={s.vsText}>VS</Text>
              </View>
              <View style={[s.athleteBox, { alignItems: 'flex-end' }]}>
                <Text style={[s.athleteTextReady, { textAlign: 'right' }]}>{asg.blueAthlete || '---'}</Text>
                <View style={{ width: 12, height: 4, backgroundColor: '#3b82f6', borderRadius: 2, marginTop: 4 }} />
              </View>
            </View>
          </View>
        )
      })}
    </ScrollView>
  )
}
