// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Notifications Screen
// Push notification inbox with categories: All, Matches,
// Tournaments, System. Supports read/unread, tap-to-navigate.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Platform,
  RefreshControl,
} from 'react-native'
import { useVCTTheme } from '../../theme-provider'
import { VctBadge } from '../../core-ui'
import { useQuery } from '../../data-hooks'
import { triggerHaptic } from '../../haptic-feedback'
import { EmptyState } from '../../error-states'

// ── Types ────────────────────────────────────────────────────

interface NotificationsScreenProps {
  onGoBack?: () => void
  onNavigateMatch?: (matchId: string) => void
  onNavigateTournament?: (tournamentId: string) => void
}

interface NotificationItem {
  id: string
  type: 'match' | 'tournament' | 'system' | 'result'
  title: string
  body: string
  isRead: boolean
  createdAt: string
  data?: { matchId?: string; tournamentId?: string }
}

type FilterTab = 'all' | 'match' | 'tournament' | 'system'

// ── Filter Tabs ──────────────────────────────────────────────

const FILTER_TABS: { key: FilterTab; label: string; emoji: string }[] = [
  { key: 'all', label: 'Tất cả', emoji: '📬' },
  { key: 'match', label: 'Trận đấu', emoji: '⚔️' },
  { key: 'tournament', label: 'Giải đấu', emoji: '🏆' },
  { key: 'system', label: 'Hệ thống', emoji: '⚙️' },
]

// ── Notification Icon ────────────────────────────────────────

function getNotifIcon(type: string): string {
  switch (type) {
    case 'match': return '⚔️'
    case 'tournament': return '🏆'
    case 'result': return '🏅'
    case 'system': return '🔔'
    default: return '📩'
  }
}

// ── Component ────────────────────────────────────────────────

export function ScreenNotifications({
  onGoBack,
  onNavigateMatch,
  onNavigateTournament,
}: NotificationsScreenProps) {
  const { theme } = useVCTTheme()
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [refreshing, setRefreshing] = useState(false)

  const { data: notifications, isLoading, refetch } = useQuery<NotificationItem[]>(
    '/api/v1/notifications',
    { cacheKey: 'notifications', staleTime: 30_000 }
  )

  const fadeAnim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start()
  }, [])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    triggerHaptic('light')
    await refetch()
    setRefreshing(false)
  }, [refetch])

  const filteredList = (notifications ?? []).filter(
    (n) => activeTab === 'all' || n.type === activeTab
  )

  const unreadCount = (notifications ?? []).filter((n) => !n.isRead).length

  const handleItemPress = useCallback((item: NotificationItem) => {
    triggerHaptic('light')
    if (item.data?.matchId) onNavigateMatch?.(item.data.matchId)
    else if (item.data?.tournamentId) onNavigateTournament?.(item.data.tournamentId)
  }, [onNavigateMatch, onNavigateTournament])

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      const now = new Date()
      const diffMs = now.getTime() - d.getTime()
      const diffMin = Math.floor(diffMs / 60_000)
      if (diffMin < 1) return 'Vừa xong'
      if (diffMin < 60) return `${diffMin} phút trước`
      const diffHr = Math.floor(diffMin / 60)
      if (diffHr < 24) return `${diffHr} giờ trước`
      const diffDay = Math.floor(diffHr / 24)
      return `${diffDay} ngày trước`
    } catch { return dateStr }
  }

  const renderItem = useCallback(({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[styles.notifItem, { backgroundColor: item.isRead ? 'transparent' : `${theme.colors.primary}10` }]}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.notifIcon}>{getNotifIcon(item.type)}</Text>
      <View style={styles.notifContent}>
        <Text style={[styles.notifTitle, { color: theme.colors.text, fontWeight: item.isRead ? '500' : '700' }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.notifBody, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {item.body}
        </Text>
        <Text style={[styles.notifTime, { color: theme.colors.textSecondary }]}>
          {formatTime(item.createdAt)}
        </Text>
      </View>
      {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />}
    </TouchableOpacity>
  ), [theme, handleItemPress])

  return (
    <Animated.View style={[styles.container, { backgroundColor: theme.colors.background, opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.colors.text }]}>← Quay lại</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Thông báo</Text>
          {unreadCount > 0 && <VctBadge label={`${unreadCount} mới`} variant="error" />}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabRow}>
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, { backgroundColor: activeTab === tab.key ? theme.colors.primary : theme.colors.surface }]}
            onPress={() => { setActiveTab(tab.key); triggerHaptic('selection') }}
          >
            <Text style={[styles.tabText, { color: activeTab === tab.key ? '#FFF' : theme.colors.textSecondary }]}>
              {tab.emoji} {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
        ListEmptyComponent={
          <EmptyState title="Không có thông báo" message="Các thông báo mới sẽ xuất hiện tại đây." />
        }
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />}
      />
    </Animated.View>
  )
}

// ── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 56 : 40, paddingBottom: 4 },
  backBtn: { paddingVertical: 8 },
  backText: { fontSize: 15, fontWeight: '600' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  headerTitle: { fontSize: 28, fontWeight: '800' },
  tabRow: { flexDirection: 'row', paddingHorizontal: 24, marginTop: 12, marginBottom: 8, gap: 6 },
  tab: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  tabText: { fontSize: 12, fontWeight: '600' },
  listContent: { paddingBottom: 32 },
  notifItem: { flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 14, gap: 12, alignItems: 'flex-start' },
  notifIcon: { fontSize: 24, marginTop: 2 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 15, lineHeight: 20 },
  notifBody: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  notifTime: { fontSize: 11, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 60 },
})
