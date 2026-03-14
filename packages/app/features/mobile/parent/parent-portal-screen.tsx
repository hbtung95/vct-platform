import * as React from 'react'
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { useAuth } from '../../auth/AuthProvider'
import { Colors, SharedStyles, FontWeight, Radius, Space, Touch } from '../mobile-theme'
import { Badge, EmptyState, ScreenSkeleton } from '../mobile-ui'
import { Icon, VCTIcons } from '../icons'
import { hapticLight } from '../haptics'
import { useParentDashboard } from './useParentData'
import { LINK_STATUS_CFG } from './parent-mock-data'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Parent Portal Screen
// Dashboard hub: stats, children cards, results, quick actions
// ═══════════════════════════════════════════════════════════════

const QUICK_ACTIONS = [
  { key: 'children', label: 'Con em', icon: VCTIcons.people, color: Colors.accent, route: '/parent-children' },
  { key: 'consents', label: 'Đồng thuận', icon: VCTIcons.clipboard, color: Colors.green, route: '/parent-consents' },
  { key: 'attendance', label: 'Điểm danh', icon: VCTIcons.calendar, color: Colors.gold, route: '/parent-attendance' },
  { key: 'results', label: 'Thành tích', icon: VCTIcons.trophy, color: Colors.purple, route: '/parent-children' },
] as const

