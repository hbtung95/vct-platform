/**
 * VCT Design Tokens
 * Central source of truth for colors, spacing, typography, shadows, 
 * breakpoints and animation values used across the VCT Platform.
 * 
 * Usage: import { colors, spacing, typography } from '@vct/ui/tokens'
 */

// ═══════════════════════════════════════════════════════════════
// Colors — Maps to CSS custom properties (--vct-*)
// ═══════════════════════════════════════════════════════════════

export const colors = {
  // Brand
  primary: 'var(--vct-primary, #dc2626)',
  primaryHover: 'var(--vct-primary-hover, #b91c1c)',
  primaryLight: 'var(--vct-primary-light, #fee2e2)',
  accent: 'var(--vct-accent, #f59e0b)',
  accentHover: 'var(--vct-accent-hover, #d97706)',

  // Surfaces
  bg: 'var(--vct-bg, #0f172a)',
  bgElevated: 'var(--vct-bg-elevated, #1e293b)',
  bgCard: 'var(--vct-bg-card, #1e293b)',
  bgHover: 'var(--vct-bg-hover, #334155)',
  bgInput: 'var(--vct-bg-input, #1e293b)',

  // Text
  text: 'var(--vct-text, #f1f5f9)',
  textMuted: 'var(--vct-text-muted, #94a3b8)',
  textInverse: 'var(--vct-text-inverse, #0f172a)',

  // Borders
  border: 'var(--vct-border, #334155)',
  borderFocus: 'var(--vct-border-focus, #dc2626)',

  // Status
  success: 'var(--vct-success, #22c55e)',
  warning: 'var(--vct-warning, #f59e0b)',
  error: 'var(--vct-error, #ef4444)',
  info: 'var(--vct-info, #3b82f6)',

  // Medals
  gold: 'var(--vct-gold, #fbbf24)',
  silver: 'var(--vct-silver, #9ca3af)',
  bronze: 'var(--vct-bronze, #d97706)',
} as const

// ═══════════════════════════════════════════════════════════════
// Spacing — 4px base unit
// ═══════════════════════════════════════════════════════════════

export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
} as const

// ═══════════════════════════════════════════════════════════════
// Typography
// ═══════════════════════════════════════════════════════════════

export const typography = {
  fontFamily: {
    sans: '"Inter", "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
    display: '"Outfit", "Inter", sans-serif',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const

// ═══════════════════════════════════════════════════════════════
// Shadows
// ═══════════════════════════════════════════════════════════════

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px rgba(0, 0, 0, 0.3)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.3)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.3)',
  glow: '0 0 20px rgba(220, 38, 38, 0.3)',
  card: '0 2px 8px rgba(0, 0, 0, 0.2)',
} as const

// ═══════════════════════════════════════════════════════════════
// Border Radius
// ═══════════════════════════════════════════════════════════════

export const radii = {
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const

// ═══════════════════════════════════════════════════════════════
// Breakpoints
// ═══════════════════════════════════════════════════════════════

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// ═══════════════════════════════════════════════════════════════
// Animation
// ═══════════════════════════════════════════════════════════════

export const animation = {
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '400ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
  },
} as const

// ═══════════════════════════════════════════════════════════════
// Z-Index Scale
// ═══════════════════════════════════════════════════════════════

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
  commandPalette: 1090,
} as const
