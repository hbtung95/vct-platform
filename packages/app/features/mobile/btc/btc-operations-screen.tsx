import * as React from 'react'
import { useState } from 'react'
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { Colors, SharedStyles, FontWeight, Radius, Space } from '../mobile-theme'
import { Badge, ScreenHeader, ScreenSkeleton, EmptyState, Chip, SectionDivider } from '../mobile-ui'
import { Icon, VCTIcons } from '../icons'
import { hapticLight } from '../haptics'
import { useBTCWeighIns, useBTCDraws, useBTCRefereeAssignments } from './useBTCData'
import { WEIGHIN_RESULT_CFG, REFEREE_ROLE_CFG } from './btc-mock-data'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — BTC Operations Screen
// Combined: Weigh-in + Draw + Referee Assignments
// ═══════════════════════════════════════════════════════════════

type OpTab = 'weighin' | 'draw' | 'referee'

export function BTCOperationsMobileScreen() {
  const router = useRouter()
  const [tab, setTab] = useState<OpTab>('weighin')
  const { data: weighIns, isLoading: wiLoading, refetch: wiRefetch } = useBTCWeighIns()
  const { data: draws, isLoading: drLoading, refetch: drRefetch } = useBTCDraws()
  const { data: assignments, isLoading: raLoading, refetch: raRefetch } = useBTCRefereeAssignments()

  const isLoading = wiLoading || drLoading || raLoading
  const refetch = () => { wiRefetch(); drRefetch(); raRefetch() }

  if (isLoading) return <ScreenSkeleton />

  return (
    <ScrollView
      style={SharedStyles.page}
      contentContainerStyle={SharedStyles.scrollContent}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={Colors.accent} />}
    >
      <ScreenHeader title="Vận hành" subtitle="Cân, bốc thăm, trọng tài" icon={VCTIcons.flash} onBack={() => router.back()} />

      {/* Tab Selector */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: Space.lg }}>
        <Chip label="Cân" selected={tab === 'weighin'} onPress={() => setTab('weighin')} count={(weighIns ?? []).length} color={Colors.green} />
        <Chip label="Bốc thăm" selected={tab === 'draw'} onPress={() => setTab('draw')} count={(draws ?? []).length} color={Colors.purple} />
        <Chip label="Trọng tài" selected={tab === 'referee'} onPress={() => setTab('referee')} count={(assignments ?? []).length} color={Colors.gold} />
      </View>

      {/* ── WEIGH-IN TAB ── */}
      {tab === 'weighin' && (
        <>
          {/* Stats */}
          <View style={[SharedStyles.card, { flexDirection: 'row', gap: 12, marginBottom: Space.sm }]}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: FontWeight.extrabold, color: Colors.green }}>{(weighIns ?? []).filter(w => w.result === 'pass').length}</Text>
              <Text style={{ fontSize: 10, color: Colors.textSecondary }}>Đạt</Text>
            </View>
            <View style={{ width: 1, backgroundColor: Colors.border }} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: FontWeight.extrabold, color: Colors.red }}>{(weighIns ?? []).filter(w => w.result === 'fail').length}</Text>
              <Text style={{ fontSize: 10, color: Colors.textSecondary }}>Không đạt</Text>
            </View>
            <View style={{ width: 1, backgroundColor: Colors.border }} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: FontWeight.extrabold, color: Colors.accent }}>{(weighIns ?? []).length}</Text>
              <Text style={{ fontSize: 10, color: Colors.textSecondary }}>Tổng</Text>
            </View>
          </View>

          {(weighIns ?? []).map(wi => {
            const cfg = WEIGHIN_RESULT_CFG[wi.result] ?? WEIGHIN_RESULT_CFG['pending']!
            return (
              <View key={wi.id} style={SharedStyles.card}>
                <View style={[SharedStyles.rowBetween]}>
                  <View style={[SharedStyles.row, { gap: 10 }]}>
                    <View style={{
                      width: 40, height: 40, borderRadius: 10,
                      backgroundColor: Colors.overlay(cfg.color, 0.08),
                      justifyContent: 'center', alignItems: 'center',
                    }}>
                      <Icon name={VCTIcons.barbell} size={20} color={cfg.color} />
                    </View>
                    <View>
                      <Text style={{ fontSize: 13, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>{wi.athlete_name}</Text>
                      <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{wi.team_name} · {wi.category}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 16, fontWeight: FontWeight.extrabold, color: cfg.color }}>{wi.weight}kg</Text>
                    <Badge label={cfg.label} bg={Colors.overlay(cfg.color, 0.1)} fg={cfg.color} />
                  </View>
                </View>
              </View>
            )
          })}
          {(weighIns ?? []).length === 0 && <EmptyState icon={VCTIcons.barbell} title="Chưa có dữ liệu cân" message="Dữ liệu cân sẽ hiển thị tại đây." />}
        </>
      )}

      {/* ── DRAW TAB ── */}
      {tab === 'draw' && (
        <>
          {(draws ?? []).map(dr => (
            <View key={dr.id} style={SharedStyles.card}>
              <View style={[SharedStyles.rowBetween, { marginBottom: 6 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>{dr.category_name}</Text>
                  <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>{dr.bracket_type === 'single_elimination' ? 'Loại trực tiếp' : dr.bracket_type === 'round_robin' ? 'Vòng tròn' : 'Loại kép'}</Text>
                </View>
                <Badge label={dr.status === 'confirmed' ? 'Xác nhận' : 'Nháp'} bg={Colors.overlay(dr.status === 'confirmed' ? Colors.green : Colors.gold, 0.1)} fg={dr.status === 'confirmed' ? Colors.green : Colors.gold} />
              </View>
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 4 }}>
                <View style={[SharedStyles.row, { gap: 4 }]}>
                  <Icon name={VCTIcons.fitness} size={11} color={Colors.textSecondary} />
                  <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{dr.total_athletes} VĐV</Text>
                </View>
                <View style={[SharedStyles.row, { gap: 4 }]}>
                  <Icon name={VCTIcons.star} size={11} color={Colors.textSecondary} />
                  <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{dr.seed_count} hạt giống</Text>
                </View>
              </View>
            </View>
          ))}
          {(draws ?? []).length === 0 && <EmptyState icon={VCTIcons.stats} title="Chưa bốc thăm" message="Kết quả bốc thăm sẽ hiển thị tại đây." />}
        </>
      )}

      {/* ── REFEREE TAB ── */}
      {tab === 'referee' && (
        <>
          {/* Group by arena */}
          {Array.from(new Set((assignments ?? []).map(a => a.arena_name))).map(arena => (
            <React.Fragment key={arena}>
              <SectionDivider label={arena} icon={VCTIcons.location} />
              {(assignments ?? []).filter(a => a.arena_name === arena).map(ra => (
                <View key={ra.id} style={[SharedStyles.card, { flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
                  <View style={{
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: Colors.overlay(Colors.gold, 0.08),
                    justifyContent: 'center', alignItems: 'center',
                  }}>
                    <Icon name={VCTIcons.person} size={18} color={Colors.gold} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>{ra.referee_name}</Text>
                    <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{REFEREE_ROLE_CFG[ra.role] ?? ra.role}</Text>
                  </View>
                  <Badge label={ra.session === 'morning' ? 'Sáng' : ra.session === 'afternoon' ? 'Chiều' : 'Tối'} bg={Colors.overlay(Colors.accent, 0.1)} fg={Colors.accent} />
                </View>
              ))}
            </React.Fragment>
          ))}
          {(assignments ?? []).length === 0 && <EmptyState icon={VCTIcons.people} title="Chưa phân công" message="Phân công trọng tài sẽ hiển thị tại đây." />}
        </>
      )}
    </ScrollView>
  )
}
