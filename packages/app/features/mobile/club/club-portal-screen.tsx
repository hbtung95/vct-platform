import * as React from 'react'
import { useMemo } from 'react'
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { useAuth } from '../../auth/AuthProvider'
import { Colors, SharedStyles, FontWeight, Radius, Space } from '../mobile-theme'
import { Badge, ScreenSkeleton, AnimatedCard, SectionDivider, StatCard } from '../mobile-ui'
import { Icon, VCTIcons } from '../icons'
import { hapticLight } from '../haptics'
import { useClubDashboard, useClubClasses } from './useClubData'
import { formatVND, DAY_LABELS, CLASS_STATUS_CFG, MOCK_FINANCE, MOCK_MEMBERS } from './club-mock-data'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Club Portal Screen (v2)
// Dashboard hub: stats, alerts, quick actions, today's classes, recent activity
// ═══════════════════════════════════════════════════════════════

const QUICK_ACTIONS = [
  { key: 'members', label: 'Thành viên', icon: VCTIcons.people, color: Colors.accent, route: '/club-members' },
  { key: 'classes', label: 'Lớp học', icon: VCTIcons.book, color: Colors.green, route: '/club-classes' },
  { key: 'finance', label: 'Tài chính', icon: VCTIcons.trending, color: Colors.purple, route: '/club-finance' },
  { key: 'attendance', label: 'Điểm danh', icon: VCTIcons.calendar, color: Colors.gold, route: '/club-attendance' },
  { key: 'tournaments', label: 'Giải đấu', icon: VCTIcons.shield, color: '#3b82f6', route: '/club-delegation-portal' },
] as const

// Recent activity mock (will be API-driven later)
function getRecentActivity() {
  const items = [
    { type: 'member', text: 'Lê Minh Quân đăng ký tham gia CLB', time: '2 giờ trước', color: Colors.accent, icon: VCTIcons.person },
    { type: 'finance', text: 'Thu học phí Lớp Cơ Bản: +12.5tr', time: '5 giờ trước', color: Colors.green, icon: VCTIcons.trending },
    { type: 'attendance', text: 'Điểm danh Lớp Nâng Cao: 13/15', time: 'Hôm qua', color: Colors.gold, icon: VCTIcons.checkmark },
  ]
  return items
}

