import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { ComponentType, ReactNode } from 'react'

import { AuthProvider, useAuth } from 'app/features/auth/AuthProvider'
import { type RouteId } from 'app/features/layout/route-types'
import {
  canAccessMobileRoute,
  MOBILE_ROUTE_REGISTRY,
  type MobileRouteKey,
} from 'app/features/mobile/mobile-routes'
import {
  AccessDeniedMobileScreen,
  AppealsMobileScreen,
  ArenasMobileScreen,
  AthletesMobileScreen,
  CombatMobileScreen,
  FormsMobileScreen,
  MobileOpsBoardScreen,
  RegistrationMobileScreen,
  RefereeAssignmentsMobileScreen,
  RefereesMobileScreen,
  ResultsMobileScreen,
  ScheduleMobileScreen,
  TeamsMobileScreen,
  TournamentConfigMobileScreen,
  WeighInMobileScreen,
} from 'app/features/mobile/tournament-screens'
import {
  AthletePortalMobileScreen,
  AthleteTournamentsMobileScreen,
  AthleteTrainingMobileScreen,
  AthleteResultsMobileScreen,
  AthleteRankingsMobileScreen,
  AthleteElearningMobileScreen,
  TournamentDetailMobileScreen,
  TrainingDetailMobileScreen,
} from 'app/features/mobile/athlete'
import {
  ParentPortalMobileScreen,
  ParentChildrenMobileScreen,
  ParentConsentsMobileScreen,
  ParentAttendanceMobileScreen,
} from 'app/features/mobile/parent'
import {
  ClubPortalMobileScreen,
  ClubMembersMobileScreen,
  ClubClassesMobileScreen,
  ClubFinanceMobileScreen,
  ClubAttendanceMobileScreen,
} from 'app/features/mobile/club'
import {
  BTCPortalMobileScreen,
  BTCRegistrationsMobileScreen,
  BTCScheduleMobileScreen,
  BTCOperationsMobileScreen,
  BTCResultsMobileScreen,
  BTCIssuesMobileScreen,
} from 'app/features/mobile/btc'
import { LoginMobileScreen } from 'app/features/mobile/login-screen'
import { OnboardingMobileScreen } from 'app/features/mobile/onboarding-screen'
import {
  RefereePortalMobileScreen,
  RefereeScheduleMobileScreen,
  RefereeScoringMobileScreen,
} from 'app/features/mobile/referee'
import {
  MedicalPortalMobileScreen,
  MedicalIncidentsMobileScreen,
  MedicalRecordsMobileScreen,
} from 'app/features/mobile/medical'

import { ClubDelegationPortalMobileScreen } from 'app/features/mobile/club/club-delegation-portal-screen'
import { ClubDelegationScheduleMobileScreen } from 'app/features/mobile/club/club-delegation-schedule-screen'
import { ClubDelegationResultsMobileScreen } from 'app/features/mobile/club/club-delegation-results-screen'

import {
  FederationPortalMobileScreen,
  FederationClubsMobileScreen,
  FederationApprovalsMobileScreen,
  FederationTournamentsMobileScreen,
  FederationRefereesMobileScreen,
  FederationFinanceMobileScreen,
} from 'app/features/mobile/federation'

import {
  NFPortalMobileScreen,
  NFProvincesMobileScreen,
  NFTournamentsMobileScreen,
  NFRefereesMobileScreen,
  NFRankingsMobileScreen,
} from 'app/features/mobile/national-federation'

import {
  TDPortalMobileScreen,
  TDStandardsMobileScreen,
  TDQualityMobileScreen,
} from 'app/features/mobile/technical-director'

import {
  AdminPortalMobileScreen,
  AdminUsersMobileScreen,
  AdminAuditMobileScreen,
} from 'app/features/mobile/admin-mobile'

import { UserDetailScreen } from 'app/features/user/detail-screen'
import { TabNavigator } from './tab-navigator'

const Stack = createNativeStackNavigator()

const ROUTE_SCREEN_COMPONENTS: Partial<Record<RouteId, ComponentType>> = {
  teams: TeamsMobileScreen,
  athletes: AthletesMobileScreen,
  registration: RegistrationMobileScreen,
  results: ResultsMobileScreen,
  schedule: ScheduleMobileScreen,
  arenas: ArenasMobileScreen,
  referees: RefereesMobileScreen,
  appeals: AppealsMobileScreen,
  'weigh-in': WeighInMobileScreen,
  combat: CombatMobileScreen,
  forms: FormsMobileScreen,
  'referee-assignments': RefereeAssignmentsMobileScreen,
  'tournament-config': TournamentConfigMobileScreen,
}

function GuardedScreen({
  routeKey,
  children,
}: {
  routeKey: MobileRouteKey
  children: ReactNode
}) {
  const { currentUser } = useAuth()
  if (!canAccessMobileRoute(routeKey, currentUser.role)) {
    return <AccessDeniedMobileScreen />
  }
  return <>{children}</>
}

