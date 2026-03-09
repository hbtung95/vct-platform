'use client'
import type { CSSProperties, FC, ReactNode } from 'react'
import * as Legacy from './vct-ui.legacy'

export const cn = Legacy.cn

export interface VCTProviderProps {
  children: ReactNode
}

export interface VCTStackProps {
  children: ReactNode
  direction?: 'row' | 'column'
  gap?: number
  align?: CSSProperties['alignItems']
  justify?: CSSProperties['justifyContent']
  style?: CSSProperties
  className?: string
  [key: string]: any
}

export interface VCTDividerProps {
  label?: string
  vertical?: boolean
  [key: string]: any
}

export interface VCTTextProps {
  children: ReactNode
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'mono'
  className?: string
  style?: CSSProperties
  [key: string]: any
}

export interface VCTButtonProps {
  children?: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'small' | 'md' | string
  loading?: boolean
  disabled?: boolean
  icon?: ReactNode
  style?: CSSProperties
  type?: 'button' | 'submit' | 'reset'
  onClick?: (...args: any[]) => void
  title?: string
  [key: string]: any
}

export interface VCTCardProps {
  children: ReactNode
  title?: ReactNode
  headerAction?: ReactNode
  footer?: ReactNode
  className?: string
  style?: CSSProperties
  [key: string]: any
}

export const VCT_Provider = Legacy.VCT_Provider as FC<VCTProviderProps>
export const VCT_Stack = Legacy.VCT_Stack as FC<VCTStackProps>
export const VCT_Divider = Legacy.VCT_Divider as FC<VCTDividerProps>
export const VCT_Text = Legacy.VCT_Text as FC<VCTTextProps>
export const VCT_Button = Legacy.VCT_Button as FC<VCTButtonProps>
export const VCT_Card = Legacy.VCT_Card as FC<VCTCardProps>
