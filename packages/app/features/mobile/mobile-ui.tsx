import * as React from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { Colors, SharedStyles, FontWeight, Radius, Space } from './mobile-theme'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Shared Mobile UI Components
// Reusable across all mobile screens
// ═══════════════════════════════════════════════════════════════

/** Status badge with colored background */
export function Badge({ label, bg, fg }: { label: string; bg: string; fg: string }) {
  return (
    <View style={[SharedStyles.badge, { backgroundColor: bg }]}>
      <Text style={[SharedStyles.badgeText, { color: fg }]}>{label}</Text>
    </View>
  )
}

/** Animated skill/progress bar */
export function SkillBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={SharedStyles.skillRow}>
      <Text style={SharedStyles.skillLabel}>{label}</Text>
      <View style={SharedStyles.skillTrack}>
        <View style={[SharedStyles.skillFill, { width: `${Math.min(value, 100)}%`, backgroundColor: color }]} />
      </View>
      <Text style={[SharedStyles.skillValue, { color }]}>{value}</Text>
    </View>
  )
}

/** Goal progress bar with label */
export function GoalBar({ title, progress, color, icon }: { title: string; progress: number; color: string; icon: string }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={[SharedStyles.rowBetween, { marginBottom: 4 }]}>
        <View style={[SharedStyles.row, { gap: 8 }]}>
          <Text style={{ fontSize: 14 }}>{icon}</Text>
          <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: Colors.textPrimary }}>{title}</Text>
        </View>
        <Text style={{ fontSize: 11, fontWeight: FontWeight.extrabold, color }}>{progress}%</Text>
      </View>
      <View style={SharedStyles.progressTrack}>
        <View style={[SharedStyles.progressFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: color }]} />
      </View>
    </View>
  )
}

/** Section header with back button */
export function ScreenHeader({ title, subtitle, emoji, onBack }: {
  title: string; subtitle: string; emoji: string; onBack: () => void
}) {
  return (
    <View style={[SharedStyles.row, { gap: 12, marginBottom: 16 }]}>
      <Pressable
        onPress={onBack}
        style={{
          width: 36, height: 36, borderRadius: Radius.md,
          borderWidth: 1, borderColor: Colors.border,
          backgroundColor: Colors.bgCard, justifyContent: 'center', alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 16, color: Colors.textSecondary, fontWeight: FontWeight.semibold }}>‹</Text>
      </Pressable>
      <Text style={{ fontSize: 24 }}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 22, fontWeight: FontWeight.black, color: Colors.textPrimary }}>{title}</Text>
        <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>{subtitle}</Text>
      </View>
    </View>
  )
}

/** Skeleton placeholder for loading states */
export function SkeletonBox({ width, height = 16, radius = 8, style }: {
  width: number | string; height?: number; radius?: number; style?: object
}) {
  return (
    <View style={[{
      width: width as number, height, borderRadius: radius,
      backgroundColor: '#e2e8f0',
      opacity: 0.6,
    }, style]} />
  )
}

/** Full-screen skeleton for screen loading */
export function ScreenSkeleton() {
  return (
    <View style={[SharedStyles.page, SharedStyles.scrollContent]}>
      {/* Hero skeleton */}
      <View style={[SharedStyles.heroCard, { padding: Space.xxl }]}>
        <SkeletonBox width={72} height={72} radius={36} style={{ marginBottom: 12 }} />
        <SkeletonBox width={180} height={20} style={{ marginBottom: 8 }} />
        <SkeletonBox width={120} height={14} />
      </View>
      {/* Stats skeleton */}
      <View style={SharedStyles.statsRow}>
        {[1, 2, 3].map(i => (
          <View key={i} style={SharedStyles.statBox}>
            <SkeletonBox width={40} height={24} style={{ marginBottom: 4 }} />
            <SkeletonBox width={50} height={10} />
          </View>
        ))}
      </View>
      {/* Cards skeleton */}
      {[1, 2, 3].map(i => (
        <View key={i} style={SharedStyles.card}>
          <SkeletonBox width="80%" height={16} style={{ marginBottom: 8 }} />
          <SkeletonBox width="60%" height={12} style={{ marginBottom: 6 }} />
          <SkeletonBox width="40%" height={12} />
        </View>
      ))}
    </View>
  )
}

/** Loading spinner overlay */
export function LoadingOverlay({ message = 'Đang tải...' }: { message?: string }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bgBase }}>
      <ActivityIndicator size="large" color={Colors.accent} />
      <Text style={{ marginTop: 12, fontSize: 13, color: Colors.textSecondary, fontWeight: FontWeight.semibold }}>
        {message}
      </Text>
    </View>
  )
}

/** Empty list state */
export function EmptyState({ emoji, title, message }: { emoji: string; title: string; message: string }) {
  return (
    <View style={SharedStyles.emptyBox}>
      <Text style={{ fontSize: 36 }}>{emoji}</Text>
      <Text style={[SharedStyles.emptyText, { fontWeight: FontWeight.bold }]}>{title}</Text>
      <Text style={[SharedStyles.emptyText, { fontSize: 11, maxWidth: 220 }]}>{message}</Text>
    </View>
  )
}

/** "Coming soon" toast for placeholder features */
export function showComingSoon(feature: string): void {
  // Using global alert as a simple cross-platform toast
  // In production, replace with a proper toast library
  const { Alert } = require('react-native')
  Alert.alert('Sắp ra mắt', `Tính năng "${feature}" đang được phát triển.`)
}
