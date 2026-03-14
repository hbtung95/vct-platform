import * as React from 'react'
import { useState, useCallback } from 'react'
import { ActivityIndicator, Alert, Modal, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { useAuth } from '../../auth/AuthProvider'
import { Colors, SharedStyles, FontWeight, Radius, Space } from '../mobile-theme'
import { Badge, ScreenHeader, ScreenSkeleton, EmptyState } from '../mobile-ui'
import { Icon, VCTIcons } from '../icons'
import { hapticLight, hapticSuccess, hapticError, hapticMedium, hapticWarning } from '../haptics'
import { useParentChildren, useParentConsents } from './useParentData'
import { createConsent, revokeConsent, isApiAvailable } from './parent-api'
import { CONSENT_TYPE_CFG, CONSENT_STATUS_CFG } from './parent-mock-data'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Parent Consents Screen
// E-Consent list, sign new, revoke existing
// ═══════════════════════════════════════════════════════════════

const CONSENT_TYPE_OPTIONS = [
  { value: 'tournament', label: 'Giải đấu', icon: VCTIcons.trophy },
  { value: 'belt_exam', label: 'Thi đai', icon: VCTIcons.ribbon },
  { value: 'medical', label: 'Y tế', icon: VCTIcons.medkit },
  { value: 'photo_usage', label: 'Hình ảnh', icon: VCTIcons.camera },
  { value: 'training', label: 'Tập luyện', icon: VCTIcons.fitness },
]

type FilterTab = 'all' | 'active' | 'revoked'
const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'active', label: 'Hiệu lực' },
  { key: 'revoked', label: 'Thu hồi' },
]

/** Check if consent expires within 30 days */
function isExpiringSoon(expiresAt?: string): boolean {
  if (!expiresAt) return false
  const diff = new Date(expiresAt).getTime() - Date.now()
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000
}

function daysUntilExpiry(expiresAt: string): number {
  return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
}

