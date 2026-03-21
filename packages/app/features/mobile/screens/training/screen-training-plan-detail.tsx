// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Training Plan Detail Screen
// Detailed training plan view with weekly schedule, exercises,
// progress tracking, and completion check-off.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native'
import { useVCTTheme } from '../../theme-provider'
import { VctCard, VctBadge } from '../../core-ui'
import { useQuery } from '../../data-hooks'
import { triggerHaptic } from '../../haptic-feedback'
import { SkeletonLoader } from '../../skeleton-loader'
import { ErrorState } from '../../error-states'
import { MobileScreenCenteredState, MobileScreenShell } from '../../screen-shell'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// ── Types ────────────────────────────────────────────────────

interface TrainingPlanDetailProps {
  planId: string
  onGoBack?: () => void
  onNavigateTechnique?: (techId: string) => void
}

interface TrainingPlanData {
  id: string
  title: string
  description: string
  level: string
  duration: string
  createdBy: string
  progress: number
  totalSessions: number
  completedSessions: number
  weeks: WeekSchedule[]
}

interface WeekSchedule {
  weekNumber: number
  title: string
  sessions: SessionItem[]
}

interface SessionItem {
  id: string
  day: string
  title: string
  duration: string
  exercises: ExerciseItem[]
  isCompleted: boolean
}

interface ExerciseItem {
  id: string
  name: string
  sets: number
  reps: string
  notes?: string
  techniqueId?: string
}

// ── Component ────────────────────────────────────────────────

