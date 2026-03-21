/**
 * @deprecated This file has zero imports and is superseded by newer screen modules.
 * Can be safely deleted during next cleanup pass.
 */
import * as React from 'react'
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native'
import { useRouter } from 'solito/navigation'
import { useAuth } from '../auth/AuthProvider'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — MOBILE ATHLETE SCREENS
// 5 screens: Portal, Tournaments, Training, Results, Rankings
// ═══════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────
// COMMON STYLES & COMPONENTS
// ────────────────────────────────────────────────────────────────

const C = {
  bg: '#f8fafc',
  card: '#ffffff',
  dark: '#0f172a',
  muted: '#64748b',
  border: '#e2e8f0',
  accent: '#3b82f6',
  gold: '#f59e0b',
  green: '#22c55e',
  red: '#ef4444',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
  hero: '#0f172a',
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 16, paddingBottom: 40 },

  // Hero / Header
  heroCard: {
    borderRadius: 20, padding: 24, marginBottom: 16,
    backgroundColor: C.hero,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: C.dark, marginBottom: 12, marginTop: 8 },
  subtitle: { fontSize: 12, color: C.muted, marginBottom: 16, marginTop: -8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  headerIcon: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '900', color: C.dark },
  headerSub: { fontSize: 12, color: C.muted, marginTop: 2 },

  // Cards
  card: {
    borderRadius: 16, padding: 16, marginBottom: 12,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
  },
  cardTitle: { fontSize: 14, fontWeight: '800', color: C.dark, marginBottom: 4 },
  cardMeta: { fontSize: 11, color: C.muted },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statBox: {
    flex: 1, borderRadius: 16, padding: 14, alignItems: 'center',
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
  },
  statValue: { fontSize: 22, fontWeight: '900', color: C.dark, marginBottom: 2 },
  statLabel: { fontSize: 10, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Action grid
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  actionBtn: {
    flex: 1, borderRadius: 14, padding: 14, alignItems: 'center',
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
  },
  actionIcon: { fontSize: 22, marginBottom: 6 },
  actionLabel: { fontSize: 11, fontWeight: '700', color: '#334155' },

  // Skill bar
  skillRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  skillLabel: { width: 64, fontSize: 11, fontWeight: '600', color: C.muted, textAlign: 'right' },
  skillTrack: { flex: 1, height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  skillFill: { height: '100%', borderRadius: 4 },
  skillValue: { width: 28, fontSize: 11, fontWeight: '800', textAlign: 'right' },

  // Badges
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
  badgeText: { fontSize: 10, fontWeight: '800' },

  // Progress bar
  progressTrack: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden', marginTop: 6 },
  progressFill: { height: '100%', borderRadius: 3 },

  // Belt timeline
  beltDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: C.card },
  beltLine: { position: 'absolute', left: 5, top: 14, bottom: 0, width: 2, backgroundColor: C.border },

  // Empty
  emptyBox: {
    paddingVertical: 32, alignItems: 'center', justifyContent: 'center',
    borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: C.border,
    backgroundColor: '#fafafa', marginBottom: 12,
  },
  emptyText: { fontSize: 13, color: C.muted, marginTop: 8, textAlign: 'center' },

  // Doc checklist
  docRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10,
    backgroundColor: '#f8fafc', borderWidth: 1, borderColor: C.border, marginBottom: 6,
  },
  docLabel: { fontSize: 12, color: C.muted },
  docIcon: { fontSize: 14 },

  // Back button
  backBtn: {
    width: 36, height: 36, borderRadius: 12, borderWidth: 1, borderColor: C.border,
    backgroundColor: C.card, justifyContent: 'center', alignItems: 'center', marginRight: 8,
  },
  backText: { fontSize: 16, color: C.muted, fontWeight: '600' },
})

// ── Badge Component ──
function Badge({ label, bg, fg }: { label: string; bg: string; fg: string }) {
  return (
    <View style={[s.badge, { backgroundColor: bg }]}>
      <Text style={[s.badgeText, { color: fg }]}>{label}</Text>
    </View>
  )
}

// ── Skill Bar ──
function SkillBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={s.skillRow}>
      <Text style={s.skillLabel}>{label}</Text>
      <View style={s.skillTrack}>
        <View style={[s.skillFill, { width: `${Math.min(value, 100)}%`, backgroundColor: color }]} />
      </View>
      <Text style={[s.skillValue, { color }]}>{value}</Text>
    </View>
  )
}

