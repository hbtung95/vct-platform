// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Edit Profile Screen
// Full profile editor: avatar, personal info, belt, contact,
// social links. Form validation with live preview.
// ═══════════════════════════════════════════════════════════════

import React, { useState, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { useVCTTheme } from '../../theme-provider'
import { VctButton, VctTextInput, VctCard, VctBadge } from '../../core-ui'
import { useQuery, useMutation } from '../../data-hooks'
import { triggerHaptic } from '../../haptic-feedback'
import { useToast } from '../../toast-notification'
import { SkeletonLoader } from '../../skeleton-loader'
import { MobileScreenCenteredState, MobileScreenShell } from '../../screen-shell'

// ── Types ────────────────────────────────────────────────────

interface EditProfileScreenProps {
  onGoBack?: () => void
  onSaveSuccess?: () => void
}

interface ProfileFormData {
  fullName: string
  phone: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  address: string
  bio: string
  emergencyContact: string
  emergencyPhone: string
}

// ── Gender Options ───────────────────────────────────────────

const GENDER_OPTIONS: { key: ProfileFormData['gender']; label: string }[] = [
  { key: 'male', label: 'Nam' },
  { key: 'female', label: 'Nữ' },
  { key: 'other', label: 'Khác' },
]

// ── Component ────────────────────────────────────────────────

export function ScreenEditProfile({ onGoBack, onSaveSuccess }: EditProfileScreenProps) {
  const { theme } = useVCTTheme()
  const toast = useToast()

  const { data: profile, isLoading } = useQuery<ProfileFormData & { email: string; belt?: string }>('/api/v1/users/me', {
    cacheKey: 'user-profile-edit',
    staleTime: 60_000,
  })

  const [form, setForm] = useState<ProfileFormData>({
    fullName: '', phone: '', dateOfBirth: '', gender: 'male',
    address: '', bio: '', emergencyContact: '', emergencyPhone: '',
  })

  // Sync from API
  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName ?? '',
        phone: profile.phone ?? '',
        dateOfBirth: profile.dateOfBirth ?? '',
        gender: profile.gender ?? 'male',
        address: profile.address ?? '',
        bio: profile.bio ?? '',
        emergencyContact: profile.emergencyContact ?? '',
        emergencyPhone: profile.emergencyPhone ?? '',
      })
    }
  }, [profile])

  const { mutate: saveProfile, isLoading: saving } = useMutation('/api/v1/users/me', 'PUT')

  const updateField = useCallback((field: keyof ProfileFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleSave = useCallback(() => {
    if (!form.fullName.trim()) {
      toast.show({ type: 'error', title: 'Vui lòng nhập họ tên' })
      return
    }
    Alert.alert('Xác nhận', 'Lưu thay đổi hồ sơ?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Lưu',
        onPress: async () => {
          try {
            await saveProfile(form)
            triggerHaptic('success')
            toast.show({ type: 'success', title: 'Đã lưu hồ sơ' })
            onSaveSuccess?.()
          } catch (error) {
            triggerHaptic('error')
            toast.show({
              type: 'error',
              title: 'Không thể lưu hồ sơ',
              message: error instanceof Error ? error.message : 'Vui lòng thử lại.',
            })
          }
        },
      },
    ])
  }, [form, onSaveSuccess, saveProfile, toast])

  if (isLoading) {
    return (
      <MobileScreenCenteredState backgroundColor={theme.colors.background}>
        <View style={styles.skeletons}>
          <SkeletonLoader width={100} height={100} borderRadius={50} />
          <SkeletonLoader width={300} height={40} borderRadius={10} />
          <SkeletonLoader width={300} height={40} borderRadius={10} />
          <SkeletonLoader width={300} height={40} borderRadius={10} />
        </View>
      </MobileScreenCenteredState>
    )
  }

  return (
    <MobileScreenShell
      backLabel="Hủy"
      backgroundColor={theme.colors.background}
      onGoBack={onGoBack}
      title="Chỉnh sửa hồ sơ"
    >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.surface }]}>
            <Text style={styles.avatarEmoji}>📸</Text>
          </View>
          <TouchableOpacity onPress={() => triggerHaptic('light')}>
            <Text style={[styles.changePhoto, { color: theme.colors.primary }]}>Đổi ảnh đại diện</Text>
          </TouchableOpacity>
        </View>

        {/* Email (read-only) */}
        {profile?.email && (
          <VctCard style={styles.readOnlyCard}>
            <Text style={[styles.roLabel, { color: theme.colors.textSecondary }]}>Email</Text>
            <View style={styles.roRow}>
              <Text style={[styles.roValue, { color: theme.colors.text }]}>{profile.email}</Text>
              <VctBadge label="Không thể sửa" variant="primary" />
            </View>
          </VctCard>
        )}

        {/* Form Fields */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>THÔNG TIN CÁ NHÂN</Text>

          <VctTextInput
            label="Họ và tên *"
            value={form.fullName}
            onChangeText={(v) => updateField('fullName', v)}
            placeholder="Nguyễn Văn A"
          />

          <VctTextInput
            label="Số điện thoại"
            value={form.phone}
            onChangeText={(v) => updateField('phone', v)}
            placeholder="0901234567"
            keyboardType="phone-pad"
          />

          <VctTextInput
            label="Ngày sinh"
            value={form.dateOfBirth}
            onChangeText={(v) => updateField('dateOfBirth', v)}
            placeholder="DD/MM/YYYY"
          />

          {/* Gender Selector */}
          <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Giới tính</Text>
          <View style={styles.genderRow}>
            {GENDER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.genderOption,
                  {
                    backgroundColor: form.gender === opt.key ? theme.colors.primary : theme.colors.surface,
                    borderColor: form.gender === opt.key ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => { updateField('gender', opt.key); triggerHaptic('selection') }}
              >
                <Text style={[styles.genderLabel, { color: form.gender === opt.key ? '#FFF' : theme.colors.text }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <VctTextInput
            label="Địa chỉ"
            value={form.address}
            onChangeText={(v) => updateField('address', v)}
            placeholder="Thành phố, Quận/Huyện"
          />

          <VctTextInput
            label="Giới thiệu bản thân"
            value={form.bio}
            onChangeText={(v) => updateField('bio', v)}
            placeholder="Vài dòng về bạn..."
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Emergency Contact */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>LIÊN HỆ KHẨN CẤP</Text>
          <VctTextInput
            label="Người liên hệ"
            value={form.emergencyContact}
            onChangeText={(v) => updateField('emergencyContact', v)}
            placeholder="Tên người thân"
          />
          <VctTextInput
            label="SĐT liên hệ"
            value={form.emergencyPhone}
            onChangeText={(v) => updateField('emergencyPhone', v)}
            placeholder="0901234567"
            keyboardType="phone-pad"
          />
        </View>

        {/* Save Button */}
        <View style={styles.saveSection}>
          <VctButton title={saving ? 'Đang lưu...' : 'Lưu thay đổi'} onPress={handleSave} variant="primary" size="lg" disabled={saving} />
        </View>
    </MobileScreenShell>
  )
}

// ── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  skeletons: { alignItems: 'center', paddingTop: 100, gap: 16 },
  avatarSection: { alignItems: 'center', paddingVertical: 20 },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 36 },
  changePhoto: { fontSize: 14, fontWeight: '600', marginTop: 8 },
  readOnlyCard: { marginHorizontal: 24, padding: 14, marginBottom: 8 },
  roLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  roRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roValue: { fontSize: 15, fontWeight: '500' },
  section: { paddingHorizontal: 24, marginTop: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' },
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 14 },
  genderRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  genderOption: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  genderLabel: { fontSize: 14, fontWeight: '600' },
  saveSection: { paddingHorizontal: 24, marginTop: 32 },
})
