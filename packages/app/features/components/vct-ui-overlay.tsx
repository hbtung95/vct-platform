'use client'
import type { CSSProperties, FC, ReactNode } from 'react'
import * as Legacy from './vct-ui.legacy'

export interface VCTLoadingOverlayProps {
  show: boolean
  message?: ReactNode
  [key: string]: any
}

export interface VCTModalProps {
  isOpen: boolean
  onClose: () => void
  title?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  width?: string | number
  className?: string
  style?: CSSProperties
  [key: string]: any
}

export interface VCTToastProps {
  isVisible: boolean
  message: ReactNode
  type?: 'success' | 'warning' | 'error' | 'info' | string
  onClose?: () => void
  [key: string]: any
}

export interface VCTConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: ReactNode
  message?: ReactNode
  preview?: ReactNode
  confirmLabel?: ReactNode
  confirmVariant?: 'primary' | 'danger' | 'secondary' | string
  [key: string]: any
}

export const VCT_LoadingOverlay =
  Legacy.VCT_LoadingOverlay as FC<VCTLoadingOverlayProps>
export const VCT_Modal = Legacy.VCT_Modal as FC<VCTModalProps>
export const VCT_Toast = Legacy.VCT_Toast as FC<VCTToastProps>
export const VCT_ConfirmDialog =
  Legacy.VCT_ConfirmDialog as FC<VCTConfirmDialogProps>
