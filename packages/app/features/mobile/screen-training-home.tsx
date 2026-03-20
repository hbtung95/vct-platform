// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Training Home Screen
// Hub for all training content: training plans, techniques,
// curriculum, belt exams, and e-learning.
// ═══════════════════════════════════════════════════════════════

import React, { useRef, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  RefreshControl,
} from 'react-native'
import { useVCTTheme } from './theme-provider'
import { VctCard, VctBadge } from './core-ui'
import { useQuery } from './data-hooks'
import { triggerHaptic } from './haptic-feedback'
import { SkeletonLoader } from './skeleton-loader'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// ── Types ────────────────────────────────────────────────────

interface TrainingHomeProps {
  onNavigatePlan?: (planId: string) => void
  onNavigateTechnique?: (techniqueId: string) => void
  onNavigateCurriculum?: (curriculumId: string) => void
  onNavigateBeltExam?: (examId: string) => void
  onNavigateElearning?: (courseId: string) => void
}

interface TrainingPlan {
  id: string
  title: string
  level: string
  duration: string
  progress: number // 0-100
}

interface Technique {
  id: string
  name: string
  category: 'quyền' | 'đối_kháng' | 'binh_khí'
  difficulty: 'cơ_bản' | 'trung_bình' | 'nâng_cao'
  hasVideo: boolean
}

interface QuickCategory {
  id: string
  emoji: string
  label: string
  count: number
  color: string
}

// ── Category Data ────────────────────────────────────────────

const TRAINING_CATEGORIES: QuickCategory[] = [
  { id: 'plans', emoji: '📋', label: 'Giáo án', count: 0, color: '#3B82F6' },
  { id: 'quyen', emoji: '🥋', label: 'Bài quyền', count: 0, color: '#8B5CF6' },
  { id: 'doi_khang', emoji: '⚔️', label: 'Đối kháng', count: 0, color: '#EF4444' },
  { id: 'binh_khi', emoji: '🗡️', label: 'Binh khí', count: 0, color: '#F59E0B' },
  { id: 'belt_exams', emoji: '🎖️', label: 'Thi đai', count: 0, color: '#10B981' },
  { id: 'elearning', emoji: '📚', label: 'E-Learning', count: 0, color: '#EC4899' },
]

// ── Component ────────────────────────────────────────────────

