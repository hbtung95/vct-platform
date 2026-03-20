// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Mobile Module Barrel Export
// Single entry point for all mobile infrastructure, hooks,
// components, screens, and services.
// ═══════════════════════════════════════════════════════════════

// ── Infrastructure & Services ────────────────────────────────
export { apiClient } from './api-client'
export { CircuitBreaker, RetryWithBackoff } from './api-resilience'
export { createApiVersionInterceptor } from './api-version-interceptor'
export { bootstrapApp } from './app-bootstrap'
export { VCTApp, MainStackNavigator } from './app-entry'
export { AppWrapper } from './app-wrapper'
export { authStorage } from './auth-storage'
export { configManager } from './config-manager'
export { crashReporter } from './crash-reporter'
export { registerDeepLinks } from './deep-linking'
export { deviceInfo } from './device-info'
export { featureFlags } from './feature-flags'
export { imageCache } from './image-cache'
export { createInterceptorChain } from './interceptor-chain'
export { requestLogger } from './request-logger'
export { secureStorage } from './secure-storage'
export { sslPinning } from './ssl-pinning'
export { WebSocketClient } from './websocket-client'

// ── Auth & Security ──────────────────────────────────────────
export { AuthGuard } from './auth-guard'
export { biometrics } from './biometrics-auth'
export { permissionManager } from './permission-manager'
export { securityUtils } from './security-utils'

// ── Data & State ─────────────────────────────────────────────
export { useQuery, useMutation } from './data-hooks'
export type { UseDataResult, UseMutationResult } from './data-hooks'
export { useNetworkStatus, getOfflineCache, setOfflineCache } from './offline-manager'

// ── Navigation ───────────────────────────────────────────────
export type {
  AuthStackParamList,
  MainTabParamList,
  HomeStackParamList,
  TournamentStackParamList,
  TrainingStackParamList,
  ProfileStackParamList,
} from './route-types'
export { DEEP_LINK_CONFIG, SCREEN_NAMES } from './route-types'
export { TAB_CONFIGS, createTabScreenOptions, createTabItemOptions } from './tab-navigator'
export { MainTabNavigator } from './tab-navigator'
export { AUTH_SCREENS, createAuthScreenOptions, getInitialAuthRoute, AuthNavigator } from './auth-navigator'
export { useRootNavigator, RootStatusBar, RootLoadingScreen, createNavigationTheme } from './root-navigator'
export { navigationHelpers, navigateToLogin } from './navigation-helpers'

// ── UI Components ────────────────────────────────────────────
export { VctButton, VctTextInput, VctCard, VctBadge } from './core-ui'
export { BaseScreen } from './base-screen'
export { BottomSheet } from './bottom-sheet'
export { SkeletonLoader } from './skeleton-loader'
export { ErrorState, EmptyState, OfflineState, LoadingFailed, DataGuard } from './error-states'
export { MobileErrorBoundary } from './MobileErrorBoundary'
export { NetworkStatusBanner } from './NetworkStatusBanner'
export { ForceUpdateModal } from './ForceUpdateModal'

// ── Hooks ────────────────────────────────────────────────────
export { useAnalytics } from './useAnalytics'
export { useAppUpdate } from './useAppUpdate'
export { useFormValidation } from './form-validation'
export {
  useDebounce,
  useDebouncedCallback,
  useThrottle,
  useKeyboard,
  useDimensions,
  usePrevious,
  useInterval,
  useTimeout,
  useSafeAsync,
} from './utility-hooks'

// ── UX Utilities ─────────────────────────────────────────────
export { triggerHaptic } from './haptic-feedback'
export { accessibilityHelpers } from './accessibility-helpers'
export { analyticsTracker } from './analytics-tracker'
export { appLifecycle } from './app-lifecycle'
export { backgroundTaskManager } from './background-tasks'
export { performanceMonitor } from './performance-monitor'
export { usePerformanceMonitor, markAppStart, getTimeSinceStart } from './performance-monitor'

// ── Theme & i18n ─────────────────────────────────────────────
export { VCTThemeProvider, useVCTTheme } from './theme-provider'
export { ToastProvider, useToast } from './toast-notification'
export { i18n } from './mobile-i18n'

// ── Screens ──────────────────────────────────────────────────
export { ScreenLogin } from './screen-login'
export { ScreenRegister } from './screen-register'
export { ScreenOnboarding } from './screen-onboarding'
export { ScreenHome } from './screen-home'
export { ScreenTournamentList } from './screen-tournament-list'
export { ScreenTournamentDetail } from './screen-tournament-detail'
export { ScreenProfile } from './screen-profile'
export { ScreenSettings } from './screen-settings'
export { ScreenTrainingHome } from './screen-training-home'
export { ScreenTechniqueDetail } from './screen-technique-detail'
export { ScreenLiveScoring } from './screen-live-scoring'
export { ScreenBracketView } from './screen-bracket-view'
export { ScreenMatchDetail } from './screen-match-detail'

// ── Screen Registry ──────────────────────────────────────────
export { SCREEN_COMPONENTS, getScreenComponent } from './screen-registry'
export type { ScreenName } from './screen-registry'
