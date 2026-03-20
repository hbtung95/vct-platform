// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Screen Registry
// Maps screen names to their lazy-loaded components.
// Used by navigators to register screens without circular deps.
// ═══════════════════════════════════════════════════════════════

import React from 'react'

// ── Lazy Screen Loader ───────────────────────────────────────

// Auth Screens
export const LazyScreenLogin = React.lazy(() =>
  import('./screen-login').then((m) => ({ default: m.ScreenLogin as React.ComponentType<any> }))
)
export const LazyScreenRegister = React.lazy(() =>
  import('./screen-register').then((m) => ({ default: m.ScreenRegister as React.ComponentType<any> }))
)
export const LazyScreenOnboarding = React.lazy(() =>
  import('./screen-onboarding').then((m) => ({ default: m.ScreenOnboarding as React.ComponentType<any> }))
)

// Main Screens
export const LazyScreenHome = React.lazy(() =>
  import('./screen-home').then((m) => ({ default: m.ScreenHome as React.ComponentType<any> }))
)
export const LazyScreenTournamentList = React.lazy(() =>
  import('./screen-tournament-list').then((m) => ({ default: m.ScreenTournamentList as React.ComponentType<any> }))
)
export const LazyScreenTournamentDetail = React.lazy(() =>
  import('./screen-tournament-detail').then((m) => ({ default: m.ScreenTournamentDetail as React.ComponentType<any> }))
)
export const LazyScreenProfile = React.lazy(() =>
  import('./screen-profile').then((m) => ({ default: m.ScreenProfile as React.ComponentType<any> }))
)
export const LazyScreenSettings = React.lazy(() =>
  import('./screen-settings').then((m) => ({ default: m.ScreenSettings as React.ComponentType<any> }))
)

// Training Screens
export const LazyScreenTrainingHome = React.lazy(() =>
  import('./screen-training-home').then((m) => ({ default: m.ScreenTrainingHome as React.ComponentType<any> }))
)
export const LazyScreenTechniqueDetail = React.lazy(() =>
  import('./screen-technique-detail').then((m) => ({ default: m.ScreenTechniqueDetail as React.ComponentType<any> }))
)

// Competition Screens
export const LazyScreenLiveScoring = React.lazy(() =>
  import('./screen-live-scoring').then((m) => ({ default: m.ScreenLiveScoring as React.ComponentType<any> }))
)
export const LazyScreenBracketView = React.lazy(() =>
  import('./screen-bracket-view').then((m) => ({ default: m.ScreenBracketView as React.ComponentType<any> }))
)
export const LazyScreenMatchDetail = React.lazy(() =>
  import('./screen-match-detail').then((m) => ({ default: m.ScreenMatchDetail as React.ComponentType<any> }))
)

// ── Screen Name → Component Map ─────────────────────────────

export const SCREEN_COMPONENTS = {
  // Auth flow
  Onboarding: LazyScreenOnboarding,
  Login: LazyScreenLogin,
  Register: LazyScreenRegister,

  // Main flow
  HomeScreen: LazyScreenHome,
  TournamentList: LazyScreenTournamentList,
  TournamentDetail: LazyScreenTournamentDetail,
  ProfileHome: LazyScreenProfile,
  Settings: LazyScreenSettings,

  // Training
  TrainingHome: LazyScreenTrainingHome,
  TechniqueDetail: LazyScreenTechniqueDetail,

  // Competition
  LiveScoring: LazyScreenLiveScoring,
  BracketView: LazyScreenBracketView,
  MatchDetail: LazyScreenMatchDetail,
} as const

export type ScreenName = keyof typeof SCREEN_COMPONENTS

/**
 * Resolves a screen component by name.
 * Falls back to a placeholder if not found.
 */
export function getScreenComponent(name: string): React.ComponentType<any> {
  const component = (SCREEN_COMPONENTS as Record<string, React.ComponentType<any>>)[name]
  if (!component) {
    // Return a placeholder component (no JSX in .ts file)
    const Placeholder: React.FC = () => {
      const { View, Text } = require('react-native')
      return React.createElement(
        View,
        { style: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0E14' } },
        React.createElement(
          Text,
          { style: { color: '#94A3B8', fontSize: 14 } },
          `Màn hình "${name}" đang phát triển`
        )
      )
    }
    return Placeholder
  }
  return component
}