// ── Goal Progress ──
function GoalBar({ title, progress, color, icon }: { title: string; progress: number; color: string; icon: string }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 14 }}>{icon}</Text>
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.dark }}>{title}</Text>
        </View>
        <Text style={{ fontSize: 11, fontWeight: '800', color }}>{progress}%</Text>
      </View>
      <View style={s.progressTrack}>
        <View style={[s.progressFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: color }]} />
      </View>
    </View>
  )
}

// ── Section Header with Back ──
function ScreenHeader({ title, subtitle, emoji, onBack }: { title: string; subtitle: string; emoji: string; onBack: () => void }) {
  return (
    <View style={s.headerRow}>
      <Pressable style={s.backBtn} onPress={onBack}>
        <Text style={s.backText}>‹</Text>
      </Pressable>
      <Text style={{ fontSize: 24 }}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.headerTitle}>{title}</Text>
        <Text style={s.headerSub}>{subtitle}</Text>
      </View>
    </View>
  )
}

// ────────────────────────────────────────────────────────────────
// MOCK DATA
// ────────────────────────────────────────────────────────────────

const MOCK_SKILLS = [
  { label: 'Kỹ thuật', value: 78, color: C.accent },
  { label: 'Thể lực', value: 65, color: C.green },
  { label: 'Tốc độ', value: 72, color: C.gold },
  { label: 'Sức mạnh', value: 58, color: C.red },
  { label: 'Phản xạ', value: 82, color: C.purple },
  { label: 'Tinh thần', value: 88, color: C.cyan },
]

const MOCK_GOALS = [
  { title: 'Nâng đẳng cấp đai', progress: 72, color: C.red, icon: '🎯' },
  { title: 'Thi đấu 10 giải', progress: 60, color: C.accent, icon: '🏆' },
  { title: 'Duy trì tập luyện', progress: 85, color: C.green, icon: '💪' },
]

const MOCK_BELT_HISTORY = [
  { belt: 'Trắng đai', date: '01/2020', color: '#e2e8f0' },
  { belt: 'Lam đai 1', date: '06/2021', color: '#60a5fa' },
  { belt: 'Lam đai 2', date: '03/2023', color: '#3b82f6' },
  { belt: 'Lam đai 3', date: '09/2024', color: '#2563eb' },
]

const MOCK_TOURNAMENTS = [
  {
    id: '1', name: 'VĐ Toàn Quốc 2025', doan: 'TP. Hồ Chí Minh', date: '15/08/2025',
    categories: ['ĐK Nam 60kg', 'Quyền đơn nam'], status: 'ok' as const,
    docs: { kham_sk: true, bao_hiem: true, cmnd: true, anh: true },
  },
  {
    id: '2', name: 'Giải Trẻ TP.HCM 2025', doan: 'CLB Tân Bình', date: '20/06/2025',
    categories: ['ĐK Nam 60kg'], status: 'missing' as const,
    docs: { kham_sk: true, bao_hiem: false, cmnd: true, anh: false },
  },
  {
    id: '3', name: 'Cúp CLB 2025', doan: 'TP. Hồ Chí Minh', date: '10/04/2025',
    categories: ['Quyền đơn nam'], status: 'rejected' as const,
    docs: { kham_sk: true, bao_hiem: true, cmnd: false, anh: true },
  },
]

const MOCK_TRAINING = [
  { id: '1', type: 'regular' as const, date: '12/03/2026', time: '17:00 – 19:00', location: 'Nhà thi đấu Q.1', coach: 'HLV Nguyễn Văn A', status: 'completed' as const },
  { id: '2', type: 'sparring' as const, date: '13/03/2026', time: '06:00 – 08:00', location: 'CLB Tân Bình', coach: 'HLV Trần Thị B', status: 'scheduled' as const },
  { id: '3', type: 'regular' as const, date: '14/03/2026', time: '17:00 – 19:00', location: 'Nhà thi đấu Q.1', coach: 'HLV Nguyễn Văn A', status: 'scheduled' as const },
  { id: '4', type: 'exam' as const, date: '16/03/2026', time: '08:00 – 12:00', location: 'SVĐ Thống Nhất', coach: 'HLV Trần Thị B', status: 'scheduled' as const },
  { id: '5', type: 'special' as const, date: '18/03/2026', time: '15:00 – 17:00', location: 'CLB Phú Thọ', coach: 'HLV Lê Văn C', status: 'scheduled' as const },
]