export function ScreenTrainingHome({
  onNavigatePlan,
  onNavigateTechnique,
  onNavigateCurriculum,
  onNavigateBeltExam,
  onNavigateElearning,
}: TrainingHomeProps) {
  const { theme } = useVCTTheme()

  const { data: plans, isLoading: plansLoading, refetch: refetchPlans } = useQuery<TrainingPlan[]>(
    '/api/v1/training/plans?limit=5',
    { cacheKey: 'training-plans', staleTime: 120_000 }
  )

  const { data: techniques, isLoading: techLoading, refetch: refetchTech } = useQuery<Technique[]>(
    '/api/v1/training/techniques?limit=10',
    { cacheKey: 'training-techniques', staleTime: 120_000 }
  )

  const [refreshing, setRefreshing] = React.useState(false)

  const fadeAnim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start()
  }, [])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    triggerHaptic('light')
    await Promise.all([refetchPlans(), refetchTech()])
    setRefreshing(false)
  }, [refetchPlans, refetchTech])

  const getDifficultyBadge = (diff: Technique['difficulty']) => {
    switch (diff) {
      case 'cơ_bản': return { label: 'Cơ bản', variant: 'success' as const }
      case 'trung_bình': return { label: 'Trung bình', variant: 'warning' as const }
      case 'nâng_cao': return { label: 'Nâng cao', variant: 'error' as const }
    }
  }

  const getCategoryLabel = (cat: Technique['category']) => {
    switch (cat) {
      case 'quyền': return '🥋 Quyền'
      case 'đối_kháng': return '⚔️ Đối kháng'
      case 'binh_khí': return '🗡️ Binh khí'
    }
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor: theme.colors.background, opacity: fadeAnim }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Huấn luyện</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Nâng cao kỹ năng võ thuật cổ truyền
          </Text>
        </View>

        {/* Category Grid */}
        <View style={styles.categoryGrid}>
          {TRAINING_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => triggerHaptic('selection')}
              accessibilityLabel={cat.label}
            >
              <View style={[styles.catIconBg, { backgroundColor: `${cat.color}20` }]}>
                <Text style={styles.catEmoji}>{cat.emoji}</Text>
              </View>
              <Text style={[styles.catLabel, { color: theme.colors.text }]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* My Training Plans */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Giáo án của tôi</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: theme.colors.primary }]}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {plansLoading ? (
            <View style={styles.skeletonRow}>
              {[1, 2].map((i) => <SkeletonLoader key={i} width={(SCREEN_WIDTH - 60) / 2} height={130} borderRadius={14} />)}
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.planScroll}>
              {(plans ?? []).map((plan) => (
                <TouchableOpacity key={plan.id} onPress={() => { triggerHaptic('light'); onNavigatePlan?.(plan.id) }} activeOpacity={0.7}>
                  <VctCard style={styles.planCard}>
                    <Text style={[styles.planTitle, { color: theme.colors.text }]} numberOfLines={2}>{plan.title}</Text>
                    <VctBadge label={plan.level} variant="info" />
                    <Text style={[styles.planDuration, { color: theme.colors.textSecondary }]}>⏱️ {plan.duration}</Text>
                    {/* Progress Bar */}
                    <View style={[styles.progressBg, { backgroundColor: theme.colors.border }]}>
                      <View style={[styles.progressFill, { width: `${plan.progress}%`, backgroundColor: theme.colors.primary }]} />
                    </View>
                    <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>{plan.progress}%</Text>
                  </VctCard>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Techniques */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Kỹ thuật</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: theme.colors.primary }]}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {techLoading ? (
            <View style={styles.skeletonList}>
              {[1, 2, 3].map((i) => <SkeletonLoader key={i} width={SCREEN_WIDTH - 48} height={72} borderRadius={12} />)}
            </View>
          ) : (
            (techniques ?? []).map((tech) => {
              const badge = getDifficultyBadge(tech.difficulty)
              return (
                <TouchableOpacity key={tech.id} onPress={() => { triggerHaptic('light'); onNavigateTechnique?.(tech.id) }} activeOpacity={0.7}>
                  <VctCard style={styles.techCard}>
                    <View style={styles.techRow}>
                      <View style={styles.techInfo}>
                        <Text style={[styles.techName, { color: theme.colors.text }]}>{tech.name}</Text>
                        <Text style={[styles.techCategory, { color: theme.colors.textSecondary }]}>
                          {getCategoryLabel(tech.category)} {tech.hasVideo && '🎬'}
                        </Text>
                      </View>
                      <VctBadge label={badge.label} variant={badge.variant} />
                    </View>
                  </VctCard>
                </TouchableOpacity>
              )
            })
          )}
        </View>
      </ScrollView>
    </Animated.View>
  )
}

// ── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  header: { paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 60 : 48, paddingBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: '800', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 14, marginTop: 4 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24, marginTop: 20, gap: 10 },
  categoryCard: { width: (SCREEN_WIDTH - 48 - 20) / 3, padding: 14, borderRadius: 14, alignItems: 'center' },
  catIconBg: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  catEmoji: { fontSize: 20 },
  catLabel: { fontSize: 11, fontWeight: '600' },
  section: { paddingHorizontal: 24, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  seeAll: { fontSize: 14, fontWeight: '600' },
  planScroll: { gap: 12 },
  planCard: { width: (SCREEN_WIDTH - 60) / 2, padding: 14 },
  planTitle: { fontSize: 14, fontWeight: '700', marginBottom: 6, lineHeight: 20 },
  planDuration: { fontSize: 12, marginTop: 6 },
  progressBg: { height: 4, borderRadius: 2, marginTop: 8 },
  progressFill: { height: 4, borderRadius: 2 },
  progressText: { fontSize: 11, marginTop: 4, textAlign: 'right' },
  techCard: { marginBottom: 8, padding: 14 },
  techRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  techInfo: { flex: 1, marginRight: 8 },
  techName: { fontSize: 15, fontWeight: '700' },
  techCategory: { fontSize: 12, marginTop: 2 },
  skeletonRow: { flexDirection: 'row', gap: 12 },
  skeletonList: { gap: 8 },
})
