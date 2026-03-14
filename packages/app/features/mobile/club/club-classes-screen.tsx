import * as React from 'react'
import { useMemo } from 'react'
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { Colors, SharedStyles, FontWeight, Radius, Space } from '../mobile-theme'
import { Badge, ScreenHeader, ScreenSkeleton, EmptyState } from '../mobile-ui'
import { Icon, VCTIcons } from '../icons'
import { hapticLight } from '../haptics'
import { useClubClasses } from './useClubData'
import { CLASS_STATUS_CFG, DAY_LABELS, formatVND } from './club-mock-data'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Club Classes Screen
// Class list with schedule, capacity progress, status
// ═══════════════════════════════════════════════════════════════

export function ClubClassesMobileScreen() {
  const router = useRouter()
  const { data: classes, isLoading, refetch } = useClubClasses()

  const todayDow = useMemo(() => { const d = new Date().getDay(); return d === 0 ? 7 : d }, [])

  if (isLoading || !classes) return <ScreenSkeleton />

  const activeCount = classes.filter(c => c.status === 'active').length
  const totalStudents = classes.reduce((s, c) => s + c.current_students, 0)

  return (
    <ScrollView
      style={SharedStyles.page}
      contentContainerStyle={SharedStyles.scrollContent}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.accent} />}
    >
      <ScreenHeader title="Lớp học" subtitle={`${classes.length} lớp · ${totalStudents} học viên`} icon={VCTIcons.book} onBack={() => router.back()} />

      {/* Stats */}
      <View style={SharedStyles.statsRow}>
        <View style={SharedStyles.statBox}>
          <Icon name={VCTIcons.book} size={14} color={Colors.green} style={{ marginBottom: 2 }} />
          <Text style={[SharedStyles.statValue, { color: Colors.green, fontSize: 20 }]}>{activeCount}</Text>
          <Text style={SharedStyles.statLabel}>Hoạt động</Text>
        </View>
        <View style={SharedStyles.statBox}>
          <Icon name={VCTIcons.people} size={14} color={Colors.accent} style={{ marginBottom: 2 }} />
          <Text style={[SharedStyles.statValue, { color: Colors.accent, fontSize: 20 }]}>{totalStudents}</Text>
          <Text style={SharedStyles.statLabel}>Học viên</Text>
        </View>
        <View style={SharedStyles.statBox}>
          <Icon name={VCTIcons.calendar} size={14} color={Colors.gold} style={{ marginBottom: 2 }} />
          <Text style={[SharedStyles.statValue, { color: Colors.gold, fontSize: 20 }]}>
            {classes.filter(c => c.sessions.some(s => s.day_of_week === todayDow)).length}
          </Text>
          <Text style={SharedStyles.statLabel}>Hôm nay</Text>
        </View>
      </View>

      {/* Class List */}
      {classes.length > 0 ? classes.map(cls => {
        const stCfg = CLASS_STATUS_CFG[cls.status] ?? CLASS_STATUS_CFG['active']!
        const capacity = cls.max_students > 0 ? Math.round((cls.current_students / cls.max_students) * 100) : 0
        const hasToday = cls.sessions.some(s => s.day_of_week === todayDow)
        return (
          <View key={cls.id} style={[SharedStyles.card, hasToday && { borderColor: Colors.overlay(Colors.green, 0.3), borderWidth: 1 }]}>
            <View style={[SharedStyles.rowBetween, { marginBottom: 8 }]}>
              <View style={[SharedStyles.row, { gap: 10 }]}>
                <View style={{
                  width: 40, height: 40, borderRadius: 12,
                  backgroundColor: hasToday ? Colors.overlay(Colors.green, 0.1) : Colors.overlay(Colors.accent, 0.08),
                  justifyContent: 'center', alignItems: 'center',
                }}>
                  <Icon name={VCTIcons.book} size={20} color={hasToday ? Colors.green : Colors.accent} />
                </View>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>{cls.name}</Text>
                  <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>
                    HLV: {cls.coach_name}
                  </Text>
                </View>
              </View>
              <Badge label={stCfg.label} bg={stCfg.bg} fg={stCfg.fg} />
            </View>

            {/* Schedule chips */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {cls.sessions.map((s, i) => (
                <View key={i} style={{
                  flexDirection: 'row', alignItems: 'center', gap: 4,
                  paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.sm,
                  backgroundColor: s.day_of_week === todayDow ? Colors.overlay(Colors.green, 0.1) : Colors.bgInput,
                }}>
                  <Text style={{
                    fontSize: 10, fontWeight: FontWeight.bold,
                    color: s.day_of_week === todayDow ? Colors.green : Colors.textSecondary,
                  }}>
                    {DAY_LABELS[s.day_of_week] ?? `T${s.day_of_week}`} {s.start_time}-{s.end_time}
                  </Text>
                </View>
              ))}
            </View>

            {/* Capacity bar */}
            <View style={{ marginBottom: 4 }}>
              <View style={[SharedStyles.rowBetween, { marginBottom: 4 }]}>
                <Text style={{ fontSize: 10, color: Colors.textSecondary }}>Sĩ số: {cls.current_students}/{cls.max_students}</Text>
                <Text style={{ fontSize: 10, fontWeight: FontWeight.bold, color: capacity >= 90 ? Colors.red : capacity >= 70 ? Colors.gold : Colors.green }}>{capacity}%</Text>
              </View>
              <View style={{ height: 4, backgroundColor: Colors.trackBg, borderRadius: 2, overflow: 'hidden' }}>
                <View style={{ height: '100%', borderRadius: 2, width: `${Math.min(capacity, 100)}%`, backgroundColor: capacity >= 90 ? Colors.red : capacity >= 70 ? Colors.gold : Colors.green }} />
              </View>
            </View>

            {/* Fee */}
            <View style={[SharedStyles.row, { gap: 6, marginTop: 6 }]}>
              <Icon name={VCTIcons.trending} size={11} color={Colors.textMuted} />
              <Text style={{ fontSize: 10, color: Colors.textMuted }}>Học phí: {formatVND(cls.monthly_fee)}/tháng</Text>
            </View>
          </View>
        )
      }) : (
        <EmptyState icon={VCTIcons.book} title="Chưa có lớp học" message="Liên hệ ban quản lý để tạo lớp mới." />
      )}
    </ScrollView>
  )
}
