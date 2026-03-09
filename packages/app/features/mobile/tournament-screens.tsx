import * as React from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import {
  repositories,
  type ResultRecord,
  useEntityCollection,
} from '../data/repository'
import type { DangKy, DonVi, LichThiDau, VanDongVien } from '../data/types'

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
    gap: 12,
  },
  card: {
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  rowMeta: {
    fontSize: 12,
    color: '#475569',
  },
  stateBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  stateText: {
    fontSize: 13,
    color: '#334155',
    textAlign: 'center',
  },
  stateButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0ea5e9',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  stateButtonLabel: {
    color: '#0ea5e9',
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 24,
    gap: 8,
  },
})

const ModuleHeader = ({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) => (
  <View style={{ marginBottom: 8 }}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>{subtitle}</Text>
  </View>
)

const EmptyState = ({
  message,
  onReload,
}: {
  message: string
  onReload: () => void
}) => (
  <View style={styles.stateBox}>
    <Text style={styles.stateText}>{message}</Text>
    <Pressable onPress={onReload} style={styles.stateButton}>
      <Text style={styles.stateButtonLabel}>Tải lại</Text>
    </Pressable>
  </View>
)

function ModuleList<T extends { id: string }>({
  title,
  subtitle,
  data,
  loading,
  error,
  onReload,
  emptyMessage,
  renderItem,
}: {
  title: string
  subtitle: string
  data: T[]
  loading: boolean
  error: string | null
  onReload: () => void
  emptyMessage: string
  renderItem: (item: T) => React.ReactElement
}) {
  return (
    <View style={styles.page}>
      <ModuleHeader title={title} subtitle={subtitle} />

      {error && (
        <View
          style={[
            styles.stateBox,
            { borderColor: '#fecaca', backgroundColor: '#fef2f2' },
          ]}
        >
          <Text style={[styles.stateText, { color: '#b91c1c' }]}>
            Không thể tải dữ liệu: {error}
          </Text>
          <Pressable onPress={onReload} style={styles.stateButton}>
            <Text style={styles.stateButtonLabel}>Thử lại</Text>
          </Pressable>
        </View>
      )}

      {loading && data.length === 0 ? (
        <View style={styles.stateBox}>
          <ActivityIndicator size="small" color="#0ea5e9" />
          <Text style={styles.stateText}>Đang tải dữ liệu...</Text>
        </View>
      ) : data.length === 0 ? (
        <EmptyState message={emptyMessage} onReload={onReload} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderItem(item)}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          refreshing={loading}
          onRefresh={onReload}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  )
}

export function TeamsMobileScreen() {
  const { items, uiState, load } = useEntityCollection<DonVi>(repositories.teams.mock)

  return (
    <ModuleList
      title="Đơn vị tham gia"
      subtitle={`${items.length} đơn vị đã đăng ký`}
      data={items}
      loading={uiState.loading}
      error={uiState.error}
      onReload={() => void load()}
      emptyMessage="Chưa có đơn vị nào."
      renderItem={(item) => (
        <View style={styles.card}>
          <Text style={styles.rowTitle}>{item.ten}</Text>
          <Text style={styles.rowMeta}>
            {item.tinh} • {item.so_vdv} VĐV • {item.trang_thai}
          </Text>
        </View>
      )}
    />
  )
}

export function AthletesMobileScreen() {
  const { items, uiState, load } = useEntityCollection<VanDongVien>(
    repositories.athletes.mock
  )

  return (
    <ModuleList
      title="Vận động viên"
      subtitle={`${items.length} hồ sơ vận động viên`}
      data={items}
      loading={uiState.loading}
      error={uiState.error}
      onReload={() => void load()}
      emptyMessage="Chưa có hồ sơ vận động viên."
      renderItem={(item) => (
        <View style={styles.card}>
          <Text style={styles.rowTitle}>{item.ho_ten}</Text>
          <Text style={styles.rowMeta}>
            {item.doan_ten} • {item.can_nang}kg • {item.trang_thai}
          </Text>
        </View>
      )}
    />
  )
}

export function RegistrationMobileScreen() {
  const { items, uiState, load } = useEntityCollection<DangKy>(
    repositories.registration.mock
  )

  return (
    <ModuleList
      title="Đăng ký nội dung"
      subtitle={`${items.length} lượt đăng ký`}
      data={items}
      loading={uiState.loading}
      error={uiState.error}
      onReload={() => void load()}
      emptyMessage="Chưa có lượt đăng ký."
      renderItem={(item) => (
        <View style={styles.card}>
          <Text style={styles.rowTitle}>{item.vdv_ten}</Text>
          <Text style={styles.rowMeta}>
            {item.nd_ten} • {item.doan_ten} • {item.trang_thai}
          </Text>
        </View>
      )}
    />
  )
}

export function ResultsMobileScreen() {
  const { items, uiState, load } = useEntityCollection<ResultRecord>(
    repositories.results.mock
  )

  return (
    <ModuleList
      title="Kết quả thi đấu"
      subtitle={`${items.length} kết quả đã ghi nhận`}
      data={items}
      loading={uiState.loading}
      error={uiState.error}
      onReload={() => void load()}
      emptyMessage="Chưa có kết quả nào."
      renderItem={(item) => (
        <View style={styles.card}>
          <Text style={styles.rowTitle}>{item.noi_dung}</Text>
          <Text style={styles.rowMeta}>
            {item.vdv_ten} • {item.doan} • {item.ket_qua}
          </Text>
        </View>
      )}
    />
  )
}

export function ScheduleMobileScreen() {
  const { items, uiState, load } = useEntityCollection<LichThiDau>(
    repositories.schedule.mock
  )

  return (
    <ModuleList
      title="Lịch thi đấu"
      subtitle={`${items.length} phiên thi đấu`}
      data={items}
      loading={uiState.loading}
      error={uiState.error}
      onReload={() => void load()}
      emptyMessage="Chưa có lịch thi đấu."
      renderItem={(item) => (
        <View style={styles.card}>
          <Text style={styles.rowTitle}>
            {item.ngay} • {item.phien}
          </Text>
          <Text style={styles.rowMeta}>
            {item.noi_dung} • {item.san_id} • {item.trang_thai}
          </Text>
        </View>
      )}
    />
  )
}

export function AccessDeniedMobileScreen() {
  return (
    <View style={styles.page}>
      <View style={[styles.stateBox, { borderColor: '#fecaca', backgroundColor: '#fef2f2' }]}>
        <Text style={[styles.rowTitle, { color: '#991b1b' }]}>
          Không có quyền truy cập màn này
        </Text>
        <Text style={[styles.stateText, { color: '#b91c1c' }]}>
          Hãy đổi role phù hợp ở trang chủ hoặc quay về module được cấp quyền.
        </Text>
      </View>
    </View>
  )
}

export function MobileModuleCard({
  title,
  subtitle,
  onPress,
}: {
  title: string
  subtitle: string
  onPress: () => void
}) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowMeta}>{subtitle}</Text>
    </Pressable>
  )
}
