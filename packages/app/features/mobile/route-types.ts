// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Route Types
// Centralized type-safe route definitions for the entire app.
// All screen names, param types, and deep link patterns in one
// place so navigation is fully type-checked at compile time.
// ═══════════════════════════════════════════════════════════════

import * as ExpoLinking from 'expo-linking'
import type { LinkingOptions, NavigatorScreenParams } from '@react-navigation/native'

// ── Auth Stack ───────────────────────────────────────────────

export type AuthStackParamList = {
  Onboarding: undefined
  Login: { returnTo?: string } | undefined
  Register: { inviteCode?: string } | undefined
  ForgotPassword: { email?: string } | undefined
  ResetPassword: { token: string }
  VerifyOTP: { phone: string; purpose: 'login' | 'register' }
}

// ── Main Tab Navigator ───────────────────────────────────────

export type MainTabParamList = {
  HomeTab: undefined
  TournamentsTab: undefined
  TrainingTab: undefined
  ProfileTab: undefined
}

// ── Main Stack ───────────────────────────────────────────────

export type MainStackParamList = {
  Tabs: NavigatorScreenParams<MainTabParamList> | undefined
  TournamentDetail: { tournamentId: string }
  Settings: undefined
}

// ── Home Stack ───────────────────────────────────────────────

export type HomeStackParamList = {
  HomeScreen: undefined
  NotificationList: undefined
  NotificationDetail: { id: string }
  AnnouncementDetail: { id: string }
}

// ── Tournament Stack ─────────────────────────────────────────

export type TournamentStackParamList = {
  TournamentList: { status?: 'upcoming' | 'ongoing' | 'completed' } | undefined
  TournamentDetail: { id: string }
  TournamentRegistration: { tournamentId: string }
  BracketView: { tournamentId: string; categoryId: string }
  MatchDetail: { matchId: string }
  LiveScoring: { matchId: string }
  AthleteProfile: { athleteId: string }
  TeamDetail: { teamId: string }
}

// ── Training Stack ───────────────────────────────────────────

export type TrainingStackParamList = {
  TrainingHome: undefined
  TrainingPlanDetail: { planId: string }
  TechniqueDetail: { techniqueId: string }
  TechniqueVideo: { techniqueId: string; videoUrl: string }
  CurriculumDetail: { curriculumId: string }
  BeltExamDetail: { examId: string }
  ElearningCourse: { courseId: string }
}

// ── Profile Stack ────────────────────────────────────────────

export type ProfileStackParamList = {
  ProfileHome: undefined
  EditProfile: undefined
  Settings: undefined
  ChangePassword: undefined
  LanguageSettings: undefined
  ThemeSettings: undefined
  PrivacyPolicy: undefined
  TermsOfService: undefined
  About: undefined
  FeedbackForm: undefined
  MyTournaments: undefined
  MyClub: { clubId: string }
  Achievement: { achievementId: string }
}

// ── Screen Name Registry ─────────────────────────────────────

export const SCREEN_NAMES = {
  // Auth
  ONBOARDING: 'Onboarding' as const,
  LOGIN: 'Login' as const,
  REGISTER: 'Register' as const,
  FORGOT_PASSWORD: 'ForgotPassword' as const,
  RESET_PASSWORD: 'ResetPassword' as const,
  VERIFY_OTP: 'VerifyOTP' as const,
  // Tabs
  HOME_TAB: 'HomeTab' as const,
  TOURNAMENTS_TAB: 'TournamentsTab' as const,
  TRAINING_TAB: 'TrainingTab' as const,
  PROFILE_TAB: 'ProfileTab' as const,
  // Home
  HOME_SCREEN: 'HomeScreen' as const,
  // Tournament
  TOURNAMENT_LIST: 'TournamentList' as const,
  TOURNAMENT_DETAIL: 'TournamentDetail' as const,
  BRACKET_VIEW: 'BracketView' as const,
  MATCH_DETAIL: 'MatchDetail' as const,
  LIVE_SCORING: 'LiveScoring' as const,
  // Profile
  PROFILE_HOME: 'ProfileHome' as const,
  EDIT_PROFILE: 'EditProfile' as const,
  SETTINGS: 'Settings' as const,
} as const

// ── Deep Link Map ────────────────────────────────────────────

export interface MobileDeepLinkRoute {
  pattern: string
  screen: string
  tab?: keyof MainTabParamList
  paramExtractor?: (params: Record<string, string>) => Record<string, unknown>
}

export const MOBILE_DEEP_LINK_PREFIXES = [
  ExpoLinking.createURL('/'),
  'vctplatform://',
  'https://vct-platform.vn',
  'https://vct-platform.com',
  'https://www.vct-platform.com',
] as const

export const MOBILE_DEEP_LINK_ROUTES: ReadonlyArray<MobileDeepLinkRoute> = [
  {
    pattern: 'onboarding',
    screen: SCREEN_NAMES.ONBOARDING,
  },
  {
    pattern: 'login',
    screen: SCREEN_NAMES.LOGIN,
  },
  {
    pattern: 'register',
    screen: SCREEN_NAMES.REGISTER,
  },
  {
    pattern: 'forgot-password',
    screen: SCREEN_NAMES.FORGOT_PASSWORD,
  },
  {
    pattern: 'reset-password/:token',
    screen: SCREEN_NAMES.RESET_PASSWORD,
  },
  {
    pattern: 'verify-otp/:phone/:purpose',
    screen: SCREEN_NAMES.VERIFY_OTP,
  },
  {
    pattern: '',
    screen: SCREEN_NAMES.HOME_TAB,
    tab: SCREEN_NAMES.HOME_TAB,
  },
  {
    pattern: 'tournaments',
    screen: SCREEN_NAMES.TOURNAMENTS_TAB,
    tab: SCREEN_NAMES.TOURNAMENTS_TAB,
  },
  {
    pattern: 'training',
    screen: SCREEN_NAMES.TRAINING_TAB,
    tab: SCREEN_NAMES.TRAINING_TAB,
  },
  {
    pattern: 'profile',
    screen: SCREEN_NAMES.PROFILE_TAB,
    tab: SCREEN_NAMES.PROFILE_TAB,
  },
  {
    pattern: 'tournaments/:tournamentId',
    screen: SCREEN_NAMES.TOURNAMENT_DETAIL,
    tab: SCREEN_NAMES.TOURNAMENTS_TAB,
  },
  {
    pattern: 'settings',
    screen: SCREEN_NAMES.SETTINGS,
    tab: SCREEN_NAMES.PROFILE_TAB,
  },
] as const

export type MobileLinkingParamList = AuthStackParamList & MainStackParamList

export const DEEP_LINK_CONFIG: LinkingOptions<MobileLinkingParamList> = {
  prefixes: [...MOBILE_DEEP_LINK_PREFIXES],
  config: {
    screens: {
      Onboarding: 'onboarding',
      Login: 'login',
      Register: 'register',
      ForgotPassword: 'forgot-password',
      ResetPassword: 'reset-password/:token',
      VerifyOTP: 'verify-otp/:phone/:purpose',
      Tabs: {
        screens: {
          HomeTab: {
            path: '',
          },
          TournamentsTab: {
            path: 'tournaments',
          },
          TrainingTab: {
            path: 'training',
          },
          ProfileTab: {
            path: 'profile',
          },
        },
      },
      TournamentDetail: 'tournaments/:tournamentId',
      Settings: 'settings',
    },
  },
}