export function ParentPortalMobileScreen() {
  const router = useRouter()
  const { currentUser } = useAuth()
  const { data: dashboard, isLoading, error, refetch } = useParentDashboard()

  if (isLoading) return <ScreenSkeleton />
  if (error) {
    return (
      <ScrollView style={SharedStyles.page} contentContainerStyle={SharedStyles.scrollContent}>
        <EmptyState
          icon={VCTIcons.alert}
          title="Không tải được dữ liệu"
          message={error}
          ctaLabel="Thử lại"
          onCta={refetch}
        />
      </ScrollView>
    )
  }
  if (!dashboard) return <ScreenSkeleton />

  const stats = [
    { label: 'Con em', value: dashboard.children_count, icon: VCTIcons.people, color: Colors.accent },
    { label: 'Đồng thuận', value: dashboard.active_consents, icon: VCTIcons.checkmark, color: Colors.green },
    { label: 'Chờ duyệt', value: dashboard.pending_consents, icon: VCTIcons.time, color: Colors.gold },
    { label: 'Sự kiện', value: dashboard.upcoming_events, icon: VCTIcons.trophy, color: Colors.purple },
  ]

  return (
    <ScrollView
      style={SharedStyles.page}
      contentContainerStyle={SharedStyles.scrollContent}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.accent} />}
    >
      {/* Greeting */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 12,
        marginBottom: Space.lg, paddingHorizontal: 2,
      }}>
        <View style={{
          width: 48, height: 48, borderRadius: 14,
          backgroundColor: Colors.overlay(Colors.accent, 0.12),
          justifyContent: 'center', alignItems: 'center',
        }}>
          <Icon name={VCTIcons.people} size={24} color={Colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>
            Xin chào, {currentUser?.name?.split(' ').pop() ?? 'Phụ huynh'}
          </Text>
          <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>
            Cổng Phụ Huynh — Quản lý hoạt động con em
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={SharedStyles.statsRow}>
        {stats.map(s => (
          <View key={s.label} style={SharedStyles.statBox} accessibilityLabel={`${s.value} ${s.label}`}>
            <Icon name={s.icon} size={16} color={s.color} style={{ marginBottom: 4 }} />
            <Text style={[SharedStyles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={SharedStyles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Pending Consents Alert */}
      {dashboard.pending_consents > 0 && (
        <Pressable
          onPress={() => { hapticLight(); router.push('/parent-consents') }}
          accessibilityRole="button"
          accessibilityLabel={`${dashboard.pending_consents} đồng thuận chờ xử lý`}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 10,
            padding: Space.md, borderRadius: Radius.md, marginBottom: Space.md,
            backgroundColor: Colors.overlay(Colors.gold, 0.1),
            borderWidth: 1, borderColor: Colors.overlay(Colors.gold, 0.2),
          }}
        >
          <Icon name={VCTIcons.alert} size={18} color={Colors.gold} />
          <Text style={{ fontSize: 12, color: Colors.gold, fontWeight: FontWeight.bold, flex: 1 }}>
            {dashboard.pending_consents} đồng thuận cần xác nhận
          </Text>
          <Icon name={VCTIcons.forward} size={16} color={Colors.gold} />
        </Pressable>
      )}

      {/* Quick Actions */}
      <Text style={SharedStyles.sectionTitle}>Thao tác nhanh</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: Space.lg }}>
        {QUICK_ACTIONS.map(action => (
          <Pressable
            key={action.key}
            style={{
              width: '47%', flexGrow: 1,
              borderRadius: Radius.lg, padding: Space.md,
              backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
              alignItems: 'center', gap: 8, minHeight: 44,
            }}
            onPress={() => { hapticLight(); router.push(action.route) }}
            accessibilityRole="button"
            accessibilityLabel={action.label}
          >
            <View style={{
              width: 40, height: 40, borderRadius: 12,
              backgroundColor: Colors.overlay(action.color, 0.1),
              justifyContent: 'center', alignItems: 'center',
            }}>
              <Icon name={action.icon} size={20} color={action.color} />
            </View>
            <Text style={{ fontSize: 12, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Children Quick Cards */}
      <Text style={SharedStyles.sectionTitle}>Con em của bạn</Text>
      {dashboard.children.map(child => {
        const stCfg = LINK_STATUS_CFG[child.status] ?? LINK_STATUS_CFG['pending']!
        return (
          <Pressable
            key={child.id}
            style={SharedStyles.card}
            onPress={() => { hapticLight(); router.push('/parent-children') }}
            accessibilityRole="button"
            accessibilityLabel={`${child.athlete_name}: ${stCfg.label}`}
          >
            <View style={[SharedStyles.rowBetween]}>
              <View style={[SharedStyles.row, { gap: 12 }]}>
                <View style={{
                  width: 44, height: 44, borderRadius: 12,
                  backgroundColor: Colors.overlay(Colors.accent, 0.08),
                  justifyContent: 'center', alignItems: 'center',
                }}>
                  <Icon name={VCTIcons.fitness} size={22} color={Colors.accent} />
                </View>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>{child.athlete_name}</Text>
                  <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>
                    {child.club_name} · {child.belt_level} · {child.relation}
                  </Text>
                </View>
              </View>
              <Badge label={stCfg.label} bg={stCfg.bg} fg={stCfg.fg} />
            </View>
          </Pressable>
        )
      })}

      {/* Recent Results */}
      <Text style={SharedStyles.sectionTitle}>Thành tích gần đây</Text>
      {dashboard.recent_results.length > 0 ? dashboard.recent_results.slice(0, 4).map((r, i) => (
        <View key={i} style={SharedStyles.card}>
          <Text style={{ fontSize: 14, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, marginBottom: 4 }}>{r.result}</Text>
          <View style={[SharedStyles.row, { gap: 6 }]}>
            <Icon name={VCTIcons.trophy} size={12} color={Colors.textSecondary} />
            <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{r.tournament} · {r.category}</Text>
          </View>
          <View style={[SharedStyles.row, { gap: 6, marginTop: 2 }]}>
            <Icon name={VCTIcons.calendar} size={12} color={Colors.textSecondary} />
            <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{r.date}</Text>
          </View>
        </View>
      )) : (
        <View style={[SharedStyles.card, { alignItems: 'center', paddingVertical: Space.xxl }]}>
          <Icon name={VCTIcons.trophy} size={28} color={Colors.textMuted} />
          <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 8 }}>Chưa có thành tích</Text>
        </View>
      )}
    </ScrollView>
  )
}
