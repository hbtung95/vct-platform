import * as React from 'react'
import { StyleSheet, Text, View, RefreshControl, ScrollView } from 'react-native'
import { Colors, FontWeight, Radius, Space, SharedStyles } from '../mobile-theme'
import { Icon, VCTIcons } from '../icons'
import { SearchBar, ScreenSkeleton } from '../mobile-ui'
import { hapticLight } from '../haptics'
import { useAdminUsers } from './useAdminData'

const s = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', padding: Space.lg, borderRadius: Radius.lg, backgroundColor: Colors.bgCard, marginBottom: Space.sm, borderWidth: 1, borderColor: Colors.border },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: Space.md },
  content: { flex: 1 },
  name: { fontSize: 15, fontWeight: FontWeight.bold, color: Colors.textWhite, marginBottom: 2 },
  username: { fontSize: 12, color: Colors.textMuted, marginBottom: 4 },
  roleBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.sm, alignSelf: 'flex-start' },
  roleText: { fontSize: 10, fontWeight: FontWeight.bold },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  infoText: { fontSize: 11, color: Colors.textMuted, marginLeft: 4 },
})

const ROLE_COLORS: Record<string, string> = {
  admin: Colors.red,
  federation_president: Colors.purple,
  btc: Colors.accent,
  referee: Colors.gold,
  coach: Colors.green,
  athlete: Colors.textSecondary,
  technical_director: '#f59e0b',
}

export function AdminUsersMobileScreen() {
  const { data: users, isLoading, refetch } = useAdminUsers()
  const [refreshing, setRefreshing] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const onRefresh = React.useCallback(async () => { setRefreshing(true); hapticLight(); await refetch(); setRefreshing(false) }, [refetch])

  if (isLoading && !refreshing) return <ScreenSkeleton />

  const filtered = users.filter(u =>
    u.display_name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <ScrollView style={SharedStyles.page} contentContainerStyle={{ padding: Space.xl, paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
      keyboardShouldPersistTaps="handled"
    >
      <SearchBar value={search} onChangeText={setSearch} placeholder="Tìm user, vai trò..." />
      <Text style={[SharedStyles.sectionTitle, { marginBottom: 16, marginTop: Space.xl }]}>Người dùng ({filtered.length})</Text>

      {filtered.map(u => {
        const roleColor = ROLE_COLORS[u.role] || Colors.textMuted
        const statusColor = u.status === 'active' ? Colors.green : u.status === 'locked' ? Colors.red : Colors.textMuted
        return (
          <View key={u.id} style={s.card}>
            <View style={[s.avatar, { backgroundColor: Colors.overlay(roleColor, 0.1) }]}>
              <Icon name={VCTIcons.person} size={22} color={roleColor} />
            </View>
            <View style={s.content}>
              <Text style={s.name}>{u.display_name}</Text>
              <Text style={s.username}>@{u.username}</Text>
              <View style={[s.roleBadge, { backgroundColor: Colors.overlay(roleColor, 0.15) }]}>
                <Text style={[s.roleText, { color: roleColor }]}>{u.role}</Text>
              </View>
              <View style={s.infoRow}>
                <Icon name={VCTIcons.time} size={11} color={Colors.textMuted} />
                <Text style={s.infoText}>Login: {u.last_login.slice(0, 10)}</Text>
              </View>
            </View>
            <View style={[s.statusDot, { backgroundColor: statusColor }]} />
          </View>
        )
      })}
      {filtered.length === 0 && <Text style={{ color: Colors.textMuted, textAlign: 'center', marginTop: Space.xxl }}>Không tìm thấy</Text>}
    </ScrollView>
  )
}
