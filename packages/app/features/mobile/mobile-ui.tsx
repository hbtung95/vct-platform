import * as React from 'react'
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View, Animated } from 'react-native'
import { Colors, SharedStyles, FontWeight, Radius, Space, Touch } from './mobile-theme'
import { Icon, VCTIcons } from './icons'
import { hapticLight } from './haptics'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Shared Mobile UI Components (v2)
// Accessible, animated, icon-based (no emoji)
// ═══════════════════════════════════════════════════════════════

/** Status badge with colored background */
export function Badge({ label, bg, fg, icon }: { label: string; bg: string; fg: string; icon?: React.ComponentProps<typeof Icon>['name'] }) {
  return (
    <View style={[SharedStyles.badge, { backgroundColor: bg }]} accessibilityRole="text">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        {icon && <Icon name={icon} size={10} color={fg} />}
        <Text style={[SharedStyles.badgeText, { color: fg }]}>{label}</Text>
      </View>
    </View>
  )
}

/** Animated skill/progress bar */
export function SkillBar({ label, value, color }: { label: string; value: number; color: string }) {
  const animWidth = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.timing(animWidth, {
      toValue: Math.min(value, 100),
      duration: 600,
      useNativeDriver: false,
    }).start()
  }, [value, animWidth])

  return (
    <View style={SharedStyles.skillRow} accessibilityLabel={`${label}: ${value} phần trăm`} accessibilityRole="progressbar">
      <Text style={SharedStyles.skillLabel}>{label}</Text>
      <View style={SharedStyles.skillTrack}>
        <Animated.View style={[SharedStyles.skillFill, {
          width: animWidth.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
          backgroundColor: color,
        }]} />
      </View>
      <Text style={[SharedStyles.skillValue, { color }]}>{value}</Text>
    </View>
  )
}

/** Goal progress bar with label */
export function GoalBar({ title, progress, color, icon }: { title: string; progress: number; color: string; icon?: string }) {
  const animWidth = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    Animated.timing(animWidth, {
      toValue: Math.min(progress, 100),
      duration: 600,
      useNativeDriver: false,
    }).start()
  }, [progress, animWidth])

  return (
    <View style={{ marginBottom: 14 }} accessibilityLabel={`${title}: ${progress} phần trăm hoàn thành`} accessibilityRole="progressbar">
      <View style={[SharedStyles.rowBetween, { marginBottom: 4 }]}>
        <View style={[SharedStyles.row, { gap: 8 }]}>
          {icon && <Text style={{ fontSize: 14 }}>{icon}</Text>}
          <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: Colors.textPrimary }}>{title}</Text>
        </View>
        <Text style={{ fontSize: 11, fontWeight: FontWeight.extrabold, color }}>{progress}%</Text>
      </View>
      <View style={SharedStyles.progressTrack}>
        <Animated.View style={[SharedStyles.progressFill, {
          width: animWidth.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
          backgroundColor: color,
        }]} />
      </View>
    </View>
  )
}

/** Section header with back button (accessible, 44px touch target) */
export function ScreenHeader({ title, subtitle, icon, onBack }: {
  title: string; subtitle: string; icon?: React.ComponentProps<typeof Icon>['name']; onBack: () => void
}) {
  return (
    <View style={[SharedStyles.row, { gap: 12, marginBottom: 16 }]}>
      <Pressable
        onPress={() => { hapticLight(); onBack() }}
        accessibilityRole="button"
        accessibilityLabel="Quay lại"
        accessibilityHint="Quay về màn hình trước"
        style={{
          width: Touch.minSize, height: Touch.minSize, borderRadius: Radius.md,
          borderWidth: 1, borderColor: Colors.border,
          backgroundColor: Colors.bgCard, justifyContent: 'center', alignItems: 'center',
        }}
      >
        <Icon name={VCTIcons.back} size={20} color={Colors.textSecondary} />
      </Pressable>
      {icon && <Icon name={icon} size={24} color={Colors.accent} />}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 22, fontWeight: FontWeight.black, color: Colors.textPrimary }} accessibilityRole="header">{title}</Text>
        <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>{subtitle}</Text>
      </View>
    </View>
  )
}