const MOCK_RESULTS = [
  { id: '1', name: 'VĐ Toàn Quốc 2025', medal: '🥇', result: 'HCV', category: 'ĐK Nam 60kg', date: '15/08/2025' },
  { id: '2', name: 'Giải Trẻ TP.HCM 2025', medal: '🥈', result: 'HCB', category: 'ĐK Nam 60kg', date: '20/06/2025' },
  { id: '3', name: 'Cúp CLB 2025', medal: '🥉', result: 'HCĐ', category: 'Quyền đơn nam', date: '10/04/2025' },
  { id: '4', name: 'Giải Vô Địch Miền Nam 2024', medal: '🥇', result: 'HCV', category: 'ĐK Nam 57kg', date: '20/11/2024' },
  { id: '5', name: 'Giải Trẻ Quốc Gia 2024', medal: '🥈', result: 'HCB', category: 'Quyền đơn nam', date: '05/07/2024' },
]

const SESSION_TYPE_CFG: Record<string, { label: string; emoji: string; color: string }> = {
  regular: { label: 'Thường', emoji: '🥋', color: C.accent },
  sparring: { label: 'Đối kháng', emoji: '⚔️', color: C.red },
  exam: { label: 'Thi / Đấu', emoji: '🏆', color: C.gold },
  special: { label: 'Đặc biệt', emoji: '⭐', color: C.purple },
}

const SESSION_STATUS_CFG: Record<string, { label: string; bg: string; fg: string }> = {
  completed: { label: 'Đã tập', bg: '#dcfce7', fg: '#166534' },
  scheduled: { label: 'Sắp tới', bg: '#dbeafe', fg: '#1e40af' },
  absent: { label: 'Vắng', bg: '#fee2e2', fg: '#991b1b' },
  cancelled: { label: 'Hủy', bg: '#fef3c7', fg: '#92400e' },
}

const TOURNAMENT_STATUS_CFG: Record<string, { label: string; bg: string; fg: string }> = {
  ok: { label: 'Hợp lệ', bg: '#dcfce7', fg: '#166534' },
  missing: { label: 'Thiếu HS', bg: '#fef3c7', fg: '#92400e' },
  rejected: { label: 'Từ chối', bg: '#fee2e2', fg: '#991b1b' },
}

// ════════════════════════════════════════════════════════════════
// 1. ATHLETE PORTAL MOBILE SCREEN
// ════════════════════════════════════════════════════════════════

