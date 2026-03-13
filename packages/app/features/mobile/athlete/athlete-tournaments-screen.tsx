import * as React from 'react'
import { RefreshControl, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { Colors, SharedStyles, FontWeight } from '../mobile-theme'
import { Badge, ScreenHeader, ScreenSkeleton } from '../mobile-ui'
import { useAthleteTournaments } from '../useAthleteData'
import { TOURNAMENT_STATUS_CFG } from '../mock-data'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Athlete Tournaments Screen
// Tournament list with status, docs checklist, progress bars
// ═══════════════════════════════════════════════════════════════

export function AthleteTournamentsMobileScreen() {
  const router = useRouter()
  const { data: tournaments, isLoading, refetch } = useAthleteTournaments()

  if (isLoading || !tournaments) return <ScreenSkeleton />

  const totalOk = tournaments.filter(t => t.status === 'ok').length
  const totalMissing = tournaments.filter(t => t.status === 'missing').length
  const totalRejected = tournaments.filter(t => t.status === 'rejected').length

  return (
    <ScrollView
      style={SharedStyles.page}
      contentContainerStyle={SharedStyles.scrollContent}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.accent} />}
    >
      <ScreenHeader title="Giải đấu" subtitle="Theo dõi thi đấu và hồ sơ" emoji="🏆" onBack={() => router.back()} />

      {/* Stats */}
      <View style={SharedStyles.statsRow}>
        <View style={SharedStyles.statBox}>
          <Text style={SharedStyles.statValue}>{tournaments.length}</Text>
          <Text style={SharedStyles.statLabel}>Tổng giải</Text>
        </View>
        <View style={SharedStyles.statBox}>
          <Text style={[SharedStyles.statValue, { color: Colors.green }]}>{totalOk}</Text>
          <Text style={SharedStyles.statLabel}>Hợp lệ</Text>
        </View>
        <View style={SharedStyles.statBox}>
          <Text style={[SharedStyles.statValue, { color: Colors.gold }]}>{totalMissing}</Text>
          <Text style={SharedStyles.statLabel}>Thiếu HS</Text>
        </View>
        <View style={SharedStyles.statBox}>
          <Text style={[SharedStyles.statValue, { color: Colors.red }]}>{totalRejected}</Text>
          <Text style={SharedStyles.statLabel}>Từ chối</Text>
        </View>
      </View>

      {/* Tournament cards */}
      {tournaments.map(t => {
        const st = TOURNAMENT_STATUS_CFG[t.status] ?? TOURNAMENT_STATUS_CFG['ok']!
        const docs = [
          { l: 'Khám sức khỏe', ok: t.docs.kham_sk },
          { l: 'Bảo hiểm y tế', ok: t.docs.bao_hiem },
          { l: 'CCCD/CMND', ok: t.docs.cmnd },
          { l: 'Ảnh thẻ', ok: t.docs.anh },
        ]
        const okCount = docs.filter(d => d.ok).length
        const pct = (okCount / docs.length) * 100

        return (
          <View key={t.id} style={SharedStyles.card}>
            <View style={[SharedStyles.rowBetween, { alignItems: 'flex-start', marginBottom: 8 }]}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>{t.name}</Text>
                <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 4 }}>📍 {t.doan} · 📅 {t.date}</Text>
              </View>
              <Badge label={st.label} bg={st.bg} fg={st.fg} />
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {t.categories.map((c, i) => (
                <View key={i} style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: Colors.overlay(Colors.accent, 0.1), borderWidth: 1, borderColor: Colors.overlay(Colors.accent, 0.2) }}>
                  <Text style={{ fontSize: 10, fontWeight: FontWeight.bold, color: Colors.accent }}>{c}</Text>
                </View>
              ))}
            </View>

            <View style={[SharedStyles.rowBetween, { marginBottom: 6 }]}>
              <Text style={{ fontSize: 11, fontWeight: FontWeight.bold, color: Colors.textSecondary }}>Tiến độ hồ sơ</Text>
              <Text style={{ fontSize: 11, fontWeight: FontWeight.extrabold, color: pct === 100 ? Colors.green : Colors.gold }}>{okCount}/{docs.length}</Text>
            </View>
            <View style={{ height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden', marginBottom: 10 }}>
              <View style={{ height: '100%', borderRadius: 3, width: `${pct}%`, backgroundColor: pct === 100 ? Colors.green : Colors.gold }} />
            </View>

            {docs.map(d => (
              <View key={d.l} style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10,
                backgroundColor: Colors.bgBase, borderWidth: 1, borderColor: Colors.border, marginBottom: 6,
              }}>
                <Text style={{ fontSize: 12, color: Colors.textSecondary }}>{d.l}</Text>
                <Text style={{ fontSize: 14 }}>{d.ok ? '✅' : '❌'}</Text>
              </View>
            ))}
          </View>
        )
      })}
    </ScrollView>
  )
}