/** Skeleton placeholder for loading states */
export function SkeletonBox({ width, height = 16, radius = 8, style }: {
  width: number | string; height?: number; radius?: number; style?: object
}) {
  const opacity = React.useRef(new Animated.Value(0.4)).current

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.8, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [opacity])

  return (
    <Animated.View style={[{
      width: width as number, height, borderRadius: radius,
      backgroundColor: Colors.skeleton,
      opacity,
    }, style]} />
  )
}

/** Full-screen skeleton for screen loading */
export function ScreenSkeleton() {
  return (
    <View style={[SharedStyles.page, SharedStyles.scrollContent]} accessibilityLabel="Đang tải nội dung">
      <View style={[SharedStyles.heroCard, { padding: Space.xxl }]}>
        <SkeletonBox width={72} height={72} radius={36} style={{ marginBottom: 12 }} />
        <SkeletonBox width={180} height={20} style={{ marginBottom: 8 }} />
        <SkeletonBox width={120} height={14} />
      </View>
      <View style={SharedStyles.statsRow}>
        {[1, 2, 3].map(i => (
          <View key={i} style={SharedStyles.statBox}>
            <SkeletonBox width={40} height={24} style={{ marginBottom: 4 }} />
            <SkeletonBox width={50} height={10} />
          </View>
        ))}
      </View>
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
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bgBase }} accessibilityLabel={message}>
      <ActivityIndicator size="large" color={Colors.accent} />
      <Text style={{ marginTop: 12, fontSize: 13, color: Colors.textSecondary, fontWeight: FontWeight.semibold }}>
        {message}
      </Text>
    </View>
  )
}

/** Empty list state with optional CTA */
export function EmptyState({ icon, title, message, ctaLabel, onCta }: {
  icon?: React.ComponentProps<typeof Icon>['name']; title: string; message: string
  ctaLabel?: string; onCta?: () => void
}) {
  return (
    <View style={SharedStyles.emptyBox} accessibilityLabel={`${title}. ${message}`}>
      {icon && <Icon name={icon} size={36} color={Colors.textMuted} style={{ marginBottom: 4 }} />}
      <Text style={[SharedStyles.emptyText, { fontWeight: FontWeight.bold }]}>{title}</Text>
      <Text style={[SharedStyles.emptyText, { fontSize: 11, maxWidth: 220 }]}>{message}</Text>
      {ctaLabel && onCta && (
        <Pressable
          onPress={() => { hapticLight(); onCta() }}
          accessibilityRole="button"
          accessibilityLabel={ctaLabel}
          style={{
            marginTop: 12, paddingHorizontal: 20, paddingVertical: 10, borderRadius: Radius.pill,
            backgroundColor: Colors.overlay(Colors.accent, 0.1), borderWidth: 1, borderColor: Colors.overlay(Colors.accent, 0.2),
            minHeight: Touch.minSize, justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: FontWeight.extrabold, color: Colors.accent }}>{ctaLabel}</Text>
        </Pressable>
      )}
    </View>
  )
}

/** Offline/error banner at top of screen */
export function OfflineBanner({ isOffline, onRetry }: { isOffline: boolean; onRetry?: () => void }) {
  if (!isOffline) return null
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      paddingVertical: 8, paddingHorizontal: 16,
      backgroundColor: Colors.overlay(Colors.gold, 0.12), borderBottomWidth: 1, borderBottomColor: Colors.overlay(Colors.gold, 0.2),
    }} accessibilityRole="alert" accessibilityLabel="Đang dùng dữ liệu offline">
      <Icon name={VCTIcons.cloudOffline} size={16} color={Colors.gold} />
      <Text style={{ fontSize: 11, fontWeight: FontWeight.bold, color: Colors.gold, flex: 1 }}>
        Đang dùng dữ liệu offline
      </Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Kết nối lại"
          style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.sm, backgroundColor: Colors.overlay(Colors.gold, 0.15), minHeight: 32, justifyContent: 'center' }}
        >
          <Text style={{ fontSize: 10, fontWeight: FontWeight.extrabold, color: Colors.gold }}>Thử lại</Text>
        </Pressable>
      )}
    </View>
  )
}

/** "Coming soon" alert for placeholder features */
export function showComingSoon(feature: string): void {
  Alert.alert('Sắp ra mắt', `Tính năng "${feature}" đang được phát triển.`)
}

// ═══════════════════════════════════════════════════════════════
// PROFESSIONAL UI COMPONENTS (v2)
// ═══════════════════════════════════════════════════════════════