export function ParentConsentsMobileScreen() {
  const router = useRouter()
  const { token } = useAuth()
  const { data: consents, isLoading, error, refetch } = useParentConsents()
  const { data: children } = useParentChildren()
  const [newModalVisible, setNewModalVisible] = useState(false)
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null)
  const [revoking, setRevoking] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')

  // New consent form
  const [form, setForm] = useState({ athlete_id: '', athlete_name: '', type: 'tournament', title: '', description: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleCreate = useCallback(async () => {
    if (!form.title.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tiêu đề đồng thuận.')
      return
    }
    hapticLight()
    setSubmitting(true)
    try {
      if (isApiAvailable()) {
        await createConsent(token, form)
      } else {
        await new Promise(r => setTimeout(r, 1000))
      }
      hapticSuccess()
      Alert.alert('Thành công', 'Đã ký đồng thuận mới.')
      setNewModalVisible(false)
      setForm({ athlete_id: '', athlete_name: '', type: 'tournament', title: '', description: '' })
      refetch()
    } catch (err: unknown) {
      hapticError()
      Alert.alert('Lỗi', err instanceof Error ? err.message : 'Không thể tạo đồng thuận')
    } finally {
      setSubmitting(false)
    }
  }, [token, form, refetch])

  const handleRevoke = useCallback(async (id: string) => {
    setRevoking(true)
    try {
      if (isApiAvailable()) {
        await revokeConsent(token, id)
      } else {
        await new Promise(r => setTimeout(r, 800))
      }
      hapticWarning()
      setConfirmRevokeId(null)
      refetch()
    } catch (err: unknown) {
      hapticError()
      Alert.alert('Lỗi', err instanceof Error ? err.message : 'Không thể thu hồi')
    } finally {
      setRevoking(false)
    }
  }, [token, refetch])

  // Auto-set first child when modal opens
  React.useEffect(() => {
    if (newModalVisible && children && children.length > 0) {
      const approved = children.filter(c => c.status === 'approved')
      if (approved.length > 0 && !form.athlete_id) {
        setForm(f => ({ ...f, athlete_id: approved[0]!.athlete_id, athlete_name: approved[0]!.athlete_name }))
      }
    }
  }, [newModalVisible, children])

  if (isLoading) return <ScreenSkeleton />
  if (error) {
    return (
      <ScrollView style={SharedStyles.page} contentContainerStyle={SharedStyles.scrollContent}>
        <ScreenHeader title="Đồng thuận" subtitle="E-Consent cho con em" icon={VCTIcons.clipboard} onBack={() => router.back()} />
        <EmptyState icon={VCTIcons.alert} title="Không tải được dữ liệu" message={error} ctaLabel="Thử lại" onCta={refetch} />
      </ScrollView>
    )
  }
  if (!consents) return <ScreenSkeleton />

  const activeCount = consents.filter(c => c.status === 'active').length
  const revokedCount = consents.filter(c => c.status === 'revoked').length
  const expiringSoonCount = consents.filter(c => c.status === 'active' && isExpiringSoon(c.expires_at)).length

  // Filter consents
  const filteredConsents = activeFilter === 'all' ? consents
    : consents.filter(c => c.status === activeFilter)

  return (
    <>
      <ScrollView
        style={SharedStyles.page}
        contentContainerStyle={[SharedStyles.scrollContent, { paddingBottom: 100 }]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.accent} />}
      >
        <ScreenHeader title="Đồng thuận" subtitle="E-Consent cho con em" icon={VCTIcons.clipboard} onBack={() => router.back()} />

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: Space.lg }}>
          <View style={SharedStyles.statBox} accessibilityLabel={`${activeCount} hiệu lực`}>
            <Icon name={VCTIcons.checkmark} size={16} color={Colors.green} style={{ marginBottom: 4 }} />
            <Text style={[SharedStyles.statValue, { color: Colors.green }]}>{activeCount}</Text>
            <Text style={SharedStyles.statLabel}>Hiệu lực</Text>
          </View>
          <View style={SharedStyles.statBox} accessibilityLabel={`${revokedCount} đã thu hồi`}>
            <Icon name={VCTIcons.alert} size={16} color={Colors.red} style={{ marginBottom: 4 }} />
            <Text style={[SharedStyles.statValue, { color: Colors.red }]}>{revokedCount}</Text>
            <Text style={SharedStyles.statLabel}>Thu hồi</Text>
          </View>
          <View style={SharedStyles.statBox} accessibilityLabel={`${consents.length} tổng`}>
            <Icon name={VCTIcons.clipboard} size={16} color={Colors.accent} style={{ marginBottom: 4 }} />
            <Text style={[SharedStyles.statValue, { color: Colors.accent }]}>{consents.length}</Text>
            <Text style={SharedStyles.statLabel}>Tổng</Text>
          </View>
        </View>

        {/* Expiry Warning Banner */}
        {expiringSoonCount > 0 && (
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 8,
            padding: Space.md, borderRadius: Radius.md, marginBottom: Space.md,
            backgroundColor: Colors.overlay(Colors.gold, 0.1),
            borderWidth: 1, borderColor: Colors.overlay(Colors.gold, 0.2),
          }}>
            <Icon name={VCTIcons.alert} size={16} color={Colors.gold} />
            <Text style={{ fontSize: 11, color: Colors.gold, fontWeight: FontWeight.bold, flex: 1 }}>
              {expiringSoonCount} đồng thuận sắp hết hạn trong 30 ngày tới
            </Text>
          </View>
        )}

        {/* Filter Tabs */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: Space.md }}>
          {FILTER_TABS.map(tab => (
            <Pressable
              key={tab.key}
              onPress={() => { hapticLight(); setActiveFilter(tab.key) }}
              style={{
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.pill,
                backgroundColor: activeFilter === tab.key ? Colors.overlay(Colors.accent, 0.12) : Colors.bgCard,
                borderWidth: 1,
                borderColor: activeFilter === tab.key ? Colors.accent : Colors.border,
              }}
            >
              <Text style={{
                fontSize: 12, fontWeight: FontWeight.bold,
                color: activeFilter === tab.key ? Colors.accent : Colors.textSecondary,
              }}>{tab.label} {tab.key === 'active' ? `(${activeCount})` : tab.key === 'revoked' ? `(${revokedCount})` : ''}</Text>
            </Pressable>
          ))}
        </View>

        {/* Consent list */}
        {filteredConsents.length > 0 ? filteredConsents.map(c => {
          const typeCfg = CONSENT_TYPE_CFG[c.type] ?? CONSENT_TYPE_CFG['training']!
          const statusCfg = CONSENT_STATUS_CFG[c.status] ?? CONSENT_STATUS_CFG['active']!
          return (
            <View key={c.id} style={SharedStyles.card}>
              <View style={[SharedStyles.rowBetween, { marginBottom: 6 }]}>
                <View style={[SharedStyles.row, { gap: 10, flex: 1 }]}>
                  <View style={{
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: Colors.overlay(typeCfg.color, 0.1),
                    justifyContent: 'center', alignItems: 'center',
                  }}>
                    <Icon name={VCTIcons.clipboard} size={16} color={typeCfg.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>{c.title}</Text>
                    <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>
                      {typeCfg.label} · {c.athlete_name}
                    </Text>
                  </View>
                </View>
                <Badge label={statusCfg.label} bg={statusCfg.bg} fg={statusCfg.fg} />
              </View>

              <Text style={{ fontSize: 11, color: Colors.textSecondary, marginBottom: 8, lineHeight: 16 }}>{c.description}</Text>

              <View style={[SharedStyles.row, { gap: 6 }]}>
                <Icon name={VCTIcons.calendar} size={12} color={Colors.textMuted} />
                <Text style={{ fontSize: 10, color: Colors.textMuted }}>Ký ngày {c.signed_at?.split('T')[0]}</Text>
              </View>

              {/* Expiry warning */}
              {c.status === 'active' && c.expires_at && isExpiringSoon(c.expires_at) && (
                <View style={[SharedStyles.row, { gap: 6, marginTop: 4 }]}>
                  <Icon name={VCTIcons.alert} size={12} color={Colors.gold} />
                  <Text style={{ fontSize: 10, color: Colors.gold, fontWeight: FontWeight.bold }}>
                    Hết hạn sau {daysUntilExpiry(c.expires_at)} ngày
                  </Text>
                </View>
              )}

              {/* Revoke action */}
              {c.status === 'active' && (
                <View style={{ marginTop: 10, alignItems: 'flex-end' }}>
                  {confirmRevokeId === c.id ? (
                    <View style={[SharedStyles.row, { gap: 8 }]}>
                      <Pressable onPress={() => setConfirmRevokeId(null)}
                        style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill, backgroundColor: Colors.bgCard }}>
                        <Text style={{ fontSize: 11, color: Colors.textSecondary, fontWeight: FontWeight.bold }}>Hủy</Text>
                      </Pressable>
                      <Pressable onPress={() => handleRevoke(c.id)} disabled={revoking}
                        style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill, backgroundColor: Colors.overlay(Colors.red, 0.1) }}>
                        {revoking ? (
                          <ActivityIndicator size="small" color={Colors.red} />
                        ) : (
                          <View style={[SharedStyles.row, { gap: 4 }]}>
                            <Icon name={VCTIcons.alert} size={12} color={Colors.red} />
                            <Text style={{ fontSize: 11, color: Colors.red, fontWeight: FontWeight.bold }}>Xác nhận thu hồi</Text>
                          </View>
                        )}
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable onPress={() => { hapticLight(); setConfirmRevokeId(c.id) }}
                      style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill, backgroundColor: Colors.overlay(Colors.red, 0.06) }}>
                      <Text style={{ fontSize: 11, color: Colors.red, fontWeight: FontWeight.bold }}>Thu hồi</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          )
        }) : (
          <EmptyState icon={VCTIcons.clipboard} title="Chưa có đồng thuận" message="Nhấn nút bên dưới để ký đồng thuận mới." />
        )}
      </ScrollView>

      {/* FAB — New Consent */}
      <Pressable
        onPress={() => { hapticMedium(); setNewModalVisible(true) }}
        accessibilityRole="button"
        accessibilityLabel="Ký đồng thuận mới"
        style={{
          position: 'absolute', bottom: 24, right: 20,
          flexDirection: 'row', alignItems: 'center', gap: 8,
          paddingHorizontal: 20, height: 52, borderRadius: 26,
          backgroundColor: Colors.green,
          shadowColor: Colors.green, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
        }}
      >
        <Icon name={VCTIcons.add} size={22} color="#fff" />
        <Text style={{ fontSize: 13, fontWeight: FontWeight.extrabold, color: '#fff' }}>Ký mới</Text>
      </Pressable>

      {/* New Consent Modal */}
      <Modal visible={newModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setNewModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: Colors.bgBase }}>
          <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: Space.lg, paddingVertical: Space.md,
            borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.bgCard,
          }}>
            <Pressable onPress={() => setNewModalVisible(false)}>
              <Text style={{ fontSize: 15, color: Colors.textSecondary, fontWeight: FontWeight.semibold }}>Hủy</Text>
            </Pressable>
            <Text style={{ fontSize: 16, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>Ký đồng thuận</Text>
            <Pressable onPress={handleCreate} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator size="small" color={Colors.accent} />
              ) : (
                <Text style={{ fontSize: 15, fontWeight: FontWeight.extrabold, color: Colors.accent }}>Ký</Text>
              )}
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: Space.lg, gap: 16 }}>
            {/* Select Child */}
            <View>
              <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase' }}>Chọn con em</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {(children ?? []).filter(c => c.status === 'approved').map(c => (
                  <Pressable
                    key={c.athlete_id}
                    onPress={() => { hapticLight(); setForm(f => ({ ...f, athlete_id: c.athlete_id, athlete_name: c.athlete_name })) }}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.pill,
                      backgroundColor: form.athlete_id === c.athlete_id ? Colors.overlay(Colors.accent, 0.12) : Colors.bgCard,
                      borderWidth: 1,
                      borderColor: form.athlete_id === c.athlete_id ? Colors.accent : Colors.border,
                    }}
                  >
                    <Text style={{
                      fontSize: 13, fontWeight: FontWeight.bold,
                      color: form.athlete_id === c.athlete_id ? Colors.accent : Colors.textSecondary,
                    }}>{c.athlete_name}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Consent type */}
            <View>
              <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase' }}>Loại đồng thuận</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {CONSENT_TYPE_OPTIONS.map(opt => (
                  <Pressable
                    key={opt.value}
                    onPress={() => { hapticLight(); setForm(f => ({ ...f, type: opt.value })) }}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 6,
                      paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.pill,
                      backgroundColor: form.type === opt.value ? Colors.overlay(Colors.green, 0.12) : Colors.bgCard,
                      borderWidth: 1,
                      borderColor: form.type === opt.value ? Colors.green : Colors.border,
                    }}
                  >
                    <Icon name={opt.icon} size={14} color={form.type === opt.value ? Colors.green : Colors.textSecondary} />
                    <Text style={{
                      fontSize: 13, fontWeight: FontWeight.bold,
                      color: form.type === opt.value ? Colors.green : Colors.textSecondary,
                    }}>{opt.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Title */}
            <View>
              <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginBottom: 6, textTransform: 'uppercase' }}>Tiêu đề</Text>
              <TextInput
                value={form.title}
                onChangeText={v => setForm(f => ({ ...f, title: v }))}
                placeholder="VD: Đồng ý tham gia giải..."
                placeholderTextColor={Colors.textMuted}
                style={{
                  backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
                  borderRadius: Radius.md, padding: 14, fontSize: 14, color: Colors.textPrimary,
                }}
              />
            </View>

            {/* Description */}
            <View>
              <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginBottom: 6, textTransform: 'uppercase' }}>Mô tả</Text>
              <TextInput
                value={form.description}
                onChangeText={v => setForm(f => ({ ...f, description: v }))}
                placeholder="Chi tiết nội dung đồng thuận..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
                style={{
                  backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
                  borderRadius: Radius.md, padding: 14, fontSize: 14, color: Colors.textPrimary,
                  minHeight: 80, textAlignVertical: 'top',
                }}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  )
}
