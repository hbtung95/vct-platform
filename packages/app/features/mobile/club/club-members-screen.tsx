import * as React from 'react'
import { useState, useCallback } from 'react'
import { ActivityIndicator, Alert, Modal, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { useAuth } from '../../auth/AuthProvider'
import { Colors, SharedStyles, FontWeight, Radius, Space } from '../mobile-theme'
import { Badge, ScreenHeader, ScreenSkeleton, EmptyState, SearchBar, Chip } from '../mobile-ui'
import { Icon, VCTIcons } from '../icons'
import { hapticLight, hapticSuccess, hapticError, hapticMedium, hapticWarning } from '../haptics'
import { useClubMembers } from './useClubData'
import { approveMember, rejectMember, deleteMember, isApiAvailable } from './club-api'
import { MEMBER_STATUS_CFG } from './club-mock-data'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Club Members Screen
// Members list, approve/reject, add modal
// ═══════════════════════════════════════════════════════════════

type FilterTab = 'all' | 'active' | 'pending' | 'suspended'
const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'active', label: 'Hoạt động' },
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'suspended', label: 'Tạm ngưng' },
]

const BELT_OPTIONS = ['Bạch đai', 'Lam đai', 'Hoàng đai nhất', 'Hoàng đai nhị', 'Hoàng đai tam', 'Hồng đai', 'Hắc đai']

