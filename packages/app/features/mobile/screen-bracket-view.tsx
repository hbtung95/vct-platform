// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Bracket View Screen
// Single-elimination tournament bracket visualization.
// Supports scrolling through rounds with match cards.
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
import { useVCTTheme } from './theme-provider'
import { VctCard, VctBadge } from './core-ui'
import { useQuery } from './data-hooks'
import { triggerHaptic } from './haptic-feedback'
import { SkeletonLoader } from './skeleton-loader'
import { ErrorState } from './error-states'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// ── Types ────────────────────────────────────────────────────

interface BracketViewProps {
  tournamentId: string
  categoryId?: string
  onGoBack?: () => void
  onNavigateMatch?: (matchId: string) => void
}

interface BracketMatch {
  id: string
  roundIndex: number
  position: number
  athleteRed?: { id: string; name: string; club: string }
  athleteBlue?: { id: string; name: string; club: string }
  scoreRed?: number
  scoreBlue?: number
  winnerId?: string
  status: 'pending' | 'in_progress' | 'completed'
  scheduledTime?: string
}

interface BracketData {
  tournamentId: string
  categoryName: string
  totalRounds: number
  matches: BracketMatch[]
}

// ── Helpers ──────────────────────────────────────────────────

const ROUND_LABELS = ['Vòng loại', 'Tứ kết', 'Bán kết', 'Chung kết']

function getRoundLabel(roundIndex: number, totalRounds: number): string {
  const fromEnd = totalRounds - 1 - roundIndex
  if (fromEnd < ROUND_LABELS.length) return ROUND_LABELS[ROUND_LABELS.length - 1 - fromEnd]
  return `Vòng ${roundIndex + 1}`
}

// ── Component ────────────────────────────────────────────────

export function ScreenBracketView({
  tournamentId,
  categoryId,
  onGoBack,
  onNavigateMatch,
}: BracketViewProps) {
  const { theme } = useVCTTheme()

  const url = categoryId
    ? `/api/v1/tournaments/${tournamentId}/brackets?category=${categoryId}`
    : `/api/v1/tournaments/${tournamentId}/brackets`

  const { data: bracket, isLoading, error, refetch } = useQuery<BracketData>(url, {
    cacheKey: `bracket-${tournamentId}-${categoryId ?? 'all'}`,
    staleTime: 60_000,
  })

  const fadeAnim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start()
  }, [])

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.skeletons}>
          <SkeletonLoader width={SCREEN_WIDTH - 48} height={40} borderRadius={8} />
          <SkeletonLoader width={SCREEN_WIDTH - 48} height={300} borderRadius={14} />
        </View>
      </View>
    )
  }

  if (error || !bracket) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorState title="Không thể tải nhánh đấu" message="Vui lòng thử lại." onRetry={refetch} />
      </View>
    )
  }

  // Group matches by round
  const rounds: BracketMatch[][] = []
  for (let r = 0; r < bracket.totalRounds; r++) {
    rounds.push(bracket.matches.filter((m) => m.roundIndex === r).sort((a, b) => a.position - b.position))
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor: theme.colors.background, opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.colors.text }]}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Nhánh đấu</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>{bracket.categoryName}</Text>
      </View>

      {/* Horizontal Bracket Scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bracketScroll}>
        {rounds.map((roundMatches, roundIndex) => (
          <View key={roundIndex} style={styles.roundColumn}>
            <View style={[styles.roundHeader, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.roundTitle, { color: theme.colors.text }]}>
                {getRoundLabel(roundIndex, bracket.totalRounds)}
              </Text>
              <Text style={[styles.roundCount, { color: theme.colors.textSecondary }]}>
                {roundMatches.length} trận
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.matchColumn}>
              {roundMatches.map((match) => (
                <TouchableOpacity
                  key={match.id}
                  onPress={() => { triggerHaptic('light'); onNavigateMatch?.(match.id) }}
                  activeOpacity={0.7}
                >
                  <VctCard style={styles.matchCard}>
                    {/* Status */}
                    <VctBadge
                      label={match.status === 'completed' ? 'Xong' : match.status === 'in_progress' ? '🔴 Live' : 'Chờ'}
                      variant={match.status === 'completed' ? 'success' : match.status === 'in_progress' ? 'error' : 'info'}
                    />

                    {/* Red Corner */}
                    <View style={[styles.athleteRow, match.winnerId === match.athleteRed?.id && styles.winnerRow]}>
                      <View style={[styles.cornerDot, { backgroundColor: '#EF4444' }]} />
                      <Text style={[styles.athleteName, { color: theme.colors.text }]} numberOfLines={1}>
                        {match.athleteRed?.name ?? 'TBD'}
                      </Text>
                      <Text style={[styles.matchScore, { color: match.winnerId === match.athleteRed?.id ? '#00E5CC' : theme.colors.textSecondary }]}>
                        {match.scoreRed ?? '-'}
                      </Text>
                    </View>

                    {/* Blue Corner */}
                    <View style={[styles.athleteRow, match.winnerId === match.athleteBlue?.id && styles.winnerRow]}>
                      <View style={[styles.cornerDot, { backgroundColor: '#3B82F6' }]} />
                      <Text style={[styles.athleteName, { color: theme.colors.text }]} numberOfLines={1}>
                        {match.athleteBlue?.name ?? 'TBD'}
                      </Text>
                      <Text style={[styles.matchScore, { color: match.winnerId === match.athleteBlue?.id ? '#00E5CC' : theme.colors.textSecondary }]}>
                        {match.scoreBlue ?? '-'}
                      </Text>
                    </View>

                    {match.scheduledTime && (
                      <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
                        🕐 {match.scheduledTime}
                      </Text>
                    )}
                  </VctCard>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  )
}

// ── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  skeletons: { gap: 16, alignItems: 'center', paddingTop: 100 },
  header: { paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 56 : 40, paddingBottom: 12 },
  backBtn: { paddingVertical: 8 },
  backText: { fontSize: 15, fontWeight: '600' },
  headerTitle: { fontSize: 24, fontWeight: '800', marginTop: 4 },
  headerSubtitle: { fontSize: 14, marginTop: 2 },
  bracketScroll: { paddingHorizontal: 16, paddingBottom: 32 },
  roundColumn: { width: SCREEN_WIDTH * 0.65, marginRight: 12 },
  roundHeader: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, marginBottom: 8, alignItems: 'center' },
  roundTitle: { fontSize: 14, fontWeight: '700' },
  roundCount: { fontSize: 11, marginTop: 2 },
  matchColumn: { gap: 8 },
  matchCard: { padding: 12 },
  athleteRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 8 },
  winnerRow: { opacity: 1 },
  cornerDot: { width: 8, height: 8, borderRadius: 4 },
  athleteName: { flex: 1, fontSize: 14, fontWeight: '600' },
  matchScore: { fontSize: 16, fontWeight: '800', fontVariant: ['tabular-nums'] },
  timeText: { fontSize: 11, marginTop: 6, textAlign: 'center' },
})
