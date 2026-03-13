import * as React from 'react'
import { useState, useCallback } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useAuth } from '../auth/AuthProvider'
import { Colors, FontWeight, Radius, Space } from './mobile-theme'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Mobile Login Screen
// Premium login with VCT branding, proper loading state
// ═══════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDark },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Space.xxl },

  heroWrap: { alignItems: 'center', marginBottom: 40 },
  logoCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.overlay(Colors.accent, 0.15), justifyContent: 'center', alignItems: 'center',
    marginBottom: 20, borderWidth: 2, borderColor: Colors.overlay(Colors.accent, 0.3),
  },
  logoText: { fontSize: 42 },
  brandText: { fontSize: 28, fontWeight: FontWeight.black, color: Colors.textWhite, letterSpacing: 1, marginBottom: 4 },
  brandSub: { fontSize: 13, color: Colors.textMuted, fontWeight: FontWeight.semibold },

  formCard: {
    borderRadius: Radius.xl, padding: Space.xxl,
    backgroundColor: '#1e293b', borderWidth: 1, borderColor: Colors.borderLight,
  },
  label: { fontSize: 12, fontWeight: FontWeight.extrabold, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.bgInput, borderRadius: Radius.md, borderWidth: 1, borderColor: '#475569',
    paddingHorizontal: 14, marginBottom: 18,
  },
  inputIcon: { fontSize: 16 },
  input: { flex: 1, height: 48, color: Colors.textWhite, fontSize: 15, fontWeight: FontWeight.semibold },

  loginBtn: {
    borderRadius: Radius.md, height: 52, justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.accent, marginTop: 6,
    shadowColor: Colors.accent, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4,
  },
  loginBtnDisabled: { opacity: 0.5 },
  loginBtnText: { fontSize: 16, fontWeight: FontWeight.black, color: '#fff', letterSpacing: 0.5 },

  errorBox: {
    backgroundColor: Colors.overlay(Colors.red, 0.12), borderRadius: Radius.md, padding: Space.md,
    marginBottom: Space.lg, borderWidth: 1, borderColor: Colors.overlay(Colors.red, 0.2),
  },
  errorText: { color: Colors.red, fontSize: 12, fontWeight: FontWeight.bold, textAlign: 'center' },

  demoHint: {
    marginTop: Space.xxl, padding: Space.lg, borderRadius: Radius.md,
    backgroundColor: Colors.overlay(Colors.gold, 0.08), borderWidth: 1, borderColor: Colors.overlay(Colors.gold, 0.15),
  },
  demoTitle: { color: Colors.gold, fontSize: 11, fontWeight: FontWeight.extrabold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  demoText: { color: Colors.textMuted, fontSize: 12, lineHeight: 18 },
  demoCode: { color: '#e2e8f0', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontWeight: FontWeight.bold },

  footer: { alignItems: 'center', marginTop: Space.xxxl, paddingBottom: Space.lg },
  footerText: { color: '#475569', fontSize: 11, fontWeight: FontWeight.semibold },
})

export function LoginMobileScreen() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = username.trim().length > 0 && password.trim().length > 0 && !isSubmitting

  const handleLogin = useCallback(async () => {
    if (!canSubmit) return
    setError('')
    setIsSubmitting(true)
    try {
      await login({ username: username.trim(), password: password.trim() })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng nhập thất bại'
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }, [canSubmit, login, username, password])

  const handleDemoSkip = useCallback(() => {
    setIsSubmitting(true)
    login({ username: 'demo', password: 'demo' })
      .catch(() => setError('Không thể khởi tạo chế độ demo'))
      .finally(() => setIsSubmitting(false))
  }, [login])

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* HERO */}
        <View style={styles.heroWrap}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>🥋</Text>
          </View>
          <Text style={styles.brandText}>VCT PLATFORM</Text>
          <Text style={styles.brandSub}>Nền tảng Võ Cổ Truyền Việt Nam</Text>
        </View>

        {/* FORM */}
        <View style={styles.formCard}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Tên đăng nhập</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên đăng nhập"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={setUsername}
              editable={!isSubmitting}
            />
          </View>

          <Text style={styles.label}>Mật khẩu</Text>
          <View style={styles.inputWrap}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu"
              placeholderTextColor="#64748b"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!isSubmitting}
              onSubmitEditing={handleLogin}
            />
          </View>

          <Pressable
            style={[styles.loginBtn, !canSubmit && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={!canSubmit}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>ĐĂNG NHẬP</Text>
            )}
          </Pressable>
        </View>

        {/* DEMO */}
        <View style={styles.demoHint}>
          <Text style={styles.demoTitle}>💡 Tài khoản demo</Text>
          <Text style={styles.demoText}>
            Bạn có thể bỏ qua đăng nhập để dùng chế độ demo.{'\n'}
            Hoặc đăng nhập với: <Text style={styles.demoCode}>admin / admin123</Text>
          </Text>
        </View>

        <Pressable
          style={{ marginTop: 16, alignItems: 'center', padding: 14, opacity: isSubmitting ? 0.5 : 1 }}
          onPress={handleDemoSkip}
          disabled={isSubmitting}
        >
          <Text style={{ color: Colors.accent, fontWeight: FontWeight.extrabold, fontSize: 14 }}>
            Bỏ qua → Dùng chế độ Demo
          </Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 VCT Platform v1.0</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
