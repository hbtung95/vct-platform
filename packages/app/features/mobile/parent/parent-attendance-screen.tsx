import * as React from 'react'
import { useMemo, useState } from 'react'
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { Colors, SharedStyles, FontWeight, Radius, Space } from '../mobile-theme'
import { Badge, ScreenHeader, ScreenSkeleton, EmptyState } from '../mobile-ui'
import { Icon, VCTIcons } from '../icons'
import { hapticLight } from '../haptics'
import { useParentChildren, useChildAttendance } from './useParentData'
import { ATTENDANCE_STATUS_CFG } from './parent-mock-data'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Parent Attendance Screen
// Child selector, stats, heatmap, session list
// ═══════════════════════════════════════════════════════════════

const HEATMAP_COLORS: Record<string, string> = {
  present: '#22c55e',
  late: '#f59e0b',
  absent: '#ef4444',
  none: Colors.bgCard,
}

export function ParentAttendanceMobileScreen() {
  const router = useRouter()
  const { data: children, isLoading: childrenLoading, error: childrenError, refetch: refetchChildren } = useParentChildren()
  const approvedChildren = useMemo(
    () => (children ?? []).filter(c => c.status === 'approved'),
    [children]
  )
  const [selectedId, setSelectedId] = useState('')

  // Auto-select first child
  React.useEffect(() => {
    if (approvedChildren.length > 0 && !selectedId) {
      setSelectedId(approvedChildren[0]!.athlete_id)
    }
  }, [approvedChildren, selectedId])

  const { data: attendance, isLoading: attendanceLoading, error: attendanceError, refetch } = useChildAttendance(selectedId)

  // Compute stats and heatmap before any early return to keep hook order stable.
  const total = attendance.length
  const present = attendance.filter(a => a.status === 'present').length
  const late = attendance.filter(a => a.status === 'late').length
  const absent = attendance.filter(a => a.status === 'absent').length
  const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0

  const heatmapDays = useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]!
      const record = attendance.find(a => a.date === dateStr)
      return { date: dateStr, status: record?.status ?? 'none', day: d.getDate() }
    }).reverse()
  }, [attendance])

  if (childrenLoading) return <ScreenSkeleton />
  if (childrenError) {
    return (
      <ScrollView style={SharedStyles.page} contentContainerStyle={SharedStyles.scrollContent}>
        <ScreenHeader title="Điểm danh" subtitle="Theo dõi chuyên cần tập luyện" icon={VCTIcons.calendar} onBack={() => router.back()} />
        <EmptyState icon={VCTIcons.alert} title="Không tải được dữ liệu" message={childrenError} ctaLabel="Thử lại" onCta={refetchChildren} />
      </ScrollView>
    )
  }

  if (approvedChildren.length === 0) {
    return (
      <ScrollView style={SharedStyles.page} contentContainerStyle={SharedStyles.scrollContent}>
        <ScreenHeader title="Điểm danh" subtitle="Theo dõi chuyên cần tập luyện" icon={VCTIcons.calendar} onBack={() => router.back()} />
        <EmptyState
          icon={VCTIcons.people}
          title="Chưa liên kết con em"
          message="Bạn cần liên kết với tài khoản con em trước khi xem điểm danh."
          ctaLabel="Liên kết ngay"
          onCta={() => router.push('/parent-children')}
        />
      </ScrollView>
    )
  }

  const selectedName = approvedChildren.find(c => c.athlete_id === selectedId)?.athlete_name ?? ''

  return (
    <ScrollView
      style={SharedStyles.page}
      contentContainerStyle={SharedStyles.scrollContent}
      refreshControl={<RefreshControl refreshing={attendanceLoading} onRefresh={refetch} tintColor={Colors.accent} />}
    >
      <ScreenHeader title="Điểm danh" subtitle="Theo dõi chuyên cần tập luyện" icon={VCTIcons.calendar} onBack={() => router.back()} />

      {/* Child Selector */}
      {approvedChildren.length > 1 && (
        <View style={{ marginBottom: Space.lg }}>
          <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase' }}>Chọn con em</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {approvedChildren.map(c => (
              <Pressable
                key={c.athlete_id}
                onPress={() => { hapticLight(); setSelectedId(c.athlete_id) }}
                style={{
                  paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.pill,
                  backgroundColor: selectedId === c.athlete_id ? Colors.overlay(Colors.accent, 0.12) : Colors.bgCard,
                  borderWidth: 1,
                  borderColor: selectedId === c.athlete_id ? Colors.accent : Colors.border,
                }}
              >
                <Text style={{
                  fontSize: 13, fontWeight: FontWeight.bold,
                  color: selectedId === c.athlete_id ? Colors.accent : Colors.textSecondary,
                }}>{c.athlete_name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Attendance Rate */}
      <View style={[SharedStyles.card, { alignItems: 'center', paddingVertical: Space.xl }]}>
        <Text style={{ fontSize: 11, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginBottom: 4, textTransform: 'uppercase' }}>
          Tỷ lệ chuyên cần — {selectedName}
        </Text>
        <Text style={{ fontSize: 48, fontWeight: FontWeight.extrabold, color: rate >= 80 ? Colors.green : rate >= 60 ? Colors.gold : Colors.red }}>
          {rate}%
        </Text>
        <View style={{ height: 6, width: '80%', backgroundColor: Colors.trackBg, borderRadius: 3, overflow: 'hidden', marginTop: 8 }}>
          <View style={{ height: '100%', borderRadius: 3, width: `${rate}%`, backgroundColor: rate >= 80 ? Colors.green : rate >= 60 ? Colors.gold : Colors.red }} />
        </View>
      </View>

      {/* Stats Row */}
      <View style={SharedStyles.statsRow}>
        <View style={SharedStyles.statBox} accessibilityLabel={`${present} có mặt`}>
          <Icon name={VCTIcons.checkmark} size={14} color={Colors.green} style={{ marginBottom: 2 }} />
          <Text style={[SharedStyles.statValue, { color: Colors.green, fontSize: 20 }]}>{present}</Text>
          <Text style={SharedStyles.statLabel}>Có mặt</Text>
        </View>
        <View style={SharedStyles.statBox} accessibilityLabel={`${late} trễ`}>
          <Icon name={VCTIcons.time} size={14} color={Colors.gold} style={{ marginBottom: 2 }} />
          <Text style={[SharedStyles.statValue, { color: Colors.gold, fontSize: 20 }]}>{late}</Text>
          <Text style={SharedStyles.statLabel}>Trễ</Text>
        </View>
        <View style={SharedStyles.statBox} accessibilityLabel={`${absent} vắng`}>
          <Icon name={VCTIcons.alert} size={14} color={Colors.red} style={{ marginBottom: 2 }} />
          <Text style={[SharedStyles.statValue, { color: Colors.red, fontSize: 20 }]}>{absent}</Text>
          <Text style={SharedStyles.statLabel}>Vắng</Text>
        </View>
        <View style={SharedStyles.statBox} accessibilityLabel={`${total} tổng`}>
          <Icon name={VCTIcons.calendar} size={14} color={Colors.accent} style={{ marginBottom: 2 }} />
          <Text style={[SharedStyles.statValue, { color: Colors.accent, fontSize: 20 }]}>{total}</Text>
          <Text style={SharedStyles.statLabel}>Tổng</Text>
        </View>
      </View>

      {/* 28-Day Heatmap */}
      <Text style={SharedStyles.sectionTitle}>Lịch 28 ngày gần nhất</Text>
      <View style={[SharedStyles.card, { paddingVertical: Space.md }]}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
          {heatmapDays.map((day, i) => (
            <View
              key={i}
              style={{
                width: 32, height: 32, borderRadius: 6,
                backgroundColor: HEATMAP_COLORS[day.status] ?? HEATMAP_COLORS.none,
                opacity: day.status === 'none' ? 0.3 : 1,
                justifyContent: 'center', alignItems: 'center',
              }}
              accessibilityLabel={`${day.date}: ${ATTENDANCE_STATUS_CFG[day.status]?.label ?? 'Không có buổi'}`}
            >
              <Text style={{ fontSize: 9, fontWeight: FontWeight.bold, color: day.status === 'none' ? Colors.textMuted : '#fff' }}>
                {day.day}
              </Text>
            </View>
          ))}
        </View>
        {/* Legend */}
        <View style={[SharedStyles.row, { justifyContent: 'center', gap: 12, marginTop: 10 }]}>
          {Object.entries(ATTENDANCE_STATUS_CFG).map(([key, cfg]) => (
            <View key={key} style={[SharedStyles.row, { gap: 4 }]}>
              <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: cfg.color }} />
              <Text style={{ fontSize: 9, color: Colors.textSecondary }}>{cfg.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Session List */}
      <Text style={SharedStyles.sectionTitle}>Chi tiết buổi tập</Text>
      {attendanceError ? (
        <EmptyState icon={VCTIcons.alert} title="Không tải được điểm danh" message={attendanceError} ctaLabel="Thử lại" onCta={refetch} />
      ) : attendance.length > 0 ? attendance.map((a, i) => {
        const statusCfg = ATTENDANCE_STATUS_CFG[a.status] ?? ATTENDANCE_STATUS_CFG['present']!
        return (
          <View key={i} style={SharedStyles.card}>
            <View style={[SharedStyles.rowBetween]}>
              <View style={[SharedStyles.row, { gap: 10 }]}>
                <View style={{
                  width: 32, height: 32, borderRadius: 8,
                  backgroundColor: Colors.overlay(statusCfg.color, 0.1),
                  justifyContent: 'center', alignItems: 'center',
                }}>
                  <Icon
                    name={a.status === 'present' ? VCTIcons.checkmark : a.status === 'late' ? VCTIcons.time : VCTIcons.alert}
                    size={16} color={statusCfg.color}
                  />
                </View>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: FontWeight.bold, color: Colors.textPrimary }}>{a.session}</Text>
                  <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{a.date} · {a.coach}</Text>
                </View>
              </View>
              <Badge label={statusCfg.label} bg={Colors.overlay(statusCfg.color, 0.1)} fg={statusCfg.color} />
            </View>
          </View>
        )
      }) : (
        <EmptyState icon={VCTIcons.calendar} title="Chưa có dữ liệu" message="Dữ liệu điểm danh sẽ xuất hiện khi con em tham gia tập luyện." />
      )}
    </ScrollView>
  )
}
