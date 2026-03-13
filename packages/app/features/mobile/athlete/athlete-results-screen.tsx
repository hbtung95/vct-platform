import * as React from 'react'
import { RefreshControl, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { Colors, SharedStyles, FontWeight } from '../mobile-theme'
import { ScreenHeader, ScreenSkeleton } from '../mobile-ui'
import { useAthleteResults } from '../useAthleteData'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Athlete Results Screen
// Medal breakdown, competition history, Elo rating
// ═══════════════════════════════════════════════════════════════

export function AthleteResultsMobileScreen() {
  const router = useRouter()
  const { data, isLoading, refetch } = useAthleteResults()

  if (isLoading || !data) return <ScreenSkeleton />

  const { results, medals, eloRating, totalTournaments } = data

  return (
    <ScrollView
      style={SharedStyles.page}
      contentContainerStyle={SharedStyles.scrollContent}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.accent} />}
    >
      <ScreenHeader title="Kết quả thi đấu" subtitle="Thành tích qua các giải đấu" emoji="🏅" onBack={() => router.back()} />

      {/* Medal breakdown */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        {[
          { emoji: '🥇', count: medals.gold, label: 'Vàng', color: '#d97706', borderColor: Colors.overlay('#f59e0b', 0.3) },
          { emoji: '🥈', count: medals.silver, label: 'Bạc', color: '#64748b', borderColor: Colors.overlay('#94a3b8', 0.3) },
          { emoji: '🥉', count: medals.bronze, label: 'Đồng', color: '#c2783e', borderColor: Colors.overlay('#c2783e', 0.3) },
        ].map(m => (
          <View key={m.label} style={[SharedStyles.statBox, { borderColor: m.borderColor, backgroundColor: Colors.overlay(m.color, 0.05) }]}>
            <Text style={{ fontSize: 24, marginBottom: 4 }}>{m.emoji}</Text>
            <Text style={[SharedStyles.statValue, { color: m.color }]}>{m.count}</Text>
            <Text style={[SharedStyles.statLabel, { color: m.color }]}>{m.label}</Text>
          </View>
        ))}
      </View>

      {/* Elo + Total Stats */}
      <View style={SharedStyles.statsRow}>
        <View style={[SharedStyles.statBox, { borderColor: Colors.borderAccent, backgroundColor: Colors.overlay(Colors.accent, 0.05) }]}>
          <Text style={{ fontSize: 12, marginBottom: 2 }}>📊</Text>
          <Text style={[SharedStyles.statValue, { color: Colors.accent }]}>{eloRating}</Text>
          <Text style={SharedStyles.statLabel}>Điểm Elo</Text>
        </View>
        <View style={SharedStyles.statBox}>
          <Text style={{ fontSize: 12, marginBottom: 2 }}>🏆</Text>
          <Text style={SharedStyles.statValue}>{totalTournaments}</Text>
          <Text style={SharedStyles.statLabel}>Tổng giải</Text>
        </View>
        <View style={SharedStyles.statBox}>
          <Text style={{ fontSize: 12, marginBottom: 2 }}>🏅</Text>
          <Text style={[SharedStyles.statValue, { color: Colors.gold }]}>{medals.total}</Text>
          <Text style={SharedStyles.statLabel}>Tổng HC</Text>
        </View>
      </View>

      {/* Competition history */}
      <Text style={SharedStyles.sectionTitle}>Lịch sử thi đấu</Text>
      {results.map((r, idx) => (
        <View key={r.id} style={SharedStyles.card}>
          <View style={[SharedStyles.rowBetween, { marginBottom: 6 }]}>
            <View style={[SharedStyles.row, { gap: 10, flex: 1 }]}>
              <View style={{
                width: 32, height: 32, borderRadius: 10,
                backgroundColor: Colors.overlay(Colors.gold, 0.1), justifyContent: 'center', alignItems: 'center',
              }}>
                <Text style={{ fontSize: 12, fontWeight: FontWeight.extrabold, color: Colors.gold }}>{idx + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>{r.name}</Text>
                <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>{r.category} · {r.date}</Text>
              </View>
            </View>
            <View style={[SharedStyles.row, { gap: 4 }]}>
              <Text style={{ fontSize: 18 }}>{r.medal}</Text>
              <Text style={{ fontSize: 12, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>{r.result}</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  )
}