/** Pressable card with scale-on-press spring animation */
export function AnimatedCard({ children, onPress, style }: {
  children: React.ReactNode; onPress?: () => void; style?: object
}) {
  const scale = React.useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 4 }).start()
  }
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4 }).start()
  }

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => { if (onPress) { hapticLight(); onPress() } }}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      <Animated.View style={[SharedStyles.card, { transform: [{ scale }] }, style]}>
        {children}
      </Animated.View>
    </Pressable>
  )
}

/** Search input with icon and clear button */
export function SearchBar({ value, onChangeText, placeholder = 'Tìm kiếm...' }: {
  value: string; onChangeText: (text: string) => void; placeholder?: string
}) {
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 10,
      backgroundColor: Colors.bgCard, borderRadius: Radius.md,
      borderWidth: 1, borderColor: Colors.border,
      paddingHorizontal: 14, marginBottom: Space.md, height: 44,
    }}>
      <Icon name={VCTIcons.search} size={18} color={Colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        style={{ flex: 1, fontSize: 14, color: Colors.textPrimary, height: '100%' }}
        accessibilityLabel={placeholder}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          accessibilityRole="button"
          accessibilityLabel="Xóa tìm kiếm"
          style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.overlay(Colors.textMuted, 0.1), justifyContent: 'center', alignItems: 'center' }}
        >
          <Icon name={VCTIcons.close} size={14} color={Colors.textMuted} />
        </Pressable>
      )}
    </View>
  )
}

