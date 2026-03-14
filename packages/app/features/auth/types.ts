import { ENTITY_AUTHZ_ROLES } from './entity-authz.generated'
import type { WorkspaceType } from '../layout/workspace-types'

const EXTRA_USER_ROLES = [
  'vice_president',
  'discipline_board',
  'inspector',
  'pr_manager',
  'international_liaison',
  'provincial_president',
  'provincial_vice_president',
  'provincial_secretary',
  'provincial_technical_head',
  'provincial_referee_head',
  'provincial_committee_member',
  'provincial_accountant',
  'club_leader',
  'club_vice_leader',
  'club_secretary',
  'club_accountant',
  'parent',
] as const

export const USER_ROLES = [...ENTITY_AUTHZ_ROLES, ...EXTRA_USER_ROLES] as const
export type UserRole = (typeof USER_ROLES)[number]

const USER_ROLE_SET = new Set<string>(USER_ROLES)

export const isUserRole = (value: unknown): value is UserRole =>
  typeof value === 'string' && USER_ROLE_SET.has(value)

/** Scope type for contextual role assignments */
export type RoleScopeType =
  | 'SYSTEM'
  | 'TENANT'
  | 'FEDERATION'
  | 'PROVINCE'
  | 'TOURNAMENT'
  | 'CLUB'
  | 'SELF'

/** A single role assignment with scope context */
export interface UserRoleAssignment {
  roleId: string
  roleName: string
  roleCode: string
  scopeType: RoleScopeType
  scopeId?: string
  scopeName?: string
  grantedAt: string
  expiresAt?: string
}

/** A workspace the user has access to */
export interface WorkspaceAccess {
  type: WorkspaceType
  scopeId: string
  scopeName: string
  role: string
}

/**
 * UUID-Centric auth user.
 * `role` is kept as backwards-compatible alias for primaryRole.
 * Use `roles[]` for multi-role and `permissions[]` for O(1) permission
 * checks via the usePermission hook.
 */
export interface AuthUser {
  id: string
  name: string
  username?: string
  email?: string
  avatarUrl?: string
  tenantId?: string
  locale?: string
  timezone?: string
  /** Backwards-compatible single role (= primaryRole). */
  role: UserRole
  /** All role assignments with scopes. */
  roles: UserRoleAssignment[]
  /** Flattened permission strings, e.g. ["tournament.create","athlete.read"]. */
  permissions: string[]
  /** Workspaces this UUID can access. */
  workspaces: WorkspaceAccess[]
  /** Arbitrary profile metadata from backend. */
  metadata?: Record<string, unknown>
}

/** Simplified login — server determines role from credentials */
export interface LoginInput {
  username: string
  password: string
  rememberMe?: boolean
  role?: UserRole
  tournamentCode?: string
  operationShift?: 'sang' | 'chieu' | 'toi'
}

/** Context selection after login — on Portal Hub / workspace entry */
export interface WorkspaceContextInput {
  tournamentCode?: string
  operationShift?: 'sang' | 'chieu' | 'toi'
}

export interface AuthSession {
  token: string
  accessToken: string
  refreshToken: string
  tokenType: 'Bearer'
  user: AuthUser
  tournamentCode?: string
  operationShift?: 'sang' | 'chieu' | 'toi'
  expiresAt: string
  refreshExpiresAt: string
}

export interface RevokeInput {
  refreshToken?: string
  accessToken?: string
  revokeAll?: boolean
  reason?: string
}

export interface AuthAuditEntry {
  id: string
  time: string
  userId: string
  username: string
  role: UserRole
  action: string
  success: boolean
  ip: string
  userAgent: string
  details?: Record<string, unknown>
}

export const USER_ROLE_OPTIONS: Array<{ value: UserRole; label: string; tier: 'federation' | 'tournament' | 'club' | 'individual' }> = [
  { value: 'admin', label: 'Quản trị hệ thống', tier: 'federation' },
  { value: 'federation_president', label: 'Chủ tịch Liên đoàn', tier: 'federation' },
  { value: 'vice_president', label: 'Phó chủ tịch Liên đoàn', tier: 'federation' },
  { value: 'federation_secretary', label: 'Tổng thư ký', tier: 'federation' },
  { value: 'provincial_admin', label: 'Quản trị địa phương', tier: 'federation' },
  { value: 'provincial_president', label: 'Chủ tịch Liên đoàn tỉnh', tier: 'federation' },
  { value: 'provincial_vice_president', label: 'Phó chủ tịch Liên đoàn tỉnh', tier: 'federation' },
  { value: 'provincial_secretary', label: 'Tổng thư ký Liên đoàn tỉnh', tier: 'federation' },
  { value: 'provincial_technical_head', label: 'Phụ trách chuyên môn tỉnh', tier: 'federation' },
  { value: 'provincial_referee_head', label: 'Phụ trách trọng tài tỉnh', tier: 'federation' },
  { value: 'provincial_committee_member', label: 'Ủy viên ban chấp hành tỉnh', tier: 'federation' },
  { value: 'provincial_accountant', label: 'Kế toán Liên đoàn tỉnh', tier: 'federation' },
  { value: 'technical_director', label: 'Giám đốc kỹ thuật', tier: 'federation' },
  { value: 'discipline_board', label: 'Ban kỷ luật', tier: 'federation' },
  { value: 'inspector', label: 'Thanh tra', tier: 'federation' },
  { value: 'pr_manager', label: 'Phụ trách truyền thông', tier: 'federation' },
  { value: 'international_liaison', label: 'Phụ trách đối ngoại', tier: 'federation' },
  { value: 'btc', label: 'Ban tổ chức', tier: 'tournament' },
  { value: 'referee_manager', label: 'Điều phối trọng tài', tier: 'tournament' },
  { value: 'referee', label: 'Trọng tài', tier: 'tournament' },
  { value: 'medical_staff', label: 'Nhân viên y tế', tier: 'tournament' },
  { value: 'coach', label: 'Huấn luyện viên', tier: 'club' },
  { value: 'club_leader', label: 'Chủ nhiệm CLB', tier: 'club' },
  { value: 'club_vice_leader', label: 'Phó chủ nhiệm CLB', tier: 'club' },
  { value: 'club_secretary', label: 'Thư ký CLB', tier: 'club' },
  { value: 'club_accountant', label: 'Kế toán CLB', tier: 'club' },
  { value: 'delegate', label: 'Cán bộ đoàn', tier: 'individual' },
  { value: 'athlete', label: 'Vận động viên', tier: 'individual' },
  { value: 'parent', label: 'Phụ huynh', tier: 'individual' },
]
