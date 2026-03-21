export type MarketplaceProductCategory =
  | 'vo_phuc'
  | 'bao_ho'
  | 'binh_khi'
  | 'dung_cu'
  | 'san_dau'
  | 'phu_kien'

export type MarketplaceProductCondition =
  | 'new'
  | 'like_new'
  | 'used'
  | 'collector'

export type MarketplaceProductStatus =
  | 'draft'
  | 'active'
  | 'out_of_stock'
  | 'archived'

export type MarketplaceOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'shipping'
  | 'completed'
  | 'cancelled'

export type MarketplacePaymentStatus =
  | 'unpaid'
  | 'deposit_paid'
  | 'paid'

export interface MarketplaceProductSpec {
  label: string
  value: string
}

export interface MarketplaceShippingProfile {
  lead_time_days: number
  delivery_zones: string[]
  shipping_fee_vnd: number
  pickup_available: boolean
}

export interface MarketplaceProduct {
  id: string
  slug: string
  seller_id: string
  seller_name: string
  seller_role: string
  title: string
  short_description: string
  description: string
  category: MarketplaceProductCategory
  condition: MarketplaceProductCondition
  martial_art: string
  price_vnd: number
  compare_at_price_vnd: number
  currency: string
  stock_quantity: number
  minimum_order_quantity: number
  status: MarketplaceProductStatus
  location: string
  featured: boolean
  images: string[]
  tags: string[]
  specs: MarketplaceProductSpec[]
  shipping: MarketplaceShippingProfile
  created_at: string
  updated_at: string
}

export interface MarketplaceOrderItem {
  id: string
  product_id: string
  product_slug: string
  product_title: string
  unit_price_vnd: number
  quantity: number
  line_total_vnd: number
}

export interface MarketplaceOrder {
  id: string
  order_code: string
  seller_id: string
  seller_name: string
  buyer_name: string
  buyer_phone: string
  buyer_email: string
  buyer_address: string
  notes: string
  status: MarketplaceOrderStatus
  payment_status: MarketplacePaymentStatus
  items: MarketplaceOrderItem[]
  subtotal_vnd: number
  shipping_fee_vnd: number
  discount_vnd: number
  total_vnd: number
  created_at: string
  updated_at: string
}

export interface MarketplaceFacetCount {
  key: string
  label: string
  count: number
}

export interface MarketplaceCatalogStats {
  total_products: number
  featured_products: number
  active_sellers: number
  completed_orders: number
  total_inventory_vnd: number
}

export interface MarketplaceCatalogResponse {
  items: MarketplaceProduct[]
  featured: MarketplaceProduct[]
  stats: MarketplaceCatalogStats
  facets: {
    categories: MarketplaceFacetCount[]
    conditions: MarketplaceFacetCount[]
  }
  total: number
}

export interface MarketplaceSellerDashboard {
  summary: {
    active_products: number
    pending_orders: number
    completed_orders: number
    low_stock_products: number
    gross_revenue_vnd: number
  }
  low_stock_products: MarketplaceProduct[]
  recent_orders: MarketplaceOrder[]
}

export interface MarketplaceCreateOrderInput {
  product_id?: string
  product_slug?: string
  quantity: number
  buyer_name: string
  buyer_phone: string
  buyer_email?: string
  buyer_address?: string
  notes?: string
}

export interface MarketplaceUpsertProductInput {
  seller_id?: string
  seller_name?: string
  seller_role?: string
  title: string
  short_description: string
  description: string
  category: MarketplaceProductCategory
  condition: MarketplaceProductCondition
  martial_art?: string
  price_vnd: number
  compare_at_price_vnd?: number
  currency?: string
  stock_quantity: number
  minimum_order_quantity?: number
  status?: MarketplaceProductStatus
  location?: string
  featured?: boolean
  images?: string[]
  tags?: string[]
  specs?: MarketplaceProductSpec[]
  shipping?: MarketplaceShippingProfile
}
