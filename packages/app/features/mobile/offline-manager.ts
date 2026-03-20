export { offlineManager } from './offline/offline-manager'
export type {
  CacheEntry,
  SyncQueueItem,
  SyncPriority,
  ConflictStrategy,
  SyncResult,
  SyncEvent,
  SyncEventType,
  StorageAnalytics,
  NetworkListener,
  SyncEventListener,
} from './offline/offline-manager'
export { useNetworkStatus } from './offline/useNetworkStatus'
export type { NetworkStatus } from './offline/useNetworkStatus'

import { offlineManager } from './offline/offline-manager'

export async function getOfflineCache<T>(key: string): Promise<T | null> {
  const cached = await offlineManager.get<T>(key)
  return cached?.data ?? null
}

export function setOfflineCache<T>(
  key: string,
  data: T,
  ttlMs?: number,
): Promise<void> {
  return offlineManager.set(key, data, ttlMs)
}

export function clearAllOfflineCache(): Promise<void> {
  return offlineManager.clearCache()
}