export function AthletePortalMobileScreen() {
  const { currentUser } = useAuth()
  const router = useRouter()

  return (
    <ScrollView style={s.page} contentContainerStyle={s.scroll}>
      {/* HERO */}
      <View style={s.heroCard}>
        <View style={{
          width: 72, height: 72, borderRadius: 36,
          backgroundColor: 'rgba(59,130,246,0.2)', justifyContent: 'center', alignItems: 'center',
          marginBottom: 12, borderWidth: 2, borderColor: 'rgba(59,130,246,0.4)',
        }}>
          <Text style={{ fontSize: 32 }}>🥋</Text>
        </View>
        <Text style={{ fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 4 }}>
          {currentUser.name || 'VĐV Demo'}
        </Text>
        <Text style={{ fontSize: 13, color: '#94a3b8', fontWeight: '600' }}>
          Vận động viên · CLB Tân Bình
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(245,158,11,0.15)' }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#f59e0b' }}>🥋 Lam đai 3</Text>
          </View>
          <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(59,130,246,0.15)' }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#3b82f6' }}>📊 Elo: 1450</Text>
          </View>
          <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(34,197,94,0.15)' }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#22c55e' }}>✅ Đang hoạt động</Text>
          </View>
        </View>
      </View>

      {/* STATS */}
      <View style={s.statsRow}>
        <View style={s.statBox}>
          <Text style={s.statValue}>12</Text>
          <Text style={s.statLabel}>Giải đấu</Text>
        </View>
        <View style={s.statBox}>
          <Text style={[s.statValue, { color: C.gold }]}>5</Text>
          <Text style={s.statLabel}>Huy chương</Text>
        </View>
        <View style={s.statBox}>
          <Text style={[s.statValue, { color: C.green }]}>87%</Text>
          <Text style={s.statLabel}>Tỷ lệ tập</Text>
        </View>
      </View>

      {/* QUICK ACTIONS */}
      <Text style={s.sectionTitle}>Truy cập nhanh</Text>
      <View style={s.actionRow}>
        <Pressable style={s.actionBtn} onPress={() => router.push('/athlete-tournaments')}>
          <Text style={s.actionIcon}>🏆</Text>
          <Text style={s.actionLabel}>Giải đấu</Text>
        </Pressable>
        <Pressable style={s.actionBtn} onPress={() => router.push('/athlete-training')}>
          <Text style={s.actionIcon}>📋</Text>
          <Text style={s.actionLabel}>Lịch tập</Text>
        </Pressable>
        <Pressable style={s.actionBtn} onPress={() => router.push('/athlete-results')}>
          <Text style={s.actionIcon}>🏅</Text>
          <Text style={s.actionLabel}>Thành tích</Text>
        </Pressable>
        <Pressable style={s.actionBtn} onPress={() => router.push('/athlete-rankings')}>
          <Text style={s.actionIcon}>📊</Text>
          <Text style={s.actionLabel}>Xếp hạng</Text>
        </Pressable>
      </View>

      {/* SKILL BARS */}
      <Text style={s.sectionTitle}>Chỉ số kỹ năng</Text>
      <View style={s.card}>
        {MOCK_SKILLS.map(sk => (
          <SkillBar key={sk.label} label={sk.label} value={sk.value} color={sk.color} />
        ))}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10, marginTop: 6 }}>
          <Text style={{ fontSize: 11, color: C.muted }}>
            Trung bình: <Text style={{ fontWeight: '800', color: C.dark }}>{Math.round(MOCK_SKILLS.reduce((a, sk) => a + sk.value, 0) / MOCK_SKILLS.length)}</Text>/100
          </Text>
          <Text style={{ fontSize: 11, fontWeight: '800', color: C.purple }}>💪 Tốt</Text>
        </View>
      </View>

      {/* PERSONAL GOALS */}
      <Text style={s.sectionTitle}>Mục tiêu cá nhân</Text>
      <View style={s.card}>
        {MOCK_GOALS.map(g => (
          <GoalBar key={g.title} title={g.title} progress={g.progress} color={g.color} icon={g.icon} />
        ))}
      </View>

      {/* BELT TIMELINE */}
      <Text style={s.sectionTitle}>Hành trình thăng đai</Text>
      <View style={s.card}>
        {MOCK_BELT_HISTORY.map((b, idx) => (
          <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: idx < MOCK_BELT_HISTORY.length - 1 ? 14 : 0, position: 'relative' }}>
            {idx < MOCK_BELT_HISTORY.length - 1 && (
              <View style={{ position: 'absolute', left: 5, top: 14, height: 26, width: 2, backgroundColor: C.border }} />
            )}
            <View style={[s.beltDot, { backgroundColor: b.color }]} />
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: C.dark }}>{b.belt}</Text>
              <Text style={{ fontSize: 10, color: C.muted, fontFamily: 'monospace' }}>{b.date}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* RECENT TOURNAMENTS */}
      <Text style={s.sectionTitle}>Giải đấu gần đây</Text>
      {MOCK_TOURNAMENTS.slice(0, 2).map(t => {
        const st = TOURNAMENT_STATUS_CFG[t.status] ?? TOURNAMENT_STATUS_CFG.ok!
        return (
          <View key={t.id} style={s.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={s.cardTitle}>{t.name}</Text>
              <Badge label={st.label} bg={st.bg} fg={st.fg} />
            </View>
            <Text style={s.cardMeta}>{t.doan} · {t.date}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {t.categories.map((c, i) => (
                <View key={i} style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: 'rgba(59,130,246,0.1)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)' }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: C.accent }}>{c}</Text>
                </View>
              ))}
            </View>
          </View>
        )
      })}
    </ScrollView>
  )
}

// ════════════════════════════════════════════════════════════════
// 2. ATHLETE TOURNAMENTS MOBILE SCREEN
// ════════════════════════════════════════════════════════════════

