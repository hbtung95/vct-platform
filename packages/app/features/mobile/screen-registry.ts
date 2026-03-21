// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Screen Registry
// Canonical source of truth for mobile screen lazy loading.
// Navigators and barrel exports should read from this file only.
// ═══════════════════════════════════════════════════════════════

import React from 'react'

export type RegisteredScreenComponent = React.ComponentType<any>
export type RegisteredScreen =
  | RegisteredScreenComponent
  | React.LazyExoticComponent<RegisteredScreenComponent>
export type ScreenGroupName = keyof typeof SCREEN_GROUPS

type ScreenLoader = () => Promise<{ default: RegisteredScreenComponent }>
type ScreenModule = Record<string, RegisteredScreenComponent>
type ScreenModuleLoader<TModule extends ScreenModule = ScreenModule> =
  () => Promise<TModule>
type ScreenGroupComponentMap<TNames extends readonly string[]> = {
  [K in TNames[number]]: React.LazyExoticComponent<RegisteredScreenComponent>
}

function createLazyScreen(loader: ScreenLoader) {
  return React.lazy(loader)
}

function createLazyScreenFromModule<TModule extends ScreenModule>(
  loader: ScreenModuleLoader<TModule>,
  exportName: keyof TModule & string,
) {
  return createLazyScreen(() =>
    loader().then((module) => ({
      default: module[exportName] as RegisteredScreenComponent,
    })),
  )
}

function buildScreenGroup<
  TNames extends readonly string[],
  TModule extends ScreenModule,
>(
  names: TNames,
  loader: ScreenModuleLoader<TModule>,
  exportsByName: { [K in TNames[number]]: keyof TModule & string },
): ScreenGroupComponentMap<TNames> {
  const group = {} as ScreenGroupComponentMap<TNames>

  for (const name of names) {
    const key = name as TNames[number]
    group[key] = createLazyScreenFromModule(loader, exportsByName[key])
  }

  return group
}

// ── Screen Groups ────────────────────────────────────────────

export const SCREEN_GROUPS = {
  auth: ['Onboarding', 'Login', 'Register'] as const,
  main: [
    'HomeScreen',
    'TournamentList',
    'TournamentDetail',
    'ProfileHome',
    'Settings',
  ] as const,
  training: [
    'TrainingHome',
    'TechniqueDetail',
    'TrainingPlanDetail',
  ] as const,
  competition: ['LiveScoring', 'BracketView', 'MatchDetail'] as const,
  utility: ['Notifications', 'EditProfile'] as const,
} as const

// ── Lazy Screen Loader ───────────────────────────────────────

const loadAuthScreens = () => import('./screens/auth')
const loadMainScreens = () => import('./screens/main')
const loadTrainingScreens = () => import('./screens/training')
const loadCompetitionScreens = () => import('./screens/competition')
const loadUtilityScreens = () => import('./screens/utility')

export const AUTH_SCREEN_COMPONENTS = buildScreenGroup(
  SCREEN_GROUPS.auth,
  loadAuthScreens,
  {
    Onboarding: 'ScreenOnboarding',
    Login: 'ScreenLogin',
    Register: 'ScreenRegister',
  },
)

export const MAIN_SCREEN_COMPONENTS = buildScreenGroup(
  SCREEN_GROUPS.main,
  loadMainScreens,
  {
    HomeScreen: 'ScreenHome',
    TournamentList: 'ScreenTournamentList',
    TournamentDetail: 'ScreenTournamentDetail',
    ProfileHome: 'ScreenProfile',
    Settings: 'ScreenSettings',
  },
)

export const TRAINING_SCREEN_COMPONENTS = buildScreenGroup(
  SCREEN_GROUPS.training,
  loadTrainingScreens,
  {
    TrainingHome: 'ScreenTrainingHome',
    TechniqueDetail: 'ScreenTechniqueDetail',
    TrainingPlanDetail: 'ScreenTrainingPlanDetail',
  },
)

