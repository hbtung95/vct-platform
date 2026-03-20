// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Technique Detail Screen
// Full technique breakdown: video embed, step-by-step guide,
// key points, related techniques, and practice tips.
// ═══════════════════════════════════════════════════════════════

import React, { useRef, useEffect, useState, useCallback } from 'react'
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
import { VctCard, VctBadge, VctButton } from './core-ui'
import { useQuery } from './data-hooks'
import { triggerHaptic } from './haptic-feedback'
import { SkeletonLoader } from './skeleton-loader'
import { ErrorState } from './error-states'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// ── Types ────────────────────────────────────────────────────

interface TechniqueDetailProps {
  techniqueId: string
  onGoBack?: () => void
  onNavigateRelated?: (id: string) => void
}

interface TechniqueData {
  id: string
  name: string
  vietnameseName: string
  category: string
  difficulty: 'cơ_bản' | 'trung_bình' | 'nâng_cao'
  description: string
  videoUrl?: string
  thumbnailUrl?: string
  steps: { order: number; title: string; description: string }[]
  keyPoints: string[]
  commonMistakes: string[]
  relatedTechniques: { id: string; name: string; category: string }[]
  beltRequired?: string
  estimatedTime: string
}

// ── Component ────────────────────────────────────────────────

export function ScreenTechniqueDetail({
  techniqueId,
  onGoBack,
  onNavigateRelated,
}: TechniqueDetailProps) {
  const { theme } = useVCTTheme()
  const [activeTab, setActiveTab] = useState<'steps' | 'tips' | 'related'>('steps')

  const { data: technique, isLoading, error, refetch } = useQuery<TechniqueData>(
    `/api/v1/training/techniques/${techniqueId}`,
    { cacheKey: `technique-${techniqueId}`, staleTime: 300_000 }
  )

  const fadeAnim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start()
  }, [])

  const getDiffBadge = (diff: string) => {
    switch (diff) {
      case 'cơ_bản': return { label: 'Cơ bản', variant: 'success' as const }
      case 'trung_bình': return { label: 'Trung bình', variant: 'warning' as const }
      case 'nâng_cao': return { label: 'Nâng cao', variant: 'error' as const }
      default: return { label: diff, variant: 'info' as const }
    }
  }

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.skeletonContent}>
          <SkeletonLoader width={SCREEN_WIDTH} height={220} borderRadius={0} />
          <SkeletonLoader width={SCREEN_WIDTH - 48} height={30} borderRadius={8} />
          <SkeletonLoader width={SCREEN_WIDTH - 48} height={200} borderRadius={14} />
        </View>
      </View>
    )
  }

  if (error || !technique) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ErrorState title="Không thể tải kỹ thuật" message="Vui lòng thử lại." onRetry={refetch} />
      </View>
    )
  }

  const diffBadge = getDiffBadge(technique.difficulty)

  return (
    <Animated.View style={[styles.container, { backgroundColor: theme.colors.background, opacity: fadeAnim }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity onPress={onGoBack} style={[styles.backBtn, { backgroundColor: theme.colors.surface }]}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        {/* Video Placeholder */}
        <View style={[styles.videoContainer, { backgroundColor: theme.colors.surface }]}>
          <Text style={styles.videoEmoji}>🎬</Text>
          <Text style={[styles.videoText, { color: theme.colors.textSecondary }]}>
            {technique.videoUrl ? 'Nhấn để phát video' : 'Video đang cập nhật'}
          </Text>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={[styles.techniqueName, { color: theme.colors.text }]}>{technique.name}</Text>
          {technique.vietnameseName && (
            <Text style={[styles.vietnameseName, { color: theme.colors.textSecondary }]}>
              {technique.vietnameseName}
            </Text>
          )}
          <View style={styles.badgeRow}>
            <VctBadge label={diffBadge.label} variant={diffBadge.variant} />
            <VctBadge label={technique.category} variant="info" />
            {technique.beltRequired && <VctBadge label={`Đai ${technique.beltRequired}`} variant="warning" />}
          </View>
          <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
            ⏱️ {technique.estimatedTime}
          </Text>
        </View>

        {/* Description */}
        <View style={styles.descSection}>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>{technique.description}</Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabRow}>
          {(['steps', 'tips', 'related'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, { backgroundColor: activeTab === tab ? theme.colors.primary : theme.colors.surface }]}
              onPress={() => { setActiveTab(tab); triggerHaptic('selection') }}
            >
              <Text style={[styles.tabText, { color: activeTab === tab ? '#FFF' : theme.colors.textSecondary }]}>
                {tab === 'steps' ? '📝 Các bước' : tab === 'tips' ? '💡 Mẹo' : '🔗 Liên quan'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Steps Tab */}
        {activeTab === 'steps' && (
          <View style={styles.tabContent}>
            {technique.steps.map((step, i) => (
              <VctCard key={i} style={styles.stepCard}>
                <View style={styles.stepHeader}>
                  <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.stepNumberText}>{step.order}</Text>
                  </View>
                  <Text style={[styles.stepTitle, { color: theme.colors.text }]}>{step.title}</Text>
                </View>
                <Text style={[styles.stepDesc, { color: theme.colors.textSecondary }]}>{step.description}</Text>
              </VctCard>
            ))}
          </View>
        )}

        {/* Tips Tab */}
        {activeTab === 'tips' && (
          <View style={styles.tabContent}>
            <Text style={[styles.subTitle, { color: theme.colors.text }]}>💡 Điểm then chốt</Text>
            {technique.keyPoints.map((point, i) => (
              <View key={i} style={styles.bulletItem}>
                <Text style={[styles.bulletDot, { color: theme.colors.primary }]}>●</Text>
                <Text style={[styles.bulletText, { color: theme.colors.textSecondary }]}>{point}</Text>
              </View>
            ))}

            <Text style={[styles.subTitle, { color: theme.colors.text, marginTop: 20 }]}>⚠️ Lỗi thường gặp</Text>
            {technique.commonMistakes.map((mistake, i) => (
              <View key={i} style={styles.bulletItem}>
                <Text style={[styles.bulletDot, { color: theme.colors.error }]}>✕</Text>
                <Text style={[styles.bulletText, { color: theme.colors.textSecondary }]}>{mistake}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Related Tab */}
        {activeTab === 'related' && (
          <View style={styles.tabContent}>
            {technique.relatedTechniques.map((rel) => (
              <TouchableOpacity
                key={rel.id}
                onPress={() => { triggerHaptic('light'); onNavigateRelated?.(rel.id) }}
                activeOpacity={0.7}
              >
                <VctCard style={styles.relatedCard}>
                  <Text style={[styles.relatedName, { color: theme.colors.text }]}>{rel.name}</Text>
                  <Text style={[styles.relatedCat, { color: theme.colors.textSecondary }]}>{rel.category}</Text>
                </VctCard>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </Animated.View>
  )
}

// ── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  skeletonContent: { gap: 16, alignItems: 'center', paddingTop: 60 },
  backBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 56 : 40, left: 24, zIndex: 10, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 20 },
  videoContainer: { width: SCREEN_WIDTH, height: 220, alignItems: 'center', justifyContent: 'center' },
  videoEmoji: { fontSize: 48, marginBottom: 8 },
  videoText: { fontSize: 14 },
  titleSection: { paddingHorizontal: 24, paddingTop: 20 },
  techniqueName: { fontSize: 24, fontWeight: '800', lineHeight: 30 },
  vietnameseName: { fontSize: 16, fontStyle: 'italic', marginTop: 4 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  metaText: { fontSize: 13, marginTop: 8 },
  descSection: { paddingHorizontal: 24, marginTop: 16 },
  description: { fontSize: 14, lineHeight: 22 },
  tabRow: { flexDirection: 'row', paddingHorizontal: 24, marginTop: 24, gap: 8 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '600' },
  tabContent: { paddingHorizontal: 24, marginTop: 16 },
  stepCard: { marginBottom: 10, padding: 14 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  stepNumber: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  stepTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
  stepDesc: { fontSize: 13, lineHeight: 20, marginLeft: 40 },
  subTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  bulletItem: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  bulletDot: { fontSize: 10, marginTop: 4 },
  bulletText: { fontSize: 14, lineHeight: 20, flex: 1 },
  relatedCard: { marginBottom: 8, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  relatedName: { fontSize: 15, fontWeight: '700' },
  relatedCat: { fontSize: 12 },
})