export function AthleteTournamentsMobileScreen() {
  const router = useRouter()

  const totalOk = MOCK_TOURNAMENTS.filter(t => t.status === 'ok').length
  const totalMissing = MOCK_TOURNAMENTS.filter(t => t.status === 'missing').length
  const totalRejected = MOCK_TOURNAMENTS.filter(t => t.status === 'rejected').length

  return (
    <ScrollView style={s.page} contentContainerStyle={s.scroll}>
      <ScreenHeader
        title="Giải đấu"
        subtitle="Theo dõi thi đấu và hồ sơ"
        emoji="🏆"
        onBack={() => router.back()}
      />

      {/* Stats */}
      <View style={s.statsRow}>
        <View style={s.statBox}>
          <Text style={s.statValue}>{MOCK_TOURNAMENTS.length}</Text>
          <Text style={s.statLabel}>Tổng giải</Text>
        </View>
        <View style={s.statBox}>
          <Text style={[s.statValue, { color: C.green }]}>{totalOk}</Text>
          <Text style={s.statLabel}>Hợp lệ</Text>
        </View>
        <View style={s.statBox}>
          <Text style={[s.statValue, { color: C.gold }]}>{totalMissing}</Text>
          <Text style={s.statLabel}>Thiếu HS</Text>
        </View>
        <View style={s.statBox}>
          <Text style={[s.statValue, { color: C.red }]}>{totalRejected}</Text>
          <Text style={s.statLabel}>Từ chối</Text>
        </View>
      </View>

      {/* Tournament Cards */}
      {MOCK_TOURNAMENTS.map(t => {
        const st = TOURNAMENT_STATUS_CFG[t.status] ?? TOURNAMENT_STATUS_CFG.ok!
        const docs = [
          { l: 'Khám sức khỏe', ok: t.docs.kham_sk },
          { l: 'Bảo hiểm y tế', ok: t.docs.bao_hiem },
          { l: 'CCCD/CMND', ok: t.docs.cmnd },
          { l: 'Ảnh thẻ', ok: t.docs.anh },
        ]
        const okCount = docs.filter(d => d.ok).length
        const pct = (okCount / docs.length) * 100

        return (
          <View key={t.id} style={s.card}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={s.cardTitle}>{t.name}</Text>
                <Text style={[s.cardMeta, { marginTop: 4 }]}>📍 {t.doan} · 📅 {t.date}</Text>
              </View>
              <Badge label={st.label} bg={st.bg} fg={st.fg} />
            </View>

            {/* Categories */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {t.categories.map((c, i) => (
                <View key={i} style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: 'rgba(59,130,246,0.1)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)' }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: C.accent }}>{c}</Text>
                </View>
              ))}
            </View>

            {/* Progress */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: C.muted }}>Tiến độ hồ sơ</Text>
              <Text style={{ fontSize: 11, fontWeight: '800', color: pct === 100 ? C.green : C.gold }}>{okCount}/{docs.length}</Text>
            </View>
            <View style={{ height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden', marginBottom: 10 }}>
              <View style={{ height: '100%', borderRadius: 3, width: `${pct}%`, backgroundColor: pct === 100 ? C.green : C.gold }} />
            </View>

            {/* Doc checklist */}
            {docs.map(d => (
              <View key={d.l} style={s.docRow}>
                <Text style={s.docLabel}>{d.l}</Text>
                <Text style={s.docIcon}>{d.ok ? '✅' : '❌'}</Text>
              </View>
            ))}
          </View>
        )
      })}
    </ScrollView>
  )
}

// ════════════════════════════════════════════════════════════════
// 3. ATHLETE TRAINING MOBILE SCREEN
// ════════════════════════════════════════════════════════════════

