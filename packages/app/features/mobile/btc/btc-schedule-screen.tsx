import * as React from 'react'
import { useMemo, useState } from 'react'
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { Colors, SharedStyles, FontWeight, Radius, Space } from '../mobile-theme'
import { Badge, ScreenHeader, ScreenSkeleton, EmptyState, Chip } from '../mobile-ui'
import { Icon, VCTIcons } from '../icons'
import { hapticLight } from '../haptics'
import { useBTCSchedule } from './useBTCData'
import { SLOT_STATUS_CFG, MATCH_TYPE_CFG } from './btc-mock-data'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — BTC Schedule Screen
// Day tabs, arena filter, slot cards with time/category/arena
// ═══════════════════════════════════════════════════════════════

export function BTCScheduleMobileScreen() {
  const router = useRouter()
  const { data: schedule, isLoading, refetch } = useBTCSchedule()
  const [selectedDay, setSelectedDay] = useState(1)
  const [arenaFilter, setArenaFilter] = useState<string | null>(null)

  const days = useMemo(() => {
    const ds = Array.from(new Set((schedule ?? []).map(s => s.day))).sort()
    return ds.length > 0 ? ds : [1, 2]
  }, [schedule])

  const arenas = useMemo(() =>
    Array.from(new Set((schedule ?? []).map(s => s.arena_name))).sort(),
    [schedule]
  )

  const filteredSlots = useMemo(() =>
    (schedule ?? [])
      .filter(s => s.day === selectedDay && (!arenaFilter || s.arena_name === arenaFilter))
      .sort((a, b) => a.start_time.localeCompare(b.start_time)),
    [schedule, selectedDay, arenaFilter]
  )

  const dayStats = useMemo(() => {
    const daySlots = (schedule ?? []).filter(s => s.day === selectedDay)
    return {
      total: daySlots.length,
      completed: daySlots.filter(s => s.status === 'completed').length,
      inProgress: daySlots.filter(s => s.status === 'in_progress').length,
    }
  }, [schedule, selectedDay])

  if (isLoading || !schedule) return <ScreenSkeleton />

  return (
    <ScrollView
      style={SharedStyles.page}
      contentContainerStyle={SharedStyles.scrollContent}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.accent} />}
    >
      <ScreenHeader title="Lịch thi đấu" subtitle={`${schedule.length} trận`} icon={VCTIcons.calendar} onBack={() => router.back()} />

      {/* Day Tabs */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: Space.md }}>
        {days.map(day => (
          <Chip
            key={day}
            label={`Ngày ${day}`}
            selected={selectedDay === day}
            onPress={() => { hapticLight(); setSelectedDay(day) }}
            count={(schedule ?? []).filter(s => s.day === day).length}
          />
        ))}
      </View>

      {/* Arena Filter */}
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: Space.md, flexWrap: 'wrap' }}>
        <Chip label="Tất cả sân" selected={!arenaFilter} onPress={() => setArenaFilter(null)} color={Colors.green} />
        {arenas.map(arena => (
          <Chip key={arena} label={arena} selected={arenaFilter === arena} onPress={() => setArenaFilter(arena)} color={Colors.cyan} />
        ))}
      </View>

      {/* Day Stats */}
      <View style={[SharedStyles.card, { flexDirection: 'row', gap: 12, marginBottom: Space.sm }]}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: FontWeight.extrabold, color: Colors.accent }}>{dayStats.total}</Text>
          <Text style={{ fontSize: 10, color: Colors.textSecondary }}>Tổng</Text>
        </View>
        <View style={{ width: 1, backgroundColor: Colors.border }} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: FontWeight.extrabold, color: Colors.gold }}>{dayStats.inProgress}</Text>
          <Text style={{ fontSize: 10, color: Colors.textSecondary }}>Đang thi</Text>
        </View>
        <View style={{ width: 1, backgroundColor: Colors.border }} />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: FontWeight.extrabold, color: Colors.green }}>{dayStats.completed}</Text>
          <Text style={{ fontSize: 10, color: Colors.textSecondary }}>Xong</Text>
        </View>
      </View>

      {/* Slot Cards */}
      {filteredSlots.length > 0 ? filteredSlots.map(slot => {
        const stCfg = SLOT_STATUS_CFG[slot.status] ?? SLOT_STATUS_CFG['scheduled']!
        const mtCfg = MATCH_TYPE_CFG[slot.match_type] ?? MATCH_TYPE_CFG['doi_khang']!
        return (
          <View key={slot.id} style={[SharedStyles.card, slot.status === 'in_progress' && { borderColor: Colors.gold, borderWidth: 1.5 }]}>
            <View style={[SharedStyles.rowBetween, { marginBottom: 6 }]}>
              <View style={[SharedStyles.row, { gap: 10 }]}>
                <View style={{ alignItems: 'center', minWidth: 50, backgroundColor: Colors.overlay(stCfg.color, 0.08), borderRadius: Radius.sm, padding: 6 }}>
                  <Text style={{ fontSize: 14, fontWeight: FontWeight.extrabold, color: stCfg.color }}>{slot.start_time}</Text>
                  <Text style={{ fontSize: 9, color: Colors.textMuted }}>{slot.end_time}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>{slot.category_name}</Text>
                  <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>{slot.arena_name}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <Badge label={mtCfg.label} bg={Colors.overlay(mtCfg.color, 0.1)} fg={mtCfg.color} />
                <Badge label={stCfg.label} bg={Colors.overlay(stCfg.color, 0.1)} fg={stCfg.color} />
              </View>
            </View>
            {(slot.athlete_a || slot.athlete_b) && (
              <View style={{ marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: Colors.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: Colors.textPrimary }}>{slot.athlete_a ?? '—'}</Text>
                    <Text style={{ fontSize: 9, color: Colors.textMuted }}>{slot.team_a ?? ''}</Text>
                  </View>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.overlay(Colors.accent, 0.1), justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 10, fontWeight: FontWeight.black, color: Colors.accent }}>VS</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: Colors.textPrimary }}>{slot.athlete_b ?? '—'}</Text>
                    <Text style={{ fontSize: 9, color: Colors.textMuted }}>{slot.team_b ?? ''}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )
      }) : (
        <EmptyState icon={VCTIcons.calendar} title="Chưa có lịch thi" message="Lịch thi đấu sẽ hiển thị tại đây." />
      )}
    </ScrollView>
  )
}
