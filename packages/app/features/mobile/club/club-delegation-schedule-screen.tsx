import * as React from 'react'
import { StyleSheet, Text, View, RefreshControl, ScrollView, Pressable } from 'react-native'
import { Colors, FontWeight, Radius, Space, SharedStyles } from '../mobile-theme'
import { Icon, VCTIcons } from '../icons'
import { hapticLight } from '../haptics'
import { useDelegationSchedule } from './useClubData'

// ═══════════════════════════════════════════════════════════════
// DELEGATION SCHEDULE SCREEN
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Space.sm },
  timeText: { fontSize: 13, color: Colors.textSecondary, fontWeight: FontWeight.bold },
  arenaText: { fontSize: 13, color: Colors.textMuted },
  categoryText: { fontSize: 14, fontWeight: FontWeight.black, color: Colors.textWhite, marginBottom: Space.md },
  
  versusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  athleteBox: { flex: 1 },
  athleteName: { fontSize: 15, fontWeight: FontWeight.bold, color: Colors.textWhite },
  vsCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.bgBase, justifyContent: 'center', alignItems: 'center', marginHorizontal: Space.sm },
  vsText: { fontSize: 12, fontWeight: FontWeight.black, color: Colors.textMuted },
  
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
    marginTop: Space.md,
  },
  badgeUpcoming: { backgroundColor: Colors.overlay(Colors.gold, 0.15) },
  badgeOngoing: { backgroundColor: Colors.overlay(Colors.accent, 0.15) },
  badgeCompleted: { backgroundColor: Colors.overlay(Colors.green, 0.15) },
  textUpcoming: { color: Colors.gold, fontSize: 12, fontWeight: FontWeight.bold },
  textOngoing: { color: Colors.accent, fontSize: 12, fontWeight: FontWeight.bold },
  textCompleted: { color: Colors.green, fontSize: 12, fontWeight: FontWeight.bold },
})

export function ClubDelegationScheduleMobileScreen() {
  const { schedule, isLoading } = useDelegationSchedule()
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
      <Text style={[SharedStyles.sectionTitle, { marginBottom: 16 }]}>Lịch thi đấu đoàn ({schedule.length})</Text>

      {schedule.map(match => {
        let badgeStyle = s.badgeUpcoming
        let textStyle = s.textUpcoming
        let statusLabel = 'Chưa diễn ra'
        if (match.status === 'ongoing') {
          badgeStyle = s.badgeOngoing; textStyle = s.textOngoing; statusLabel = 'Đang thi đấu'
        } else if (match.status === 'completed') {
          badgeStyle = s.badgeCompleted; textStyle = s.textCompleted; statusLabel = `Đã xong (${match.result === 'win' ? 'Thắng' : 'Thua'} ${match.score})`
        }

        return (
          <View key={match.id} style={s.card}>
            <View style={s.headerRow}>
              <Text style={s.timeText}>{match.time}</Text>
              <Text style={s.arenaText}>{match.arena}</Text>
            </View>
            <Text style={s.categoryText}>{match.category}</Text>

            <View style={s.versusRow}>
              <View style={[s.athleteBox, { alignItems: 'flex-start' }]}>
                <Text style={s.athleteName}>{match.athleteName}</Text>
                <View style={{ width: 12, height: 4, backgroundColor: '#ef4444', borderRadius: 2, marginTop: 4 }} />
              </View>
              {match.opponentName ? (
                <>
                  <View style={s.vsCircle}>
                    <Text style={s.vsText}>VS</Text>
                  </View>
                  <View style={[s.athleteBox, { alignItems: 'flex-end' }]}>
                    <Text style={[s.athleteName, { textAlign: 'right' }]}>{match.opponentName}</Text>
                    <View style={{ width: 12, height: 4, backgroundColor: '#3b82f6', borderRadius: 2, marginTop: 4 }} />
                  </View>
                </>
              ) : (
                <View style={s.athleteBox} /> // Placeholder for forms (quyền thuật)
              )}
            </View>
            
            <View style={[s.statusBadge, badgeStyle]}>
              <Text style={textStyle}>{statusLabel}</Text>
            </View>
          </View>
        )
      })}
    </ScrollView>
  )
}
