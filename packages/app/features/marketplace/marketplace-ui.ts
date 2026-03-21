import type {
  MarketplaceOrderStatus,
  MarketplacePaymentStatus,
  MarketplaceProductCategory,
  MarketplaceProductCondition,
  MarketplaceProductStatus,
} from '@vct/shared-types'

export const marketplaceCategoryLabels: Record<MarketplaceProductCategory, string> = {
  vo_phuc: 'Vo phuc',
  bao_ho: 'Bao ho',
  binh_khi: 'Binh khi',
  dung_cu: 'Dung cu',
  san_dau: 'San dau',
  phu_kien: 'Phu kien',
}

export const marketplaceConditionLabels: Record<MarketplaceProductCondition, string> = {
  new: 'Moi',
  like_new: 'Nhu moi',
  used: 'Da qua su dung',
  collector: 'Suu tam',
}

export const marketplaceStatusLabels: Record<MarketplaceProductStatus, string> = {
  draft: 'Nhap',
  active: 'Dang ban',
  out_of_stock: 'Het hang',
  archived: 'Luu kho',
}

export const marketplaceOrderStatusLabels: Record<MarketplaceOrderStatus, string> = {
  pending: 'Moi tao',
  confirmed: 'Da xac nhan',
  preparing: 'Dang dong goi',
  shipping: 'Dang giao',
  completed: 'Hoan tat',
  cancelled: 'Da huy',
}

export const marketplacePaymentStatusLabels: Record<MarketplacePaymentStatus, string> = {
  unpaid: 'Chua thanh toan',
  deposit_paid: 'Da coc',
  paid: 'Da thanh toan',
}

export const marketplaceStatusTone = (
  status: MarketplaceProductStatus | MarketplaceOrderStatus | MarketplacePaymentStatus
) => {
  switch (status) {
    case 'active':
    case 'completed':
    case 'paid':
      return 'success'
    case 'out_of_stock':
    case 'pending':
    case 'deposit_paid':
    case 'preparing':
    case 'shipping':
      return 'warning'
    case 'cancelled':
    case 'archived':
      return 'neutral'
    case 'draft':
      return 'info'
    default:
      return 'info'
  }
}

export const formatCurrencyVND = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0)

export const formatCompactVND = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value || 0)

export const categoryAccentMap: Record<MarketplaceProductCategory, string> = {
  vo_phuc: '#f97316',
  bao_ho: '#ef4444',
  binh_khi: '#0ea5e9',
  dung_cu: '#10b981',
  san_dau: '#eab308',
  phu_kien: '#8b5cf6',
}