function renderModuleScreen(route: (typeof MOBILE_ROUTE_REGISTRY)[number]) {
  const RouteScreen = ROUTE_SCREEN_COMPONENTS[route.routeId]

  return (
    <GuardedScreen routeKey={route.key}>
      {RouteScreen ? (
        <RouteScreen />
      ) : (
        <MobileOpsBoardScreen
          routeId={route.routeId}
          title={route.title}
          subtitle={route.subtitle}
          webPath={route.webPath}
        />
      )}
    </GuardedScreen>
  )
}

/**
 * App content when user is authenticated.
 * Tab navigator is the root, with detail screens pushed on top.
 */
function AuthenticatedStack() {
  return (
    <Stack.Navigator>
      {/* Tab Navigator as main screen */}
      <Stack.Screen
        name="main-tabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />

      {/* MODULE SCREENS — pushed on top of tabs */}
      {MOBILE_ROUTE_REGISTRY.map((route) => (
        <Stack.Screen key={route.key} name={route.key} options={{ title: route.title }}>
          {() => renderModuleScreen(route)}
        </Stack.Screen>
      ))}

      {/* DETAIL SCREENS */}
      <Stack.Screen
        name="user-detail"
        component={UserDetailScreen}
        options={{ title: 'User' }}
      />

      {/* ATHLETE SCREENS */}
      <Stack.Screen
        name="athlete-portal"
        component={AthletePortalMobileScreen}
        options={{ title: 'Cổng VĐV' }}
      />
      <Stack.Screen
        name="athlete-tournaments"
        component={AthleteTournamentsMobileScreen}
        options={{ title: 'Giải đấu' }}
      />
      <Stack.Screen
        name="athlete-training"
        component={AthleteTrainingMobileScreen}
        options={{ title: 'Lịch tập' }}
      />
      <Stack.Screen
        name="athlete-results"
        component={AthleteResultsMobileScreen}
        options={{ title: 'Kết quả' }}
      />
      <Stack.Screen
        name="athlete-rankings"
        component={AthleteRankingsMobileScreen}
        options={{ title: 'Xếp hạng' }}
      />
      <Stack.Screen
        name="athlete-elearning"
        component={AthleteElearningMobileScreen}
        options={{ title: 'E-Learning' }}
      />
      <Stack.Screen
        name="tournament-detail"
        component={TournamentDetailMobileScreen}
        options={{ title: 'Chi tiết giải' }}
      />
      <Stack.Screen
        name="training-detail"
        component={TrainingDetailMobileScreen}
        options={{ title: 'Chi tiết buổi tập' }}
      />
      {/* ── Parent Screens ── */}
      <Stack.Screen
        name="parent-portal"
        component={ParentPortalMobileScreen}
        options={{ title: 'Cổng Phụ Huynh' }}
      />
      <Stack.Screen
        name="parent-children"
        component={ParentChildrenMobileScreen}
        options={{ title: 'Con em' }}
      />
      <Stack.Screen
        name="parent-consents"
        component={ParentConsentsMobileScreen}
        options={{ title: 'Đồng thuận' }}
      />
      <Stack.Screen
        name="parent-attendance"
        component={ParentAttendanceMobileScreen}
        options={{ title: 'Điểm danh' }}
      />
      {/* ── Club Manager Screens ── */}
      <Stack.Screen
        name="club-portal"
        component={ClubPortalMobileScreen}
        options={{ title: 'Quản lý CLB' }}
      />
      <Stack.Screen
        name="club-members"
        component={ClubMembersMobileScreen}
        options={{ title: 'Thành viên' }}
      />
      <Stack.Screen
        name="club-classes"
        component={ClubClassesMobileScreen}
        options={{ title: 'Lớp học' }}
      />
      <Stack.Screen
        name="club-finance"
        component={ClubFinanceMobileScreen}
        options={{ title: 'Tài chính' }}
      />
      <Stack.Screen
        name="club-attendance"
        component={ClubAttendanceMobileScreen}
        options={{ title: 'Điểm danh CLB' }}
      />
      {/* ── BTC (Ban Tổ Chức) Screens ── */}
      <Stack.Screen
        name="btc-portal"
        component={BTCPortalMobileScreen}
        options={{ title: 'Ban Tổ Chức' }}
      />
      <Stack.Screen
        name="btc-registrations"
        component={BTCRegistrationsMobileScreen}
        options={{ title: 'Đăng ký' }}
      />
      <Stack.Screen
        name="btc-schedule"
        component={BTCScheduleMobileScreen}
        options={{ title: 'Lịch thi đấu' }}
      />
      <Stack.Screen
        name="btc-operations"
        component={BTCOperationsMobileScreen}
        options={{ title: 'Vận hành' }}
      />
      <Stack.Screen
        name="btc-results"
        component={BTCResultsMobileScreen}
        options={{ title: 'Kết quả' }}
      />
      <Stack.Screen
        name="btc-issues"
        component={BTCIssuesMobileScreen}
        options={{ title: 'Sự cố' }}
      />
      {/* ── Referee Screens ── */}
      <Stack.Screen
        name="referee-portal"
        component={RefereePortalMobileScreen}
        options={{ title: 'Trọng tài' }}
      />
      <Stack.Screen
        name="referee-schedule"
        component={RefereeScheduleMobileScreen}
        options={{ title: 'Lịch làm việc' }}
      />
      <Stack.Screen
        name="referee-scoring"
        component={RefereeScoringMobileScreen}
        options={{ title: 'Chấm điểm' }}
      />
      {/* ── Medical Screens ── */}
      <Stack.Screen
        name="medical-portal"
        component={MedicalPortalMobileScreen}
        options={{ title: 'Y tế' }}
      />
      <Stack.Screen
        name="medical-incidents"
        component={MedicalIncidentsMobileScreen}
        options={{ title: 'Sự cố y tế' }}
      />
      <Stack.Screen
        name="medical-records"
        component={MedicalRecordsMobileScreen}
        options={{ title: 'Hồ sơ y tế' }}
      />
      {/* ── Delegation / Club Tournaments ── */}
      <Stack.Screen
        name="club-delegation-portal"
        component={ClubDelegationPortalMobileScreen}
        options={{ title: 'Giải đấu' }}
      />
      <Stack.Screen
        name="club-delegation-schedule"
        component={ClubDelegationScheduleMobileScreen}
        options={{ title: 'Lịch thi đấu đoàn' }}
      />
      <Stack.Screen
        name="club-delegation-results"
        component={ClubDelegationResultsMobileScreen}
        options={{ title: 'Thành tích đoàn' }}
      />
      {/* ── Federation Screens ── */}
      <Stack.Screen
        name="federation-portal"
        component={FederationPortalMobileScreen}
        options={{ title: 'Liên đoàn' }}
      />
      <Stack.Screen
        name="federation-clubs"
        component={FederationClubsMobileScreen}
        options={{ title: 'Câu lạc bộ trực thuộc' }}
      />
      <Stack.Screen
        name="federation-approvals"
        component={FederationApprovalsMobileScreen}
        options={{ title: 'Duyệt hồ sơ' }}
      />
      <Stack.Screen
        name="federation-tournaments"
        component={FederationTournamentsMobileScreen}
        options={{ title: 'Mạng lưới giải đấu' }}
      />
      <Stack.Screen
        name="federation-referees"
        component={FederationRefereesMobileScreen}
        options={{ title: 'Danh bạ trọng tài' }}
      />
      <Stack.Screen
        name="federation-finance"
        component={FederationFinanceMobileScreen}
        options={{ title: 'Tài chính & Hội phí' }}
      />
      <Stack.Screen
        name="nf-provinces"
        component={NFProvincesMobileScreen}
        options={{ title: 'Liên đoàn cấp Tỉnh' }}
      />
      <Stack.Screen
        name="nf-tournaments"
        component={NFTournamentsMobileScreen}
        options={{ title: 'Giải đấu Quốc gia' }}
      />
      <Stack.Screen
        name="nf-referees"
        component={NFRefereesMobileScreen}
        options={{ title: 'Trọng tài QG & QT' }}
      />
      <Stack.Screen
        name="nf-rankings"
        component={NFRankingsMobileScreen}
        options={{ title: 'Bảng xếp hạng VĐV' }}
      />
      <Stack.Screen
        name="td-standards"
        component={TDStandardsMobileScreen}
        options={{ title: 'Quy chuẩn Kỹ thuật' }}
      />
      <Stack.Screen
        name="td-quality"
        component={TDQualityMobileScreen}
        options={{ title: 'Chất lượng Trọng tài' }}
      />
      <Stack.Screen
        name="admin-users"
        component={AdminUsersMobileScreen}
        options={{ title: 'Quản lý Người dùng' }}
      />
      <Stack.Screen
        name="admin-audit"
        component={AdminAuditMobileScreen}
        options={{ title: 'Nhật ký Hệ thống' }}
      />
    </Stack.Navigator>
  )
}

/**
 * Root navigation — checks auth state to show Login or main app.
 */
function RootNavigator() {
  const { isAuthenticated } = useAuth()

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="app" component={AuthenticatedStack} />
      ) : (
        <>
          <Stack.Screen
            name="onboarding"
            component={OnboardingMobileScreen}
          />
          <Stack.Screen
            name="login"
            component={LoginMobileScreen}
            options={{ animationTypeForReplace: 'pop' }}
          />
        </>
      )}
    </Stack.Navigator>
  )
}

export function NativeNavigation() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  )
}
