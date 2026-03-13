import { StyleSheet } from 'react-native'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Mobile Design System
// Single source of truth: colors, spacing, typography, shared styles
// ═══════════════════════════════════════════════════════════════

/** Palette — dark-first martial arts branding */
export const Colors = {
  // Backgrounds
  bgBase: '#f8fafc',
  bgDark: '#0f172a',
  bgCard: '#ffffff',
  bgInput: '#334155',

  // Accents
  accent: '#3b82f6',
  accentDark: '#2563eb',
  gold: '#f59e0b',
  green: '#22c55e',
  red: '#ef4444',
  purple: '#8b5cf6',
  cyan: '#06b6d4',

  // Text
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  textWhite: '#ffffff',
  textMuted: '#94a3b8',

  // Borders
  border: '#e2e8f0',
  borderLight: 'rgba(255,255,255,0.06)',
  borderAccent: 'rgba(59,130,246,0.2)',

  // Status
  statusOkBg: '#dcfce7',
  statusOkFg: '#166534',
  statusWarnBg: '#fef3c7',
  statusWarnFg: '#92400e',
  statusErrorBg: '#fee2e2',
  statusErrorFg: '#991b1b',
  statusInfoBg: '#dbeafe',
  statusInfoFg: '#1e40af',

  // Transparent overlays
  overlay: (color: string, opacity: number) => {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    return `rgba(${r},${g},${b},${opacity})`
  },
} as const

/** Spacing scale (4px base) */
export const Space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const

/** Border radius scale */
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const

/** Font weights (as React Native expects) */
export const FontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
}

/** Shared styles reusable across all mobile screens */
export const SharedStyles = StyleSheet.create({
  // Page layouts
  page: { flex: 1, backgroundColor: Colors.bgBase },
  pageDark: { flex: 1, backgroundColor: Colors.bgDark },
  scrollContent: { padding: Space.lg, paddingBottom: 40 },

  // Cards
  card: {
    borderRadius: Radius.lg,
    padding: Space.lg,
    marginBottom: Space.md,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroCard: {
    borderRadius: Radius.xl,
    padding: Space.xxl,
    marginBottom: Space.lg,
    backgroundColor: Colors.bgDark,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },

  // Stats row
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: Space.lg },
  statBox: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: 14,
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: { fontSize: 22, fontWeight: FontWeight.black, color: Colors.textPrimary, marginBottom: 2 },
  statLabel: {
    fontSize: 10, fontWeight: FontWeight.bold, color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },

  // Action grid
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: Space.lg },
  actionBtn: {
    flex: 1, borderRadius: Radius.md, padding: 14, alignItems: 'center',
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
  },
  actionIcon: { fontSize: 22, marginBottom: 6 },
  actionLabel: { fontSize: 11, fontWeight: FontWeight.bold, color: '#334155' },

  // Section titles
  sectionTitle: { fontSize: 16, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, marginBottom: 12, marginTop: 8 },
  sectionSub: { fontSize: 11, color: Colors.textSecondary, marginBottom: 10 },

  // Skill bars
  skillRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  skillLabel: { width: 64, fontSize: 11, fontWeight: FontWeight.semibold, color: Colors.textSecondary, textAlign: 'right' },
  skillTrack: { flex: 1, height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  skillFill: { height: '100%', borderRadius: 4 },
  skillValue: { width: 28, fontSize: 11, fontWeight: FontWeight.extrabold, textAlign: 'right' },

  // Progress bar
  progressTrack: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden', marginTop: 6 },
  progressFill: { height: '100%', borderRadius: 3 },

  // Badge
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill, alignSelf: 'flex-start' },
  badgeText: { fontSize: 10, fontWeight: FontWeight.extrabold },

  // Empty state
  emptyBox: {
    paddingVertical: 32, alignItems: 'center', justifyContent: 'center',
    borderRadius: Radius.lg, borderWidth: 1, borderStyle: 'dashed',
    borderColor: Colors.border, backgroundColor: '#fafafa', marginBottom: 12,
  },
  emptyText: { fontSize: 13, color: Colors.textSecondary, marginTop: 8, textAlign: 'center' },

  // Row layouts
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
})
