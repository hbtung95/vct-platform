/**
 * @deprecated This file has zero imports and is superseded by newer screen modules.
 * Can be safely deleted during next cleanup pass.
 */
import * as React from 'react'
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { useAuth } from '../auth/AuthProvider'
import { Colors, SharedStyles, FontWeight, Radius, Space, Touch } from './mobile-theme'
import { Badge, ScreenSkeleton, StatsCounter } from './mobile-ui'
import { Icon, VCTIcons } from './icons'
import { hapticLight } from './haptics'
import { useAthleteProfileMe } from './useAthleteData'
import { EditProfileModal } from './edit-profile-modal'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Profile Screen (v4)
// Role-adaptive: athlete, parent, club manager, default
// ═══════════════════════════════════════════════════════════════

// ── Role detection ──
const CLUB_ROLES = ['coach', 'club_leader', 'club_vice_leader', 'club_secretary', 'club_accountant']

const ROLE_LABELS: Record<string, string> = {
  athlete: 'Vận động viên',
  coach: 'Huấn luyện viên',
  parent: 'Phụ huynh',
  club_leader: 'Chủ nhiệm CLB',
  club_vice_leader: 'Phó chủ nhiệm',
  club_secretary: 'Thư ký CLB',
  club_accountant: 'Thủ quỹ',
  admin: 'Quản trị viên',
  federation_admin: 'Liên đoàn',
  referee: 'Trọng tài',
}

const ROLE_ICONS: Record<string, keyof typeof VCTIcons> = {
  athlete: 'fitness',
  coach: 'book',
  parent: 'people',
  club_leader: 'shield',
  club_vice_leader: 'shield',
  club_secretary: 'document',
  club_accountant: 'trending',
  admin: 'settings',
  federation_admin: 'trophy',
  referee: 'eye',
}

function getRoleGroup(role?: string): 'athlete' | 'parent' | 'club' | 'default' {
  if (!role) return 'default'
  if (role === 'parent') return 'parent'
  if (CLUB_ROLES.includes(role)) return 'club'
  if (role === 'athlete') return 'athlete'
  return 'default'
}

function InfoField({ icon, label, value }: {
  icon: React.ComponentProps<typeof Icon>['name']; label: string; value: string | undefined
}) {
  return (
    <View style={[SharedStyles.rowBetween, {
      paddingVertical: 12,
      borderBottomWidth: 1, borderBottomColor: Colors.border,
    }]} accessibilityLabel={`${label}: ${value || 'Chưa cập nhật'}`}>
      <View style={[SharedStyles.row, { gap: 10 }]}>
        <Icon name={icon} size={16} color={Colors.textSecondary} />
        <Text style={{ fontSize: 13, fontWeight: FontWeight.semibold, color: Colors.textSecondary }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 13, fontWeight: FontWeight.bold, color: value ? Colors.textPrimary : Colors.textMuted }}>
        {value || 'Chưa cập nhật'}
      </Text>
    </View>
  )
}

// ── Quick Actions by Role ──
function RoleQuickActions({ roleGroup, router }: { roleGroup: string; router: ReturnType<typeof useRouter> }) {
  const actions = roleGroup === 'club' ? [
    { label: 'Thành viên', icon: VCTIcons.people, route: '/club-members', color: Colors.accent },
    { label: 'Lớp học', icon: VCTIcons.book, route: '/club-classes', color: Colors.green },
    { label: 'Tài chính', icon: VCTIcons.trending, route: '/club-finance', color: Colors.purple },
    { label: 'Điểm danh', icon: VCTIcons.calendar, route: '/club-attendance', color: Colors.gold },
  ] : roleGroup === 'parent' ? [
    { label: 'Con em', icon: VCTIcons.people, route: '/parent-children', color: Colors.accent },
    { label: 'Đồng thuận', icon: VCTIcons.shield, route: '/parent-consents', color: Colors.green },
    { label: 'Điểm danh', icon: VCTIcons.calendar, route: '/parent-attendance', color: Colors.gold },
  ] : roleGroup === 'athlete' ? [
    { label: 'Giải đấu', icon: VCTIcons.trophy, route: '/athlete-tournaments', color: Colors.gold },
    { label: 'Lịch tập', icon: VCTIcons.calendar, route: '/athlete-training', color: Colors.green },
    { label: 'Kết quả', icon: VCTIcons.medal, route: '/athlete-results', color: Colors.purple },
    { label: 'Xếp hạng', icon: VCTIcons.stats, route: '/athlete-rankings', color: Colors.accent },
  ] : []

  if (actions.length === 0) return null

  return (
    <>
      <Text style={SharedStyles.sectionTitle}>Truy cập nhanh</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: Space.lg }}>
        {actions.map(a => (
          <Pressable
            key={a.label}
            onPress={() => { hapticLight(); router.push(a.route) }}
            accessibilityRole="button"
            accessibilityLabel={a.label}
            style={{
              width: '47%', flexGrow: 1,
              borderRadius: Radius.lg, padding: Space.md,
              backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
              alignItems: 'center', gap: 6, minHeight: Touch.minSize,
            }}
          >
            <View style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: Colors.overlay(a.color, 0.1),
              justifyContent: 'center', alignItems: 'center',
            }}>
              <Icon name={a.icon} size={18} color={a.color} />
            </View>
            <Text style={{ fontSize: 11, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>{a.label}</Text>
          </Pressable>
        ))}
      </View>
    </>
  )
}

