import * as React from 'react'
import { useMemo } from 'react'
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { useAuth } from '../../auth/AuthProvider'
import { Colors, SharedStyles, FontWeight, Radius, Space } from '../mobile-theme'
import { ScreenSkeleton, AnimatedCard, SectionDivider, StatCard } from '../mobile-ui'
import { Icon, VCTIcons } from '../icons'
import { hapticLight } from '../haptics'
import { useBTCStats, useBTCSchedule } from './useBTCData'
import { formatVND, SLOT_STATUS_CFG, MATCH_TYPE_CFG } from './btc-mock-data'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — BTC Portal Screen
// Dashboard hub: stats, alerts, today's schedule, quick actions
// ═══════════════════════════════════════════════════════════════

const QUICK_ACTIONS = [
  { key: 'registrations', label: 'Đăng ký', icon: VCTIcons.clipboard, color: Colors.accent, route: '/btc-registrations' },
  { key: 'schedule', label: 'Lịch thi', icon: VCTIcons.calendar, color: Colors.green, route: '/btc-schedule' },
  { key: 'operations', label: 'Vận hành', icon: VCTIcons.flash, color: Colors.gold, route: '/btc-operations' },
  { key: 'results', label: 'Kết quả', icon: VCTIcons.trophy, color: Colors.purple, route: '/btc-results' },
  { key: 'issues', label: 'Sự cố', icon: VCTIcons.alert, color: Colors.red, route: '/btc-issues' },
  { key: 'finance', label: 'Tài chính', icon: VCTIcons.trending, color: Colors.cyan, route: '/btc-issues' },
] as const

