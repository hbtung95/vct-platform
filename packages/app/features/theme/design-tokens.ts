// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — DESIGN TOKENS
// Centralized design system tokens for consistent styling.
// Import from: @app/features/theme/design-tokens
// ═══════════════════════════════════════════════════════════════

// ── Color Palette ───────────────────────────────────────────

export const colors = {
  // Brand
  brand: {
    primary: '#2563eb',     // Blue 600
    primaryLight: '#3b82f6', // Blue 500
    primaryDark: '#1d4ed8',  // Blue 700
    secondary: '#7c3aed',   // Violet 600
    secondaryLight: '#8b5cf6',
    secondaryDark: '#6d28d9',
    accent: '#f59e0b',       // Amber 500
    accentLight: '#fbbf24',
    accentDark: '#d97706',
  },

  // Neutrals
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Semantic
  semantic: {
    success: '#16a34a',
    successLight: '#22c55e',
    successBg: '#f0fdf4',
    warning: '#d97706',
    warningLight: '#f59e0b',
    warningBg: '#fffbeb',
    error: '#dc2626',
    errorLight: '#ef4444',
    errorBg: '#fef2f2',
    info: '#2563eb',
    infoLight: '#3b82f6',
    infoBg: '#eff6ff',
  },

  // Vietnamese martial arts specific
  belt: {
    white: '#ffffff',
    yellow: '#facc15',
    green: '#22c55e',
    blue: '#3b82f6',
    red: '#ef4444',
    black: '#1e293b',
  },

  // Dark mode
  dark: {
    bg: '#0f172a',
    surface: '#1e293b',
    surfaceHover: '#334155',
    border: '#334155',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
  },

  // Light mode
  light: {
    bg: '#ffffff',
    surface: '#f8fafc',
    surfaceHover: '#f1f5f9',
    border: '#e2e8f0',
    text: '#0f172a',
    textSecondary: '#64748b',
  },
} as const

// ── Spacing Scale ───────────────────────────────────────────

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
} as const

// ── Typography ──────────────────────────────────────────────

export const typography = {
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'Fira Code', 'Consolas', monospace",
  },
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
} as const

// ── Border Radius ───────────────────────────────────────────

export const radius = {
  none: '0',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px',
} as const

// ── Shadows ─────────────────────────────────────────────────

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000',
  // Glass morphism
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  glassDark: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
} as const

// ── Transitions ─────────────────────────────────────────────

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const

// ── Breakpoints ─────────────────────────────────────────────

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// ── Z-Index Scale ───────────────────────────────────────────

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  banner: 30,
  overlay: 40,
  modal: 50,
  popover: 60,
  toast: 70,
  tooltip: 80,
  commandPalette: 90,
} as const

// ── Combined Token Export ───────────────────────────────────

export const tokens = {
  colors,
  spacing,
  typography,
  radius,
  shadows,
  transitions,
  breakpoints,
  zIndex,
} as const

export type DesignTokens = typeof tokens
