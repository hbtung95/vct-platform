import * as React from 'react'
import { useState, useCallback } from 'react'
import { ActivityIndicator, Alert, Modal, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { useAuth } from '../../auth/AuthProvider'
import { Colors, SharedStyles, FontWeight, Radius, Space } from '../mobile-theme'
import { Badge, ScreenHeader, ScreenSkeleton, EmptyState, SearchBar, Chip } from '../mobile-ui'
import { Icon, VCTIcons } from '../icons'
import { hapticLight, hapticSuccess, hapticError, hapticMedium } from '../haptics'
import { useClubFinance, useClubFinanceSummary } from './useClubData'
import { createClubFinanceEntry, isApiAvailable } from './club-api'
import { FINANCE_TYPE_CFG, formatVND } from './club-mock-data'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Club Finance Screen
// Income/expense ledger, summary card, add entry modal
// ═══════════════════════════════════════════════════════════════

type FilterTab = 'all' | 'income' | 'expense'
const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'income', label: 'Thu' },
  { key: 'expense', label: 'Chi' },
]

export function ClubFinanceMobileScreen() {
  const router = useRouter()
  const { token } = useAuth()
  const { data: entries, isLoading, refetch } = useClubFinance()
  const { data: summary } = useClubFinanceSummary()
  const [filter, setFilter] = useState<FilterTab>('all')
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [form, setForm] = useState({ type: 'income' as 'income' | 'expense', category: '', amount: '', description: '' })
  const [submitting, setSubmitting] = useState(false)

  const [search, setSearch] = useState('')

  const searchedEntries = (entries ?? []).filter(e =>
    !search || e.category.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase())
  )
  const filteredEntries = filter === 'all' ? searchedEntries : searchedEntries.filter(e => e.type === filter)
  const incomeCount = (entries ?? []).filter(e => e.type === 'income').length
  const expenseCount = (entries ?? []).filter(e => e.type === 'expense').length

  const handleAdd = useCallback(async () => {
    if (!form.category.trim() || !form.amount.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập loại và số tiền.')
      return
    }
    hapticLight()
    setSubmitting(true)
    try {
      if (isApiAvailable()) {
        await createClubFinanceEntry(token, {
          club_id: 'CLB-001', type: form.type, category: form.category,
          amount: parseInt(form.amount, 10), description: form.description,
          date: new Date().toISOString().split('T')[0]!, status: 'completed',
        })
      } else {
        await new Promise(r => setTimeout(r, 1000))
      }
      hapticSuccess()
      Alert.alert('Thành công', 'Đã ghi nhận giao dịch.')
      setAddModalVisible(false)
      setForm({ type: 'income', category: '', amount: '', description: '' })
      refetch()
    } catch (err: unknown) {
      hapticError()
      Alert.alert('Lỗi', err instanceof Error ? err.message : 'Không thể ghi nhận')
    } finally {
      setSubmitting(false)
    }
  }, [token, form, refetch])

  if (isLoading || !entries) return <ScreenSkeleton />

  return (
    <>
      <ScrollView
        style={SharedStyles.page}
        contentContainerStyle={[SharedStyles.scrollContent, { paddingBottom: 100 }]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.accent} />}
      >
        <ScreenHeader title="Tài chính" subtitle="Sổ cái thu chi CLB" icon={VCTIcons.trending} onBack={() => router.back()} />

        {/* Summary Card */}
        {summary && (
          <View style={[SharedStyles.card, { flexDirection: 'row', gap: 12, marginBottom: Space.md }]}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Icon name={VCTIcons.trending} size={16} color={Colors.green} />
              <Text style={{ fontSize: 15, fontWeight: FontWeight.extrabold, color: Colors.green, marginTop: 4 }}>{formatVND(summary.total_income)}</Text>
              <Text style={{ fontSize: 10, color: Colors.textSecondary }}>Tổng thu</Text>
            </View>
            <View style={{ width: 1, backgroundColor: Colors.border }} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Icon name={VCTIcons.trendingDown} size={16} color={Colors.red} />
              <Text style={{ fontSize: 15, fontWeight: FontWeight.extrabold, color: Colors.red, marginTop: 4 }}>{formatVND(summary.total_expense)}</Text>
              <Text style={{ fontSize: 10, color: Colors.textSecondary }}>Tổng chi</Text>
            </View>
            <View style={{ width: 1, backgroundColor: Colors.border }} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Icon name={VCTIcons.stats} size={16} color={summary.balance >= 0 ? Colors.purple : Colors.red} />
              <Text style={{ fontSize: 15, fontWeight: FontWeight.extrabold, color: summary.balance >= 0 ? Colors.purple : Colors.red, marginTop: 4 }}>{formatVND(summary.balance)}</Text>
              <Text style={{ fontSize: 10, color: Colors.textSecondary }}>Số dư</Text>
            </View>
          </View>
        )}

        {/* Pending alert */}
        {summary && summary.pending > 0 && (
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 8,
            padding: Space.md, borderRadius: Radius.md, marginBottom: Space.md,
            backgroundColor: Colors.overlay(Colors.gold, 0.1),
            borderWidth: 1, borderColor: Colors.overlay(Colors.gold, 0.2),
          }}>
            <Icon name={VCTIcons.alert} size={16} color={Colors.gold} />
            <Text style={{ fontSize: 11, color: Colors.gold, fontWeight: FontWeight.bold, flex: 1 }}>
              {formatVND(summary.pending)} giao dịch đang treo
            </Text>
          </View>
        )}

        <SearchBar value={search} onChangeText={setSearch} placeholder="Tìm theo danh mục, mô tả..." />

        {/* Filter Chips */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: Space.md }}>
          <Chip label="Tất cả" selected={filter === 'all'} onPress={() => setFilter('all')} count={(entries ?? []).length} />
          <Chip label="Thu" selected={filter === 'income'} onPress={() => setFilter('income')} count={incomeCount} color={Colors.green} />
          <Chip label="Chi" selected={filter === 'expense'} onPress={() => setFilter('expense')} count={expenseCount} color={Colors.red} />
        </View>

        {/* Entry List */}
        {filteredEntries.length > 0 ? filteredEntries.map(e => {
          const typeCfg = FINANCE_TYPE_CFG[e.type] ?? FINANCE_TYPE_CFG['income']!
          return (
            <View key={e.id} style={SharedStyles.card}>
              <View style={[SharedStyles.rowBetween, { marginBottom: 4 }]}>
                <View style={[SharedStyles.row, { gap: 10 }]}>
                  <View style={{
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: Colors.overlay(typeCfg.color, 0.1),
                    justifyContent: 'center', alignItems: 'center',
                  }}>
                    <Icon name={e.type === 'income' ? VCTIcons.trending : VCTIcons.trendingDown} size={18} color={typeCfg.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>{e.category}</Text>
                    <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }} numberOfLines={1}>{e.description}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 14, fontWeight: FontWeight.extrabold, color: typeCfg.color }}>
                  {e.type === 'income' ? '+' : '-'}{formatVND(e.amount)}
                </Text>
              </View>
              <View style={[SharedStyles.row, { gap: 8, marginLeft: 46 }]}>
                <View style={[SharedStyles.row, { gap: 4 }]}>
                  <Icon name={VCTIcons.calendar} size={10} color={Colors.textMuted} />
                  <Text style={{ fontSize: 10, color: Colors.textMuted }}>{e.date}</Text>
                </View>
                {e.status === 'pending' && (
                  <Badge label="Đang treo" bg={Colors.overlay(Colors.gold, 0.1)} fg={Colors.gold} />
                )}
              </View>
            </View>
          )
        }) : (
          <EmptyState icon={VCTIcons.trending} title="Chưa có giao dịch" message="Ghi nhận thu chi bằng nút bên dưới." />
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => { hapticMedium(); setAddModalVisible(true) }}
        accessibilityRole="button" accessibilityLabel="Ghi nhận giao dịch"
        style={{
          position: 'absolute', bottom: 24, right: 20,
          flexDirection: 'row', alignItems: 'center', gap: 8,
          paddingHorizontal: 20, height: 52, borderRadius: 26,
          backgroundColor: Colors.purple,
          shadowColor: Colors.purple, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
        }}
      >
        <Icon name={VCTIcons.add} size={22} color="#fff" />
        <Text style={{ fontSize: 13, fontWeight: FontWeight.extrabold, color: '#fff' }}>Ghi nhận</Text>
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
            <Text style={{ fontSize: 16, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>Ghi nhận giao dịch</Text>
            <Pressable onPress={handleAdd} disabled={submitting}>
              {submitting ? <ActivityIndicator size="small" color={Colors.accent} /> : (
                <Text style={{ fontSize: 15, fontWeight: FontWeight.extrabold, color: Colors.accent }}>Lưu</Text>
              )}
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: Space.lg, gap: 16 }}>
            {/* Type selector */}
            <View>
              <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase' }}>Loại</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {(['income', 'expense'] as const).map(t => (
                  <Pressable key={t}
                    onPress={() => { hapticLight(); setForm(f => ({ ...f, type: t })) }}
                    style={{
                      flex: 1, paddingVertical: 12, borderRadius: Radius.md, alignItems: 'center',
                      backgroundColor: form.type === t ? Colors.overlay(t === 'income' ? Colors.green : Colors.red, 0.12) : Colors.bgCard,
                      borderWidth: 1,
                      borderColor: form.type === t ? (t === 'income' ? Colors.green : Colors.red) : Colors.border,
                    }}>
                    <View style={[SharedStyles.row, { gap: 6 }]}>
                      <Icon name={t === 'income' ? VCTIcons.trending : VCTIcons.trendingDown} size={16}
                        color={form.type === t ? (t === 'income' ? Colors.green : Colors.red) : Colors.textSecondary} />
                      <Text style={{ fontSize: 14, fontWeight: FontWeight.bold,
                        color: form.type === t ? (t === 'income' ? Colors.green : Colors.red) : Colors.textSecondary }}>
                        {t === 'income' ? 'Thu' : 'Chi'}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
            <View>
              <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginBottom: 6, textTransform: 'uppercase' }}>Danh mục</Text>
              <TextInput value={form.category} onChangeText={v => setForm(f => ({ ...f, category: v }))} placeholder="VD: Học phí, Thuê mặt bằng..."
                placeholderTextColor={Colors.textMuted}
                style={{ backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 14, fontSize: 14, color: Colors.textPrimary }} />
            </View>
            <View>
              <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginBottom: 6, textTransform: 'uppercase' }}>Số tiền (VNĐ)</Text>
              <TextInput value={form.amount} onChangeText={v => setForm(f => ({ ...f, amount: v.replace(/[^0-9]/g, '') }))} placeholder="500000" keyboardType="numeric"
                placeholderTextColor={Colors.textMuted}
                style={{ backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 14, fontSize: 14, color: Colors.textPrimary }} />
            </View>
            <View>
              <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginBottom: 6, textTransform: 'uppercase' }}>Mô tả</Text>
              <TextInput value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))} placeholder="Chi tiết giao dịch..." multiline numberOfLines={3}
                placeholderTextColor={Colors.textMuted}
                style={{ backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 14, fontSize: 14, color: Colors.textPrimary, minHeight: 80, textAlignVertical: 'top' }} />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  )
}
