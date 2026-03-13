import * as React from 'react'
import { RefreshControl, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { Colors, SharedStyles, FontWeight } from '../mobile-theme'
import { ScreenHeader, SkillBar, GoalBar, EmptyState, ScreenSkeleton } from '../mobile-ui'
import { useAthleteProfile } from '../useAthleteData'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Athlete Rankings Screen
// Elo, skills, goals, ranking positions
// ═══════════════════════════════════════════════════════════════

const RANKING_SNAPSHOT = [
  { label: 'Toàn quốc (ĐK Nam 60kg)', rank: '#12', trend: '↑ 3' },
  { label: 'Khu vực phía Nam', rank: '#5', trend: '↑ 1' },
  { label: 'TP. Hồ Chí Minh', rank: '#3', trend: '—' },
]

export function AthleteRankingsMobileScreen() {
  const router = useRouter()
  const { data, isLoading, refetch } = useAthleteProfile()

  if (isLoading || !data) return <ScreenSkeleton />

  return (
    <ScrollView
      style={SharedStyles.page}
      contentContainerStyle={SharedStyles.scrollContent}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.accent} />}
    >
      <ScreenHeader title="BXH & Chỉ số" subtitle="Xếp hạng và thành tích cá nhân" emoji="📊" onBack={() => router.back()} />

      {/* Quick Stats */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <View style={[SharedStyles.statBox, { borderColor: Colors.borderAccent, backgroundColor: Colors.overlay(Colors.accent, 0.06) }]}>
          <Text style={{ fontSize: 16, marginBottom: 4 }}>📊</Text>
          <Text style={[SharedStyles.statValue, { color: Colors.accent, fontSize: 26 }]}>{data.elo}</Text>
          <Text style={[SharedStyles.statLabel, { color: Colors.accentDark }]}>Điểm Elo</Text>
        </View>
        <View style={[SharedStyles.statBox, { borderColor: Colors.overlay(Colors.gold, 0.2), backgroundColor: Colors.overlay(Colors.gold, 0.06) }]}>
          <Text style={{ fontSize: 16, marginBottom: 4 }}>🏅</Text>
          <Text style={[SharedStyles.statValue, { color: Colors.gold, fontSize: 26 }]}>{data.medalCount}</Text>
          <Text style={[SharedStyles.statLabel, { color: '#b45309' }]}>Huy chương</Text>
        </View>
        <View style={[SharedStyles.statBox, { borderColor: Colors.overlay(Colors.green, 0.2), backgroundColor: Colors.overlay(Colors.green, 0.06) }]}>
          <Text style={{ fontSize: 16, marginBottom: 4 }}>🏆</Text>
          <Text style={[SharedStyles.statValue, { color: Colors.green, fontSize: 26 }]}>{data.tournamentCount}</Text>
          <Text style={[SharedStyles.statLabel, { color: '#16a34a' }]}>Giải đấu</Text>
        </View>
      </View>

      {/* Skill Bars */}
      <Text style={SharedStyles.sectionTitle}>Chỉ số kỹ năng</Text>
      <View style={SharedStyles.card}>
        {data.skills.map(sk => <SkillBar key={sk.label} label={sk.label} value={sk.value} color={sk.color} />)}
      </View>

      {/* Goals */}
      <Text style={SharedStyles.sectionTitle}>Mục tiêu cá nhân</Text>
      <View style={SharedStyles.card}>
        {data.goals.map(g => <GoalBar key={g.title} title={g.title} progress={g.progress} color={g.color} icon={g.icon} />)}
      </View>

      {/* Elo History Placeholder */}
      <Text style={SharedStyles.sectionTitle}>Lịch sử xếp hạng</Text>
      <EmptyState emoji="📈" title="Biểu đồ Elo" message="Biểu đồ lịch sử xếp hạng Elo sẽ được hiển thị tại đây. Tính năng đang phát triển." />

      {/* Rankings Snapshot */}
      <Text style={SharedStyles.sectionTitle}>Vị trí xếp hạng</Text>
      <View style={SharedStyles.card}>
        {RANKING_SNAPSHOT.map((r, idx) => (
          <View key={idx} style={[SharedStyles.rowBetween, {
            paddingVertical: 10,
            borderBottomWidth: idx < RANKING_SNAPSHOT.length - 1 ? 1 : 0,
            borderBottomColor: Colors.border,
          }]}>
            <Text style={{ fontSize: 12, fontWeight: FontWeight.semibold, color: Colors.textPrimary, flex: 1 }}>{r.label}</Text>
            <View style={[SharedStyles.row, { gap: 8 }]}>
              <Text style={{ fontSize: 16, fontWeight: FontWeight.black, color: Colors.accent }}>{r.rank}</Text>
              <Text style={{ fontSize: 11, fontWeight: FontWeight.bold, color: r.trend.includes('↑') ? Colors.green : Colors.textSecondary }}>{r.trend}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