export const COMPETITION_SCREEN_COMPONENTS = buildScreenGroup(
  SCREEN_GROUPS.competition,
  loadCompetitionScreens,
  {
    LiveScoring: 'ScreenLiveScoring',
    BracketView: 'ScreenBracketView',
    MatchDetail: 'ScreenMatchDetail',
  },
)

export const UTILITY_SCREEN_COMPONENTS = buildScreenGroup(
  SCREEN_GROUPS.utility,
  loadUtilityScreens,
  {
    Notifications: 'ScreenNotifications',
    EditProfile: 'ScreenEditProfile',
  },
)

export const LazyScreenOnboarding = AUTH_SCREEN_COMPONENTS.Onboarding
export const LazyScreenLogin = AUTH_SCREEN_COMPONENTS.Login
export const LazyScreenRegister = AUTH_SCREEN_COMPONENTS.Register
export const LazyScreenHome = MAIN_SCREEN_COMPONENTS.HomeScreen
export const LazyScreenTournamentList = MAIN_SCREEN_COMPONENTS.TournamentList
export const LazyScreenTournamentDetail =
  MAIN_SCREEN_COMPONENTS.TournamentDetail
export const LazyScreenProfile = MAIN_SCREEN_COMPONENTS.ProfileHome
export const LazyScreenSettings = MAIN_SCREEN_COMPONENTS.Settings
export const LazyScreenTrainingHome = TRAINING_SCREEN_COMPONENTS.TrainingHome
export const LazyScreenTechniqueDetail =
  TRAINING_SCREEN_COMPONENTS.TechniqueDetail
export const LazyScreenTrainingPlanDetail =
  TRAINING_SCREEN_COMPONENTS.TrainingPlanDetail
export const LazyScreenLiveScoring = COMPETITION_SCREEN_COMPONENTS.LiveScoring
export const LazyScreenBracketView = COMPETITION_SCREEN_COMPONENTS.BracketView
export const LazyScreenMatchDetail = COMPETITION_SCREEN_COMPONENTS.MatchDetail
export const LazyScreenNotifications = UTILITY_SCREEN_COMPONENTS.Notifications
export const LazyScreenEditProfile = UTILITY_SCREEN_COMPONENTS.EditProfile

export const SCREEN_COMPONENTS_BY_GROUP = {
  auth: AUTH_SCREEN_COMPONENTS,
  main: MAIN_SCREEN_COMPONENTS,
  training: TRAINING_SCREEN_COMPONENTS,
  competition: COMPETITION_SCREEN_COMPONENTS,
  utility: UTILITY_SCREEN_COMPONENTS,
} as const

export const SCREEN_COMPONENTS = {
  ...SCREEN_COMPONENTS_BY_GROUP.auth,
  ...SCREEN_COMPONENTS_BY_GROUP.main,
  ...SCREEN_COMPONENTS_BY_GROUP.training,
  ...SCREEN_COMPONENTS_BY_GROUP.competition,
  ...SCREEN_COMPONENTS_BY_GROUP.utility,
} as const

export type ScreenName = keyof typeof SCREEN_COMPONENTS

export function getScreenComponentsForGroup<TGroup extends ScreenGroupName>(
  group: TGroup,
) {
  return SCREEN_COMPONENTS_BY_GROUP[group]
}

function createMissingScreen(name: string): RegisteredScreenComponent {
  const MissingScreen: RegisteredScreenComponent = () => {
    const { View, Text } = require('react-native')

    return React.createElement(
      View,
      {
        style: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A0E14',
          paddingHorizontal: 24,
        },
      },
      React.createElement(
        Text,
        {
          style: {
            color: '#94A3B8',
            fontSize: 14,
            textAlign: 'center',
          },
        },
        `Màn hình "${name}" đang phát triển`,
      ),
    )
  }

  return MissingScreen
}

export function getScreenComponent(name: string): RegisteredScreen {
  return (
    SCREEN_COMPONENTS[name as ScreenName] ?? createMissingScreen(name)
  )
}