export function AthleteTrainingMobileScreen() {
  const router = useRouter()

  const attendanceStats = { total: 48, attended: 42, streak: 7, absent: 4, cancelled: 2, rate: 87.5 }
  const typeBreakdown = [
    { type: 'regular', count: 30 },
    { type: 'sparring', count: 8 },
    { type: 'exam', count: 6 },
    { type: 'special', count: 4 },
  ]

  return (
    <ScrollView style={s.page} contentContainerStyle={s.scroll}>
      <ScreenHeader
        title="Lịch tập"
        subtitle="Lịch tập luyện và điểm danh"
        emoji="📋"
        onBack={() => router.back()}
      />

      {/* Attendance Stats */}
      <View style={s.statsRow}>
        <View style={s.statBox}>
          <Text style={s.statValue}>{attendanceStats.total}</Text>
          <Text style={s.statLabel}>Tổng buổi</Text>
        </View>
        <View style={s.statBox}>
          <Text style={[s.statValue, { color: C.green }]}>{attendanceStats.attended}</Text>
          <Text style={s.statLabel}>Đã tập</Text>
        </View>
        <View style={s.statBox}>
          <Text style={[s.statValue, { color: C.purple }]}>{attendanceStats.streak}</Text>
          <Text style={s.statLabel}>Chuỗi</Text>
        </View>
        <View style={s.statBox}>
          <Text style={[s.statValue, { color: C.red }]}>{attendanceStats.absent}</Text>
          <Text style={s.statLabel}>Vắng</Text>
        </View>
      </View>

      {/* Attendance rate */}
      <View style={s.card}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: C.muted, marginBottom: 6 }}>Tỷ lệ chuyên cần</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={{ fontSize: 28, fontWeight: '900', color: C.green }}>{attendanceStats.rate}%</Text>
          <View style={{ flex: 1 }}>
            <View style={{ height: 10, backgroundColor: '#f1f5f9', borderRadius: 5, overflow: 'hidden' }}>
              <View style={{ height: '100%', borderRadius: 5, width: `${attendanceStats.rate}%`, backgroundColor: C.green }} />
            </View>
          </View>
        </View>
        <Text style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>
          🔥 Chuỗi {attendanceStats.streak} buổi liên tiếp · {attendanceStats.cancelled} buổi hủy
        </Text>
      </View>

      {/* Upcoming Sessions */}
      <Text style={s.sectionTitle}>Buổi tập sắp tới</Text>
      {MOCK_TRAINING.filter(t => t.status === 'scheduled').map(session => {
        const cfg = SESSION_TYPE_CFG[session.type] ?? SESSION_TYPE_CFG.regular!
        const stCfg = SESSION_STATUS_CFG[session.status] ?? SESSION_STATUS_CFG.scheduled!
        return (
          <View key={session.id} style={s.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 16 }}>{cfg.emoji}</Text>
                <Text style={{ fontSize: 12, fontWeight: '800', color: cfg.color }}>{cfg.label}</Text>
              </View>
              <Badge label={stCfg.label} bg={stCfg.bg} fg={stCfg.fg} />
            </View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.dark, marginBottom: 4 }}>🕐 {session.time}</Text>
            <Text style={{ fontSize: 11, color: C.muted }}>📍 {session.location}</Text>
            <Text style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>👤 {session.coach}</Text>
            <Text style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>📅 {session.date}</Text>
          </View>
        )
      })}

      {/* Completed Sessions */}
      <Text style={s.sectionTitle}>Buổi tập đã hoàn thành</Text>
      {MOCK_TRAINING.filter(t => t.status === 'completed').map(session => {
        const cfg = SESSION_TYPE_CFG[session.type] ?? SESSION_TYPE_CFG.regular!
        const stCfg = SESSION_STATUS_CFG[session.status] ?? SESSION_STATUS_CFG.completed!
        return (
          <View key={session.id} style={s.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 14 }}>{cfg.emoji}</Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: cfg.color }}>{cfg.label}</Text>
              </View>
              <Badge label={stCfg.label} bg={stCfg.bg} fg={stCfg.fg} />
            </View>
            <Text style={{ fontSize: 12, color: C.dark, fontWeight: '600' }}>{session.time} · {session.date}</Text>
            <Text style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{session.location} · {session.coach}</Text>
          </View>
        )
      })}

      {/* Type Breakdown */}
      <Text style={s.sectionTitle}>Phân loại buổi tập</Text>
      <View style={s.card}>
        {typeBreakdown.map(({ type, count }) => {
          const cfg = SESSION_TYPE_CFG[type] ?? SESSION_TYPE_CFG.regular!
          const pct = attendanceStats.total > 0 ? (count / attendanceStats.total) * 100 : 0
          return (
            <View key={type} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Text style={{ fontSize: 14, width: 20 }}>{cfg.emoji}</Text>
              <Text style={{ fontSize: 11, fontWeight: '700', width: 64, color: cfg.color }}>{cfg.label}</Text>
              <View style={{ flex: 1, height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                <View style={{ height: '100%', borderRadius: 4, width: `${pct}%`, backgroundColor: cfg.color }} />
              </View>
              <Text style={{ fontSize: 12, fontWeight: '800', width: 24, textAlign: 'right', color: C.dark }}>{count}</Text>
            </View>
          )
        })}
      </View>
    </ScrollView>
  )
}

