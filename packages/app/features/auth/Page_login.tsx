'use client'
import * as React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  VCT_Button,
  VCT_Field,
  VCT_Input,
  VCT_Select,
  VCT_Stack,
  VCT_Text,
  VCT_Toast,
} from '../components/vct-ui'
import { VCT_Icons } from '../components/vct-icons'
import { useAuth } from './AuthProvider'
import type { LoginInput, UserRole } from './types'

const ROLE_OPTIONS: Array<{ value: UserRole; label: string }> = [
  { value: 'admin', label: 'Quản trị hệ thống' },
  { value: 'btc', label: 'Ban tổ chức' },
  { value: 'referee_manager', label: 'Điều phối trọng tài' },
  { value: 'referee', label: 'Trọng tài' },
  { value: 'delegate', label: 'Cán bộ đoàn' },
]

const QUICK_ACCOUNTS: Array<{
  username: string
  password: string
  role: UserRole
  label: string
}> = [
  { username: 'admin', password: 'Admin@123', role: 'admin', label: 'Admin' },
  { username: 'btc', password: 'Btc@123', role: 'btc', label: 'Ban tổ chức' },
  {
    username: 'ref-manager',
    password: 'Ref@123',
    role: 'referee_manager',
    label: 'Điều phối trọng tài',
  },
  { username: 'delegate', password: 'Delegate@123', role: 'delegate', label: 'Cán bộ đoàn' },
]

const SHIFT_OPTIONS = [
  { value: 'sang', label: 'Ca sáng (06:00 - 12:00)' },
  { value: 'chieu', label: 'Ca chiều (12:00 - 18:00)' },
  { value: 'toi', label: 'Ca tối (18:00 - 22:00)' },
]

const INITIAL_FORM: LoginInput = {
  username: 'admin',
  password: 'Admin@123',
  role: 'admin',
  tournamentCode: 'VCT-2026',
  operationShift: 'sang',
}