export function ClubMembersMobileScreen() {
  const router = useRouter()
  const { token } = useAuth()
  const { data: members, isLoading, refetch } = useClubMembers()
  const [filter, setFilter] = useState<FilterTab>('all')
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', belt_level: 'Bạch đai' })
  const [submitting, setSubmitting] = useState(false)

  const [search, setSearch] = useState('')

  const searchedMembers = (members ?? []).filter(m =>
    !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search)
  )
  const filteredMembers = filter === 'all' ? searchedMembers : searchedMembers.filter(m => m.status === filter)
  const pendingCount = (members ?? []).filter(m => m.status === 'pending').length
  const activeCount = (members ?? []).filter(m => m.status === 'active').length
  const suspendedCount = (members ?? []).filter(m => m.status === 'suspended').length

  const handleApprove = useCallback(async (id: string, name: string) => {
    Alert.alert('Duyệt thành viên', `Duyệt ${name}?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Duyệt', onPress: async () => {
          try {
            if (isApiAvailable()) await approveMember(token, id)
            hapticSuccess()
            refetch()
          } catch (err: unknown) {
            hapticError()
            Alert.alert('Lỗi', err instanceof Error ? err.message : 'Không thể duyệt')
          }
        },
      },
    ])
  }, [token, refetch])

  const handleReject = useCallback(async (id: string, name: string) => {
    Alert.alert('Từ chối', `Từ chối ${name}?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Từ chối', style: 'destructive',
        onPress: async () => {
          try {
            if (isApiAvailable()) await rejectMember(token, id)
            hapticWarning()
            refetch()
          } catch (err: unknown) {
            hapticError()
            Alert.alert('Lỗi', err instanceof Error ? err.message : 'Không thể từ chối')
          }
        },
      },
    ])
  }, [token, refetch])

  const handleDelete = useCallback((id: string, name: string) => {
    Alert.alert('Xóa thành viên', `Xóa ${name} khỏi CLB?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive',
        onPress: async () => {
          try {
            if (isApiAvailable()) await deleteMember(token, id)
            hapticWarning()
            refetch()
          } catch (err: unknown) {
            hapticError()
            Alert.alert('Lỗi', err instanceof Error ? err.message : 'Không thể xóa')
          }
        },
      },
    ])
  }, [token, refetch])

  const handleAdd = useCallback(async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ tên và số điện thoại.')
      return
    }
    hapticLight()
    setSubmitting(true)
    try {
      if (isApiAvailable()) {
        const { createClubMember } = await import('./club-api')
        await createClubMember(token, {
          club_id: 'CLB-001', name: form.name, phone: form.phone,
          belt_level: form.belt_level, status: 'pending', join_date: new Date().toISOString().split('T')[0]!, role: 'Thành viên',
        })
      } else {
        await new Promise(r => setTimeout(r, 1000))
      }
      hapticSuccess()
      Alert.alert('Thành công', 'Đã thêm thành viên mới.')
      setAddModalVisible(false)
      setForm({ name: '', phone: '', belt_level: 'Bạch đai' })
      refetch()
    } catch (err: unknown) {
      hapticError()
      Alert.alert('Lỗi', err instanceof Error ? err.message : 'Không thể thêm')
    } finally {
      setSubmitting(false)
    }
  }, [token, form, refetch])

  if (isLoading || !members) return <ScreenSkeleton />

  return (
    <>
      <ScrollView
        style={SharedStyles.page}
        contentContainerStyle={[SharedStyles.scrollContent, { paddingBottom: 100 }]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.accent} />}
      >
        <ScreenHeader title="Thành viên" subtitle={`${members.length} thành viên`} icon={VCTIcons.people} onBack={() => router.back()} />

        <SearchBar value={search} onChangeText={setSearch} placeholder="Tìm theo tên hoặc SĐT..." />

        {/* Filter Chips */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: Space.md, flexWrap: 'wrap' }}>
          <Chip label="Tất cả" selected={filter === 'all'} onPress={() => setFilter('all')} count={(members ?? []).length} />
          <Chip label="Hoạt động" selected={filter === 'active'} onPress={() => setFilter('active')} count={activeCount} color={Colors.green} />
          <Chip label="Chờ duyệt" selected={filter === 'pending'} onPress={() => setFilter('pending')} count={pendingCount} color={Colors.gold} />
          <Chip label="Tạm ngưng" selected={filter === 'suspended'} onPress={() => setFilter('suspended')} count={suspendedCount} color={Colors.red} />
        </View>

        {/* Member List */}
        {filteredMembers.length > 0 ? filteredMembers.map(m => {
          const stCfg = MEMBER_STATUS_CFG[m.status] ?? MEMBER_STATUS_CFG['active']!
          return (
            <View key={m.id} style={SharedStyles.card}>
              <View style={[SharedStyles.rowBetween, { marginBottom: 6 }]}>
                <View style={[SharedStyles.row, { gap: 12 }]}>
                  <View style={{
                    width: 44, height: 44, borderRadius: 12,
                    backgroundColor: Colors.overlay(stCfg.color, 0.08),
                    justifyContent: 'center', alignItems: 'center',
                  }}>
                    <Icon name={VCTIcons.person} size={22} color={stCfg.color} />
                  </View>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>{m.name}</Text>
                    <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>
                      {m.belt_level} · {m.role}
                    </Text>
                  </View>
                </View>
                <Badge label={stCfg.label} bg={stCfg.bg} fg={stCfg.fg} />
              </View>

              <View style={{ gap: 3, marginLeft: 56 }}>
                <View style={[SharedStyles.row, { gap: 6 }]}>
                  <Icon name={VCTIcons.call} size={11} color={Colors.textSecondary} />
                  <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{m.phone}</Text>
                </View>
                <View style={[SharedStyles.row, { gap: 6 }]}>
                  <Icon name={VCTIcons.calendar} size={11} color={Colors.textSecondary} />
                  <Text style={{ fontSize: 11, color: Colors.textSecondary }}>Gia nhập: {m.join_date}</Text>
                </View>
              </View>

              {/* Actions */}
              {m.status === 'pending' && (
                <View style={[SharedStyles.row, { gap: 8, marginTop: 10, justifyContent: 'flex-end' }]}>
                  <Pressable onPress={() => handleApprove(m.id, m.name)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill, backgroundColor: Colors.overlay(Colors.green, 0.1) }}>
                    <Icon name={VCTIcons.checkmark} size={12} color={Colors.green} />
                    <Text style={{ fontSize: 10, fontWeight: FontWeight.bold, color: Colors.green }}>Duyệt</Text>
                  </Pressable>
                  <Pressable onPress={() => handleReject(m.id, m.name)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill, backgroundColor: Colors.overlay(Colors.red, 0.08) }}>
                    <Icon name={VCTIcons.close} size={12} color={Colors.red} />
                    <Text style={{ fontSize: 10, fontWeight: FontWeight.bold, color: Colors.red }}>Từ chối</Text>
                  </Pressable>
                </View>
              )}
              {m.status === 'active' && (
                <View style={{ marginTop: 10, alignItems: 'flex-end' }}>
                  <Pressable onPress={() => handleDelete(m.id, m.name)}
                    style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill, backgroundColor: Colors.overlay(Colors.red, 0.06) }}>
                    <Text style={{ fontSize: 10, fontWeight: FontWeight.bold, color: Colors.red }}>Xóa</Text>
                  </Pressable>
                </View>
              )}
            </View>
          )
        }) : (
          <EmptyState icon={VCTIcons.people} title="Chưa có thành viên" message="Thêm thành viên bằng nút bên dưới." />
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => { hapticMedium(); setAddModalVisible(true) }}
        accessibilityRole="button" accessibilityLabel="Thêm thành viên"
        style={{
          position: 'absolute', bottom: 24, right: 20,
          flexDirection: 'row', alignItems: 'center', gap: 8,
          paddingHorizontal: 20, height: 52, borderRadius: 26,
          backgroundColor: Colors.accent,
          shadowColor: Colors.accent, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
        }}
      >
        <Icon name={VCTIcons.add} size={22} color="#fff" />
        <Text style={{ fontSize: 13, fontWeight: FontWeight.extrabold, color: '#fff' }}>Thêm</Text>
      </Pressable>

      {/* Add Modal */}
      <Modal visible={addModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setAddModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: Colors.bgBase }}>
          <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: Space.lg, paddingVertical: Space.md,
            borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.bgCard,
          }}>
            <Pressable onPress={() => setAddModalVisible(false)}>
              <Text style={{ fontSize: 15, color: Colors.textSecondary, fontWeight: FontWeight.semibold }}>Hủy</Text>
            </Pressable>
            <Text style={{ fontSize: 16, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>Thêm thành viên</Text>
            <Pressable onPress={handleAdd} disabled={submitting}>
              {submitting ? <ActivityIndicator size="small" color={Colors.accent} /> : (
                <Text style={{ fontSize: 15, fontWeight: FontWeight.extrabold, color: Colors.accent }}>Lưu</Text>
              )}
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: Space.lg, gap: 16 }}>
            <View>
              <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginBottom: 6, textTransform: 'uppercase' }}>Họ tên</Text>
              <TextInput value={form.name} onChangeText={v => setForm(p => ({ ...p, name: v }))} placeholder="Nguyễn Văn ..."
                placeholderTextColor={Colors.textMuted}
                style={{ backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 14, fontSize: 14, color: Colors.textPrimary }} />
            </View>
            <View>
              <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginBottom: 6, textTransform: 'uppercase' }}>Số điện thoại</Text>
              <TextInput value={form.phone} onChangeText={v => setForm(p => ({ ...p, phone: v }))} placeholder="09xx xxx xxx" keyboardType="phone-pad"
                placeholderTextColor={Colors.textMuted}
                style={{ backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 14, fontSize: 14, color: Colors.textPrimary }} />
            </View>
            <View>
              <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase' }}>Đai</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {BELT_OPTIONS.map(belt => (
                  <Pressable key={belt}
                    onPress={() => { hapticLight(); setForm(p => ({ ...p, belt_level: belt })) }}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.pill,
                      backgroundColor: form.belt_level === belt ? Colors.overlay(Colors.accent, 0.12) : Colors.bgCard,
                      borderWidth: 1, borderColor: form.belt_level === belt ? Colors.accent : Colors.border,
                    }}>
                    <Text style={{ fontSize: 13, fontWeight: FontWeight.bold, color: form.belt_level === belt ? Colors.accent : Colors.textSecondary }}>{belt}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  )
}
