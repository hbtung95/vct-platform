'use client'
import type { CSSProperties, FC, ReactNode } from 'react'
import * as Legacy from './vct-ui.legacy'

export interface VCTBadgeProps {
  text: ReactNode
  type?: 'success' | 'warning' | 'danger' | 'info' | string
  pulse?: boolean
  style?: CSSProperties
  [key: string]: any
}

export interface VCTKpiCardProps {
  label: ReactNode
  value: ReactNode
  icon?: ReactNode
  color?: string
  sub?: ReactNode
  style?: CSSProperties
  [key: string]: any
}

export interface VCTTableProps {
  columns?: Array<Record<string, unknown>>
  data?: any[]
  rowKey?: string
  className?: string
  [key: string]: any
}

export interface VCTAvatarGroupProps {
  names?: string[]
  max?: number
  [key: string]: any
}

export interface VCTSkeletonProps {
  width?: string | number
  height?: string | number
  radius?: string | number
  style?: CSSProperties
  [key: string]: any
}

export interface VCTEmptyStateProps {
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  actionLabel?: ReactNode
  onAction?: () => void
  [key: string]: any
}

export interface FilterChip {
  key: string
  label: string
  value: string
}

export interface VCTFilterChipsProps {
  filters: FilterChip[]
  onRemove?: (key: string) => void
  onClearAll?: () => void
  [key: string]: any
}

export interface StatusStage {
  key: string
  label: string
  color?: string
  count?: number
}

export interface VCTStatusPipelineProps {
  stages: StatusStage[]
  activeStage?: string | null
  onStageClick?: (key: string | null) => void
  [key: string]: any
}

export interface BulkActionItem {
  label: string
  icon?: ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger' | string
}

export interface VCTBulkActionsBarProps {
  count: number
  actions?: BulkActionItem[]
  onClearSelection?: () => void
  [key: string]: any
}

export interface VCTProgressBarProps {
  value: number
  max: number
  color?: string
  showLabel?: boolean
  height?: number
  [key: string]: any
}

export interface TabItem {
  key: string
  label: ReactNode
  icon?: ReactNode
}

export interface VCTTabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (tab: string) => void
  [key: string]: any
}

export interface VCTAvatarLetterProps {
  name: string
  size?: number
  style?: CSSProperties
  color?: string
  [key: string]: any
}

export const VCT_Badge = Legacy.VCT_Badge as FC<VCTBadgeProps>
export const VCT_KpiCard = Legacy.VCT_KpiCard as FC<VCTKpiCardProps>
export const VCT_Table = Legacy.VCT_Table as FC<VCTTableProps>
export const VCT_AvatarGroup = Legacy.VCT_AvatarGroup as FC<VCTAvatarGroupProps>
export const VCT_Skeleton = Legacy.VCT_Skeleton as FC<VCTSkeletonProps>
export const VCT_EmptyState = Legacy.VCT_EmptyState as FC<VCTEmptyStateProps>
export const VCT_FilterChips = Legacy.VCT_FilterChips as FC<VCTFilterChipsProps>
export const VCT_StatusPipeline =
  Legacy.VCT_StatusPipeline as FC<VCTStatusPipelineProps>
export const VCT_BulkActionsBar =
  Legacy.VCT_BulkActionsBar as FC<VCTBulkActionsBarProps>
export const VCT_ProgressBar = Legacy.VCT_ProgressBar as FC<VCTProgressBarProps>
export const VCT_Tabs = Legacy.VCT_Tabs as FC<VCTTabsProps>
export const VCT_AvatarLetter = Legacy.VCT_AvatarLetter as FC<VCTAvatarLetterProps>
