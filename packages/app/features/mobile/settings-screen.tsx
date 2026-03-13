import * as React from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useAuth } from '../auth/AuthProvider'
import { USER_ROLE_OPTIONS } from '../auth/types'
import { Colors, FontWeight, Radius, Space, SharedStyles } from './mobile-theme'
import { showComingSoon } from './mobile-ui'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Mobile Settings Screen
// Account info, app settings, logout — uses design system
// Placeholder rows now show "coming soon" feedback (fixes issue #6)
// ═══════════════════════════════════════════════════════════════

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bgBase },
  scroll: { padding: Space.lg, paddingBottom: 40 },

  userCard: {
    borderRadius: Radius.xl, padding: Space.xxl, marginBottom: 20,
    backgroundColor: Colors.bgDark,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 3,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.overlay(Colors.accent, 0.2), justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: Colors.overlay(Colors.accent, 0.3),
  },
  avatarEmoji: { fontSize: 28 },
  userName: { fontSize: 18, fontWeight: FontWeight.black, color: Colors.textWhite },
  userEmail: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  userRole: {
    marginTop: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill,
    backgroundColor: Colors.overlay(Colors.accent, 0.15), alignSelf: 'flex-start',
  },
  userRoleText: { fontSize: 10, fontWeight: FontWeight.extrabold, color: '#60a5fa' },

  sectionTitle: { fontSize: 12, fontWeight: FontWeight.extrabold, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 8 },
  sectionCard: {
    borderRadius: Radius.lg, overflow: 'hidden', marginBottom: Space.lg,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
  },

  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIcon: { fontSize: 18, width: 28, textAlign: 'center' },
  rowLabel: { fontSize: 14, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  rowValue: { fontSize: 13, color: Colors.textSecondary, fontWeight: FontWeight.semibold },
  rowArrow: { fontSize: 14, color: '#cbd5e1' },

  logoutBtn: {
    borderRadius: Radius.lg, padding: 16, marginTop: 8, marginBottom: 16,
    backgroundColor: Colors.overlay(Colors.red, 0.06), borderWidth: 1, borderColor: Colors.overlay(Colors.red, 0.15),
    alignItems: 'center',
  },
  logoutText: { fontSize: 15, fontWeight: FontWeight.extrabold, color: Colors.red },

  footer: { alignItems: 'center', paddingVertical: 16 },
  footerText: { fontSize: 11, color: Colors.textMuted, marginBottom: 2 },
})

interface SettingRowProps {
  icon: string; label: string; value?: string
  showArrow?: boolean; onPress?: () => void; isLast?: boolean
}

function SettingRow({ icon, label, value, showArrow = true, onPress, isLast }: SettingRowProps) {
  return (
    <Pressable
      style={[s.row, !isLast && s.rowBorder]}
      onPress={onPress ?? (() => showComingSoon(label))}
      android_ripple={{ color: 'rgba(0,0,0,0.04)' }}
    >
      <View style={s.rowLeft}>
        <Text style={s.rowIcon}>{icon}</Text>
        <Text style={s.rowLabel}>{label}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {value ? <Text style={s.rowValue}>{value}</Text> : null}
        {showArrow ? <Text style={s.rowArrow}>›</Text> : null}
      </View>
    </Pressable>
  )
}

export function SettingsMobileScreen() {
  const { currentUser, logout, setRole } = useAuth()

  const roleLabel = USER_ROLE_OPTIONS.find(r => r.value === currentUser.role)?.label ?? currentUser.role

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất khỏi ứng dụng?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: () => logout() },
    ])
  }

  const handleRoleSwitch = () => {
    Alert.alert('Chọn vai trò', 'Chuyển đổi vai trò để xem module tương ứng', [
      ...USER_ROLE_OPTIONS.map(r => ({
        text: `${r.value === currentUser.role ? '✓ ' : ''}${r.label}`,
        onPress: () => setRole(r.value),
      })),
      { text: 'Hủy', style: 'cancel' as const },
    ])
  }

  return (
    <ScrollView style={s.page} contentContainerStyle={s.scroll}>
      {/* USER CARD */}
      <View style={s.userCard}>
        <View style={s.avatarRow}>
          <View style={s.avatar}>
            <Text style={s.avatarEmoji}>🥋</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.userName}>{currentUser.name || 'VĐV Demo'}</Text>
            <Text style={s.userEmail}>{currentUser.email || 'demo@vctplatform.vn'}</Text>
            <View style={s.userRole}>
              <Text style={s.userRoleText}>{roleLabel}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ACCOUNT */}
      <Text style={s.sectionTitle}>Tài khoản</Text>
      <View style={s.sectionCard}>
        <SettingRow icon="👤" label="Hồ sơ cá nhân" />
        <SettingRow icon="🔄" label="Chuyển vai trò" value={roleLabel} onPress={handleRoleSwitch} />
        <SettingRow icon="🔐" label="Đổi mật khẩu" />
        <SettingRow icon="📱" label="Thiết bị đăng nhập" value="1 thiết bị" isLast />
      </View>

      {/* APP SETTINGS */}
      <Text style={s.sectionTitle}>Ứng dụng</Text>
      <View style={s.sectionCard}>
        <SettingRow icon="🌐" label="Ngôn ngữ" value="Tiếng Việt" />
        <SettingRow icon="🔔" label="Thông báo" value="Bật" />
        <SettingRow icon="🌙" label="Chế độ tối" value="Tắt" />
        <SettingRow icon="📊" label="Sử dụng dữ liệu" value="Wi-Fi" isLast />
      </View>

      {/* ABOUT */}
      <Text style={s.sectionTitle}>Thông tin</Text>
      <View style={s.sectionCard}>
        <SettingRow icon="ℹ️" label="Giới thiệu VCT" />
        <SettingRow icon="📋" label="Điều khoản sử dụng" />
        <SettingRow icon="🛡️" label="Chính sách bảo mật" />
        <SettingRow icon="📞" label="Liên hệ hỗ trợ" />
        <SettingRow icon="⭐" label="Đánh giá ứng dụng" />
        <SettingRow icon="📦" label="Phiên bản" value="1.0.0" showArrow={false} isLast />
      </View>

      <Pressable style={s.logoutBtn} onPress={handleLogout}>
        <Text style={s.logoutText}>🚪 Đăng xuất</Text>
      </Pressable>

      <View style={s.footer}>
        <Text style={s.footerText}>VCT Platform © 2025</Text>
        <Text style={s.footerText}>Võ Cổ Truyền Việt Nam</Text>
      </View>
    </ScrollView>
  )
}
