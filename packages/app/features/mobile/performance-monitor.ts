import {
  getTimeSinceStart,
  markAppStart,
  usePerformanceMonitor,
} from './usePerformanceMonitor'

export { usePerformanceMonitor, markAppStart, getTimeSinceStart }

export const performanceMonitor = {
  markAppStart,
  getTimeSinceStart,
} as const