// ════════════════════════════════════════════════════════════════
// 4. ATHLETE RESULTS MOBILE SCREEN
// ════════════════════════════════════════════════════════════════

export function AthleteResultsMobileScreen() {
  const router = useRouter()

  const medals = { gold: 2, silver: 2, bronze: 1, total: 5 }

  return (
    <ScrollView style={s.page} contentContainerStyle={s.scroll}>
      <ScreenHeader
        title="Kết quả thi đấu"
        subtitle="Thành tích qua các giải đấu"
        emoji="🏅"
        onBack={() => router.back()}
      />

      {/* Medal Breakdown */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <View style={[s.statBox, { borderColor: 'rgba(245,158,11,0.3)', backgroundColor: 'rgba(245,158,11,0.05)' }]}>
          <Text style={{ fontSize: 24, marginBottom: 4 }}>🥇</Text>
          <Text style={[s.statValue, { color: '#d97706' }]}>{medals.gold}</Text>
          <Text style={[s.statLabel, { color: '#b45309' }]}>Vàng</Text>
        </View>
        <View style={[s.statBox, { borderColor: 'rgba(148,163,184,0.3)', backgroundColor: 'rgba(148,163,184,0.05)' }]}>
          <Text style={{ fontSize: 24, marginBottom: 4 }}>🥈</Text>
          <Text style={[s.statValue, { color: '#64748b' }]}>{medals.silver}</Text>
          <Text style={[s.statLabel, { color: '#64748b' }]}>Bạc</Text>
        </View>
        <View style={[s.statBox, { borderColor: 'rgba(194,120,62,0.3)', backgroundColor: 'rgba(194,120,62,0.05)' }]}>
          <Text style={{ fontSize: 24, marginBottom: 4 }}>🥉</Text>
          <Text style={[s.statValue, { color: '#c2783e' }]}>{medals.bronze}</Text>
          <Text style={[s.statLabel, { color: '#92400e' }]}>Đồng</Text>
        </View>
      </View>

      {/* Elo + Total Stats */}
      <View style={s.statsRow}>
        <View style={[s.statBox, { borderColor: 'rgba(59,130,246,0.2)', backgroundColor: 'rgba(59,130,246,0.05)' }]}>
          <Text style={{ fontSize: 12, marginBottom: 2 }}>📊</Text>
          <Text style={[s.statValue, { color: C.accent }]}>1450</Text>
          <Text style={s.statLabel}>Điểm Elo</Text>
        </View>
        <View style={s.statBox}>
          <Text style={{ fontSize: 12, marginBottom: 2 }}>🏆</Text>
          <Text style={s.statValue}>12</Text>
          <Text style={s.statLabel}>Tổng giải</Text>
        </View>
        <View style={s.statBox}>
          <Text style={{ fontSize: 12, marginBottom: 2 }}>🏅</Text>
          <Text style={[s.statValue, { color: C.gold }]}>{medals.total}</Text>
          <Text style={s.statLabel}>Tổng HC</Text>
        </View>
      </View>

      {/* Competition History */}
      <Text style={s.sectionTitle}>Lịch sử thi đấu</Text>
      {MOCK_RESULTS.map((r, idx) => (
        <View key={r.id} style={s.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <View style={{
                width: 32, height: 32, borderRadius: 10,
                backgroundColor: 'rgba(245,158,11,0.1)', justifyContent: 'center', alignItems: 'center',
              }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: C.gold }}>{idx + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: C.dark }}>{r.name}</Text>
                <Text style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{r.category} · {r.date}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 18 }}>{r.medal}</Text>
              <Text style={{ fontSize: 12, fontWeight: '800', color: C.dark }}>{r.result}</Text>
            </View>
          </View>
        </View>
      ))}

      {/* Summary Footer */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
        <View style={[s.statBox, { paddingVertical: 10 }]}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: C.dark }}>12</Text>
          <Text style={[s.statLabel, { marginTop: 2 }]}>Giải đấu</Text>
        </View>
        <View style={[s.statBox, { paddingVertical: 10 }]}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: C.green }}>3</Text>
          <Text style={[s.statLabel, { marginTop: 2 }]}>Hoàn thành</Text>
        </View>
        <View style={[s.statBox, { paddingVertical: 10 }]}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: C.accent }}>2</Text>
          <Text style={[s.statLabel, { marginTop: 2 }]}>CLB đại diện</Text>
        </View>
      </View>
    </ScrollView>
  )
}