export const Page_login = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get('redirect') || '/'

  const { login, isAuthenticated, isHydrating } = useAuth()

  const [form, setForm] = useState<LoginInput>(INITIAL_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  const [toast, setToast] = useState<{
    show: boolean
    msg: string
    type: 'success' | 'error' | 'warning' | 'info'
  }>({ show: false, msg: '', type: 'success' })

  useEffect(() => {
    if (!isHydrating && isAuthenticated) {
      router.replace(redirectTarget)
    }
  }, [isAuthenticated, isHydrating, redirectTarget, router])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 1024px)')
    const sync = () => setIsCompact(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const handleField = <K extends keyof LoginInput>(key: K, value: LoginInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const tips = useMemo(
    () => [
      'Đồng bộ vai trò để phân quyền chính xác theo module.',
      'Mỗi ca điều hành tương ứng tổ trực ban kỹ thuật.',
      'Sử dụng mã giải để phân tách dữ liệu theo mùa giải.',
    ],
    []
  )

  const showToast = (msg: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setToast({ show: true, msg, type })
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }))
    }, 3200)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.username.trim() || !form.password.trim()) {
      showToast('Vui lòng nhập đủ tài khoản và mật khẩu.', 'warning')
      return
    }
    if (!form.tournamentCode.trim()) {
      showToast('Mã giải là bắt buộc để khóa phạm vi dữ liệu.', 'warning')
      return
    }

    setIsSubmitting(true)
    try {
      await login({
        ...form,
        username: form.username.trim(),
        password: form.password.trim(),
        tournamentCode: form.tournamentCode.trim().toUpperCase(),
      })
      showToast('Đăng nhập thành công. Đang chuyển vào hệ điều hành giải...', 'success')
      router.replace(redirectTarget)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Không thể kết nối máy chủ xác thực'
      showToast(message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        gridTemplateColumns: isCompact ? 'minmax(0, 1fr)' : '1.1fr 0.9fr',
        background:
          'radial-gradient(circle at 15% 20%, rgba(22, 163, 74, 0.12), transparent 40%), radial-gradient(circle at 85% 15%, rgba(185, 28, 28, 0.12), transparent 45%), #eef2f7',
      }}
    >
      <section
        style={{
          padding: isCompact ? '28px 18px' : '48px clamp(24px, 6vw, 72px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: isCompact ? 'none' : '1px solid rgba(15, 23, 42, 0.08)',
          borderBottom: isCompact ? '1px solid rgba(15, 23, 42, 0.08)' : 'none',
        }}
      >
        <div>
          <VCT_Stack direction="row" gap={12} align="center" style={{ marginBottom: 20 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #b91c1c, #166534)',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <VCT_Icons.Shield size={20} />
            </div>
            <div>
              <VCT_Text variant="h3" style={{ margin: 0 }}>
                VCT Tournament Command
              </VCT_Text>
              <VCT_Text variant="small" style={{ opacity: 0.7 }}>
                Trung tâm vận hành giải võ cổ truyền
              </VCT_Text>
            </div>
          </VCT_Stack>

          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(34px, 5.5vw, 62px)',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              color: '#0f172a',
            }}
          >
            Điều hành giải
            <br />
            chuẩn thi đấu
          </h1>
          <p
            style={{
              marginTop: 18,
              marginBottom: 0,
              color: '#334155',
              maxWidth: 520,
              fontSize: 15,
              lineHeight: 1.7,
            }}
          >
            Đăng nhập để quản lý danh sách đoàn, cân ký, bốc thăm, phân công trọng tài,
            nhập kết quả và công bố huy chương theo thời gian thực.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isCompact
              ? 'repeat(1, minmax(0, 1fr))'
              : 'repeat(3, minmax(0, 1fr))',
            gap: 12,
            marginTop: 28,
          }}
        >
          {tips.map((tip, index) => (
            <div
              key={tip}
              style={{
                borderRadius: 14,
                padding: '14px 12px',
                border: '1px solid rgba(15, 23, 42, 0.1)',
                background: 'rgba(255, 255, 255, 0.72)',
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 8,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 800,
                  background: index === 1 ? '#15803d' : '#b91c1c',
                  marginBottom: 8,
                }}
              >
                {index + 1}
              </div>
              <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: '#1e293b' }}>{tip}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isCompact ? '22px 14px 28px' : '32px clamp(20px, 4vw, 44px)',
        }}
      >
        <form
          onSubmit={handleSubmit}
          aria-label="Đăng nhập hệ thống giải võ cổ truyền"
          style={{
            width: '100%',
            maxWidth: 520,
            borderRadius: 24,
            border: '1px solid rgba(15, 23, 42, 0.12)',
            background: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 30px 70px rgba(15, 23, 42, 0.12)',
            padding: '28px 24px',
          }}
        >
          <VCT_Stack gap={16}>
            <div>
              <VCT_Text variant="h2" style={{ marginBottom: 2 }}>
                Đăng nhập tài khoản điều hành
              </VCT_Text>
              <VCT_Text variant="small" style={{ color: '#64748b' }}>
                Phiên bản backend: Go 1.26 API
              </VCT_Text>
            </div>

            <VCT_Field label="Tài khoản">
              <VCT_Input
                value={form.username}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  handleField('username', event.target.value)
                }
                autoFocus
                placeholder="admin / btc / referee..."
              />
            </VCT_Field>

            <VCT_Field label="Mật khẩu">
              <VCT_Input
                type="password"
                value={form.password}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  handleField('password', event.target.value)
                }
                placeholder="Nhập mật khẩu"
              />
            </VCT_Field>

            <VCT_Stack direction="row" gap={12} style={{ alignItems: 'end' }}>
              <VCT_Field label="Vai trò" style={{ flex: 1 }}>
                <VCT_Select
                  value={form.role}
                  options={ROLE_OPTIONS}
                  onChange={(value: UserRole) => handleField('role', value)}
                />
              </VCT_Field>
              <VCT_Field label="Ca điều hành" style={{ flex: 1 }}>
                <VCT_Select
                  value={form.operationShift}
                  options={SHIFT_OPTIONS}
                  onChange={(value: LoginInput['operationShift']) =>
                    handleField('operationShift', value)
                  }
                />
              </VCT_Field>
            </VCT_Stack>

            <VCT_Field label="Mã giải">
              <VCT_Input
                value={form.tournamentCode}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  handleField('tournamentCode', event.target.value)
                }
                placeholder="VCT-2026"
              />
            </VCT_Field>

            <div>
              <VCT_Text variant="small" style={{ opacity: 0.7, marginBottom: 6 }}>
                Tài khoản mẫu nhanh
              </VCT_Text>
              <VCT_Stack direction="row" gap={8} style={{ flexWrap: 'wrap' }}>
                {QUICK_ACCOUNTS.map((item) => (
                  <button
                    key={item.username}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        username: item.username,
                        password: item.password,
                        role: item.role,
                      }))
                    }
                    style={{
                      borderRadius: 999,
                      border: '1px solid rgba(15, 23, 42, 0.15)',
                      background: '#fff',
                      padding: '6px 10px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </VCT_Stack>
            </div>

            <VCT_Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              icon={<VCT_Icons.CheckCircle size={16} />}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            >
              Vào hệ thống điều hành
            </VCT_Button>
          </VCT_Stack>
        </form>
      </section>

      <VCT_Toast
        isVisible={toast.show}
        message={toast.msg}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </main>
  )
}
