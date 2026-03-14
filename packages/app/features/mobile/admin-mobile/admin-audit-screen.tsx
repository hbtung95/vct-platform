import * as React from 'react'
import { StyleSheet, Text, View, RefreshControl, ScrollView } from 'react-native'
import { Colors, FontWeight, Radius, Space, SharedStyles } from '../mobile-theme'
import { Icon, VCTIcons } from '../icons'
import { ScreenSkeleton } from '../mobile-ui'
import { hapticLight } from '../haptics'
import { useAdminAudit } from './useAdminData'

const s = StyleSheet.create({
  card: { padding: Space.md, borderRadius: Radius.lg, backgroundColor: Colors.bgCard, marginBottom: Space.sm, borderWidth: 1, borderColor: Colors.border },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  action: { fontSize: 13, fontWeight: FontWeight.bold, color: Colors.textWhite },
  time: { fontSize: 11, color: Colors.textMuted },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  detailText: { fontSize: 12, color: Colors.textSecondary, marginLeft: 4 },
  statusIcon: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
})

export function AdminAuditMobileScreen() {
  const { data: audit, isLoading, refetch } = useAdminAudit()
  const [refreshing, setRefreshing] = React.useState(false)

  const onRefresh = React.useCallback(async () => { setRefreshing(true); hapticLight(); await refetch(); setRefreshing(false) }, [refetch])

  if (isLoading && !refreshing) return <ScreenSkeleton />

  return (
    <ScrollView style={SharedStyles.page} contentContainerStyle={{ padding: Space.xl, paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
    >
      <Text style={[SharedStyles.sectionTitle, { marginBottom: 16 }]}>Nhật ký Hệ thống ({audit.length})</Text>

      {audit.map(entry => (
        <View key={entry.id} style={s.card}>
          <View style={s.headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[s.statusIcon, { backgroundColor: entry.success ? Colors.green : Colors.red }]} />
              <Text style={s.action}>{entry.action}</Text>
            </View>
            <Text style={s.time}>{entry.time.slice(11, 19)}</Text>
          </View>
          <View style={s.detailRow}>
            <Icon name={VCTIcons.person} size={12} color={Colors.textMuted} />
            <Text style={s.detailText}>{entry.username}{entry.role ? ` (${entry.role})` : ''}</Text>
          </View>
          <View style={s.detailRow}>
            <Icon name={VCTIcons.globe} size={12} color={Colors.textMuted} />
            <Text style={s.detailText}>IP: {entry.ip}</Text>
          </View>
          <View style={s.detailRow}>
            <Icon name={VCTIcons.info} size={12} color={Colors.textMuted} />
            <Text style={s.detailText}>{entry.details}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  )
}
