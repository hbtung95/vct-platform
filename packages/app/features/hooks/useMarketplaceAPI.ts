import {
  type MarketplaceCatalogResponse,
  type MarketplaceCreateOrderInput,
  type MarketplaceOrder,
  type MarketplaceProduct,
  type MarketplaceSellerDashboard,
  type MarketplaceUpsertProductInput,
} from '@vct/shared-types'

import { useApiMutation, useApiQuery } from './useApiQuery'

interface CatalogFilters {
  search?: string
  category?: string
  condition?: string
  featured?: boolean
}

const buildQuery = (filters: CatalogFilters) => {
  const params = new URLSearchParams()
  if (filters.search?.trim()) params.set('search', filters.search.trim())
  if (filters.category?.trim()) params.set('category', filters.category.trim())
  if (filters.condition?.trim()) params.set('condition', filters.condition.trim())
  if (filters.featured) params.set('featured', 'true')
  const query = params.toString()
  return query ? `?${query}` : ''
}

export function useMarketplaceCatalog(filters: CatalogFilters = {}) {
  return useApiQuery<MarketplaceCatalogResponse>(
    `/api/v1/marketplace/products${buildQuery(filters)}`
  )
}

export function useMarketplaceStats() {
  return useApiQuery<{ stats: MarketplaceCatalogResponse['stats'] }>(
    '/api/v1/marketplace/stats'
  )
}

export function useMarketplaceProduct(slug: string) {
  return useApiQuery<MarketplaceProduct>(
    `/api/v1/marketplace/products/${slug}`,
    { enabled: !!slug }
  )
}

export function useMarketplaceSellerDashboard() {
  return useApiQuery<MarketplaceSellerDashboard>(
    '/api/v1/marketplace/seller/dashboard'
  )
}

export function useMarketplaceSellerProducts() {
  return useApiQuery<{ items: MarketplaceProduct[]; total: number }>(
    '/api/v1/marketplace/seller/products'
  )
}

export function useMarketplaceSellerOrders() {
  return useApiQuery<{ items: MarketplaceOrder[]; total: number }>(
    '/api/v1/marketplace/seller/orders'
  )
}

export function useCreateMarketplaceOrder() {
  return useApiMutation<MarketplaceCreateOrderInput, MarketplaceOrder>(
    'POST',
    '/api/v1/marketplace/orders'
  )
}

export function useCreateMarketplaceProduct() {
  return useApiMutation<MarketplaceUpsertProductInput, MarketplaceProduct>(
    'POST',
    '/api/v1/marketplace/seller/products'
  )
}

export function useUpdateMarketplaceProduct(productId: string) {
  return useApiMutation<Partial<MarketplaceUpsertProductInput>, MarketplaceProduct>(
    'PATCH',
    `/api/v1/marketplace/seller/products/${productId}`
  )
}

export function useUpdateMarketplaceOrder(orderId: string) {
  return useApiMutation<
    Partial<Pick<MarketplaceOrder, 'status' | 'payment_status' | 'notes'>>,
    MarketplaceOrder
  >(
    'PATCH',
    `/api/v1/marketplace/seller/orders/${orderId}`
  )
}
