// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Match Detail Screen
// Complete match result view: athlete info, round-by-round
// scoring breakdown, penalty log, and match timeline.
// ═══════════════════════════════════════════════════════════════

import React, { useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
} from 'react-native'
import { useVCTTheme } from '../../theme-provider'
import { VctCard, VctBadge } from '../../core-ui'
import { useQuery } from '../../data-hooks'
import { triggerHaptic } from '../../haptic-feedback'
import { SkeletonLoader } from '../../skeleton-loader'
import { ErrorState } from '../../error-states'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// ── Types ────────────────────────────────────────────────────

interface MatchDetailProps {
  matchId: string
  onGoBack?: () => void
  onNavigateAthlete?: (athleteId: string) => void
  onNavigateLiveScoring?: (matchId: string) => void
}

interface MatchDetailData {
  id: string
  status: 'pending' | 'in_progress' | 'completed'
  category: string
  weightClass: string
  round: string
  tournamentName: string
  scheduledTime: string
  athleteRed: AthleteInfo
  athleteBlue: AthleteInfo
  scoreRed: number
  scoreBlue: number
  winnerId?: string
  roundBreakdown: { round: number; red: number; blue: number }[]
  penalties: { corner: 'red' | 'blue'; type: string; round: number; description: string }[]
  referees: { name: string; role: string }[]
}

interface AthleteInfo {
  id: string
  name: string
  club: string
  belt?: string
  record?: string // e.g., "12W - 3L"
  age?: number
  weight?: number
}

// ── Component ────────────────────────────────────────────────

