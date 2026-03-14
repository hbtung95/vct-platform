import * as React from 'react'
import { StyleSheet, Text, View, RefreshControl, ScrollView, Pressable, Alert } from 'react-native'
import { Colors, FontWeight, Radius, Space, SharedStyles } from '../mobile-theme'
import { Icon, VCTIcons } from '../icons'
import { hapticLight, hapticSelection, hapticSuccess } from '../haptics'
import { useFederationApprovals } from './useFederationData'
import type { FederationApprovalAPI } from './federation-api'

// ═══════════════════════════════════════════════════════════════
// FEDERATION APPROVALS (DUYỆT HỒ SƠ) SCREEN
// ═══════════════════════════════════════════════════════════════

const s = StyleSheet.create({
  card: {
    padding: Space.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgCard,
    marginBottom: Space.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Space.sm },
  title: { fontSize: 16, fontWeight: FontWeight.black, color: Colors.textWhite, flex: 1, marginRight: Space.md },
  
  description: { fontSize: 14, color: Colors.textSecondary, marginBottom: Space.md, lineHeight: 20 },
  metaText: { fontSize: 12, color: Colors.textMuted, marginBottom: 4 },

  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.sm, backgroundColor: Colors.bgBase, alignSelf: 'flex-start', marginBottom: Space.md },
  typeText: { fontSize: 11, fontWeight: FontWeight.bold, color: Colors.accent },

  actionsRow: { flexDirection: 'row', gap: Space.md, marginTop: Space.sm },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  btnReject: { backgroundColor: Colors.overlay(Colors.red, 0.15), borderWidth: 1, borderColor: Colors.overlay(Colors.red, 0.3) },
  btnApprove: { backgroundColor: Colors.green },
  textReject: { color: Colors.red, fontWeight: FontWeight.bold, fontSize: 14 },
  textApprove: { color: Colors.bgDark, fontWeight: FontWeight.black, fontSize: 14 },

  statusText: { fontSize: 14, fontWeight: FontWeight.bold, textAlign: 'center', marginTop: Space.sm },
})

const TYPE_LABELS: Record<string, string> = {
  club_registration: 'Thành lập CLB',
  athlete_transfer: 'Chuyển nhượng',
  rank_promotion: 'Thăng cấp',
  tournament_sanction: 'Tổ chức giải',
}

export function FederationApprovalsMobileScreen() {
  const { data: approvals, isLoading, processApproval } = useFederationApprovals()
  const [refreshing, setRefreshing] = React.useState(false)

  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
    hapticLight()
  }, [])

  const handleAction = (item: FederationApprovalAPI, action: 'approve' | 'reject') => {
    hapticSelection()
    Alert.alert(
      action === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối',
      `Bạn có chắc chắn muốn ${action === 'approve' ? 'duyệt' : 'từ chối'} yêu cầu này?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xác nhận', 
          style: action === 'approve' ? 'default' : 'destructive',
          onPress: async () => {
             await processApproval(item.id, action)
             hapticSuccess()
          }
        }
      ]
    )
  }

  if (isLoading && !refreshing) return <View style={SharedStyles.page} />

  // Show pending first, then others
  const sorted = [...approvals].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1
    if (a.status !== 'pending' && b.status === 'pending') return 1
    return 0
  })

  return (
    <ScrollView 
      style={SharedStyles.page} 
      contentContainerStyle={{ padding: Space.xl, paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
    >
      <Text style={[SharedStyles.sectionTitle, { marginBottom: 16 }]}>Hồ sơ chờ duyệt</Text>

      {sorted.map(item => {
        const isPending = item.status === 'pending'
        return (
          <View key={item.id} style={s.card}>
            <View style={s.typeBadge}>
              <Text style={s.typeText}>{TYPE_LABELS[item.type] || item.type}</Text>
            </View>
            
            <View style={s.headerRow}>
              <Text style={s.title}>{item.title}</Text>
            </View>
            
            <Text style={s.description}>{item.description}</Text>
            <Text style={s.metaText}>Người gửi: {item.submitted_by}</Text>
            <Text style={s.metaText}>Ngày gửi: {item.submitted_date}</Text>

            {isPending ? (
              <View style={s.actionsRow}>
                <Pressable style={[s.actionBtn, s.btnReject]} onPress={() => handleAction(item, 'reject')}>
                  <Text style={s.textReject}>Từ chối</Text>
                </Pressable>
                <Pressable style={[s.actionBtn, s.btnApprove]} onPress={() => handleAction(item, 'approve')}>
                  <Text style={s.textApprove}>Phê duyệt</Text>
                </Pressable>
              </View>
            ) : (
              <Text style={[s.statusText, { color: item.status === 'approved' ? Colors.green : Colors.red }]}>
                {item.status === 'approved' ? '✓ Đã phê duyệt' : '✗ Đã từ chối'}
              </Text>
            )}
          </View>
        )
      })}
    </ScrollView>
  )
}