export function ScreenTrainingPlanDetail({
  planId,
  onGoBack,
  onNavigateTechnique,
}: TrainingPlanDetailProps) {
  const { theme } = useVCTTheme()
  const [expandedWeek, setExpandedWeek] = useState<number>(0)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  const { data: plan, isLoading, error, refetch } = useQuery<TrainingPlanData>(
    `/api/v1/training/plans/${planId}`,
    { cacheKey: `training-plan-${planId}`, staleTime: 120_000 }
  )

  const fadeAnim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start()
  }, [])

  // Sync completed from API
  useEffect(() => {
    if (plan) {
      const ids = new Set<string>()
      plan.weeks.forEach((w) => w.sessions.forEach((s) => { if (s.isCompleted) ids.add(s.id) }))
      setCompletedIds(ids)
    }
  }, [plan])

  const toggleComplete = useCallback((sessionId: string) => {
    triggerHaptic('medium')
    setCompletedIds((prev) => {
      const next = new Set(prev)
      if (next.has(sessionId)) next.delete(sessionId)
      else next.add(sessionId)
      return next
    })
  }, [])

  const toggleWeek = useCallback((weekNum: number) => {
    triggerHaptic('selection')
    setExpandedWeek((prev) => (prev === weekNum ? -1 : weekNum))
  }, [])

  if (isLoading) {
    return (
      <MobileScreenCenteredState backgroundColor={theme.colors.background}>
        <View style={styles.skeletons}>
          <SkeletonLoader width={SCREEN_WIDTH - 48} height={80} borderRadius={14} />
          <SkeletonLoader width={SCREEN_WIDTH - 48} height={200} borderRadius={14} />
        </View>
      </MobileScreenCenteredState>
    )
  }

  if (error || !plan) {
    return (
      <MobileScreenCenteredState backgroundColor={theme.colors.background}>
        <ErrorState title="Không thể tải giáo án" message="Vui lòng thử lại." onRetry={refetch} />
      </MobileScreenCenteredState>
    )
  }

  const realProgress = plan.totalSessions > 0 ? Math.round((completedIds.size / plan.totalSessions) * 100) : 0

  return (
    <Animated.View style={[styles.container, { backgroundColor: theme.colors.background, opacity: fadeAnim }]}>
      <MobileScreenShell
        backgroundColor={theme.colors.background}
        onGoBack={onGoBack}
        title={plan.title}
      >
        <View style={styles.headerMeta}>
          <View style={styles.metaRow}>
            <VctBadge label={plan.level} variant="primary" />
            <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>⏱️ {plan.duration}</Text>
            <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>✍️ {plan.createdBy}</Text>
          </View>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>{plan.description}</Text>
        </View>

        {/* Progress Bar */}
        <VctCard style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: theme.colors.text }]}>Tiến độ</Text>
            <Text style={[styles.progressPercent, { color: theme.colors.primary }]}>{realProgress}%</Text>
          </View>
          <View style={[styles.progressBg, { backgroundColor: theme.colors.border }]}>
            <View style={[styles.progressFill, { width: `${realProgress}%`, backgroundColor: theme.colors.primary }]} />
          </View>
          <Text style={[styles.sessionCount, { color: theme.colors.textSecondary }]}>
            {completedIds.size}/{plan.totalSessions} buổi tập hoàn thành
          </Text>
        </VctCard>

        {/* Weeks Accordion */}
        {plan.weeks.map((week) => (
          <View key={week.weekNumber} style={styles.weekSection}>
            <TouchableOpacity
              style={[styles.weekHeader, { backgroundColor: theme.colors.surface }]}
              onPress={() => toggleWeek(week.weekNumber)}
            >
              <View>
                <Text style={[styles.weekTitle, { color: theme.colors.text }]}>Tuần {week.weekNumber}</Text>
                <Text style={[styles.weekSubtitle, { color: theme.colors.textSecondary }]}>{week.title}</Text>
              </View>
              <Text style={[styles.expandIcon, { color: theme.colors.textSecondary }]}>
                {expandedWeek === week.weekNumber ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {expandedWeek === week.weekNumber && (
              <View style={styles.sessionList}>
                {week.sessions.map((session) => {
                  const isDone = completedIds.has(session.id)
                  return (
                    <VctCard key={session.id} style={styles.sessionCard}>
                      <View style={styles.sessionHeader}>
                        <TouchableOpacity
                          style={[styles.checkbox, { borderColor: isDone ? theme.colors.primary : theme.colors.border, backgroundColor: isDone ? theme.colors.primary : 'transparent' }]}
                          onPress={() => toggleComplete(session.id)}
                        >
                          {isDone && <Text style={styles.checkmark}>✓</Text>}
                        </TouchableOpacity>
                        <View style={styles.sessionInfo}>
                          <Text style={[styles.sessionTitle, { color: theme.colors.text, textDecorationLine: isDone ? 'line-through' : 'none' }]}>
                            {session.title}
                          </Text>
                          <Text style={[styles.sessionMeta, { color: theme.colors.textSecondary }]}>
                            📅 {session.day} • ⏱️ {session.duration}
                          </Text>
                        </View>
                      </View>

                      {/* Exercises */}
                      {session.exercises.map((ex) => (
                        <TouchableOpacity
                          key={ex.id}
                          style={styles.exerciseRow}
                          onPress={() => ex.techniqueId && onNavigateTechnique?.(ex.techniqueId)}
                          disabled={!ex.techniqueId}
                        >
                          <View style={styles.exerciseInfo}>
                            <Text style={[styles.exerciseName, { color: theme.colors.text }]}>
                              {ex.techniqueId ? '🔗 ' : '• '}{ex.name}
                            </Text>
                            <Text style={[styles.exerciseDetail, { color: theme.colors.textSecondary }]}>
                              {ex.sets} bộ × {ex.reps} {ex.notes ? `— ${ex.notes}` : ''}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </VctCard>
                  )
                })}
              </View>
            )}
          </View>
        ))}
      </MobileScreenShell>
    </Animated.View>
  )
}

// ── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  skeletons: { gap: 16, alignItems: 'center', paddingTop: 100 },
  headerMeta: { paddingHorizontal: 24, paddingBottom: 8 },
  metaRow: { flexDirection: 'row', gap: 10, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' },
  metaText: { fontSize: 13 },
  description: { fontSize: 14, lineHeight: 22, marginTop: 12 },
  progressCard: { marginHorizontal: 24, marginTop: 20, padding: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 14, fontWeight: '700' },
  progressPercent: { fontSize: 16, fontWeight: '800' },
  progressBg: { height: 6, borderRadius: 3 },
  progressFill: { height: 6, borderRadius: 3 },
  sessionCount: { fontSize: 12, marginTop: 8, textAlign: 'center' },
  weekSection: { paddingHorizontal: 24, marginTop: 16 },
  weekHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12 },
  weekTitle: { fontSize: 16, fontWeight: '700' },
  weekSubtitle: { fontSize: 12, marginTop: 2 },
  expandIcon: { fontSize: 12 },
  sessionList: { marginTop: 8, gap: 8 },
  sessionCard: { padding: 14 },
  sessionHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  checkmark: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  sessionInfo: { flex: 1 },
  sessionTitle: { fontSize: 15, fontWeight: '700', lineHeight: 20 },
  sessionMeta: { fontSize: 12, marginTop: 2 },
  exerciseRow: { marginTop: 8, paddingLeft: 36 },
  exerciseInfo: {},
  exerciseName: { fontSize: 14, fontWeight: '600' },
  exerciseDetail: { fontSize: 12, marginTop: 2 },
})
