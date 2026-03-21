// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Live Scoring Screen
// Real-time match scoring interface for referees and spectators.
// Shows live scores, timer, penalty tracking, and round results.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Platform,
  Dimensions,
} from 'react-native'
import { useVCTTheme } from '../../theme-provider'
import { VctButton, VctBadge } from '../../core-ui'
import { useQuery } from '../../data-hooks'
import { triggerHaptic } from '../../haptic-feedback'
import { ErrorState } from '../../error-states'
import { SkeletonLoader } from '../../skeleton-loader'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// ── Types ────────────────────────────────────────────────────

interface LiveScoringProps {
  matchId: string
  isReferee?: boolean
  onGoBack?: () => void
}

interface MatchLiveData {
  id: string
  status: 'waiting' | 'round_active' | 'round_break' | 'completed'
  currentRound: number
  totalRounds: number
  athleteRed: { id: string; name: string; club: string }
  athleteBlue: { id: string; name: string; club: string }
  scoreRed: number
  scoreBlue: number
  roundScores: { round: number; red: number; blue: number }[]
  penalties: { athlete: 'red' | 'blue'; type: string; round: number }[]
  timer: number // seconds remaining
  category: string
  weightClass: string
}

// ── Component ────────────────────────────────────────────────

export function ScreenLiveScoring({ matchId, isReferee = false, onGoBack }: LiveScoringProps) {
  const { theme } = useVCTTheme()

  const { data: match, isLoading, error, refetch } = useQuery<MatchLiveData>(
    `/api/v1/matches/${matchId}/live`,
    { cacheKey: `match-live-${matchId}`, staleTime: 3_000 } // Refresh every 3s
  )

  const [localScoreRed, setLocalScoreRed] = useState(0)
  const [localScoreBlue, setLocalScoreBlue] = useState(0)
  const pulseAnim = useRef(new Animated.Value(1)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start()
  }, [])

  // Sync data -> local score
  useEffect(() => {
    if (match) {
      setLocalScoreRed(match.scoreRed)
      setLocalScoreBlue(match.scoreBlue)
    }
  }, [match])

  // Pulse animation for live indicator
  useEffect(() => {
    if (match?.status === 'round_active') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      )
      loop.start()
      return () => loop.stop()
    }
  }, [match?.status, pulseAnim])

  // ── Referee Score Actions ────────────────────────────────

  const addScore = useCallback((corner: 'red' | 'blue', points: number) => {
    triggerHaptic('medium')
    if (corner === 'red') setLocalScoreRed((s) => s + points)
    else setLocalScoreBlue((s) => s + points)

    // In production, this would POST to the backend via WebSocket
    // websocketClient.send({ type: 'score', matchId, corner, points })
  }, [])

  const addPenalty = useCallback((corner: 'red' | 'blue') => {
    triggerHaptic('warning')
    Alert.alert(
      `Phạt góc ${corner === 'red' ? 'Đỏ' : 'Xanh'}`,
      'Chọn loại lỗi:',
      [
        { text: 'Nhắc nhở', onPress: () => {} },
        { text: 'Trừ điểm (-1)', onPress: () => addScore(corner, -1) },
        { text: 'Hủy', style: 'cancel' },
      ]
    )
  }, [addScore])

  // ── Format Timer ─────────────────────────────────────────

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // ── Loading / Error ──────────────────────────────────────

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: '#0A0E14' }]}>
        <SkeletonLoader width={SCREEN_WIDTH - 48} height={300} borderRadius={20} />
      </View>
    )
  }

  if (error || !match) {
    return (
      <View style={[styles.container, { backgroundColor: '#0A0E14' }]}>
        <ErrorState title="Không thể tải trận đấu" message="Vui lòng thử lại." onRetry={refetch} />
      </View>
    )
  }

  const isLive = match.status === 'round_active'

  // ── Render ───────────────────────────────────────────────

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Back + Category */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onGoBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Quay lại</Text>
        </TouchableOpacity>
        <View style={styles.topInfo}>
          <Text style={styles.categoryText}>{match.category} • {match.weightClass}</Text>
        </View>
      </View>

      {/* Live Indicator */}
      <View style={styles.liveRow}>
        {isLive && (
          <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
        )}
        <Text style={styles.statusText}>
          {match.status === 'waiting' ? 'Chờ thi' : isLive ? 'TRỰC TIẾP' : match.status === 'round_break' ? 'Nghỉ hiệp' : 'Kết thúc'}
        </Text>
        <Text style={styles.roundText}>
          Hiệp {match.currentRound}/{match.totalRounds}
        </Text>
      </View>

      {/* Timer */}
      <Text style={styles.timerText}>{formatTimer(match.timer)}</Text>

      {/* Scoreboard */}
      <View style={styles.scoreboard}>
        {/* Red Corner */}
        <View style={styles.cornerSection}>
          <View style={[styles.cornerBadge, { backgroundColor: '#EF4444' }]}>
            <Text style={styles.cornerLabel}>ĐỎ</Text>
          </View>
          <Text style={styles.athleteName} numberOfLines={1}>{match.athleteRed.name}</Text>
          <Text style={styles.clubName}>{match.athleteRed.club}</Text>
          <Text style={[styles.scoreText, { color: '#EF4444' }]}>{localScoreRed}</Text>
        </View>

        {/* VS */}
        <View style={styles.vsSection}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        {/* Blue Corner */}
        <View style={styles.cornerSection}>
          <View style={[styles.cornerBadge, { backgroundColor: '#3B82F6' }]}>
            <Text style={styles.cornerLabel}>XANH</Text>
          </View>
          <Text style={styles.athleteName} numberOfLines={1}>{match.athleteBlue.name}</Text>
          <Text style={styles.clubName}>{match.athleteBlue.club}</Text>
          <Text style={[styles.scoreText, { color: '#3B82F6' }]}>{localScoreBlue}</Text>
        </View>
      </View>

      {/* Referee Controls */}
      {isReferee && isLive && (
        <View style={styles.refControls}>
          <View style={styles.refColumn}>
            <TouchableOpacity style={[styles.scoreBtn, { backgroundColor: '#EF4444' }]} onPress={() => addScore('red', 1)}>
              <Text style={styles.scoreBtnText}>+1</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.scoreBtn, { backgroundColor: '#EF4444' }]} onPress={() => addScore('red', 2)}>
              <Text style={styles.scoreBtnText}>+2</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.penaltyBtn, { borderColor: '#EF4444' }]} onPress={() => addPenalty('red')}>
              <Text style={[styles.penaltyBtnText, { color: '#EF4444' }]}>⚠ Phạt</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.refColumn}>
            <TouchableOpacity style={[styles.scoreBtn, { backgroundColor: '#3B82F6' }]} onPress={() => addScore('blue', 1)}>
              <Text style={styles.scoreBtnText}>+1</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.scoreBtn, { backgroundColor: '#3B82F6' }]} onPress={() => addScore('blue', 2)}>
              <Text style={styles.scoreBtnText}>+2</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.penaltyBtn, { borderColor: '#3B82F6' }]} onPress={() => addPenalty('blue')}>
              <Text style={[styles.penaltyBtnText, { color: '#3B82F6' }]}>⚠ Phạt</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Round History */}
      {match.roundScores.length > 0 && (
        <View style={styles.roundHistory}>
          <Text style={styles.historyTitle}>Lịch sử hiệp</Text>
          {match.roundScores.map((r) => (
            <View key={r.round} style={styles.roundRow}>
              <Text style={[styles.roundScore, { color: '#EF4444' }]}>{r.red}</Text>
              <Text style={styles.roundLabel}>Hiệp {r.round}</Text>
              <Text style={[styles.roundScore, { color: '#3B82F6' }]}>{r.blue}</Text>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  )
}

// ── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E14' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 56 : 40 },
  backBtn: { paddingVertical: 8 },
  backText: { color: '#94A3B8', fontSize: 15, fontWeight: '600' },
  topInfo: {},
  categoryText: { color: '#64748B', fontSize: 13 },
  liveRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 16 },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444' },
  statusText: { color: '#F0F4F8', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
  roundText: { color: '#64748B', fontSize: 14 },
  timerText: { color: '#00E5CC', fontSize: 56, fontWeight: '900', textAlign: 'center', marginTop: 12, fontVariant: ['tabular-nums'] },
  scoreboard: { flexDirection: 'row', paddingHorizontal: 24, marginTop: 28, alignItems: 'center' },
  cornerSection: { flex: 1, alignItems: 'center' },
  cornerBadge: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  cornerLabel: { color: '#FFF', fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  athleteName: { color: '#F0F4F8', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  clubName: { color: '#64748B', fontSize: 12, marginTop: 2 },
  scoreText: { fontSize: 48, fontWeight: '900', marginTop: 12, fontVariant: ['tabular-nums'] },
  vsSection: { width: 50, alignItems: 'center' },
  vsText: { color: '#334155', fontSize: 18, fontWeight: '800' },
  refControls: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 40, marginTop: 28, gap: 40 },
  refColumn: { alignItems: 'center', gap: 10 },
  scoreBtn: { width: 64, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  scoreBtnText: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  penaltyBtn: { width: 80, height: 36, borderRadius: 8, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  penaltyBtnText: { fontSize: 13, fontWeight: '700' },
  roundHistory: { paddingHorizontal: 24, marginTop: 28 },
  historyTitle: { color: '#64748B', fontSize: 14, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  roundRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 24, paddingVertical: 6 },
  roundScore: { fontSize: 18, fontWeight: '800', width: 40, textAlign: 'center', fontVariant: ['tabular-nums'] },
  roundLabel: { color: '#475569', fontSize: 13, fontWeight: '600' },
})
