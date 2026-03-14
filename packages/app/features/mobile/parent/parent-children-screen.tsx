import * as React from 'react'
import { useState, useCallback } from 'react'
import { ActivityIndicator, Alert, Modal, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { useAuth } from '../../auth/AuthProvider'
import { Colors, SharedStyles, FontWeight, Radius, Space, Touch } from '../mobile-theme'
import { Badge, ScreenHeader, ScreenSkeleton, EmptyState } from '../mobile-ui'
import { Icon, VCTIcons } from '../icons'
import { hapticLight, hapticSuccess, hapticError, hapticMedium } from '../haptics'
import { useParentChildren, useChildResults, useChildAttendance } from './useParentData'
import { linkChild, unlinkChild, isApiAvailable } from './parent-api'
import { LINK_STATUS_CFG, ATTENDANCE_STATUS_CFG } from './parent-mock-data'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Parent Children Screen
// Linked children list, link modal, child detail (results)
// ═══════════════════════════════════════════════════════════════

const RELATION_OPTIONS = [
  { value: 'cha', label: 'Cha' },
  { value: 'mẹ', label: 'Mẹ' },
  { value: 'người giám hộ', label: 'Người giám hộ' },
  { value: 'ông', label: 'Ông' },
  { value: 'bà', label: 'Bà' },
  { value: 'anh/chị', label: 'Anh/Chị' },
]

export function ParentChildrenMobileScreen() {
  const router = useRouter()
  const { token } = useAuth()
  const { data: children, isLoading, error, refetch } = useParentChildren()
  const [linkModalVisible, setLinkModalVisible] = useState(false)
  const [selectedChild, setSelectedChild] = useState<string | null>(null)

  // Link form state
  const [linkForm, setLinkForm] = useState({ athlete_id: '', athlete_name: '', relation: 'cha' })
  const [submitting, setSubmitting] = useState(false)

  const handleLink = useCallback(async () => {
    if (!linkForm.athlete_id.trim() || !linkForm.athlete_name.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ mã VĐV và họ tên.')
      return
    }
    hapticLight()
    setSubmitting(true)
    try {
      if (isApiAvailable()) {
        await linkChild(token, linkForm.athlete_id, linkForm.athlete_name, linkForm.relation)
      } else {
        await new Promise(r => setTimeout(r, 1000))
      }
      hapticSuccess()
      Alert.alert('Thành công', 'Yêu cầu liên kết đã được gửi. Chờ CLB phê duyệt.')
      setLinkModalVisible(false)
      setLinkForm({ athlete_id: '', athlete_name: '', relation: 'cha' })
      refetch()
    } catch (err: unknown) {
      hapticError()
      Alert.alert('Lỗi', err instanceof Error ? err.message : 'Không thể liên kết')
    } finally {
      setSubmitting(false)
    }
  }, [token, linkForm, refetch])

  const handleUnlink = useCallback((linkId: string, name: string) => {
    Alert.alert(
      'Hủy liên kết',
      `Bạn có chắc muốn hủy liên kết với ${name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận', style: 'destructive',
          onPress: async () => {
            try {
              if (isApiAvailable()) await unlinkChild(token, linkId)
              hapticSuccess()
              refetch()
            } catch (err: unknown) {
              hapticError()
              Alert.alert('Lỗi', err instanceof Error ? err.message : 'Không thể hủy liên kết')
            }
          },
        },
      ]
    )
  }, [token, refetch])

  if (isLoading) return <ScreenSkeleton />
  if (error) {
    return (
      <ScrollView style={SharedStyles.page} contentContainerStyle={SharedStyles.scrollContent}>
        <ScreenHeader title="Con em" subtitle="Quản lý liên kết con em" icon={VCTIcons.people} onBack={() => router.back()} />
        <EmptyState icon={VCTIcons.alert} title="Không tải được dữ liệu" message={error} ctaLabel="Thử lại" onCta={refetch} />
      </ScrollView>
    )
  }
  if (!children) return <ScreenSkeleton />

  // If a child is selected, show detail
  if (selectedChild) {
    const child = children.find(c => c.athlete_id === selectedChild)
    return (
      <ChildDetailView
        athleteId={selectedChild}
        athleteName={child?.athlete_name ?? ''}
        clubName={child?.club_name ?? ''}
        beltLevel={child?.belt_level ?? ''}
        onBack={() => setSelectedChild(null)}
      />
    )
  }

  return (
    <>
      <ScrollView
        style={SharedStyles.page}
        contentContainerStyle={[SharedStyles.scrollContent, { paddingBottom: 100 }]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.accent} />}
      >
        <ScreenHeader title="Con em" subtitle="Quản lý liên kết con em" icon={VCTIcons.people} onBack={() => router.back()} />

        {/* Children List */}
        {children.length > 0 ? children.map(child => {
          const stCfg = LINK_STATUS_CFG[child.status] ?? LINK_STATUS_CFG['pending']!
          return (
            <Pressable
              key={child.id}
              style={SharedStyles.card}
              onPress={() => { hapticLight(); setSelectedChild(child.athlete_id) }}
              accessibilityRole="button"
              accessibilityLabel={`${child.athlete_name}: ${stCfg.label}`}
            >
              <View style={[SharedStyles.rowBetween, { marginBottom: 8 }]}>
                <View style={[SharedStyles.row, { gap: 12 }]}>
                  <View style={{
                    width: 48, height: 48, borderRadius: 14,
                    backgroundColor: Colors.overlay(Colors.accent, 0.08),
                    justifyContent: 'center', alignItems: 'center',
                  }}>
                    <Icon name={VCTIcons.fitness} size={24} color={Colors.accent} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 15, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>{child.athlete_name}</Text>
                    <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>
                      {child.club_name} · {child.belt_level}
                    </Text>
                  </View>
                </View>
                <Badge label={stCfg.label} bg={stCfg.bg} fg={stCfg.fg} />
              </View>

              {/* Info rows */}
              <View style={{ gap: 4, marginLeft: 60 }}>
                <View style={[SharedStyles.row, { gap: 6 }]}>
                  <Icon name={VCTIcons.person} size={12} color={Colors.textSecondary} />
                  <Text style={{ fontSize: 11, color: Colors.textSecondary }}>Quan hệ: {child.relation}</Text>
                </View>
                <View style={[SharedStyles.row, { gap: 6 }]}>
                  <Icon name={VCTIcons.calendar} size={12} color={Colors.textSecondary} />
                  <Text style={{ fontSize: 11, color: Colors.textSecondary }}>
                    Liên kết: {child.approved_at ? new Date(child.approved_at).toLocaleDateString('vi-VN') : 'Đang chờ'}
                  </Text>
                </View>
              </View>

              {/* Action buttons */}
              <View style={[SharedStyles.row, { gap: 8, marginTop: 10, marginLeft: 60 }]}>
                <Pressable
                  onPress={() => { hapticLight(); setSelectedChild(child.athlete_id) }}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 4,
                    paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.pill,
                    backgroundColor: Colors.overlay(Colors.accent, 0.08),
                  }}
                >
                  <Icon name={VCTIcons.stats} size={12} color={Colors.accent} />
                  <Text style={{ fontSize: 10, fontWeight: FontWeight.bold, color: Colors.accent }}>Xem chi tiết</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleUnlink(child.id, child.athlete_name)}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 4,
                    paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.pill,
                    backgroundColor: Colors.overlay(Colors.red, 0.08),
                  }}
                >
                  <Icon name={VCTIcons.close} size={12} color={Colors.red} />
                  <Text style={{ fontSize: 10, fontWeight: FontWeight.bold, color: Colors.red }}>Hủy liên kết</Text>
                </Pressable>
              </View>
            </Pressable>
          )
        }) : (
          <EmptyState icon={VCTIcons.people} title="Chưa liên kết con em" message="Nhấn nút bên dưới để liên kết con em với tài khoản." />
        )}
      </ScrollView>

      {/* FAB — Link Child */}
      <Pressable
        onPress={() => { hapticMedium(); setLinkModalVisible(true) }}
        accessibilityRole="button"
        accessibilityLabel="Liên kết con em mới"
        style={{
          position: 'absolute', bottom: 24, right: 20,
          flexDirection: 'row', alignItems: 'center', gap: 8,
          paddingHorizontal: 20, height: 52, borderRadius: 26,
          backgroundColor: Colors.accent,
          shadowColor: Colors.accent, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
        }}
      >
        <Icon name={VCTIcons.add} size={22} color="#fff" />
        <Text style={{ fontSize: 13, fontWeight: FontWeight.extrabold, color: '#fff' }}>Liên kết</Text>
      </Pressable>

      {/* Link Modal */}
      <Modal visible={linkModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setLinkModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: Colors.bgBase }}>
          <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: Space.lg, paddingVertical: Space.md,
            borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.bgCard,
          }}>
            <Pressable onPress={() => setLinkModalVisible(false)}>
              <Text style={{ fontSize: 15, color: Colors.textSecondary, fontWeight: FontWeight.semibold }}>Hủy</Text>
            </Pressable>
            <Text style={{ fontSize: 16, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>Liên kết con em</Text>
            <Pressable onPress={handleLink} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator size="small" color={Colors.accent} />
              ) : (
                <Text style={{ fontSize: 15, fontWeight: FontWeight.extrabold, color: Colors.accent }}>Gửi</Text>
              )}
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: Space.lg, gap: 16 }}>
            {/* Athlete ID */}
            <View>
              <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginBottom: 6, textTransform: 'uppercase' }}>Mã VĐV</Text>
              <TextInput
                value={linkForm.athlete_id}
                onChangeText={v => setLinkForm(p => ({ ...p, athlete_id: v }))}
                placeholder="ATH-XXX"
                placeholderTextColor={Colors.textMuted}
                style={{
                  backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
                  borderRadius: Radius.md, padding: 14, fontSize: 14, color: Colors.textPrimary,
                }}
              />
            </View>

            {/* Athlete Name */}
            <View>
              <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginBottom: 6, textTransform: 'uppercase' }}>Họ tên VĐV</Text>
              <TextInput
                value={linkForm.athlete_name}
                onChangeText={v => setLinkForm(p => ({ ...p, athlete_name: v }))}
                placeholder="Nguyễn Văn ..."
                placeholderTextColor={Colors.textMuted}
                style={{
                  backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
                  borderRadius: Radius.md, padding: 14, fontSize: 14, color: Colors.textPrimary,
                }}
              />
            </View>

            {/* Relation */}
            <View>
              <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginBottom: 6, textTransform: 'uppercase' }}>Quan hệ</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {RELATION_OPTIONS.map(opt => (
                  <Pressable
                    key={opt.value}
                    onPress={() => { hapticLight(); setLinkForm(p => ({ ...p, relation: opt.value })) }}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.pill,
                      backgroundColor: linkForm.relation === opt.value ? Colors.overlay(Colors.accent, 0.12) : Colors.bgCard,
                      borderWidth: 1,
                      borderColor: linkForm.relation === opt.value ? Colors.accent : Colors.border,
                    }}
                  >
                    <Text style={{
                      fontSize: 13, fontWeight: FontWeight.bold,
                      color: linkForm.relation === opt.value ? Colors.accent : Colors.textSecondary,
                    }}>{opt.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Info */}
            <View style={{
              borderRadius: Radius.md, padding: Space.md, marginTop: Space.sm,
              backgroundColor: Colors.overlay(Colors.accent, 0.06),
              borderWidth: 1, borderColor: Colors.overlay(Colors.accent, 0.12),
              flexDirection: 'row', gap: 8,
            }}>
              <Icon name={VCTIcons.info} size={16} color={Colors.accent} style={{ marginTop: 1 }} />
              <Text style={{ fontSize: 11, color: Colors.textSecondary, lineHeight: 16, flex: 1 }}>
                Yêu cầu liên kết sẽ cần được CLB/HLV phê duyệt. Sau khi phê duyệt, bạn có thể theo dõi hoạt động của con em.
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  )
}

// ── Child Detail View ──

function ChildDetailView({ athleteId, athleteName, clubName, beltLevel, onBack }: {
  athleteId: string; athleteName: string; clubName: string; beltLevel: string; onBack: () => void
}) {
  const { data: results, isLoading: resultsLoading, error: resultsError, refetch: refetchResults } = useChildResults(athleteId)
  const { data: attendance, isLoading: attendanceLoading, error: attendanceError, refetch: refetchAttendance } = useChildAttendance(athleteId)
  const [activeTab, setActiveTab] = React.useState<'results' | 'attendance'>('results')

  // Attendance stats
  const present = attendance.filter(a => a.status === 'present').length
  const late = attendance.filter(a => a.status === 'late').length
  const absent = attendance.filter(a => a.status === 'absent').length
  const rate = attendance.length > 0 ? Math.round(((present + late) / attendance.length) * 100) : 0

  return (
    <ScrollView style={SharedStyles.page} contentContainerStyle={SharedStyles.scrollContent}>
      <ScreenHeader title={athleteName} subtitle={`${clubName} · ${beltLevel}`} icon={VCTIcons.fitness} onBack={onBack} />

      {/* Tab Switcher */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: Space.lg }}>
        <Pressable
          onPress={() => { hapticLight(); setActiveTab('results') }}
          style={{
            flex: 1, paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center',
            backgroundColor: activeTab === 'results' ? Colors.overlay(Colors.accent, 0.12) : Colors.bgCard,
            borderWidth: 1, borderColor: activeTab === 'results' ? Colors.accent : Colors.border,
          }}
        >
          <View style={[SharedStyles.row, { gap: 6 }]}>
            <Icon name={VCTIcons.trophy} size={14} color={activeTab === 'results' ? Colors.accent : Colors.textSecondary} />
            <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: activeTab === 'results' ? Colors.accent : Colors.textSecondary }}>Thành tích</Text>
          </View>
        </Pressable>
        <Pressable
          onPress={() => { hapticLight(); setActiveTab('attendance') }}
          style={{
            flex: 1, paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center',
            backgroundColor: activeTab === 'attendance' ? Colors.overlay(Colors.green, 0.12) : Colors.bgCard,
            borderWidth: 1, borderColor: activeTab === 'attendance' ? Colors.green : Colors.border,
          }}
        >
          <View style={[SharedStyles.row, { gap: 6 }]}>
            <Icon name={VCTIcons.calendar} size={14} color={activeTab === 'attendance' ? Colors.green : Colors.textSecondary} />
            <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: activeTab === 'attendance' ? Colors.green : Colors.textSecondary }}>Điểm danh ({rate}%)</Text>
          </View>
        </Pressable>
      </View>

      {/* Results Tab */}
      {activeTab === 'results' && (
        <>
          <Text style={SharedStyles.sectionTitle}>Thành tích thi đấu</Text>
          {resultsLoading ? (
            <ScreenSkeleton />
          ) : resultsError ? (
            <EmptyState icon={VCTIcons.alert} title="Không tải được thành tích" message={resultsError} ctaLabel="Thử lại" onCta={refetchResults} />
          ) : results.length > 0 ? results.map((r, i) => (
            <View key={i} style={SharedStyles.card}>
              <Text style={{ fontSize: 14, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, marginBottom: 4 }}>{r.result}</Text>
              <View style={[SharedStyles.row, { gap: 6 }]}>
                <Icon name={VCTIcons.trophy} size={12} color={Colors.textSecondary} />
                <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{r.tournament}</Text>
              </View>
              <View style={[SharedStyles.row, { gap: 6, marginTop: 2 }]}>
                <Icon name={VCTIcons.fitness} size={12} color={Colors.textSecondary} />
                <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{r.category} · {r.date}</Text>
              </View>
            </View>
          )) : (
            <EmptyState icon={VCTIcons.trophy} title="Chưa có thành tích" message="Thành tích sẽ xuất hiện sau khi con em tham gia giải đấu." />
          )}
        </>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <>
          {/* Attendance stats */}
          <View style={SharedStyles.statsRow}>
            <View style={SharedStyles.statBox} accessibilityLabel={`${present} có mặt`}>
              <Icon name={VCTIcons.checkmark} size={14} color={Colors.green} style={{ marginBottom: 2 }} />
              <Text style={[SharedStyles.statValue, { color: Colors.green, fontSize: 18 }]}>{present}</Text>
              <Text style={SharedStyles.statLabel}>Có mặt</Text>
            </View>
            <View style={SharedStyles.statBox} accessibilityLabel={`${late} trễ`}>
              <Icon name={VCTIcons.time} size={14} color={Colors.gold} style={{ marginBottom: 2 }} />
              <Text style={[SharedStyles.statValue, { color: Colors.gold, fontSize: 18 }]}>{late}</Text>
              <Text style={SharedStyles.statLabel}>Trễ</Text>
            </View>
            <View style={SharedStyles.statBox} accessibilityLabel={`${absent} vắng`}>
              <Icon name={VCTIcons.alert} size={14} color={Colors.red} style={{ marginBottom: 2 }} />
              <Text style={[SharedStyles.statValue, { color: Colors.red, fontSize: 18 }]}>{absent}</Text>
              <Text style={SharedStyles.statLabel}>Vắng</Text>
            </View>
          </View>

          <Text style={SharedStyles.sectionTitle}>Chi tiết buổi tập</Text>
          {attendanceLoading ? (
            <ScreenSkeleton />
          ) : attendanceError ? (
            <EmptyState icon={VCTIcons.alert} title="Không tải được điểm danh" message={attendanceError} ctaLabel="Thử lại" onCta={refetchAttendance} />
          ) : attendance.length > 0 ? attendance.map((a, i) => {
            const statusCfg = ATTENDANCE_STATUS_CFG[a.status] ?? ATTENDANCE_STATUS_CFG['present']!
            return (
              <View key={i} style={SharedStyles.card}>
                <View style={[SharedStyles.rowBetween]}>
                  <View style={[SharedStyles.row, { gap: 10 }]}>
                    <View style={{
                      width: 32, height: 32, borderRadius: 8,
                      backgroundColor: Colors.overlay(statusCfg.color, 0.1),
                      justifyContent: 'center', alignItems: 'center',
                    }}>
                      <Icon
                        name={a.status === 'present' ? VCTIcons.checkmark : a.status === 'late' ? VCTIcons.time : VCTIcons.alert}
                        size={16} color={statusCfg.color}
                      />
                    </View>
                    <View>
                      <Text style={{ fontSize: 13, fontWeight: FontWeight.bold, color: Colors.textPrimary }}>{a.session}</Text>
                      <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{a.date} · {a.coach}</Text>
                    </View>
                  </View>
                  <Badge label={statusCfg.label} bg={Colors.overlay(statusCfg.color, 0.1)} fg={statusCfg.color} />
                </View>
              </View>
            )
          }) : (
            <EmptyState icon={VCTIcons.calendar} title="Chưa có dữ liệu" message="Dữ liệu điểm danh sẽ xuất hiện khi con em tham gia tập luyện." />
          )}
        </>
      )}
    </ScrollView>
  )
}
