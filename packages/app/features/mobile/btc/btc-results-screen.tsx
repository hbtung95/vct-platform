import * as React from 'react'
import { useState } from 'react'
import { RefreshControl, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { Colors, SharedStyles, FontWeight, Radius, Space } from '../mobile-theme'
import { Badge, ScreenHeader, ScreenSkeleton, EmptyState, Chip, SectionDivider } from '../mobile-ui'
import { Icon, VCTIcons } from '../icons'
import { useBTCResults, useBTCStandings } from './useBTCData'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — BTC Results & Standings Screen
// Match results + finalize, team standings table
// ═══════════════════════════════════════════════════════════════

type ResultTab = 'results' | 'standings'

const METHOD_LABELS: Record<string, string> = {
  points: 'Điểm', knockout: 'KO', injury: 'Chấn thương',
  walkover: 'Bỏ cuộc', disqualification: 'Truất quyền',
}

export function BTCResultsMobileScreen() {
  const router = useRouter()
  const [tab, setTab] = useState<ResultTab>('results')
  const { data: results, isLoading: rLoading, refetch: rRefetch } = useBTCResults()
  const { data: standings, isLoading: sLoading, refetch: sRefetch } = useBTCStandings()

  const isLoading = rLoading || sLoading
  const refetch = () => { rRefetch(); sRefetch() }

  if (isLoading) return <ScreenSkeleton />

  return (
    <ScrollView
      style={SharedStyles.page}
      contentContainerStyle={SharedStyles.scrollContent}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={Colors.accent} />}
    >
      <ScreenHeader title="Kết quả" subtitle="Trận đấu & toàn đoàn" icon={VCTIcons.trophy} onBack={() => router.back()} />

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: Space.lg }}>
        <Chip label="Trận đấu" selected={tab === 'results'} onPress={() => setTab('results')} count={(results ?? []).length} color={Colors.accent} />
        <Chip label="Toàn đoàn" selected={tab === 'standings'} onPress={() => setTab('standings')} count={(standings ?? []).length} color={Colors.gold} />
      </View>

      {/* ── RESULTS TAB ── */}
      {tab === 'results' && (
        <>
          {(results ?? []).map(mr => (
            <View key={mr.id} style={[SharedStyles.card, mr.status === 'finalized' && { borderLeftWidth: 3, borderLeftColor: Colors.green }]}>
              <View style={[SharedStyles.rowBetween, { marginBottom: 6 }]}>
                <Text style={{ fontSize: 11, color: Colors.textMuted, fontWeight: FontWeight.bold }}>
                  #{mr.match_number} · {mr.category_name}
                </Text>
                <Badge
                  label={mr.status === 'finalized' ? 'Chính thức' : 'Chưa duyệt'}
                  bg={Colors.overlay(mr.status === 'finalized' ? Colors.green : Colors.gold, 0.1)}
                  fg={mr.status === 'finalized' ? Colors.green : Colors.gold}
                />
              </View>

              {/* Matchup */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginVertical: 8 }}>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 13, fontWeight: mr.winner === mr.athlete_a ? FontWeight.black : FontWeight.semibold, color: mr.winner === mr.athlete_a ? Colors.green : Colors.textPrimary }}>{mr.athlete_a}</Text>
                  <Text style={{ fontSize: 9, color: Colors.textMuted }}>{mr.team_a}</Text>
                </View>
                <View style={{ width: 56, alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={{ fontSize: 22, fontWeight: FontWeight.black, color: mr.winner === mr.athlete_a ? Colors.green : Colors.textPrimary }}>{mr.score_a}</Text>
                    <Text style={{ fontSize: 12, color: Colors.textMuted }}>:</Text>
                    <Text style={{ fontSize: 22, fontWeight: FontWeight.black, color: mr.winner === mr.athlete_b ? Colors.green : Colors.textPrimary }}>{mr.score_b}</Text>
                  </View>
                  <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: Colors.overlay(Colors.accent, 0.08), marginTop: 2 }}>
                    <Text style={{ fontSize: 8, fontWeight: FontWeight.bold, color: Colors.accent }}>{METHOD_LABELS[mr.method] ?? mr.method}</Text>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: mr.winner === mr.athlete_b ? FontWeight.black : FontWeight.semibold, color: mr.winner === mr.athlete_b ? Colors.green : Colors.textPrimary }}>{mr.athlete_b}</Text>
                  <Text style={{ fontSize: 9, color: Colors.textMuted }}>{mr.team_b}</Text>
                </View>
              </View>
            </View>
          ))}
          {(results ?? []).length === 0 && <EmptyState icon={VCTIcons.trophy} title="Chưa có kết quả" message="Kết quả trận đấu sẽ hiển thị tại đây." />}
        </>
      )}

      {/* ── STANDINGS TAB ── */}
      {tab === 'standings' && (
        <>
          {/* Table Header */}
          <View style={[SharedStyles.card, { backgroundColor: Colors.bgDark, flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }]}>
            <Text style={{ width: 30, fontSize: 10, fontWeight: FontWeight.black, color: Colors.textMuted, textAlign: 'center' }}>#</Text>
            <Text style={{ flex: 1, fontSize: 10, fontWeight: FontWeight.black, color: Colors.textMuted }}>ĐỘI</Text>
            <Text style={{ width: 30, fontSize: 10, fontWeight: FontWeight.black, color: Colors.gold, textAlign: 'center' }}>🥇</Text>
            <Text style={{ width: 30, fontSize: 10, fontWeight: FontWeight.black, color: '#c0c0c0', textAlign: 'center' }}>🥈</Text>
            <Text style={{ width: 30, fontSize: 10, fontWeight: FontWeight.black, color: '#cd7f32', textAlign: 'center' }}>🥉</Text>
            <Text style={{ width: 35, fontSize: 10, fontWeight: FontWeight.black, color: Colors.accent, textAlign: 'center' }}>Tổng</Text>
          </View>

          {(standings ?? []).map((ts, idx) => (
            <View key={ts.id} style={[SharedStyles.card, { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
              idx === 0 && { borderLeftWidth: 3, borderLeftColor: Colors.gold },
              idx === 1 && { borderLeftWidth: 3, borderLeftColor: '#c0c0c0' },
              idx === 2 && { borderLeftWidth: 3, borderLeftColor: '#cd7f32' },
            ]}>
              <Text style={{ width: 30, fontSize: 16, fontWeight: FontWeight.black, color: idx < 3 ? Colors.gold : Colors.textMuted, textAlign: 'center' }}>{ts.rank}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>{ts.team_name}</Text>
              </View>
              <Text style={{ width: 30, fontSize: 14, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, textAlign: 'center' }}>{ts.gold}</Text>
              <Text style={{ width: 30, fontSize: 14, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, textAlign: 'center' }}>{ts.silver}</Text>
              <Text style={{ width: 30, fontSize: 14, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, textAlign: 'center' }}>{ts.bronze}</Text>
              <Text style={{ width: 35, fontSize: 14, fontWeight: FontWeight.black, color: Colors.accent, textAlign: 'center' }}>{ts.total_medals}</Text>
            </View>
          ))}
          {(standings ?? []).length === 0 && <EmptyState icon={VCTIcons.podium} title="Chưa có xếp hạng" message="Bảng xếp hạng toàn đoàn sẽ hiển thị tại đây." />}
        </>
      )}
    </ScrollView>
  )
}
