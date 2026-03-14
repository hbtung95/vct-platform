import * as React from 'react'
import { RefreshControl, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { Colors, SharedStyles, FontWeight, Radius, Space } from '../mobile-theme'
import { Badge, ScreenHeader, ScreenSkeleton, EmptyState, SearchBar, Chip, StatsCounter, AnimatedCard, SectionDivider } from '../mobile-ui'
import { Icon, VCTIcons } from '../icons'
import { useAthleteResults } from '../useAthleteData'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Athlete Results Screen (v3)
// Uses useAthleteResults() hook with API + mock fallback
// Medal breakdown, Elo, and competition history from real data
// ═══════════════════════════════════════════════════════════════

const MEDAL_CFG = [
  { key: 'gold', label: 'Vàng', color: '#f59e0b', icon: VCTIcons.medal },
  { key: 'silver', label: 'Bạc', color: '#94a3b8', icon: VCTIcons.medal },
  { key: 'bronze', label: 'Đồng', color: '#d97706', icon: VCTIcons.medal },
] as const

export function AthleteResultsMobileScreen() {
  const router = useRouter()
  const { data, isLoading, refetch } = useAthleteResults()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [medalFilter, setMedalFilter] = React.useState<string | null>(null)
  const results = data?.results ?? []
  const medals = data?.medals ?? { gold: 0, silver: 0, bronze: 0, total: 0 }
  const eloRating = data?.eloRating ?? 0
  const totalTournaments = data?.totalTournaments ?? 0

  const filteredResults = React.useMemo(() => {
    let list = results
    if (medalFilter) {
      const emoji = medalFilter === 'gold' ? '🥇' : medalFilter === 'silver' ? '🥈' : '🥉'
      list = list.filter(r => r.medal === emoji)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(r => r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q))
    }
    return list
  }, [results, medalFilter, searchQuery])

  if (isLoading || !data) return <ScreenSkeleton />

  return (
    <ScrollView
      style={SharedStyles.page}
      contentContainerStyle={SharedStyles.scrollContent}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.accent} />}
    >
      <ScreenHeader title="Thành tích" subtitle="Huy chương và lịch sử thi đấu" icon={VCTIcons.trophy} onBack={() => router.back()} />

      {/* Medal Breakdown */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: Space.lg }}>
        {MEDAL_CFG.map(m => {
          const count = medals[m.key as keyof typeof medals] ?? 0
          return (
            <View key={m.key} style={[SharedStyles.statBox, { borderColor: Colors.overlay(m.color, 0.2), backgroundColor: Colors.overlay(m.color, 0.06) }]}>
              <StatsCounter value={count} label={m.label} color={m.color} icon={m.icon} />
            </View>
          )
        })}
      </View>

      {/* Elo & Tournaments */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: Space.lg }}>
        <View style={[SharedStyles.statBox, { borderColor: Colors.overlay(Colors.accent, 0.2) }]}>
          <StatsCounter value={eloRating} label="Elo" color={Colors.accent} icon={VCTIcons.stats} />
        </View>
        <View style={[SharedStyles.statBox, { borderColor: Colors.overlay(Colors.green, 0.2) }]}>
          <StatsCounter value={totalTournaments} label="Giải đấu" color={Colors.green} icon={VCTIcons.trophy} />
        </View>
        <View style={[SharedStyles.statBox, { borderColor: Colors.overlay(Colors.gold, 0.2) }]}>
          <StatsCounter value={medals.total} label="Tổng HC" color={Colors.gold} icon={VCTIcons.medal} />
        </View>
      </View>

      <SectionDivider label="Lịch sử thi đấu" icon={VCTIcons.calendar} />

      <View style={{ marginBottom: Space.md }}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="Tìm giải đấu, nội dung..." />
      </View>
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: Space.lg }}>
        <Chip label="Tất cả" selected={!medalFilter} onPress={() => setMedalFilter(null)} />
        {MEDAL_CFG.map(m => (
          <Chip key={m.key} label={m.label} selected={medalFilter === m.key} onPress={() => setMedalFilter(m.key)} color={m.color} />
        ))}
      </View>

      {/* Competition History */}
      {/* Competition History */}
      {filteredResults.length > 0 ? filteredResults.map(r => (
        <AnimatedCard key={r.id} onPress={() => router.push(`/tournament-detail?id=${r.id}`)}>
          <View style={[SharedStyles.rowBetween, { marginBottom: 6 }]}>
            <Text style={{ fontSize: 14, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, flex: 1 }}>{r.name}</Text>
            {r.medal && (
              <Badge
                label={r.result}
                bg={r.medal === '🥇' ? Colors.overlay('#f59e0b', 0.12) : r.medal === '🥈' ? Colors.overlay('#94a3b8', 0.12) : Colors.overlay('#d97706', 0.12)}
                fg={r.medal === '🥇' ? '#f59e0b' : r.medal === '🥈' ? '#94a3b8' : '#d97706'}
              />
            )}
          </View>
          <View style={[SharedStyles.row, { gap: 8, marginBottom: 2 }]}>
            <Icon name={VCTIcons.fitness} size={12} color={Colors.textSecondary} />
            <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{r.category}</Text>
          </View>
          <View style={[SharedStyles.row, { gap: 8 }]}>
            <Icon name={VCTIcons.calendar} size={12} color={Colors.textSecondary} />
            <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{r.date}</Text>
            {r.result && !r.medal && (
              <>
                <Text style={{ fontSize: 11, color: Colors.textSecondary }}> · </Text>
                <Text style={{ fontSize: 11, fontWeight: FontWeight.bold, color: Colors.textSecondary }}>{r.result}</Text>
              </>
            )}
          </View>
        </AnimatedCard>
      )) : (
        <EmptyState
          icon={VCTIcons.trophy}
          title="Chưa có thành tích"
          message="Thành tích sẽ xuất hiện sau khi bạn tham gia giải đấu."
        />
      )}
    </ScrollView>
  )
}
