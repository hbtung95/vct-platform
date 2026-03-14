import * as React from 'react'
import { RefreshControl, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { Colors, SharedStyles, FontWeight, Space } from '../mobile-theme'
import { Badge, ScreenHeader, ScreenSkeleton, SearchBar, Chip, AnimatedCard, StatsCounter, SectionDivider } from '../mobile-ui'
import { Icon, VCTIcons } from '../icons'
import { useAthleteTraining } from '../useAthleteData'
import { SESSION_TYPE_CFG, SESSION_STATUS_CFG } from '../mock-data'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Athlete Training Screen (v3)
// SVG icons, computed type breakdown (no mock import), tap-to-detail
// ═══════════════════════════════════════════════════════════════

// Icon mapping for session types
const SESSION_ICONS: Record<string, React.ComponentProps<typeof Icon>['name']> = {
  'regular': VCTIcons.calendar,
  'sparring': VCTIcons.flash,
  'exam': VCTIcons.trophy,
  'special': VCTIcons.starOutline,
}

const EMPTY_STATS = {
  total: 0,
  attended: 0,
  streak: 0,
  absent: 0,
  cancelled: 0,
  rate: 0,
}

export function AthleteTrainingMobileScreen() {
  const router = useRouter()
  const { data, isLoading, refetch } = useAthleteTraining()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [typeFilter, setTypeFilter] = React.useState<string | null>(null)
  const sessions = React.useMemo(() => data?.sessions ?? [], [data?.sessions])
  const stats = data?.stats ?? EMPTY_STATS

  // Compute type breakdown from actual sessions instead of mock constant
  const typeBreakdown = React.useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of sessions) {
      counts[s.type] = (counts[s.type] ?? 0) + 1
    }
    return Object.entries(counts).map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
  }, [sessions])

  const filteredUpcoming = React.useMemo(() => {
    let list = sessions.filter(s => s.status === 'scheduled')
    if (typeFilter) list = list.filter(s => s.type === typeFilter)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(s => s.coach.toLowerCase().includes(q) || s.location.toLowerCase().includes(q))
    }
    return list
  }, [sessions, typeFilter, searchQuery])

  const filteredCompleted = React.useMemo(() => {
    let list = sessions.filter(s => s.status === 'completed')
    if (typeFilter) list = list.filter(s => s.type === typeFilter)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(s => s.coach.toLowerCase().includes(q) || s.location.toLowerCase().includes(q))
    }
    return list
  }, [sessions, typeFilter, searchQuery])

  if (isLoading || !data) return <ScreenSkeleton />

  return (
    <ScrollView
      style={SharedStyles.page}
      contentContainerStyle={[SharedStyles.scrollContent, { paddingBottom: 100 }]}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.accent} />}
    >
      <ScreenHeader title="Lịch tập" subtitle="Lịch tập luyện và điểm danh" icon={VCTIcons.calendar} onBack={() => router.back()} />

      {/* Attendance Stats */}
      <View style={SharedStyles.statsRow}>
        <View style={[SharedStyles.statBox, { borderColor: Colors.overlay(Colors.accent, 0.2) }]}>
          <StatsCounter value={stats.total} label="Tổng buổi" color={Colors.accent} icon={VCTIcons.calendar} />
        </View>
        <View style={[SharedStyles.statBox, { borderColor: Colors.overlay(Colors.green, 0.2) }]}>
          <StatsCounter value={stats.attended} label="Đã tập" color={Colors.green} icon={VCTIcons.checkmark} />
        </View>
        <View style={[SharedStyles.statBox, { borderColor: Colors.overlay(Colors.purple, 0.2) }]}>
          <StatsCounter value={stats.streak} label="Chuỗi" color={Colors.purple} icon={VCTIcons.flame} />
        </View>
        <View style={[SharedStyles.statBox, { borderColor: Colors.overlay(Colors.red, 0.2) }]}>
          <StatsCounter value={stats.absent} label="Vắng" color={Colors.red} icon={VCTIcons.alert} />
        </View>
      </View>

      {/* Attendance Rate */}
      <View style={SharedStyles.card} accessibilityLabel={`Tỷ lệ chuyên cần ${stats.rate} phần trăm`}>
        <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginBottom: 6 }}>Tỷ lệ chuyên cần</Text>
        <View style={[SharedStyles.row, { gap: 12 }]}>
          <Text style={{ fontSize: 28, fontWeight: FontWeight.black, color: Colors.green }}>{stats.rate}%</Text>
          <View style={{ flex: 1 }}>
            <View style={{ height: 10, backgroundColor: Colors.trackBg, borderRadius: 5, overflow: 'hidden' }}>
              <View style={{ height: '100%', borderRadius: 5, width: `${stats.rate}%`, backgroundColor: Colors.green }} />
            </View>
          </View>
        </View>
        <View style={[SharedStyles.row, { gap: 6, marginTop: 4 }]}>
          <Icon name={VCTIcons.flame} size={12} color={Colors.textSecondary} />
          <Text style={{ fontSize: 10, color: Colors.textSecondary }}>
            Chuỗi {stats.streak} buổi liên tiếp · {stats.cancelled} buổi hủy
          </Text>
        </View>
      </View>

      {/* Filter Section */}
      <SectionDivider label="Danh sách buổi tập" icon={VCTIcons.list} />
      <View style={{ marginBottom: Space.md }}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Tìm HLV, địa điểm..." />
      </View>
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: Space.lg }}>
        <Chip label="Tất cả" selected={!typeFilter} onPress={() => setTypeFilter(null)} />
        {Object.entries(SESSION_TYPE_CFG).map(([key, cfg]) => (
          <Chip key={key} label={cfg.label} selected={typeFilter === key} onPress={() => setTypeFilter(key)} color={cfg.color} />
        ))}
      </View>

      {/* Upcoming Sessions — tappable */}
      {filteredUpcoming.length > 0 && <Text style={SharedStyles.sectionTitle}>Sắp tới</Text>}
      {filteredUpcoming.map(session => {
        const cfg = SESSION_TYPE_CFG[session.type] ?? SESSION_TYPE_CFG['regular']!
        const stCfg = SESSION_STATUS_CFG[session.status] ?? SESSION_STATUS_CFG['scheduled']!
        const iconName = SESSION_ICONS[session.type] ?? VCTIcons.calendar
        return (
          <AnimatedCard key={session.id} onPress={() => router.push(`/training-detail?id=${session.id}`)}>
            <View style={[SharedStyles.rowBetween, { marginBottom: 8 }]}>
              <View style={[SharedStyles.row, { gap: 8 }]}>
                <Icon name={iconName} size={18} color={cfg.color} />
                <Text style={{ fontSize: 12, fontWeight: FontWeight.extrabold, color: cfg.color }}>{cfg.label}</Text>
              </View>
              <Badge label={stCfg.label} bg={stCfg.bg} fg={stCfg.fg} />
            </View>
            <View style={[SharedStyles.row, { gap: 6, marginBottom: 4 }]}>
              <Icon name={VCTIcons.time} size={14} color={Colors.textPrimary} />
              <Text style={{ fontSize: 13, fontWeight: FontWeight.bold, color: Colors.textPrimary }}>{session.time}</Text>
            </View>
            <View style={[SharedStyles.row, { gap: 6, marginBottom: 2 }]}>
              <Icon name={VCTIcons.location} size={14} color={Colors.textSecondary} />
              <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{session.location}</Text>
            </View>
            <View style={[SharedStyles.row, { gap: 6, marginBottom: 2 }]}>
              <Icon name={VCTIcons.person} size={14} color={Colors.textSecondary} />
              <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{session.coach}</Text>
            </View>
            <View style={[SharedStyles.row, { gap: 6, marginTop: 2 }]}>
              <Icon name={VCTIcons.calendar} size={12} color={Colors.textSecondary} />
              <Text style={{ fontSize: 10, color: Colors.textSecondary }}>{session.date}</Text>
            </View>
          </AnimatedCard>
        )
      })}

      {/* Completed */}
      {filteredCompleted.length > 0 && <Text style={SharedStyles.sectionTitle}>Đã tập</Text>}
      {filteredCompleted.map(session => {
        const cfg = SESSION_TYPE_CFG[session.type] ?? SESSION_TYPE_CFG['regular']!
        const stCfg = SESSION_STATUS_CFG[session.status] ?? SESSION_STATUS_CFG['completed']!
        const iconName = SESSION_ICONS[session.type] ?? VCTIcons.calendar
        return (
          <AnimatedCard key={session.id} onPress={() => router.push(`/training-detail?id=${session.id}`)}>
            <View style={[SharedStyles.rowBetween, { marginBottom: 4 }]}>
              <View style={[SharedStyles.row, { gap: 8 }]}>
                <Icon name={iconName} size={16} color={cfg.color} />
                <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: cfg.color }}>{cfg.label}</Text>
              </View>
              <Badge label={stCfg.label} bg={stCfg.bg} fg={stCfg.fg} />
            </View>
            <Text style={{ fontSize: 12, color: Colors.textPrimary, fontWeight: FontWeight.semibold }}>{session.time} · {session.date}</Text>
            <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>{session.location} · {session.coach}</Text>
          </AnimatedCard>
        )
      })}

      {(!searchQuery && !typeFilter) && (
        <>
          {/* Type Breakdown — computed from sessions */}
          <Text style={SharedStyles.sectionTitle}>Phân loại buổi tập</Text>
          <View style={SharedStyles.card}>
            {typeBreakdown.map(({ type, count }) => {
              const cfg = SESSION_TYPE_CFG[type] ?? SESSION_TYPE_CFG['regular']!
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0
              const iconName = SESSION_ICONS[type] ?? VCTIcons.calendar
              return (
                <View key={type} style={[SharedStyles.row, { gap: 10, marginBottom: 10 }]} accessibilityLabel={`${cfg.label}: ${count} buổi`}>
                  <Icon name={iconName} size={16} color={cfg.color} style={{ width: 20 }} />
                  <Text style={{ fontSize: 11, fontWeight: FontWeight.bold, width: 64, color: cfg.color }}>{cfg.label}</Text>
                  <View style={{ flex: 1, height: 8, backgroundColor: Colors.trackBg, borderRadius: 4, overflow: 'hidden' }}>
                    <View style={{ height: '100%', borderRadius: 4, width: `${pct}%`, backgroundColor: cfg.color }} />
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: FontWeight.extrabold, width: 24, textAlign: 'right', color: Colors.textPrimary }}>{count}</Text>
                </View>
              )
            })}
          </View>
        </>
      )}
    </ScrollView>
  )
}