export function BTCPortalMobileScreen() {
  const router = useRouter()
  const { currentUser } = useAuth()
  const { data: stats, isLoading, refetch } = useBTCStats()
  const { data: schedule } = useBTCSchedule()

  const todaySlots = useMemo(() =>
    (schedule ?? []).filter(s => s.day === 1).slice(0, 4),
    [schedule]
  )

  if (isLoading || !stats) return <ScreenSkeleton />

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
          backgroundColor: Colors.overlay(Colors.accent, 0.12),
          justifyContent: 'center', alignItems: 'center',
          borderWidth: 1, borderColor: Colors.overlay(Colors.accent, 0.2),
        }}>
          <Icon name={VCTIcons.trophy} size={26} color={Colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: FontWeight.black, color: Colors.textPrimary, letterSpacing: 0.3 }}>
            Ban Tổ Chức
          </Text>
          <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>
            Giải Vô Địch VCT 2026 · {currentUser?.name?.split(' ').pop() ?? 'Cán bộ'}
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={SharedStyles.statsRow}>
        <StatCard icon={VCTIcons.people} label="Đoàn" value={stats.total_teams} color={Colors.accent} />
        <StatCard icon={VCTIcons.fitness} label="VĐV" value={stats.total_athletes} color={Colors.green} />
        <StatCard icon={VCTIcons.timer} label="Trận h.nay" value={stats.matches_today} color={Colors.gold} />
        <StatCard icon={VCTIcons.stats} label="Tổng trận" value={stats.matches_total} color={Colors.purple} />
      </View>

      {/* Alerts */}
      {stats.pending_registrations > 0 && (
        <Pressable
          onPress={() => { hapticLight(); router.push('/btc-registrations') }}
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
            {stats.pending_registrations} đoàn đăng ký chờ duyệt
          </Text>
          <Icon name={VCTIcons.forward} size={16} color={Colors.gold} />
        </Pressable>
      )}
      {stats.protests_open > 0 && (
        <Pressable
          onPress={() => { hapticLight(); router.push('/btc-issues') }}
          accessibilityRole="button"
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 10,
            padding: Space.md, borderRadius: Radius.md, marginBottom: Space.sm,
            backgroundColor: Colors.overlay(Colors.red, 0.1),
            borderWidth: 1, borderColor: Colors.overlay(Colors.red, 0.2),
          }}
        >
          <Icon name={VCTIcons.warning} size={18} color={Colors.red} />
          <Text style={{ fontSize: 12, color: Colors.red, fontWeight: FontWeight.bold, flex: 1 }}>
            {stats.protests_open} khiếu nại chưa xử lý
          </Text>
          <Icon name={VCTIcons.forward} size={16} color={Colors.red} />
        </Pressable>
      )}

      {/* Quick Actions */}
      <SectionDivider label="Quản lý giải" icon={VCTIcons.settings} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: Space.lg }}>
        {QUICK_ACTIONS.map(a => (
          <AnimatedCard
            key={a.key}
            onPress={() => router.push(a.route)}
            style={{ width: '30%', flexGrow: 1, alignItems: 'center', gap: 8, minHeight: 44 }}
          >
            <View style={{
              width: 42, height: 42, borderRadius: 14,
              backgroundColor: Colors.overlay(a.color, 0.1),
              justifyContent: 'center', alignItems: 'center',
            }}>
              <Icon name={a.icon} size={20} color={a.color} />
            </View>
            <Text style={{ fontSize: 11, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, textAlign: 'center' }}>{a.label}</Text>
          </AnimatedCard>
        ))}
      </View>

      {/* Today's Schedule Preview */}
      {todaySlots.length > 0 && (
        <>
          <SectionDivider label={`Lịch thi hôm nay (${stats.matches_today})`} icon={VCTIcons.timer} />
          {todaySlots.map(slot => {
            const stCfg = SLOT_STATUS_CFG[slot.status] ?? SLOT_STATUS_CFG['scheduled']!
            const mtCfg = MATCH_TYPE_CFG[slot.match_type] ?? MATCH_TYPE_CFG['doi_khang']!
            return (
              <AnimatedCard key={slot.id} onPress={() => router.push('/btc-schedule')}>
                <View style={[SharedStyles.rowBetween]}>
                  <View style={[SharedStyles.row, { gap: 10 }]}>
                    <View style={{ alignItems: 'center', minWidth: 44 }}>
                      <Text style={{ fontSize: 16, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>{slot.start_time}</Text>
                      <Text style={{ fontSize: 9, color: Colors.textMuted }}>{slot.arena_name}</Text>
                    </View>
                    <View style={{ width: 1, height: 30, backgroundColor: Colors.border }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }} numberOfLines={1}>{slot.category_name}</Text>
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 3 }}>
                        <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: Colors.overlay(mtCfg.color, 0.1) }}>
                          <Text style={{ fontSize: 9, fontWeight: FontWeight.bold, color: mtCfg.color }}>{mtCfg.label}</Text>
                        </View>
                        <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: Colors.overlay(stCfg.color, 0.1) }}>
                          <Text style={{ fontSize: 9, fontWeight: FontWeight.bold, color: stCfg.color }}>{stCfg.label}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </AnimatedCard>
            )
          })}
        </>
      )}

      {/* Financial Summary */}
      <SectionDivider label="Tài chính giải" icon={VCTIcons.trending} />
      <View style={[SharedStyles.card, { flexDirection: 'row', gap: 12 }]}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Icon name={VCTIcons.trending} size={16} color={Colors.green} />
          <Text style={{ fontSize: 15, fontWeight: FontWeight.extrabold, color: Colors.green, marginTop: 4 }}>{formatVND(stats.total_income)}</Text>
          <Text style={{ fontSize: 10, color: Colors.textSecondary }}>Thu</Text>
        </View>
        <View style={{ width: 1, backgroundColor: Colors.border }} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Icon name={VCTIcons.trendingDown} size={16} color={Colors.red} />
          <Text style={{ fontSize: 15, fontWeight: FontWeight.extrabold, color: Colors.red, marginTop: 4 }}>{formatVND(stats.total_expense)}</Text>
          <Text style={{ fontSize: 10, color: Colors.textSecondary }}>Chi</Text>
        </View>
        <View style={{ width: 1, backgroundColor: Colors.border }} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Icon name={VCTIcons.stats} size={16} color={Colors.purple} />
          <Text style={{ fontSize: 15, fontWeight: FontWeight.extrabold, color: Colors.purple, marginTop: 4 }}>{formatVND(stats.balance)}</Text>
          <Text style={{ fontSize: 10, color: Colors.textSecondary }}>Số dư</Text>
        </View>
      </View>
    </ScrollView>
  )
}