/** Compact selectable chip/tag */
export function Chip({ label, selected, onPress, color, count }: {
  label: string; selected: boolean; onPress: () => void; color?: string; count?: number
}) {
  const chipColor = color ?? Colors.accent
  return (
    <Pressable
      onPress={() => { hapticLight(); onPress() }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={{
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.pill,
        backgroundColor: selected ? Colors.overlay(chipColor, 0.12) : Colors.bgCard,
        borderWidth: 1, borderColor: selected ? chipColor : Colors.border,
        flexDirection: 'row', alignItems: 'center', gap: 6,
      }}
    >
      <Text style={{
        fontSize: 12, fontWeight: FontWeight.bold,
        color: selected ? chipColor : Colors.textSecondary,
      }}>{label}</Text>
      {count !== undefined && count > 0 && (
        <View style={{
          minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4,
          backgroundColor: selected ? chipColor : Colors.overlay(Colors.textMuted, 0.15),
          justifyContent: 'center', alignItems: 'center',
        }}>
          <Text style={{ fontSize: 9, fontWeight: FontWeight.black, color: selected ? '#fff' : Colors.textSecondary }}>{count}</Text>
        </View>
      )}
    </Pressable>
  )
}

/** Reusable 2-step confirmation modal */
export function ConfirmModal({ visible, title, message, confirmLabel, cancelLabel, destructive, onConfirm, onCancel }: {
  visible: boolean; title: string; message: string
  confirmLabel?: string; cancelLabel?: string; destructive?: boolean
  onConfirm: () => void; onCancel: () => void
}) {
  if (!visible) return null
  const actionColor = destructive ? Colors.red : Colors.accent
  return (
    <View style={{
      ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999,
    }}>
      <View style={{
        width: '85%', maxWidth: 340, borderRadius: Radius.xl, padding: Space.xxl,
        backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
        shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 10,
      }}>
        <Text style={{ fontSize: 18, fontWeight: FontWeight.black, color: Colors.textPrimary, marginBottom: 8, textAlign: 'center' }}>{title}</Text>
        <Text style={{ fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: Space.xl }}>{message}</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable
            onPress={() => { hapticLight(); onCancel() }}
            accessibilityRole="button"
            style={{
              flex: 1, paddingVertical: 12, borderRadius: Radius.md, alignItems: 'center',
              backgroundColor: Colors.overlay(Colors.textMuted, 0.08), borderWidth: 1, borderColor: Colors.border,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: FontWeight.bold, color: Colors.textSecondary }}>{cancelLabel ?? 'Hủy'}</Text>
          </Pressable>
          <Pressable
            onPress={() => { hapticLight(); onConfirm() }}
            accessibilityRole="button"
            style={{
              flex: 1, paddingVertical: 12, borderRadius: Radius.md, alignItems: 'center',
              backgroundColor: Colors.overlay(actionColor, 0.12), borderWidth: 1, borderColor: actionColor,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: FontWeight.extrabold, color: actionColor }}>{confirmLabel ?? 'Xác nhận'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

/** Standalone stat card with icon, value, label, and optional trend */
export function StatCard({ icon, label, value, color, trend }: {
  icon: React.ComponentProps<typeof Icon>['name']; label: string; value: string | number
  color: string; trend?: 'up' | 'down' | 'flat'
}) {
  return (
    <View style={[SharedStyles.statBox, { position: 'relative' }]} accessibilityLabel={`${value} ${label}`}>
      <Icon name={icon} size={16} color={color} style={{ marginBottom: 4 }} />
      <Text style={[SharedStyles.statValue, { color }]}>{value}</Text>
      <Text style={SharedStyles.statLabel}>{label}</Text>
      {trend && trend !== 'flat' && (
        <View style={{ position: 'absolute', top: 6, right: 6 }}>
          <Icon
            name={trend === 'up' ? VCTIcons.trending : VCTIcons.trendingDown}
            size={10}
            color={trend === 'up' ? Colors.green : Colors.red}
          />
        </View>
      )}
    </View>
  )
}

/** Section divider with label and optional icon */
export function SectionDivider({ label, icon }: { label: string; icon?: React.ComponentProps<typeof Icon>['name'] }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: Space.lg, marginBottom: Space.md }}>
      <View style={{ height: 1, flex: 1, backgroundColor: Colors.border }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {icon && <Icon name={icon} size={12} color={Colors.textMuted} />}
        <Text style={{ fontSize: 10, fontWeight: FontWeight.extrabold, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</Text>
      </View>
      <View style={{ height: 1, flex: 1, backgroundColor: Colors.border }} />
    </View>
  )
}

/** Circular progress ring — View-based (no SVG dependency) */
export function ProgressRing({
  progress, size = 56, strokeWidth = 5, color = Colors.accent, label,
}: { progress: number; size?: number; strokeWidth?: number; color?: string; label?: string }) {
  const pct = Math.max(0, Math.min(100, progress))
  const innerSize = size - strokeWidth * 2
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }} accessibilityLabel={`${pct}%`} accessibilityRole="progressbar">
      {/* Track */}
      <View style={{
        position: 'absolute', width: size, height: size, borderRadius: size / 2,
        borderWidth: strokeWidth, borderColor: Colors.overlay(color, 0.12),
      }} />
      {/* Fill — using conic-gradient approximation via top+bottom halves */}
      {pct > 0 && (
        <View style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, overflow: 'hidden', transform: [{ rotate: '-90deg' }] }}>
          {/* Right half (0-50%) */}
          <View style={{ position: 'absolute', width: size / 2, height: size, right: 0, overflow: 'hidden' }}>
            <View style={{
              width: size, height: size, borderRadius: size / 2,
              borderWidth: strokeWidth, borderColor: 'transparent',
              borderTopColor: color, borderRightColor: pct > 25 ? color : 'transparent',
              transform: [{ rotate: `${Math.min(pct, 50) * 3.6}deg` }],
            }} />
          </View>
          {/* Left half (50-100%) */}
          {pct > 50 && (
            <View style={{ position: 'absolute', width: size / 2, height: size, left: 0, overflow: 'hidden' }}>
              <View style={{
                width: size, height: size, borderRadius: size / 2,
                borderWidth: strokeWidth, borderColor: 'transparent',
                borderTopColor: color, borderLeftColor: pct > 75 ? color : 'transparent',
                transform: [{ rotate: `${(pct - 50) * 3.6}deg` }],
              }} />
            </View>
          )}
        </View>
      )}
      {/* Center label */}
      <View style={{ width: innerSize, height: innerSize, borderRadius: innerSize / 2, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: size * 0.22, fontWeight: FontWeight.black, color }}>
          {label ?? `${pct}%`}
        </Text>
      </View>
    </View>
  )
}

