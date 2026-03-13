import * as React from 'react'
import { RefreshControl, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { Colors, SharedStyles, FontWeight } from '../mobile-theme'
import { Badge, ScreenHeader, ScreenSkeleton } from '../mobile-ui'
import { useAthleteTraining } from '../useAthleteData'
import { SESSION_TYPE_CFG, SESSION_STATUS_CFG, MOCK_TYPE_BREAKDOWN } from '../mock-data'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Athlete Training Screen
// Training schedule, attendance stats, session breakdown
// ═══════════════════════════════════════════════════════════════

export function AthleteTrainingMobileScreen() {
  const router = useRouter()
  const { data, isLoading, refetch } = useAthleteTraining()

  if (isLoading || !data) return <ScreenSkeleton />

  const { sessions, stats } = data

  return (
    <ScrollView
      style={SharedStyles.page}
      contentContainerStyle={SharedStyles.scrollContent}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.accent} />}
    >
      <ScreenHeader title="Lịch tập" subtitle="Lịch tập luyện và điểm danh" emoji="📋" onBack={() => router.back()} />

      {/* Attendance Stats */}
      <View style={SharedStyles.statsRow}>
        <View style={SharedStyles.statBox}>
          <Text style={SharedStyles.statValue}>{stats.total}</Text>
          <Text style={SharedStyles.statLabel}>Tổng buổi</Text>
        </View>
        <View style={SharedStyles.statBox}>
          <Text style={[SharedStyles.statValue, { color: Colors.green }]}>{stats.attended}</Text>
          <Text style={SharedStyles.statLabel}>Đã tập</Text>
        </View>
        <View style={SharedStyles.statBox}>
          <Text style={[SharedStyles.statValue, { color: Colors.purple }]}>{stats.streak}</Text>
          <Text style={SharedStyles.statLabel}>Chuỗi</Text>
        </View>
        <View style={SharedStyles.statBox}>
          <Text style={[SharedStyles.statValue, { color: Colors.red }]}>{stats.absent}</Text>
          <Text style={SharedStyles.statLabel}>Vắng</Text>
        </View>
      </View>

      {/* Attendance Rate */}
      <View style={SharedStyles.card}>
        <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginBottom: 6 }}>Tỷ lệ chuyên cần</Text>
        <View style={[SharedStyles.row, { gap: 12 }]}>
          <Text style={{ fontSize: 28, fontWeight: FontWeight.black, color: Colors.green }}>{stats.rate}%</Text>
          <View style={{ flex: 1 }}>
            <View style={{ height: 10, backgroundColor: '#f1f5f9', borderRadius: 5, overflow: 'hidden' }}>
              <View style={{ height: '100%', borderRadius: 5, width: `${stats.rate}%`, backgroundColor: Colors.green }} />
            </View>
          </View>
        </View>
        <Text style={{ fontSize: 10, color: Colors.textSecondary, marginTop: 4 }}>
          🔥 Chuỗi {stats.streak} buổi liên tiếp · {stats.cancelled} buổi hủy
        </Text>
      </View>

      {/* Upcoming Sessions */}
      <Text style={SharedStyles.sectionTitle}>Buổi tập sắp tới</Text>
      {sessions.filter(t => t.status === 'scheduled').map(session => {
        const cfg = SESSION_TYPE_CFG[session.type] ?? SESSION_TYPE_CFG['regular']!
        const stCfg = SESSION_STATUS_CFG[session.status] ?? SESSION_STATUS_CFG['scheduled']!
        return (
          <View key={session.id} style={SharedStyles.card}>
            <View style={[SharedStyles.rowBetween, { marginBottom: 8 }]}>
              <View style={[SharedStyles.row, { gap: 8 }]}>
                <Text style={{ fontSize: 16 }}>{cfg.emoji}</Text>
                <Text style={{ fontSize: 12, fontWeight: FontWeight.extrabold, color: cfg.color }}>{cfg.label}</Text>
              </View>
              <Badge label={stCfg.label} bg={stCfg.bg} fg={stCfg.fg} />
            </View>
            <Text style={{ fontSize: 13, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 4 }}>🕐 {session.time}</Text>
            <Text style={{ fontSize: 11, color: Colors.textSecondary }}>📍 {session.location}</Text>
            <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>👤 {session.coach}</Text>
            <Text style={{ fontSize: 10, color: Colors.textSecondary, marginTop: 4 }}>📅 {session.date}</Text>
          </View>
        )
      })}

      {/* Completed */}
      <Text style={SharedStyles.sectionTitle}>Buổi tập đã hoàn thành</Text>
      {sessions.filter(t => t.status === 'completed').map(session => {
        const cfg = SESSION_TYPE_CFG[session.type] ?? SESSION_TYPE_CFG['regular']!
        const stCfg = SESSION_STATUS_CFG[session.status] ?? SESSION_STATUS_CFG['completed']!
        return (
          <View key={session.id} style={SharedStyles.card}>
            <View style={[SharedStyles.rowBetween, { marginBottom: 4 }]}>
              <View style={[SharedStyles.row, { gap: 8 }]}>
                <Text style={{ fontSize: 14 }}>{cfg.emoji}</Text>
                <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: cfg.color }}>{cfg.label}</Text>
              </View>
              <Badge label={stCfg.label} bg={stCfg.bg} fg={stCfg.fg} />
            </View>
            <Text style={{ fontSize: 12, color: Colors.textPrimary, fontWeight: FontWeight.semibold }}>{session.time} · {session.date}</Text>
            <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>{session.location} · {session.coach}</Text>
          </View>
        )
      })}

      {/* Type Breakdown */}
      <Text style={SharedStyles.sectionTitle}>Phân loại buổi tập</Text>
      <View style={SharedStyles.card}>
        {MOCK_TYPE_BREAKDOWN.map(({ type, count }) => {
          const cfg = SESSION_TYPE_CFG[type] ?? SESSION_TYPE_CFG['regular']!
          const pct = stats.total > 0 ? (count / stats.total) * 100 : 0
          return (
            <View key={type} style={[SharedStyles.row, { gap: 10, marginBottom: 10 }]}>
              <Text style={{ fontSize: 14, width: 20 }}>{cfg.emoji}</Text>
              <Text style={{ fontSize: 11, fontWeight: FontWeight.bold, width: 64, color: cfg.color }}>{cfg.label}</Text>
              <View style={{ flex: 1, height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                <View style={{ height: '100%', borderRadius: 4, width: `${pct}%`, backgroundColor: cfg.color }} />
              </View>
              <Text style={{ fontSize: 12, fontWeight: FontWeight.extrabold, width: 24, textAlign: 'right', color: Colors.textPrimary }}>{count}</Text>
            </View>
          )
        })}
      </View>
    </ScrollView>
  )
}
