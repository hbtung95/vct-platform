import * as React from 'react'
import { useMemo, useState } from 'react'
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { Colors, SharedStyles, FontWeight, Radius, Space } from '../mobile-theme'
import { Badge, ScreenHeader, ScreenSkeleton, EmptyState } from '../mobile-ui'
import { Icon, VCTIcons } from '../icons'
import { hapticLight, hapticSuccess } from '../haptics'
import { useClubClasses, useClubAttendance, useClubAttendanceSummary } from './useClubData'
import { ATTENDANCE_STATUS_CFG } from './club-mock-data'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Club Attendance Screen
// Class selector, daily attendance sheet, stats
// ═══════════════════════════════════════════════════════════════

export function ClubAttendanceMobileScreen() {
  const router = useRouter()
  const { data: classes, isLoading: classesLoading } = useClubClasses()
  const [selectedClassId, setSelectedClassId] = useState('')
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0]!, [])

  // Auto-select first active class
  React.useEffect(() => {
    if (classes && classes.length > 0 && !selectedClassId) {
      const active = classes.find(c => c.status === 'active')
      if (active) setSelectedClassId(active.id)
    }
  }, [classes, selectedClassId])

  const { data: attendance, isLoading: attendanceLoading, refetch } = useClubAttendance(selectedClassId || undefined, todayStr)
  const { data: summary } = useClubAttendanceSummary()

  if (classesLoading) return <ScreenSkeleton />

  if (!classes || classes.length === 0) {
    return (
      <ScrollView style={SharedStyles.page} contentContainerStyle={SharedStyles.scrollContent}>
        <ScreenHeader title="Điểm danh" subtitle="Ghi nhận điểm danh hàng ngày" icon={VCTIcons.calendar} onBack={() => router.back()} />
        <EmptyState icon={VCTIcons.book} title="Chưa có lớp học" message="Cần tạo lớp học trước khi điểm danh." />
      </ScrollView>
    )
  }

  const selectedClassName = classes.find(c => c.id === selectedClassId)?.name ?? ''

  // Stats
  const present = attendance.filter(a => a.status === 'present').length
  const late = attendance.filter(a => a.status === 'late').length
  const absent = attendance.filter(a => a.status === 'absent').length
  const total = attendance.length

  return (
    <ScrollView
      style={SharedStyles.page}
      contentContainerStyle={SharedStyles.scrollContent}
      refreshControl={<RefreshControl refreshing={attendanceLoading} onRefresh={refetch} tintColor={Colors.accent} />}
    >
      <ScreenHeader title="Điểm danh" subtitle="Ghi nhận điểm danh hàng ngày" icon={VCTIcons.calendar} onBack={() => router.back()} />

      {/* Class Selector */}
      <View style={{ marginBottom: Space.lg }}>
        <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase' }}>Chọn lớp</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {classes.filter(c => c.status === 'active').map(c => (
            <Pressable
              key={c.id}
              onPress={() => { hapticLight(); setSelectedClassId(c.id) }}
              style={{
                paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.pill,
                backgroundColor: selectedClassId === c.id ? Colors.overlay(Colors.accent, 0.12) : Colors.bgCard,
                borderWidth: 1,
                borderColor: selectedClassId === c.id ? Colors.accent : Colors.border,
              }}
            >
              <Text style={{
                fontSize: 13, fontWeight: FontWeight.bold,
                color: selectedClassId === c.id ? Colors.accent : Colors.textSecondary,
              }}>{c.name}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Overall attendance rate */}
      {summary && (
        <View style={[SharedStyles.card, { alignItems: 'center', paddingVertical: Space.xl, marginBottom: Space.sm }]}>
          <Text style={{ fontSize: 11, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginBottom: 4, textTransform: 'uppercase' }}>
            Tỷ lệ chuyên cần tổng
          </Text>
          <Text style={{ fontSize: 42, fontWeight: FontWeight.extrabold, color: summary.attendance_rate >= 80 ? Colors.green : summary.attendance_rate >= 60 ? Colors.gold : Colors.red }}>
            {summary.attendance_rate}%
          </Text>
          <View style={{ height: 6, width: '70%', backgroundColor: Colors.trackBg, borderRadius: 3, overflow: 'hidden', marginTop: 6 }}>
            <View style={{ height: '100%', borderRadius: 3, width: `${summary.attendance_rate}%`, backgroundColor: summary.attendance_rate >= 80 ? Colors.green : summary.attendance_rate >= 60 ? Colors.gold : Colors.red }} />
          </View>
        </View>
      )}

      {/* Daily Stats */}
      <Text style={SharedStyles.sectionTitle}>Hôm nay — {selectedClassName}</Text>
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
          <Icon name={VCTIcons.people} size={14} color={Colors.accent} style={{ marginBottom: 2 }} />
          <Text style={[SharedStyles.statValue, { color: Colors.accent, fontSize: 20 }]}>{total}</Text>
          <Text style={SharedStyles.statLabel}>Tổng</Text>
        </View>
      </View>

      {/* Attendance Records */}
      <Text style={SharedStyles.sectionTitle}>Danh sách điểm danh</Text>
      {attendance.length > 0 ? attendance.map(a => {
        const statusCfg = ATTENDANCE_STATUS_CFG[a.status] ?? ATTENDANCE_STATUS_CFG['present']!
        return (
          <View key={a.id} style={SharedStyles.card}>
            <View style={[SharedStyles.rowBetween]}>
              <View style={[SharedStyles.row, { gap: 10 }]}>
                <View style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: Colors.overlay(statusCfg.color, 0.1),
                  justifyContent: 'center', alignItems: 'center',
                }}>
                  <Icon
                    name={a.status === 'present' ? VCTIcons.checkmark : a.status === 'late' ? VCTIcons.time : VCTIcons.alert}
                    size={18} color={statusCfg.color}
                  />
                </View>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: FontWeight.bold, color: Colors.textPrimary }}>{a.member_name}</Text>
                  <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{a.class_name} · {a.recorded_by}</Text>
                </View>
              </View>
              <Badge label={statusCfg.label} bg={Colors.overlay(statusCfg.color, 0.1)} fg={statusCfg.color} />
            </View>
          </View>
        )
      }) : (
        <EmptyState icon={VCTIcons.calendar} title="Chưa có điểm danh" message="Dữ liệu điểm danh sẽ xuất hiện khi ghi nhận." />
      )}
    </ScrollView>
  )
}