/** Animated tab selector with underline indicator */
export function TabSelector({
  tabs, selectedKey, onSelect, color = Colors.accent,
}: {
  tabs: { key: string; label: string; count?: number }[]
  selectedKey: string
  onSelect: (key: string) => void
  color?: string
}) {
  const indicatorAnim = React.useRef(new Animated.Value(0)).current
  const selectedIdx = tabs.findIndex(t => t.key === selectedKey)

  React.useEffect(() => {
    Animated.spring(indicatorAnim, { toValue: selectedIdx >= 0 ? selectedIdx : 0, useNativeDriver: true, tension: 200, friction: 20 }).start()
  }, [selectedIdx, indicatorAnim])

  const tabWidth = 100 / tabs.length

  return (
    <View style={{ borderRadius: Radius.md, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, marginBottom: Space.md, overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row' }}>
        {tabs.map((tab, idx) => (
          <Pressable
            key={tab.key}
            onPress={() => { hapticLight(); onSelect(tab.key) }}
            style={{ flex: 1, paddingVertical: 10, alignItems: 'center' }}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab.key === selectedKey }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{
                fontSize: 12, fontWeight: tab.key === selectedKey ? FontWeight.black : FontWeight.semibold,
                color: tab.key === selectedKey ? color : Colors.textMuted,
              }}>{tab.label}</Text>
              {tab.count !== undefined && (
                <View style={{
                  minWidth: 16, height: 16, borderRadius: 8, paddingHorizontal: 4,
                  backgroundColor: tab.key === selectedKey ? Colors.overlay(color, 0.15) : Colors.overlay(Colors.textMuted, 0.08),
                  justifyContent: 'center', alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 9, fontWeight: FontWeight.bold, color: tab.key === selectedKey ? color : Colors.textMuted }}>{tab.count}</Text>
                </View>
              )}
            </View>
          </Pressable>
        ))}
      </View>
      {/* Animated underline */}
      <Animated.View style={{
        height: 2.5, backgroundColor: color, borderRadius: 2,
        width: `${tabWidth}%` as any,
        transform: [{ translateX: indicatorAnim.interpolate({
          inputRange: tabs.map((_, i) => i),
          outputRange: tabs.map((_, i) => i * (100 / tabs.length)),
        }) as any }],
      }} />
    </View>
  )
}

/** Animated counting stat number */
export function StatsCounter({
  value, label, color = Colors.accent, icon, duration = 800, suffix = '',
}: {
  value: number; label: string; color?: string
  icon?: React.ComponentProps<typeof Icon>['name']
  duration?: number; suffix?: string
}) {
  const [display, setDisplay] = React.useState(0)
  const animRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    const startTime = Date.now()
    const startVal = 0
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(startVal + (value - startVal) * eased))
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate)
      }
    }
    animRef.current = requestAnimationFrame(animate)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [value, duration])

  return (
    <View style={{ alignItems: 'center', gap: 4 }} accessibilityLabel={`${label}: ${value}${suffix}`}>
      {icon && <Icon name={icon} size={16} color={color} />}
      <Text style={{ fontSize: 22, fontWeight: FontWeight.black, color }}>{display}{suffix}</Text>
      <Text style={{ fontSize: 10, color: Colors.textSecondary, fontWeight: FontWeight.semibold }}>{label}</Text>
    </View>
  )
}

/** Timeline item with connected dot and line */
export function TimelineItem({
  title, subtitle, time, icon, color = Colors.accent, isLast = false, children,
}: {
  title: string; subtitle?: string; time?: string
  icon?: React.ComponentProps<typeof Icon>['name']; color?: string
  isLast?: boolean; children?: React.ReactNode
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 12, minHeight: 48 }}>
      {/* Timeline track */}
      <View style={{ alignItems: 'center', width: 28 }}>
        <View style={{
          width: 28, height: 28, borderRadius: 14,
          backgroundColor: Colors.overlay(color, 0.1),
          justifyContent: 'center', alignItems: 'center',
          borderWidth: 2, borderColor: Colors.overlay(color, 0.3),
        }}>
          {icon ? <Icon name={icon} size={12} color={color} /> :
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />}
        </View>
        {!isLast && <View style={{ width: 2, flex: 1, backgroundColor: Colors.overlay(color, 0.15), marginVertical: 2 }} />}
      </View>
      {/* Content */}
      <View style={{ flex: 1, paddingBottom: isLast ? 0 : Space.md }}>
        <View style={[SharedStyles.rowBetween]}>
          <Text style={{ fontSize: 13, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, flex: 1 }} numberOfLines={1}>{title}</Text>
          {time && <Text style={{ fontSize: 10, color: Colors.textMuted }}>{time}</Text>}
        </View>
        {subtitle && <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>{subtitle}</Text>}
        {children}
      </View>
    </View>
  )
}

