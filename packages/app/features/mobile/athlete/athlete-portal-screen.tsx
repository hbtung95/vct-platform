import * as React from 'react'
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { useAuth } from '../../auth/AuthProvider'
import { Colors, SharedStyles, FontWeight, Radius, Space, Touch } from '../mobile-theme'
import { Badge, ScreenSkeleton, AnimatedCard, SectionDivider, StatsCounter } from '../mobile-ui'
import { Icon, VCTIcons } from '../icons'
import { hapticLight } from '../haptics'
import { useAthleteProfile, useAthleteTournaments, useAthleteTraining, useNotifications } from '../useAthleteData'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Athlete Portal Screen (v3)
// Compact dashboard hub: greeting, quick actions grid,
// upcoming tournament/training cards, notification badge
// De-duplicated: no skill bars, goals, belt timeline (moved to dedicated screens)
// ═══════════════════════════════════════════════════════════════

const QUICK_ACTIONS = [
  { icon: VCTIcons.trophy, label: 'Giải đấu', route: '/athlete-tournaments', color: Colors.gold },
  { icon: VCTIcons.calendar, label: 'Lịch tập', route: '/athlete-training', color: Colors.green },
  { icon: VCTIcons.podium, label: 'Thành tích', route: '/athlete-results', color: Colors.purple },
  { icon: VCTIcons.stats, label: 'Xếp hạng', route: '/athlete-rankings', color: Colors.cyan },
  { icon: VCTIcons.person, label: 'Hồ sơ', route: '/profile', color: Colors.accent },
  { icon: VCTIcons.book, label: 'E-Learning', route: '/athlete-elearning', color: Colors.red },
] as const

