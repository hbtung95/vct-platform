'use client'
import type { CSSProperties, FC, ReactNode } from 'react'
import * as Legacy from './vct-ui.legacy'

export interface VCTFieldProps {
  label?: ReactNode
  error?: ReactNode
  children: ReactNode
  tip?: string
  style?: CSSProperties
  [key: string]: any
}

export interface VCTInputProps {
  value?: string | number
  onChange?: (...args: any[]) => void
  placeholder?: string
  type?: string
  className?: string
  style?: CSSProperties
  disabled?: boolean
  autoFocus?: boolean
  min?: number
  max?: number
  step?: number
  inputMode?: string
  [key: string]: any
}

export interface VCTSearchInputProps {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  placeholder?: string
  loading?: boolean
  [key: string]: any
}

export interface SelectOption {
  value: string | number
  label: string
}

export interface VCTSelectProps {
  value?: string | number
  onChange?: (value: any) => void
  options?: SelectOption[]
  label?: ReactNode
  style?: CSSProperties
  disabled?: boolean
  [key: string]: any
}

export interface VCTSwitchProps {
  checked: boolean
  onChange?: (value: boolean) => void
  label?: ReactNode
  disabled?: boolean
  [key: string]: any
}

export interface SegmentedOption {
  value: string
  label: string
}

export interface VCTSegmentedControlProps {
  options: SegmentedOption[]
  value: string
  onChange: (value: string) => void
  style?: CSSProperties
  [key: string]: any
}

export interface VCTStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  [key: string]: any
}

export interface VCTScorePadProps {
  score: number
  onScore: (value: number) => void
  [key: string]: any
}

export const VCT_Field = Legacy.VCT_Field as FC<VCTFieldProps>
export const VCT_Input = Legacy.VCT_Input as FC<VCTInputProps>
export const VCT_SearchInput = Legacy.VCT_SearchInput as FC<VCTSearchInputProps>
export const VCT_Select = Legacy.VCT_Select as FC<VCTSelectProps>
export const VCT_Switch = Legacy.VCT_Switch as FC<VCTSwitchProps>
export const VCT_SegmentedControl =
  Legacy.VCT_SegmentedControl as FC<VCTSegmentedControlProps>
export const VCT_Stepper = Legacy.VCT_Stepper as FC<VCTStepperProps>
export const VCT_ScorePad = Legacy.VCT_ScorePad as FC<VCTScorePadProps>