export function ClubPortalMobileScreen() {
  const router = useRouter()
  const { currentUser } = useAuth()
  const { data: dashboard, isLoading, refetch } = useClubDashboard()
  const { data: classes } = useClubClasses()

  const todayDow = useMemo(() => { const d = new Date().getDay(); return d === 0 ? 7 : d }, [])
  const todayClasses = useMemo(() =>
    (classes ?? []).filter(c => c.status === 'active' && c.sessions.some(s => s.day_of_week === todayDow)),
    [classes, todayDow]
  )
  const recentActivity = useMemo(() => getRecentActivity(), [])

  if (isLoading || !dashboard) return <ScreenSkeleton />

  return (
    <ScrollView
      style={SharedStyles.page}
      contentContainerStyle={SharedStyles.scrollContent}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.accent} />}
    >
      {/* Greeting */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Space.lg, paddingHorizontal: 2 }}>
        <View style={{
          width: 52, height: 52, borderRadius: 16,
          backgroundColor: Colors.overlay(Colors.green, 0.12),
          justifyContent: 'center', alignItems: 'center',
          borderWidth: 1, borderColor: Colors.overlay(Colors.green, 0.2),
        }}>
          <Icon name={VCTIcons.shield} size={26} color={Colors.green} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: FontWeight.black, color: Colors.textPrimary, letterSpacing: 0.3 }}>
            {dashboard.club_name}
          </Text>
          <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>
            {dashboard.club_type} · Quản lý bởi {currentUser?.name?.split(' ').pop() ?? 'Chủ nhiệm'}
          </Text>
        </View>
      </View>

      {/* Stats Grid — using StatCard */}
      <View style={SharedStyles.statsRow}>
        <StatCard icon={VCTIcons.people} label="Thành viên" value={dashboard.active_members} color={Colors.accent} trend="up" />
        <StatCard icon={VCTIcons.book} label="Lớp học" value={dashboard.active_classes} color={Colors.green} />
        <StatCard icon={VCTIcons.trending} label="Số dư" value={formatVND(dashboard.balance)} color={dashboard.balance >= 0 ? Colors.purple : Colors.red} trend={dashboard.balance >= 0 ? 'up' : 'down'} />
        <StatCard icon={VCTIcons.checkmark} label="Chuyên cần" value={`${dashboard.attendance_rate}%`} color={dashboard.attendance_rate >= 80 ? Colors.green : Colors.gold} />
      </View>

      {/* Alerts */}
      {dashboard.pending_members > 0 && (
        <Pressable
          onPress={() => { hapticLight(); router.push('/club-members') }}
          accessibilityRole="button"
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 10,
            padding: Space.md, borderRadius: Radius.md, marginBottom: Space.sm,
            backgroundColor: Colors.overlay(Colors.gold, 0.1),
            borderWidth: 1, borderColor: Colors.overlay(Colors.gold, 0.2),
          }}
        >
          <Icon name={VCTIcons.alert} size={18} color={Colors.gold} />
          <Text style={{ fontSize: 12, color: Colors.gold, fontWeight: FontWeight.bold, flex: 1 }}>
            {dashboard.pending_members} thành viên chờ duyệt
          </Text>
          <Icon name={VCTIcons.forward} size={16} color={Colors.gold} />
        </Pressable>
      )}

      {dashboard.balance < 0 && (
        <Pressable
          onPress={() => { hapticLight(); router.push('/club-finance') }}
          accessibilityRole="button"
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 10,
            padding: Space.md, borderRadius: Radius.md, marginBottom: Space.sm,
            backgroundColor: Colors.overlay(Colors.red, 0.1),
            borderWidth: 1, borderColor: Colors.overlay(Colors.red, 0.2),
          }}
        >
          <Icon name={VCTIcons.alert} size={18} color={Colors.red} />
          <Text style={{ fontSize: 12, color: Colors.red, fontWeight: FontWeight.bold, flex: 1 }}>
            Số dư quỹ đang âm, cần điều chỉnh thu chi
          </Text>
          <Icon name={VCTIcons.forward} size={16} color={Colors.red} />
        </Pressable>
      )}

      {/* Quick Actions */}
      <SectionDivider label="Quản lý" icon={VCTIcons.settings} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: Space.lg }}>
        {QUICK_ACTIONS.map(action => (
          <AnimatedCard
            key={action.key}
            onPress={() => router.push(action.route)}
            style={{ width: '47%', flexGrow: 1, alignItems: 'center', gap: 8, minHeight: 44 }}
          >
            <View style={{
              width: 42, height: 42, borderRadius: 14,
              backgroundColor: Colors.overlay(action.color, 0.1),
              justifyContent: 'center', alignItems: 'center',
            }}>
              <Icon name={action.icon} size={20} color={action.color} />
            </View>
            <Text style={{ fontSize: 12, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>{action.label}</Text>
          </AnimatedCard>
        ))}
      </View>

      {/* Today's Classes Preview */}
      {todayClasses.length > 0 && (
        <>
          <SectionDivider label={`Lớp hôm nay (${todayClasses.length})`} icon={VCTIcons.calendar} />
          {todayClasses.map(cls => {
            const todaySession = cls.sessions.find(s => s.day_of_week === todayDow)
            return (
              <AnimatedCard key={cls.id} onPress={() => router.push('/club-classes')}>
                <View style={[SharedStyles.rowBetween]}>
                  <View style={[SharedStyles.row, { gap: 10 }]}>
                    <View style={{
                      width: 40, height: 40, borderRadius: 12,
                      backgroundColor: Colors.overlay(Colors.green, 0.1),
                      justifyContent: 'center', alignItems: 'center',
                    }}>
                      <Icon name={VCTIcons.book} size={20} color={Colors.green} />
                    </View>
                    <View>
                      <Text style={{ fontSize: 14, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>{cls.name}</Text>
                      <Text style={{ fontSize: 11, color: Colors.textSecondary }}>
                        {todaySession?.start_time}–{todaySession?.end_time} · HLV {cls.coach_name}
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 14, fontWeight: FontWeight.extrabold, color: Colors.accent }}>{cls.current_students}/{cls.max_students}</Text>
                    <Text style={{ fontSize: 9, color: Colors.textMuted }}>học viên</Text>
                  </View>
                </View>
              </AnimatedCard>
            )
          })}
        </>
      )}

      {/* Financial Summary */}
      <SectionDivider label="Tài chính tháng này" icon={VCTIcons.trending} />
      <View style={[SharedStyles.card, { flexDirection: 'row', gap: 12 }]}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Icon name={VCTIcons.trending} size={16} color={Colors.green} />
          <Text style={{ fontSize: 16, fontWeight: FontWeight.extrabold, color: Colors.green, marginTop: 4 }}>{formatVND(dashboard.total_income)}</Text>
          <Text style={{ fontSize: 10, color: Colors.textSecondary }}>Thu</Text>
        </View>
        <View style={{ width: 1, backgroundColor: Colors.border }} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Icon name={VCTIcons.trendingDown} size={16} color={Colors.red} />
          <Text style={{ fontSize: 16, fontWeight: FontWeight.extrabold, color: Colors.red, marginTop: 4 }}>{formatVND(dashboard.total_expense)}</Text>
          <Text style={{ fontSize: 10, color: Colors.textSecondary }}>Chi</Text>
        </View>
        <View style={{ width: 1, backgroundColor: Colors.border }} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Icon name={VCTIcons.stats} size={16} color={Colors.purple} />
          <Text style={{ fontSize: 16, fontWeight: FontWeight.extrabold, color: Colors.purple, marginTop: 4 }}>{formatVND(dashboard.balance)}</Text>
          <Text style={{ fontSize: 10, color: Colors.textSecondary }}>Số dư</Text>
        </View>
      </View>

      {/* Recent Activity Feed */}
      <SectionDivider label="Hoạt động gần đây" icon={VCTIcons.time} />
      {recentActivity.map((item, idx) => (
        <View key={idx} style={[SharedStyles.card, { flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
          <View style={{
            width: 32, height: 32, borderRadius: 8,
            backgroundColor: Colors.overlay(item.color, 0.1),
            justifyContent: 'center', alignItems: 'center',
          }}>
            <Icon name={item.icon} size={16} color={item.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: Colors.textPrimary }} numberOfLines={1}>{item.text}</Text>
            <Text style={{ fontSize: 10, color: Colors.textMuted, marginTop: 2 }}>{item.time}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  )
}
