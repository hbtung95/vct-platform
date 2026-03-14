import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions, RefreshControl } from 'react-native'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — ANALYTICS DASHBOARD
// Real-time stats, trends, and visualizations for VCT data.
// ═══════════════════════════════════════════════════════════════

// ── Types ───────────────────────────────────────────────────

interface StatsCard {
  label: string
  value: string | number
  icon: string
  trend?: { direction: 'up' | 'down' | 'flat'; percentage: number }
  color: string
}

interface AnalyticsData {
  overview: StatsCard[]
  athletesByProvince: { name: string; count: number }[]
  tournamentTrend: { month: string; count: number }[]
  beltDistribution: { belt: string; count: number; color: string }[]
  recentActivity: { action: string; time: string; user: string }[]
}

// ── Mock Data Generator ─────────────────────────────────────

function getAnalyticsData(): AnalyticsData {
  return {
    overview: [
      { label: 'Tổng VĐV', value: '12,450', icon: '🥋', trend: { direction: 'up', percentage: 8.2 }, color: '#2563eb' },
      { label: 'Tổng CLB', value: '342', icon: '🏛️', trend: { direction: 'up', percentage: 3.5 }, color: '#7c3aed' },
      { label: 'Giải đang tổ chức', value: '5', icon: '🏆', trend: { direction: 'flat', percentage: 0 }, color: '#f59e0b' },
      { label: 'Trọng tài hoạt động', value: '890', icon: '👨‍⚖️', trend: { direction: 'up', percentage: 5.1 }, color: '#16a34a' },
      { label: 'ELO trung bình', value: '1,234', icon: '📊', trend: { direction: 'up', percentage: 2.3 }, color: '#ec4899' },
      { label: 'Thu/Chi tháng', value: '₫245M', icon: '💰', trend: { direction: 'down', percentage: 1.2 }, color: '#ef4444' },
    ],
    athletesByProvince: [
      { name: 'TP.HCM', count: 3200 }, { name: 'Hà Nội', count: 2800 },
      { name: 'Bình Định', count: 1500 }, { name: 'Đà Nẵng', count: 980 },
      { name: 'TT-Huế', count: 750 }, { name: 'An Giang', count: 620 },
      { name: 'Cần Thơ', count: 550 }, { name: 'Đồng Nai', count: 480 },
    ],
    tournamentTrend: [
      { month: 'T1', count: 2 }, { month: 'T2', count: 3 }, { month: 'T3', count: 5 },
      { month: 'T4', count: 4 }, { month: 'T5', count: 8 }, { month: 'T6', count: 6 },
      { month: 'T7', count: 3 }, { month: 'T8', count: 7 }, { month: 'T9', count: 9 },
      { month: 'T10', count: 11 }, { month: 'T11', count: 14 }, { month: 'T12', count: 8 },
    ],
    beltDistribution: [
      { belt: 'Bạch đai', count: 4500, color: '#e2e8f0' },
      { belt: 'Lam đai 1', count: 2800, color: '#60a5fa' },
      { belt: 'Lam đai 2', count: 1900, color: '#3b82f6' },
      { belt: 'Hoàng đai 1', count: 1200, color: '#fbbf24' },
      { belt: 'Hoàng đai 2', count: 800, color: '#f59e0b' },
      { belt: 'Hoàng đai 3', count: 450, color: '#d97706' },
      { belt: 'Huyền đai', count: 300, color: '#1e293b' },
    ],
    recentActivity: [
      { action: 'Giải VCT TP.HCM kết thúc', time: '2 giờ trước', user: 'BTC' },
      { action: 'Cập nhật ELO 45 VĐV', time: '3 giờ trước', user: 'Hệ thống' },
      { action: 'Đăng ký mở CLB Phượng Hoàng', time: '5 giờ trước', user: 'Nguyễn Văn A' },
      { action: 'Thêm 12 VĐV mới', time: '1 ngày trước', user: 'CLB Bình Định' },
      { action: 'Cập nhật quy chế 2026', time: '2 ngày trước', user: 'Admin' },
    ],
  }
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// ── Main Dashboard ──────────────────────────────────────────

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'athletes' | 'tournaments'>('overview')

  const loadData = useCallback(() => {
    setData(getAnalyticsData())
    setRefreshing(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  if (!data) return <Text style={s.loading}>Đang tải...</Text>

  return (
    <ScrollView
      style={s.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData() }} />}
    >
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>📊 Analytics Dashboard</Text>
        <Text style={s.headerSub}>Tổng quan hệ thống VCT Platform</Text>
      </View>

      {/* Tab Bar */}
      <View style={s.tabBar}>
        {(['overview', 'athletes', 'tournaments'] as const).map((tab) => (
          <Pressable key={tab} style={[s.tab, activeTab === tab && s.tabActive]} onPress={() => setActiveTab(tab)}>
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
              {tab === 'overview' ? '📈 Tổng quan' : tab === 'athletes' ? '🥋 VĐV' : '🏆 Giải đấu'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Stats Cards */}
      <View style={s.cardsGrid}>
        {data.overview.map((card, i) => (
          <View key={i} style={s.card}>
            <Text style={s.cardIcon}>{card.icon}</Text>
            <Text style={s.cardValue}>{card.value}</Text>
            <Text style={s.cardLabel}>{card.label}</Text>
            {card.trend && (
              <View style={[s.trend, { backgroundColor: card.trend.direction === 'up' ? '#f0fdf4' : card.trend.direction === 'down' ? '#fef2f2' : '#f8fafc' }]}>
                <Text style={[s.trendText, { color: card.trend.direction === 'up' ? '#16a34a' : card.trend.direction === 'down' ? '#dc2626' : '#64748b' }]}>
                  {card.trend.direction === 'up' ? '↑' : card.trend.direction === 'down' ? '↓' : '→'} {card.trend.percentage}%
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Bar Chart — Athletes by Province */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>🗺️ VĐV theo tỉnh/thành</Text>
        {data.athletesByProvince.map((item, i) => {
          const maxCount = Math.max(...data.athletesByProvince.map(p => p.count))
          const barWidth = (item.count / maxCount) * (SCREEN_WIDTH - 150)
          return (
            <View key={i} style={s.barRow}>
              <Text style={s.barLabel}>{item.name}</Text>
              <View style={[s.bar, { width: barWidth, backgroundColor: '#3b82f6' }]} />
              <Text style={s.barValue}>{item.count.toLocaleString()}</Text>
            </View>
          )
        })}
      </View>

      {/* Belt Distribution */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>🥋 Phân bổ cấp đai</Text>
        {data.beltDistribution.map((item, i) => {
          const total = data.beltDistribution.reduce((sum, b) => sum + b.count, 0)
          const pct = ((item.count / total) * 100).toFixed(1)
          return (
            <View key={i} style={s.beltRow}>
              <View style={[s.beltDot, { backgroundColor: item.color }]} />
              <Text style={s.beltName}>{item.belt}</Text>
              <View style={s.beltBarBg}>
                <View style={[s.beltBar, { width: `${pct}%` as unknown as number, backgroundColor: item.color }]} />
              </View>
              <Text style={s.beltCount}>{item.count}</Text>
            </View>
          )
        })}
      </View>

      {/* Recent Activity */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>🕐 Hoạt động gần đây</Text>
        {data.recentActivity.map((item, i) => (
          <View key={i} style={s.activityRow}>
            <View style={s.activityDot} />
            <View style={{ flex: 1 }}>
              <Text style={s.activityAction}>{item.action}</Text>
              <Text style={s.activityMeta}>{item.user} · {item.time}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

// ── Styles ──────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loading: { textAlign: 'center', marginTop: 100, fontSize: 16, color: '#64748b' },
  header: { padding: 20, paddingTop: 16, backgroundColor: '#1e293b' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#ffffff' },
  headerSub: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  tabBar: { flexDirection: 'row', backgroundColor: '#ffffff', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#f1f5f9' },
  tabActive: { backgroundColor: '#2563eb' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  tabTextActive: { color: '#ffffff' },
  cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 12, justifyContent: 'space-between' },
  card: {
    width: (SCREEN_WIDTH - 36) / 2, backgroundColor: '#ffffff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardIcon: { fontSize: 28, marginBottom: 8 },
  cardValue: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  cardLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  trend: { marginTop: 8, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, alignSelf: 'flex-start' },
  trendText: { fontSize: 12, fontWeight: '700' },
  section: { margin: 12, backgroundColor: '#ffffff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  barLabel: { width: 60, fontSize: 12, color: '#475569', fontWeight: '500', textAlign: 'right' },
  bar: { height: 20, borderRadius: 4, minWidth: 4 },
  barValue: { fontSize: 12, color: '#64748b', fontWeight: '600', width: 45, textAlign: 'right' },
  beltRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  beltDot: { width: 12, height: 12, borderRadius: 6 },
  beltName: { width: 80, fontSize: 12, color: '#475569', fontWeight: '500' },
  beltBarBg: { flex: 1, height: 16, backgroundColor: '#f1f5f9', borderRadius: 8, overflow: 'hidden' },
  beltBar: { height: 16, borderRadius: 8 },
  beltCount: { width: 40, fontSize: 12, color: '#64748b', fontWeight: '600', textAlign: 'right' },
  activityRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
  activityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3b82f6', marginTop: 5 },
  activityAction: { fontSize: 14, color: '#0f172a', fontWeight: '500' },
  activityMeta: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
})
