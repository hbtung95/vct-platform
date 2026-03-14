import * as React from 'react'
import { useState } from 'react'
import { Alert, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { useAuth } from '../../auth/AuthProvider'
import { Colors, SharedStyles, FontWeight, Radius, Space } from '../mobile-theme'
import { Badge, ScreenHeader, ScreenSkeleton, EmptyState, Chip, SectionDivider } from '../mobile-ui'
import { Icon, VCTIcons } from '../icons'
import { hapticLight, hapticSuccess, hapticError } from '../haptics'
import { useBTCProtests, useBTCMeetings } from './useBTCData'
import { updateProtestStatus } from './btc-api'
import { isApiAvailable } from '../api-client'
import { PROTEST_STATUS_CFG } from './btc-mock-data'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — BTC Issues Screen
// Protests + Meetings combined view
// ═══════════════════════════════════════════════════════════════

type IssueTab = 'protests' | 'meetings'

export function BTCIssuesMobileScreen() {
  const router = useRouter()
  const { token } = useAuth()
  const [tab, setTab] = useState<IssueTab>('protests')
  const { data: protests, isLoading: pLoading, refetch: pRefetch } = useBTCProtests()
  const { data: meetings, isLoading: mLoading, refetch: mRefetch } = useBTCMeetings()

  const isLoading = pLoading || mLoading
  const refetch = () => { pRefetch(); mRefetch() }

  const handleProtestAction = (protestId: string, action: 'accepted' | 'rejected') => {
    const label = action === 'accepted' ? 'Chấp nhận' : 'Bác bỏ'
    Alert.alert(label, `${label} khiếu nại này?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: label, style: action === 'rejected' ? 'destructive' : 'default',
        onPress: async () => {
          try {
            if (isApiAvailable()) await updateProtestStatus(token ?? undefined, protestId, action, 'BTC', `${label} bởi BTC`)
            hapticSuccess(); pRefetch()
          } catch { hapticError(); Alert.alert('Lỗi', 'Không thể cập nhật') }
        },
      },
    ])
  }

  if (isLoading) return <ScreenSkeleton />

  return (
    <ScrollView
      style={SharedStyles.page}
      contentContainerStyle={SharedStyles.scrollContent}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={Colors.accent} />}
    >
      <ScreenHeader title="Sự cố & Họp" subtitle="Khiếu nại và họp kỹ thuật" icon={VCTIcons.alert} onBack={() => router.back()} />

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: Space.lg }}>
        <Chip label="Khiếu nại" selected={tab === 'protests'} onPress={() => setTab('protests')} count={(protests ?? []).length} color={Colors.red} />
        <Chip label="Họp KT" selected={tab === 'meetings'} onPress={() => setTab('meetings')} count={(meetings ?? []).length} color={Colors.accent} />
      </View>

      {/* ── PROTESTS TAB ── */}
      {tab === 'protests' && (
        <>
          {(protests ?? []).map(pr => {
            const cfg = PROTEST_STATUS_CFG[pr.trang_thai] ?? PROTEST_STATUS_CFG['pending']!
            return (
              <View key={pr.id} style={[SharedStyles.card, pr.trang_thai === 'pending' && { borderLeftWidth: 3, borderLeftColor: Colors.gold }]}>
                <View style={[SharedStyles.rowBetween, { marginBottom: 6 }]}>
                  <View style={[SharedStyles.row, { gap: 8 }]}>
                    <Icon name={VCTIcons.warning} size={16} color={cfg.color} />
                    <Text style={{ fontSize: 12, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>{pr.team_name}</Text>
                  </View>
                  <Badge label={cfg.label} bg={cfg.bg} fg={cfg.fg} />
                </View>

                <Text style={{ fontSize: 11, color: Colors.textSecondary, marginBottom: 4 }}>{pr.category}</Text>
                <Text style={{ fontSize: 12, color: Colors.textPrimary, lineHeight: 18 }}>{pr.noi_dung}</Text>

                {pr.quyet_dinh && (
                  <View style={{ marginTop: 8, padding: 8, borderRadius: Radius.sm, backgroundColor: Colors.overlay(Colors.green, 0.06) }}>
                    <Text style={{ fontSize: 11, color: Colors.green, fontWeight: FontWeight.semibold }}>Quyết định: {pr.quyet_dinh}</Text>
                  </View>
                )}

                <View style={[SharedStyles.rowBetween, { marginTop: 8 }]}>
                  <Text style={{ fontSize: 10, color: Colors.textMuted }}>{pr.created_at}</Text>
                  {(pr.trang_thai === 'pending' || pr.trang_thai === 'reviewing') && (
                    <View style={[SharedStyles.row, { gap: 6 }]}>
                      <Pressable onPress={() => handleProtestAction(pr.id, 'accepted')}
                        style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.pill, backgroundColor: Colors.overlay(Colors.green, 0.1) }}>
                        <Text style={{ fontSize: 10, fontWeight: FontWeight.bold, color: Colors.green }}>Chấp nhận</Text>
                      </Pressable>
                      <Pressable onPress={() => handleProtestAction(pr.id, 'rejected')}
                        style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.pill, backgroundColor: Colors.overlay(Colors.red, 0.08) }}>
                        <Text style={{ fontSize: 10, fontWeight: FontWeight.bold, color: Colors.red }}>Bác bỏ</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>
            )
          })}
          {(protests ?? []).length === 0 && <EmptyState icon={VCTIcons.checkmark} title="Không có khiếu nại" message="Giải đấu đang diễn ra thuận lợi." />}
        </>
      )}

      {/* ── MEETINGS TAB ── */}
      {tab === 'meetings' && (
        <>
          {(meetings ?? []).map(mt => {
            const isPast = mt.status === 'completed'
            return (
              <View key={mt.id} style={[SharedStyles.card, isPast && { opacity: 0.7 }]}>
                <View style={[SharedStyles.rowBetween, { marginBottom: 6 }]}>
                  <View style={[SharedStyles.row, { gap: 8 }]}>
                    <View style={{
                      width: 36, height: 36, borderRadius: 10,
                      backgroundColor: Colors.overlay(isPast ? Colors.green : Colors.accent, 0.08),
                      justifyContent: 'center', alignItems: 'center',
                    }}>
                      <Icon name={VCTIcons.people} size={18} color={isPast ? Colors.green : Colors.accent} />
                    </View>
                    <View>
                      <Text style={{ fontSize: 13, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>{mt.title}</Text>
                      <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>{mt.date} · {mt.time}</Text>
                    </View>
                  </View>
                  <Badge
                    label={mt.status === 'completed' ? 'Đã họp' : mt.status === 'cancelled' ? 'Hủy' : 'Sắp tới'}
                    bg={Colors.overlay(isPast ? Colors.green : Colors.accent, 0.1)}
                    fg={isPast ? Colors.green : Colors.accent}
                  />
                </View>

                <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                  <View style={[SharedStyles.row, { gap: 4 }]}>
                    <Icon name={VCTIcons.location} size={11} color={Colors.textSecondary} />
                    <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{mt.location}</Text>
                  </View>
                  <View style={[SharedStyles.row, { gap: 4 }]}>
                    <Icon name={VCTIcons.people} size={11} color={Colors.textSecondary} />
                    <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{mt.attendees} đại biểu</Text>
                  </View>
                </View>

                {mt.notes && (
                  <View style={{ marginTop: 8, padding: 8, borderRadius: Radius.sm, backgroundColor: Colors.overlay(Colors.accent, 0.04) }}>
                    <Text style={{ fontSize: 11, color: Colors.textSecondary, lineHeight: 16 }}>{mt.notes}</Text>
                  </View>
                )}
              </View>
            )
          })}
          {(meetings ?? []).length === 0 && <EmptyState icon={VCTIcons.people} title="Chưa có cuộc họp" message="Lịch họp kỹ thuật sẽ hiển thị tại đây." />}
        </>
      )}
    </ScrollView>
  )
}
