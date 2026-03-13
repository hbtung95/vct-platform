import * as React from 'react'
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { useAuth } from '../../auth/AuthProvider'
import { Colors, SharedStyles, FontWeight, Radius } from '../mobile-theme'
import { Badge, SkillBar, GoalBar, ScreenSkeleton } from '../mobile-ui'
import { useAthleteProfile } from '../useAthleteData'
import { TOURNAMENT_STATUS_CFG } from '../mock-data'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Athlete Portal Screen
// Dashboard overview: profile, stats, skills, goals, belt timeline
// ═══════════════════════════════════════════════════════════════

export function AthletePortalMobileScreen() {
  const { currentUser } = useAuth()
  const router = useRouter()
  const { data, isLoading, refetch } = useAthleteProfile()

  if (isLoading || !data) return <ScreenSkeleton />

  return (
    <ScrollView
      style={SharedStyles.page}
      contentContainerStyle={SharedStyles.scrollContent}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.accent} />}
    >
      {/* HERO */}
      <View style={SharedStyles.heroCard}>
        <View style={{
          width: 72, height: 72, borderRadius: 36,
          backgroundColor: Colors.overlay(Colors.accent, 0.2), justifyContent: 'center', alignItems: 'center',
          marginBottom: 12, borderWidth: 2, borderColor: Colors.overlay(Colors.accent, 0.4),
        }}>
          <Text style={{ fontSize: 32 }}>🥋</Text>
        </View>
        <Text style={{ fontSize: 22, fontWeight: FontWeight.black, color: Colors.textWhite, marginBottom: 4 }}>
          {currentUser.name || data.name}
        </Text>
        <Text style={{ fontSize: 13, color: Colors.textMuted, fontWeight: FontWeight.semibold }}>
          Vận động viên · {data.club}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <Badge label={`🥋 ${data.belt}`} bg={Colors.overlay(Colors.gold, 0.15)} fg={Colors.gold} />
          <Badge label={`📊 Elo: ${data.elo}`} bg={Colors.overlay(Colors.accent, 0.15)} fg={Colors.accent} />
          {data.isActive && <Badge label="✅ Đang hoạt động" bg={Colors.overlay(Colors.green, 0.15)} fg={Colors.green} />}
        </View>
      </View>

      {/* STATS */}
      <View style={SharedStyles.statsRow}>
        <View style={SharedStyles.statBox}>
          <Text style={SharedStyles.statValue}>{data.tournamentCount}</Text>
          <Text style={SharedStyles.statLabel}>Giải đấu</Text>
        </View>
        <View style={SharedStyles.statBox}>
          <Text style={[SharedStyles.statValue, { color: Colors.gold }]}>{data.medalCount}</Text>
          <Text style={SharedStyles.statLabel}>Huy chương</Text>
        </View>
        <View style={SharedStyles.statBox}>
          <Text style={[SharedStyles.statValue, { color: Colors.green }]}>{data.attendanceRate}%</Text>
          <Text style={SharedStyles.statLabel}>Tỷ lệ tập</Text>
        </View>
      </View>

      {/* QUICK ACTIONS */}
      <Text style={SharedStyles.sectionTitle}>Truy cập nhanh</Text>
      <View style={SharedStyles.actionRow}>
        <Pressable style={SharedStyles.actionBtn} onPress={() => router.push('/athlete-tournaments')}>
          <Text style={SharedStyles.actionIcon}>🏆</Text>
          <Text style={SharedStyles.actionLabel}>Giải đấu</Text>
        </Pressable>
        <Pressable style={SharedStyles.actionBtn} onPress={() => router.push('/athlete-training')}>
          <Text style={SharedStyles.actionIcon}>📋</Text>
          <Text style={SharedStyles.actionLabel}>Lịch tập</Text>
        </Pressable>
        <Pressable style={SharedStyles.actionBtn} onPress={() => router.push('/athlete-results')}>
          <Text style={SharedStyles.actionIcon}>🏅</Text>
          <Text style={SharedStyles.actionLabel}>Thành tích</Text>
        </Pressable>
        <Pressable style={SharedStyles.actionBtn} onPress={() => router.push('/athlete-rankings')}>
          <Text style={SharedStyles.actionIcon}>📊</Text>
          <Text style={SharedStyles.actionLabel}>Xếp hạng</Text>
        </Pressable>
      </View>

      {/* SKILL BARS */}
      <Text style={SharedStyles.sectionTitle}>Chỉ số kỹ năng</Text>
      <View style={SharedStyles.card}>
        {data.skills.map(sk => <SkillBar key={sk.label} label={sk.label} value={sk.value} color={sk.color} />)}
        <View style={[SharedStyles.rowBetween, { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10, marginTop: 6 }]}>
          <Text style={{ fontSize: 11, color: Colors.textSecondary }}>
            Trung bình: <Text style={{ fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>
              {Math.round(data.skills.reduce((a, sk) => a + sk.value, 0) / data.skills.length)}
            </Text>/100
          </Text>
          <Text style={{ fontSize: 11, fontWeight: FontWeight.extrabold, color: Colors.purple }}>💪 Tốt</Text>
        </View>
      </View>

      {/* GOALS */}
      <Text style={SharedStyles.sectionTitle}>Mục tiêu cá nhân</Text>
      <View style={SharedStyles.card}>
        {data.goals.map(g => <GoalBar key={g.title} title={g.title} progress={g.progress} color={g.color} icon={g.icon} />)}
      </View>

      {/* BELT TIMELINE */}
      <Text style={SharedStyles.sectionTitle}>Hành trình thăng đai</Text>
      <View style={SharedStyles.card}>
        {data.beltHistory.map((b, idx) => (
          <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: idx < data.beltHistory.length - 1 ? 14 : 0, position: 'relative' }}>
            {idx < data.beltHistory.length - 1 && (
              <View style={{ position: 'absolute', left: 5, top: 14, height: 26, width: 2, backgroundColor: Colors.border }} />
            )}
            <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: Colors.bgCard, backgroundColor: b.color }} />
            <View style={[SharedStyles.rowBetween, { flex: 1 }]}>
              <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: Colors.textPrimary }}>{b.belt}</Text>
              <Text style={{ fontSize: 10, color: Colors.textSecondary, fontFamily: 'monospace' }}>{b.date}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