export function AthletePortalMobileScreen() {
  const { currentUser } = useAuth()
  const router = useRouter()
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useAthleteProfile()
  const { data: tournaments, isLoading: tournLoading } = useAthleteTournaments()
  const { data: training, isLoading: trainLoading } = useAthleteTraining()
  const { notifications } = useNotifications()

  const isLoading = profileLoading
  const refetch = () => { refetchProfile() }

  if (isLoading || !profile) return <ScreenSkeleton />

  const unreadCount = notifications.filter(n => !n.read).length
  const nextTournament = tournaments?.[0]
  const nextSession = training?.sessions.find(s => s.status === 'scheduled')

  return (
    <ScrollView
      style={SharedStyles.page}
      contentContainerStyle={SharedStyles.scrollContent}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.accent} />}
    >
      {/* GREETING BAR — compact, not a full hero */}
      <View style={{
        borderRadius: Radius.xl, padding: Space.lg, marginBottom: Space.lg,
        backgroundColor: Colors.bgDark,
        flexDirection: 'row', alignItems: 'center', gap: 14,
      }}>
        <View style={{
          width: 48, height: 48, borderRadius: 24,
          backgroundColor: Colors.overlay(Colors.accent, 0.2), justifyContent: 'center', alignItems: 'center',
          borderWidth: 2, borderColor: Colors.overlay(Colors.accent, 0.4),
        }}>
          <Icon name={VCTIcons.fitness} size={24} color={Colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: FontWeight.black, color: Colors.textWhite }}>
            Chào {currentUser.name || profile.name}!
          </Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
            <Badge label={profile.belt} bg={Colors.overlay(Colors.gold, 0.15)} fg={Colors.gold} icon={VCTIcons.ribbon} />
            <Badge label={`Elo: ${profile.elo}`} bg={Colors.overlay(Colors.accent, 0.15)} fg={Colors.accent} icon={VCTIcons.stats} />
          </View>
        </View>
        {/* Notification bell */}
        <Pressable
          onPress={() => { hapticLight(); router.push('/notifications') }}
          accessibilityRole="button"
          accessibilityLabel={`Thông báo${unreadCount > 0 ? `, ${unreadCount} chưa đọc` : ''}`}
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.overlay('#fff', 0.08), justifyContent: 'center', alignItems: 'center' }}
        >
          <Icon name={VCTIcons.notifications} size={22} color={Colors.textWhite} />
          {unreadCount > 0 && (
            <View style={{
              position: 'absolute', top: 4, right: 4,
              minWidth: 16, height: 16, borderRadius: 8,
              backgroundColor: Colors.red, justifyContent: 'center', alignItems: 'center',
              paddingHorizontal: 3,
            }}>
              <Text style={{ fontSize: 9, fontWeight: FontWeight.black, color: '#fff' }}>{unreadCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* ANIMATED STATS */}
      <View style={SharedStyles.statsRow}>
        <View style={[SharedStyles.statBox, { borderColor: Colors.overlay(Colors.accent, 0.2) }]}>
          <StatsCounter value={profile.tournamentCount} label="Giải đấu" color={Colors.accent} icon={VCTIcons.trophy} />
        </View>
        <View style={[SharedStyles.statBox, { borderColor: Colors.overlay(Colors.gold, 0.2) }]}>
          <StatsCounter value={profile.medalCount} label="Huy chương" color={Colors.gold} icon={VCTIcons.medal} />
        </View>
        <View style={[SharedStyles.statBox, { borderColor: Colors.overlay(Colors.green, 0.2) }]}>
          <StatsCounter value={profile.attendanceRate} label="Chuyên cần" color={Colors.green} icon={VCTIcons.flame} suffix="%" />
        </View>
      </View>

      {/* QUICK ACTIONS — 6-item grid */}
      <SectionDivider label="Truy cập nhanh" icon={VCTIcons.flash} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: Space.lg }}>
        {QUICK_ACTIONS.map(item => (
          <AnimatedCard
            key={item.route}
            onPress={() => router.push(item.route)}
            style={{ width: '30%', flexGrow: 1, alignItems: 'center', gap: 6, minHeight: Touch.minSize }}
          >
            <View style={{
              width: 42, height: 42, borderRadius: 14,
              backgroundColor: Colors.overlay(item.color, 0.1),
              justifyContent: 'center', alignItems: 'center',
            }}>
              <Icon name={item.icon} size={20} color={item.color} />
            </View>
            <Text style={{ fontSize: 11, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>{item.label}</Text>
          </AnimatedCard>
        ))}
      </View>

      {/* UPCOMING TOURNAMENT — mini card */}
      {nextTournament && (
        <>
          <SectionDivider label="Giải đấu sắp tới" icon={VCTIcons.trophy} />
          <AnimatedCard onPress={() => router.push(`/tournament-detail?id=${nextTournament.id}`)}>
            <View style={[SharedStyles.rowBetween, { marginBottom: 6 }]}>
              <View style={[SharedStyles.row, { gap: 8 }]}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.overlay(Colors.gold, 0.1), justifyContent: 'center', alignItems: 'center' }}>
                  <Icon name={VCTIcons.trophy} size={18} color={Colors.gold} />
                </View>
                <Text style={{ fontSize: 14, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, flex: 1 }}>
                  {nextTournament.name}
                </Text>
              </View>
              <Icon name={VCTIcons.forward} size={16} color={Colors.textMuted} />
            </View>
            <View style={[SharedStyles.row, { gap: 6, marginLeft: 44 }]}>
              <Icon name={VCTIcons.calendar} size={12} color={Colors.textSecondary} />
              <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{nextTournament.date}</Text>
              <Text style={{ fontSize: 11, color: Colors.textSecondary }}> · </Text>
              <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{nextTournament.categories.join(', ')}</Text>
            </View>
          </AnimatedCard>
        </>
      )}

      {/* NEXT TRAINING SESSION — mini card */}
      {nextSession && (
        <>
          <SectionDivider label="Buổi tập tiếp theo" icon={VCTIcons.calendar} />
          <AnimatedCard onPress={() => router.push(`/training-detail?id=${nextSession.id}`)}>
            <View style={[SharedStyles.rowBetween, { marginBottom: 6 }]}>
              <View style={[SharedStyles.row, { gap: 8 }]}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.overlay(Colors.green, 0.1), justifyContent: 'center', alignItems: 'center' }}>
                  <Icon name={VCTIcons.fitness} size={18} color={Colors.green} />
                </View>
                <Text style={{ fontSize: 14, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>
                  {nextSession.time}
                </Text>
              </View>
              <Icon name={VCTIcons.forward} size={16} color={Colors.textMuted} />
            </View>
            <View style={[SharedStyles.row, { gap: 6, marginLeft: 44 }]}>
              <Icon name={VCTIcons.location} size={12} color={Colors.textSecondary} />
              <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{nextSession.location}</Text>
              <Text style={{ fontSize: 11, color: Colors.textSecondary }}> · </Text>
              <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{nextSession.coach}</Text>
            </View>
          </AnimatedCard>
        </>
      )}
    </ScrollView>
  )
}