// ════════════════════════════════════════════════════════════════
// 5. ATHLETE RANKINGS MOBILE SCREEN
// ════════════════════════════════════════════════════════════════

export function AthleteRankingsMobileScreen() {
  const router = useRouter()

  return (
    <ScrollView style={s.page} contentContainerStyle={s.scroll}>
      <ScreenHeader
        title="BXH & Chỉ số"
        subtitle="Xếp hạng và thành tích cá nhân"
        emoji="📊"
        onBack={() => router.back()}
      />

      {/* Quick Stats */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <View style={[s.statBox, { borderColor: 'rgba(59,130,246,0.2)', backgroundColor: 'rgba(59,130,246,0.06)' }]}>
          <Text style={{ fontSize: 16, marginBottom: 4 }}>📊</Text>
          <Text style={[s.statValue, { color: C.accent, fontSize: 26 }]}>1450</Text>
          <Text style={[s.statLabel, { color: '#2563eb' }]}>Điểm Elo</Text>
        </View>
        <View style={[s.statBox, { borderColor: 'rgba(245,158,11,0.2)', backgroundColor: 'rgba(245,158,11,0.06)' }]}>
          <Text style={{ fontSize: 16, marginBottom: 4 }}>🏅</Text>
          <Text style={[s.statValue, { color: C.gold, fontSize: 26 }]}>5</Text>
          <Text style={[s.statLabel, { color: '#b45309' }]}>Huy chương</Text>
        </View>
        <View style={[s.statBox, { borderColor: 'rgba(34,197,94,0.2)', backgroundColor: 'rgba(34,197,94,0.06)' }]}>
          <Text style={{ fontSize: 16, marginBottom: 4 }}>🏆</Text>
          <Text style={[s.statValue, { color: C.green, fontSize: 26 }]}>12</Text>
          <Text style={[s.statLabel, { color: '#16a34a' }]}>Giải đấu</Text>
        </View>
      </View>

      {/* Skill Bars */}
      <Text style={s.sectionTitle}>Chỉ số kỹ năng</Text>
      <View style={s.card}>
        {MOCK_SKILLS.map(sk => (
          <SkillBar key={sk.label} label={sk.label} value={sk.value} color={sk.color} />
        ))}
      </View>

      {/* Goals */}
      <Text style={s.sectionTitle}>Mục tiêu cá nhân</Text>
      <View style={s.card}>
        {MOCK_GOALS.map(g => (
          <GoalBar key={g.title} title={g.title} progress={g.progress} color={g.color} icon={g.icon} />
        ))}
      </View>

      {/* Elo History Placeholder */}
      <Text style={s.sectionTitle}>Lịch sử xếp hạng</Text>
      <View style={s.emptyBox}>
        <Text style={{ fontSize: 36 }}>📈</Text>
        <Text style={[s.emptyText, { fontWeight: '700' }]}>Biểu đồ Elo</Text>
        <Text style={[s.emptyText, { fontSize: 11, maxWidth: 220 }]}>Biểu đồ lịch sử xếp hạng Elo sẽ được hiển thị tại đây. Tính năng đang phát triển.</Text>
      </View>

      {/* Rankings Snapshot */}
      <Text style={s.sectionTitle}>Vị trí xếp hạng</Text>
      <View style={s.card}>
        {[
          { label: 'Toàn quốc (ĐK Nam 60kg)', rank: '#12', trend: '↑ 3' },
          { label: 'Khu vực phía Nam', rank: '#5', trend: '↑ 1' },
          { label: 'TP. Hồ Chí Minh', rank: '#3', trend: '—' },
        ].map((r, idx) => (
          <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: idx < 2 ? 1 : 0, borderBottomColor: C.border }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.dark, flex: 1 }}>{r.label}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: C.accent }}>{r.rank}</Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: r.trend.includes('↑') ? C.green : C.muted }}>{r.trend}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
