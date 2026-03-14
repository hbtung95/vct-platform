import * as React from 'react'
import { useState, useCallback } from 'react'
import { Alert, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { useAuth } from '../../auth/AuthProvider'
import { Colors, SharedStyles, FontWeight, Radius, Space } from '../mobile-theme'
import { Badge, ScreenHeader, ScreenSkeleton, EmptyState, SearchBar, Chip, AnimatedCard } from '../mobile-ui'
import { Icon, VCTIcons } from '../icons'
import { hapticLight, hapticSuccess, hapticError } from '../haptics'
import { useBTCRegistrations } from './useBTCData'
import { approveRegistration, rejectRegistration, isApiAvailable } from './btc-api'
import { REG_STATUS_CFG } from './btc-mock-data'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — BTC Registrations Screen
// Team registrations: search, filter, approve/reject
// ═══════════════════════════════════════════════════════════════

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected'

export function BTCRegistrationsMobileScreen() {
  const router = useRouter()
  const { token } = useAuth()
  const { data: registrations, isLoading, refetch } = useBTCRegistrations()
  const [filter, setFilter] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')

  const searched = (registrations ?? []).filter(r =>
    !search || r.team_name.toLowerCase().includes(search.toLowerCase()) || r.club_name.toLowerCase().includes(search.toLowerCase())
  )
  const filtered = filter === 'all' ? searched : searched.filter(r => r.status === filter)
  const pendingCount = (registrations ?? []).filter(r => r.status === 'pending').length
  const approvedCount = (registrations ?? []).filter(r => r.status === 'approved').length
  const rejectedCount = (registrations ?? []).filter(r => r.status === 'rejected').length

  const handleApprove = useCallback((reg: { id: string; team_name: string }) => {
    Alert.alert('Duyệt đăng ký', `Duyệt đoàn ${reg.team_name}?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Duyệt', onPress: async () => {
          try {
            if (isApiAvailable()) await approveRegistration(token, reg.id)
            hapticSuccess(); refetch()
          } catch { hapticError(); Alert.alert('Lỗi', 'Không thể duyệt') }
        },
      },
    ])
  }, [token, refetch])

  const handleReject = useCallback((reg: { id: string; team_name: string }) => {
    Alert.alert('Từ chối', `Từ chối đoàn ${reg.team_name}?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Từ chối', style: 'destructive', onPress: async () => {
          try {
            if (isApiAvailable()) await rejectRegistration(token, reg.id, 'Không đủ điều kiện')
            hapticSuccess(); refetch()
          } catch { hapticError(); Alert.alert('Lỗi', 'Không thể từ chối') }
        },
      },
    ])
  }, [token, refetch])

  if (isLoading || !registrations) return <ScreenSkeleton />

  return (
    <ScrollView
      style={SharedStyles.page}
      contentContainerStyle={[SharedStyles.scrollContent, { paddingBottom: 40 }]}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.accent} />}
    >
      <ScreenHeader title="Đăng ký" subtitle={`${registrations.length} đoàn`} icon={VCTIcons.clipboard} onBack={() => router.back()} />

      <SearchBar value={search} onChangeText={setSearch} placeholder="Tìm theo tên đoàn..." />

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: Space.md, flexWrap: 'wrap' }}>
        <Chip label="Tất cả" selected={filter === 'all'} onPress={() => setFilter('all')} count={registrations.length} />
        <Chip label="Chờ duyệt" selected={filter === 'pending'} onPress={() => setFilter('pending')} count={pendingCount} color={Colors.gold} />
        <Chip label="Đã duyệt" selected={filter === 'approved'} onPress={() => setFilter('approved')} count={approvedCount} color={Colors.green} />
        <Chip label="Từ chối" selected={filter === 'rejected'} onPress={() => setFilter('rejected')} count={rejectedCount} color={Colors.red} />
      </View>

      {filtered.length > 0 ? filtered.map(reg => {
        const cfg = REG_STATUS_CFG[reg.status] ?? REG_STATUS_CFG['pending']!
        return (
          <AnimatedCard key={reg.id}>
            <View style={[SharedStyles.rowBetween, { marginBottom: 6 }]}>
              <View style={[SharedStyles.row, { gap: 10 }]}>
                <View style={{
                  width: 44, height: 44, borderRadius: 12,
                  backgroundColor: Colors.overlay(cfg.color, 0.08),
                  justifyContent: 'center', alignItems: 'center',
                }}>
                  <Icon name={VCTIcons.people} size={22} color={cfg.color} />
                </View>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>{reg.team_name}</Text>
                  <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>
                    HLV: {reg.coach_name}
                  </Text>
                </View>
              </View>
              <Badge label={cfg.label} bg={cfg.bg} fg={cfg.fg} />
            </View>

            <View style={{ flexDirection: 'row', gap: 16, marginLeft: 54, marginTop: 4 }}>
              <View style={[SharedStyles.row, { gap: 4 }]}>
                <Icon name={VCTIcons.fitness} size={11} color={Colors.textSecondary} />
                <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{reg.athlete_count} VĐV</Text>
              </View>
              <View style={[SharedStyles.row, { gap: 4 }]}>
                <Icon name={VCTIcons.trophy} size={11} color={Colors.textSecondary} />
                <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{reg.category_count} nội dung</Text>
              </View>
              <View style={[SharedStyles.row, { gap: 4 }]}>
                <Icon name={VCTIcons.calendar} size={11} color={Colors.textSecondary} />
                <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{reg.submitted_at}</Text>
              </View>
            </View>

            {reg.status === 'rejected' && reg.reject_reason && (
              <View style={{ marginTop: 8, marginLeft: 54, padding: 8, borderRadius: Radius.sm, backgroundColor: Colors.overlay(Colors.red, 0.06) }}>
                <Text style={{ fontSize: 11, color: Colors.red, fontWeight: FontWeight.semibold }}>Lý do: {reg.reject_reason}</Text>
              </View>
            )}

            {reg.status === 'pending' && (
              <View style={[SharedStyles.row, { gap: 8, marginTop: 10, justifyContent: 'flex-end' }]}>
                <Pressable onPress={() => handleApprove(reg)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.pill, backgroundColor: Colors.overlay(Colors.green, 0.1) }}>
                  <Icon name={VCTIcons.checkmark} size={14} color={Colors.green} />
                  <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: Colors.green }}>Duyệt</Text>
                </Pressable>
                <Pressable onPress={() => handleReject(reg)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.pill, backgroundColor: Colors.overlay(Colors.red, 0.08) }}>
                  <Icon name={VCTIcons.close} size={14} color={Colors.red} />
                  <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: Colors.red }}>Từ chối</Text>
                </Pressable>
              </View>
            )}
          </AnimatedCard>
        )
      }) : (
        <EmptyState icon={VCTIcons.clipboard} title="Chưa có đăng ký" message="Các đoàn sẽ đăng ký tham gia giải tại đây." />
      )}
    </ScrollView>
  )
}
