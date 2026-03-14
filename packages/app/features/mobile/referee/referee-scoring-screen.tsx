import * as React from 'react'
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native'
import { Colors, FontWeight, Radius, Space, SharedStyles } from '../mobile-theme'
import { Icon, VCTIcons } from '../icons'
import { hapticLight, hapticSelection, hapticWarning } from '../haptics'
import { useRefereeAssignments } from './useRefereeData'

const s = StyleSheet.create({
  header: { padding: Space.xl, paddingBottom: Space.lg, alignItems: 'center' },
  matchTitle: { fontSize: 16, fontWeight: FontWeight.black, color: Colors.textWhite, marginBottom: 4 },
  matchSub: { fontSize: 13, color: Colors.textSecondary },
  
  scoringBoard: { flex: 1, flexDirection: 'row', paddingHorizontal: Space.sm },
  athletePane: { flex: 1, marginHorizontal: Space.sm, borderRadius: Radius.lg, overflow: 'hidden' },
  paneHeader: { padding: Space.md, alignItems: 'center' },
  paneRed: { backgroundColor: Colors.overlay('#ef4444', 0.1), borderWidth: 2, borderColor: Colors.overlay('#ef4444', 0.3) },
  paneBlue: { backgroundColor: Colors.overlay('#3b82f6', 0.1), borderWidth: 2, borderColor: Colors.overlay('#3b82f6', 0.3) },
  athleteName: { fontSize: 14, fontWeight: FontWeight.bold, color: Colors.textWhite, textAlign: 'center', minHeight: 40 },
  scoreDisplay: { fontSize: 64, fontWeight: FontWeight.black, textAlign: 'center', marginVertical: Space.lg },
  
  actionBtn: {
    paddingVertical: Space.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginBottom: Space.md,
    marginHorizontal: Space.md,
  },
  actionRedBtn: { backgroundColor: '#ef4444' },
  actionBlueBtn: { backgroundColor: '#3b82f6' },
  actionBtnText: { fontSize: 24, fontWeight: FontWeight.black, color: '#FFF' },
  
  penaltyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: Radius.md, marginHorizontal: Space.md,
    backgroundColor: Colors.bgDark, borderWidth: 1, borderColor: Colors.border,
  },
  penaltyText: { fontSize: 12, fontWeight: FontWeight.bold, color: Colors.textSecondary },
  
  submitBtn: {
    margin: Space.xl, paddingVertical: 18, borderRadius: Radius.pill,
    backgroundColor: Colors.accent, alignItems: 'center',
    shadowColor: Colors.accent, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  submitText: { fontSize: 16, fontWeight: FontWeight.black, color: '#fff' },
})

export function RefereeScoringMobileScreen() {
  const { assignments } = useRefereeAssignments()
  const activeMatch = assignments.find(a => a.status === 'pending')

  const [scoreRed, setScoreRed] = React.useState(0)
  const [scoreBlue, setScoreBlue] = React.useState(0)

  const handleScore = (color: 'red' | 'blue', points: number) => {
    hapticSelection()
    if (color === 'red') setScoreRed(v => Math.max(0, v + points))
    else setScoreBlue(v => Math.max(0, v + points))
  }

  const handlePenalty = (color: 'red' | 'blue') => {
    hapticWarning()
    // Penalty logic usually deducts a point or gives opponent points depending on rule
    if (color === 'red') setScoreBlue(v => v + 1)
    else setScoreRed(v => v + 1)
  }

  if (!activeMatch) {
    return (
      <View style={[SharedStyles.page, { justifyContent: 'center', alignItems: 'center' }]}>
        <Icon name={VCTIcons.checkmark} size={48} color={Colors.green} />
        <Text style={{ fontSize: 18, fontWeight: FontWeight.bold, color: Colors.textWhite, marginTop: 16 }}>Đã hoàn thành</Text>
        <Text style={{ fontSize: 14, color: Colors.textSecondary, marginTop: 8 }}>Không có trận đấu nào đang diễn ra.</Text>
      </View>
    )
  }

  return (
    <ScrollView style={SharedStyles.page} contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}>
      <View style={s.header}>
        <Text style={s.matchTitle}>{activeMatch.category} • {activeMatch.arena}</Text>
        <Text style={s.matchSub}>Trận {activeMatch.matchNo} — {activeMatch.role}</Text>
      </View>

      <View style={s.scoringBoard}>
        {/* ĐỎ */}
        <View style={[s.athletePane, s.paneRed]}>
          <View style={[s.paneHeader, { backgroundColor: '#ef4444' }]}>
            <Text style={s.athleteName} numberOfLines={2}>{activeMatch.redAthlete || 'ĐỎ'}</Text>
          </View>
          <Text style={[s.scoreDisplay, { color: '#ef4444' }]}>{scoreRed}</Text>
          <Pressable style={[s.actionBtn, s.actionRedBtn]} onPress={() => handleScore('red', 1)}>
            <Text style={s.actionBtnText}>+1</Text>
          </Pressable>
          <Pressable style={[s.actionBtn, s.actionRedBtn]} onPress={() => handleScore('red', 2)}>
            <Text style={s.actionBtnText}>+2</Text>
          </Pressable>
          <Pressable style={s.penaltyBtn} onPress={() => handlePenalty('red')}>
            <Icon name={VCTIcons.alert} size={14} color={Colors.textSecondary} />
            <Text style={s.penaltyText}>Phạt Đỏ</Text>
          </Pressable>
        </View>

        {/* XANH */}
        <View style={[s.athletePane, s.paneBlue]}>
          <View style={[s.paneHeader, { backgroundColor: '#3b82f6' }]}>
            <Text style={s.athleteName} numberOfLines={2}>{activeMatch.blueAthlete || 'XANH'}</Text>
          </View>
          <Text style={[s.scoreDisplay, { color: '#3b82f6' }]}>{scoreBlue}</Text>
          <Pressable style={[s.actionBtn, s.actionBlueBtn]} onPress={() => handleScore('blue', 1)}>
            <Text style={s.actionBtnText}>+1</Text>
          </Pressable>
          <Pressable style={[s.actionBtn, s.actionBlueBtn]} onPress={() => handleScore('blue', 2)}>
            <Text style={s.actionBtnText}>+2</Text>
          </Pressable>
          <Pressable style={s.penaltyBtn} onPress={() => handlePenalty('blue')}>
            <Icon name={VCTIcons.alert} size={14} color={Colors.textSecondary} />
            <Text style={s.penaltyText}>Phạt Xanh</Text>
          </Pressable>
        </View>
      </View>

      <Pressable style={s.submitBtn} onPress={() => hapticSelection()} accessibilityRole="button">
        <Text style={s.submitText}>Gửi kết quả</Text>
      </Pressable>
    </ScrollView>
  )
}