export function ScreenMatchDetail({
  matchId,
  onGoBack,
  onNavigateAthlete,
  onNavigateLiveScoring,
}: MatchDetailProps) {
  const { theme } = useVCTTheme()

  const { data: match, isLoading, error, refetch } = useQuery<MatchDetailData>(
    `/api/v1/matches/${matchId}`,
    { cacheKey: `match-detail-${matchId}`, staleTime: 30_000 }
  )

  const fadeAnim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start()
  }, [])

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.skeletons}>
          <SkeletonLoader width={SCREEN_WIDTH - 48} height={200} borderRadius={16} />
          <SkeletonLoader width={SCREEN_WIDTH - 48} height={150} borderRadius={14} />
        </View>
      </View>
    )
  }

  if (error || !match) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorState title="Không thể tải trận đấu" message="Vui lòng thử lại." onRetry={refetch} />
      </View>
    )
  }

  const isCompleted = match.status === 'completed'
  const isLive = match.status === 'in_progress'
  const winnerCorner = match.winnerId === match.athleteRed.id ? 'red' : match.winnerId === match.athleteBlue.id ? 'blue' : null

  return (
    <Animated.View style={[styles.container, { backgroundColor: theme.colors.background, opacity: fadeAnim }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onGoBack} style={styles.backBtn}>
            <Text style={[styles.backText, { color: theme.colors.text }]}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={[styles.tourName, { color: theme.colors.textSecondary }]}>{match.tournamentName}</Text>
          <Text style={[styles.matchMeta, { color: theme.colors.textSecondary }]}>
            {match.category} • {match.weightClass} • {match.round}
          </Text>
          {isLive && (
            <TouchableOpacity
              style={styles.liveBtn}
              onPress={() => { triggerHaptic('medium'); onNavigateLiveScoring?.(matchId) }}
            >
              <Text style={styles.liveBtnText}>🔴 Xem Live Scoring</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Scoreboard */}
        <VctCard style={styles.scoreCard}>
          <View style={styles.scoreRow}>
            {/* Red */}
            <TouchableOpacity style={styles.cornerInfo} onPress={() => onNavigateAthlete?.(match.athleteRed.id)}>
              <View style={[styles.cornerTag, { backgroundColor: '#EF4444' }]}>
                <Text style={styles.cornerTagText}>ĐỎ</Text>
              </View>
              <Text style={[styles.scAthlName, { color: theme.colors.text }]} numberOfLines={1}>{match.athleteRed.name}</Text>
              <Text style={[styles.scClub, { color: theme.colors.textSecondary }]}>{match.athleteRed.club}</Text>
              {match.athleteRed.record && <Text style={[styles.scRecord, { color: theme.colors.textSecondary }]}>📊 {match.athleteRed.record}</Text>}
            </TouchableOpacity>

            {/* Score Center */}
            <View style={styles.scoreCenter}>
              <View style={styles.scoreNums}>
                <Text style={[styles.bigScore, { color: winnerCorner === 'red' ? '#00E5CC' : theme.colors.text }]}>{match.scoreRed}</Text>
                <Text style={[styles.scoreDash, { color: theme.colors.textSecondary }]}>–</Text>
                <Text style={[styles.bigScore, { color: winnerCorner === 'blue' ? '#00E5CC' : theme.colors.text }]}>{match.scoreBlue}</Text>
              </View>
              <VctBadge
                label={isCompleted ? '✅ Kết thúc' : isLive ? '🔴 Live' : '⏳ Chờ'}
                variant={isCompleted ? 'success' : isLive ? 'error' : 'info'}
              />
              {isCompleted && winnerCorner && (
                <Text style={[styles.winnerText, { color: '#00E5CC' }]}>
                  🏆 {winnerCorner === 'red' ? match.athleteRed.name : match.athleteBlue.name}
                </Text>
              )}
            </View>

            {/* Blue */}
            <TouchableOpacity style={styles.cornerInfo} onPress={() => onNavigateAthlete?.(match.athleteBlue.id)}>
              <View style={[styles.cornerTag, { backgroundColor: '#3B82F6' }]}>
                <Text style={styles.cornerTagText}>XANH</Text>
              </View>
              <Text style={[styles.scAthlName, { color: theme.colors.text }]} numberOfLines={1}>{match.athleteBlue.name}</Text>
              <Text style={[styles.scClub, { color: theme.colors.textSecondary }]}>{match.athleteBlue.club}</Text>
              {match.athleteBlue.record && <Text style={[styles.scRecord, { color: theme.colors.textSecondary }]}>📊 {match.athleteBlue.record}</Text>}
            </TouchableOpacity>
          </View>
        </VctCard>

        {/* Round Breakdown */}
        {match.roundBreakdown.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Chi tiết từng hiệp</Text>
            <VctCard style={styles.breakdownCard}>
              <View style={styles.breakdownHeader}>
                <Text style={[styles.bkCol, { color: '#EF4444', fontWeight: '700' }]}>Đỏ</Text>
                <Text style={[styles.bkCol, { color: theme.colors.textSecondary }]}>Hiệp</Text>
                <Text style={[styles.bkCol, { color: '#3B82F6', fontWeight: '700' }]}>Xanh</Text>
              </View>
              {match.roundBreakdown.map((r) => (
                <View key={r.round} style={[styles.breakdownRow, { borderTopColor: theme.colors.border }]}>
                  <Text style={[styles.bkScore, { color: r.red > r.blue ? '#00E5CC' : theme.colors.text }]}>{r.red}</Text>
                  <Text style={[styles.bkRound, { color: theme.colors.textSecondary }]}>{r.round}</Text>
                  <Text style={[styles.bkScore, { color: r.blue > r.red ? '#00E5CC' : theme.colors.text }]}>{r.blue}</Text>
                </View>
              ))}
            </VctCard>
          </View>
        )}

        {/* Penalties */}
        {match.penalties.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Hình phạt</Text>
            {match.penalties.map((p, i) => (
              <VctCard key={i} style={styles.penaltyCard}>
                <View style={styles.penaltyRow}>
                  <View style={[styles.penaltyDot, { backgroundColor: p.corner === 'red' ? '#EF4444' : '#3B82F6' }]} />
                  <View style={styles.penaltyInfo}>
                    <Text style={[styles.penaltyType, { color: theme.colors.text }]}>⚠️ {p.type}</Text>
                    <Text style={[styles.penaltyDesc, { color: theme.colors.textSecondary }]}>
                      Hiệp {p.round} — {p.description}
                    </Text>
                  </View>
                </View>
              </VctCard>
            ))}
          </View>
        )}

        {/* Referees */}
        {match.referees.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Tổ trọng tài</Text>
            <VctCard>
              {match.referees.map((ref, i) => (
                <View key={i} style={[styles.refRow, i > 0 && { borderTopColor: theme.colors.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
                  <Text style={[styles.refName, { color: theme.colors.text }]}>⚖️ {ref.name}</Text>
                  <Text style={[styles.refRole, { color: theme.colors.textSecondary }]}>{ref.role}</Text>
                </View>
              ))}
            </VctCard>
          </View>
        )}

        {/* Schedule */}
        <View style={styles.section}>
          <Text style={[styles.timeLabel, { color: theme.colors.textSecondary }]}>
            🕐 {match.scheduledTime}
          </Text>
        </View>
      </ScrollView>
    </Animated.View>
  )
}

// ── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  skeletons: { gap: 16, alignItems: 'center', paddingTop: 100 },
  header: { paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 56 : 40, paddingBottom: 8 },
  backBtn: { paddingVertical: 8 },
  backText: { fontSize: 15, fontWeight: '600' },
  tourName: { fontSize: 13, marginTop: 4 },
  matchMeta: { fontSize: 14, marginTop: 2 },
  liveBtn: { marginTop: 10, backgroundColor: '#EF4444', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, alignSelf: 'flex-start' },
  liveBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  scoreCard: { marginHorizontal: 24, marginTop: 16, padding: 20 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cornerInfo: { flex: 1, alignItems: 'center' },
  cornerTag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, marginBottom: 8 },
  cornerTagText: { color: '#FFF', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  scAthlName: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  scClub: { fontSize: 11, marginTop: 2 },
  scRecord: { fontSize: 11, marginTop: 4 },
  scoreCenter: { width: 100, alignItems: 'center' },
  scoreNums: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bigScore: { fontSize: 36, fontWeight: '900', fontVariant: ['tabular-nums'] },
  scoreDash: { fontSize: 24 },
  winnerText: { fontSize: 12, fontWeight: '700', marginTop: 6, textAlign: 'center' },
  section: { paddingHorizontal: 24, marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  breakdownCard: { padding: 0, overflow: 'hidden' },
  breakdownHeader: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 16 },
  bkCol: { flex: 1, textAlign: 'center', fontSize: 13 },
  breakdownRow: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 16, borderTopWidth: StyleSheet.hairlineWidth },
  bkScore: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'] },
  bkRound: { flex: 1, textAlign: 'center', fontSize: 14 },
  penaltyCard: { marginBottom: 8, padding: 12 },
  penaltyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  penaltyDot: { width: 10, height: 10, borderRadius: 5 },
  penaltyInfo: { flex: 1 },
  penaltyType: { fontSize: 14, fontWeight: '600' },
  penaltyDesc: { fontSize: 12, marginTop: 2 },
  refRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 14 },
  refName: { fontSize: 14, fontWeight: '600' },
  refRole: { fontSize: 13 },
  timeLabel: { fontSize: 14, textAlign: 'center', marginTop: 8 },
})