export function ProfileMobileScreen() {
  const { currentUser } = useAuth()
  const router = useRouter()
  const roleGroup = getRoleGroup(currentUser.role)
  const { data, isLoading, refetch } = useAthleteProfileMe()
  const [editVisible, setEditVisible] = React.useState(false)

  const roleLabel = ROLE_LABELS[currentUser.role ?? ''] ?? currentUser.role ?? 'Người dùng'
  const roleIcon = ROLE_ICONS[currentUser.role ?? ''] ?? 'person'

  if (isLoading || !data) return <ScreenSkeleton />

  return (
    <>
      <ScrollView
        style={SharedStyles.page}
        contentContainerStyle={SharedStyles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.accent} />}
      >
        {/* HERO — role-adaptive */}
        <View style={SharedStyles.heroCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{
              width: 72, height: 72, borderRadius: 36,
              backgroundColor: Colors.overlay(Colors.accent, 0.2), justifyContent: 'center', alignItems: 'center',
              borderWidth: 2, borderColor: Colors.overlay(Colors.accent, 0.4),
            }}>
              <Icon name={VCTIcons[roleIcon as keyof typeof VCTIcons] ?? VCTIcons.person} size={32} color={Colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 22, fontWeight: FontWeight.black, color: Colors.textWhite, marginBottom: 4 }}>
                {currentUser.name || data.name}
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textMuted, fontWeight: FontWeight.semibold }}>
                {roleLabel} · {data.club || 'VCT Platform'}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <Badge label={roleLabel} bg={Colors.overlay(Colors.accent, 0.15)} fg={Colors.accent} icon={VCTIcons[roleIcon as keyof typeof VCTIcons]} />
                {roleGroup === 'athlete' && data.belt && (
                  <Badge label={data.belt} bg={Colors.overlay(Colors.gold, 0.15)} fg={Colors.gold} icon={VCTIcons.ribbon} />
                )}
                {data.isActive && <Badge label="Đang hoạt động" bg={Colors.overlay(Colors.green, 0.15)} fg={Colors.green} icon={VCTIcons.checkmark} />}
              </View>
            </View>
          </View>
          {roleGroup === 'athlete' && (
            <View style={[SharedStyles.rowBetween, { marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.overlay(Colors.textMuted, 0.15) }]}>
              <StatsCounter label="Elo" value={data.elo ?? 1000} color={Colors.accent} icon={VCTIcons.trending} />
              <StatsCounter label="Huy chương" value={data.medalCount ?? 0} color={Colors.gold} icon={VCTIcons.medal} />
              <StatsCounter label="Chuyên cần" value={data.attendanceRate ?? 0} color={Colors.green} icon={VCTIcons.fitness} suffix="%" />
            </View>
          )}
        </View>

        {/* EDIT PROFILE BUTTON */}
        <Pressable
          onPress={() => { hapticLight(); setEditVisible(true) }}
          accessibilityRole="button"
          accessibilityLabel="Chỉnh sửa hồ sơ"
          style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            borderRadius: Radius.md, padding: 14, marginBottom: Space.lg,
            backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
            minHeight: Touch.minSize,
          }}
        >
          <Icon name={VCTIcons.edit} size={18} color={Colors.accent} />
          <Text style={{ fontSize: 14, fontWeight: FontWeight.extrabold, color: Colors.accent }}>Chỉnh sửa hồ sơ</Text>
        </Pressable>

        {/* ROLE QUICK ACTIONS */}
        <RoleQuickActions roleGroup={roleGroup} router={router} />

        {/* PERSONAL INFO */}
        <Text style={SharedStyles.sectionTitle}>Thông tin cá nhân</Text>
        <View style={SharedStyles.card}>
          <InfoField icon={VCTIcons.mail} label="Email" value={data.email || currentUser.email} />
          <InfoField icon={VCTIcons.phone} label="Điện thoại" value={data.phone} />
          <InfoField icon={VCTIcons.person} label="Giới tính" value={data.gender === 'male' ? 'Nam' : data.gender === 'female' ? 'Nữ' : data.gender} />
          <InfoField icon={VCTIcons.calendar} label="Ngày sinh" value={data.dateOfBirth} />
          <View style={[SharedStyles.rowBetween, { paddingVertical: 12 }]}
            accessibilityLabel={`CLB: ${data.club}`}>
            <View style={[SharedStyles.row, { gap: 10 }]}>
              <Icon name={VCTIcons.home} size={16} color={Colors.textSecondary} />
              <Text style={{ fontSize: 13, fontWeight: FontWeight.semibold, color: Colors.textSecondary }}>
                {roleGroup === 'club' ? 'Võ đường' : 'CLB'}
              </Text>
            </View>
            <Text style={{ fontSize: 13, fontWeight: FontWeight.bold, color: Colors.textPrimary }}>{data.club}</Text>
          </View>
        </View>

        {/* BELT TIMELINE — athletes only */}
        {roleGroup === 'athlete' && data.beltHistory && data.beltHistory.length > 0 && (
          <>
            <Text style={SharedStyles.sectionTitle}>Hành trình thăng đai</Text>
            <View style={SharedStyles.card}>
              {data.beltHistory.map((b, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: idx < data.beltHistory.length - 1 ? 14 : 0, position: 'relative' }}>
                  {idx < data.beltHistory.length - 1 && (
                    <View style={{ position: 'absolute', left: 5, top: 14, height: 26, width: 2, backgroundColor: Colors.border }} />
                  )}
                  <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: Colors.bgCard, backgroundColor: b.color }} />
                  <View style={[SharedStyles.rowBetween, { flex: 1 }]}>
                    <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: Colors.textPrimary }}>{b.belt}</Text>
                    <Text style={{ fontSize: 10, color: Colors.textSecondary, fontFamily: 'monospace' }}>{b.date}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* SKILL STATS — athletes only */}
        {roleGroup === 'athlete' && data.skills && data.skills.length > 0 && (
          <>
            <Text style={SharedStyles.sectionTitle}>Chỉ số phát triển</Text>
            <View style={SharedStyles.card}>
              {data.skills.map(sk => (
                <View key={sk.label} style={SharedStyles.skillRow} accessibilityLabel={`${sk.label}: ${sk.value} phần trăm`}>
                  <Text style={SharedStyles.skillLabel}>{sk.label}</Text>
                  <View style={SharedStyles.skillTrack}>
                    <View style={[SharedStyles.skillFill, { width: `${sk.value}%`, backgroundColor: sk.color }]} />
                  </View>
                  <Text style={[{ width: 28, fontSize: 11, fontWeight: FontWeight.extrabold, textAlign: 'right' as const }, { color: sk.color }]}>{sk.value}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ACHIEVEMENTS — athletes only */}
        {roleGroup === 'athlete' && (
          <>
            <Text style={SharedStyles.sectionTitle}>Thành tích nổi bật</Text>
            <View style={SharedStyles.card}>
              <View style={[SharedStyles.row, { gap: Space.sm, flexWrap: 'wrap' }]}>
                <Badge label="Chuỗi 7 ngày tập" bg={Colors.overlay(Colors.purple, 0.15)} fg={Colors.purple} icon={VCTIcons.flame} />
                <Badge label="Vô địch quyền nam" bg={Colors.overlay(Colors.gold, 0.15)} fg={Colors.gold} icon={VCTIcons.trophy} />
                <Badge label="Tân binh xuất sắc" bg={Colors.overlay(Colors.green, 0.15)} fg={Colors.green} icon={VCTIcons.star} />
                <Badge label="Tham gia 10+ giải" bg={Colors.overlay(Colors.accent, 0.15)} fg={Colors.accent} icon={VCTIcons.medal} />
              </View>
            </View>
          </>
        )}

        {/* GOALS — athletes only */}
        {roleGroup === 'athlete' && data.goals && data.goals.length > 0 && (
          <>
            <Text style={SharedStyles.sectionTitle}>Mục tiêu cá nhân</Text>
            <View style={SharedStyles.card}>
              {data.goals.map(g => (
                <View key={g.title} style={{ marginBottom: 14 }} accessibilityLabel={`${g.title}: ${g.progress}%`}>
                  <View style={[SharedStyles.rowBetween, { marginBottom: 4 }]}>
                    <View style={[SharedStyles.row, { gap: 8 }]}>
                      {g.icon && <Text style={{ fontSize: 14 }}>{g.icon}</Text>}
                      <Text style={{ fontSize: 12, fontWeight: FontWeight.bold, color: Colors.textPrimary }}>{g.title}</Text>
                    </View>
                    <Text style={{ fontSize: 11, fontWeight: FontWeight.extrabold, color: g.color }}>{g.progress}%</Text>
                  </View>
                  <View style={SharedStyles.progressTrack}>
                    <View style={[SharedStyles.progressFill, { width: `${g.progress}%`, backgroundColor: g.color }]} />
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* App Version Footer */}
        <View style={{ alignItems: 'center', paddingVertical: Space.xxl }}>
          <Text style={{ fontSize: 11, color: Colors.textMuted }}>VCT Platform v1.0 · {roleLabel}</Text>
        </View>
      </ScrollView>

      <EditProfileModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        onSuccess={() => { setEditVisible(false); refetch() }}
        profile={data}
      />
    </>
  )
}
