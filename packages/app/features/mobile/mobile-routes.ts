import type { UserRole } from '../auth/types'
import { isRouteAccessible } from '../layout/route-registry'

export type MobileRouteKey =
  | 'teams'
  | 'athletes'
  | 'registration'
  | 'results'
  | 'schedule'

export interface MobileRouteItem {
  key: MobileRouteKey
  title: string
  subtitle: string
  webPath: string
  nativePath: string
}

export const MOBILE_ROUTE_REGISTRY: MobileRouteItem[] = [
  {
    key: 'teams',
    title: 'Đơn vị tham gia',
    subtitle: 'Theo dõi đoàn và trạng thái xác nhận',
    webPath: '/teams',
    nativePath: 'teams',
  },
  {
    key: 'athletes',
    title: 'Vận động viên',
    subtitle: 'Danh sách hồ sơ vận động viên',
    webPath: '/athletes',
    nativePath: 'athletes',
  },
  {
    key: 'registration',
    title: 'Đăng ký nội dung',
    subtitle: 'Kiểm tra và duyệt đăng ký thi đấu',
    webPath: '/registration',
    nativePath: 'registration',
  },
  {
    key: 'results',
    title: 'Kết quả',
    subtitle: 'Theo dõi kết quả thi đấu gần nhất',
    webPath: '/results',
    nativePath: 'results',
  },
  {
    key: 'schedule',
    title: 'Lịch thi đấu',
    subtitle: 'Lịch theo ngày và phiên đấu',
    webPath: '/schedule',
    nativePath: 'schedule',
  },
]

export const canAccessMobileRoute = (key: MobileRouteKey, role: UserRole) => {
  const route = MOBILE_ROUTE_REGISTRY.find((item) => item.key === key)
  if (!route) return false
  return isRouteAccessible(route.webPath, role)
}

export const getAccessibleMobileRoutes = (role: UserRole) =>
  MOBILE_ROUTE_REGISTRY.filter((route) => isRouteAccessible(route.webPath, role))
