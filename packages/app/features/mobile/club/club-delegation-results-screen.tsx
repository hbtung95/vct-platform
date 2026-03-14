import * as React from 'react'
import { StyleSheet, Text, View, RefreshControl, ScrollView } from 'react-native'
import { Colors, FontWeight, Radius, Space, SharedStyles } from '../mobile-theme'
import { Icon, VCTIcons } from '../icons'
import { hapticLight } from '../haptics'
import { useDelegationResults } from './useClubData'

// ═══════════════════════════════════════════════════════════════
// DELEGATION RESULTS SCREEN
// ═══════════════════════════════════════════════════════════════

const s = StyleSheet.create({
  card: {
    padding: Space.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgCard,
    marginBottom: Space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
  },
  medalBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBox: { flex: 1 },
  athleteName: { fontSize: 16, fontWeight: FontWeight.black, color: Colors.textWhite, marginBottom: 4 },
  categoryText: { fontSize: 13, color: Colors.textSecondary },
  rankText: { fontSize: 14, fontWeight: FontWeight.bold, alignSelf: 'center' },
})

const MEDAL_COLORS = {
  gold: { bg: Colors.overlay(Colors.gold, 0.2), fg: Colors.gold, label: 'HCV' },
  silver: { bg: Colors.overlay('#94a3b8', 0.2), fg: '#94a3b8', label: 'HCB' },
  bronze: { bg: Colors.overlay('#b45309', 0.2), fg: '#d97706', label: 'HCĐ' },
  none: { bg: Colors.bgBase, fg: Colors.textMuted, label: '' },
}

export function ClubDelegationResultsMobileScreen() {
  const { results, isLoading } = useDelegationResults()
  const [refreshing, setRefreshing] = React.useState(false)

  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
    hapticLight()
  }, [])

  if (isLoading && !refreshing) return <View style={SharedStyles.page} />

  // Sort: gold > silver > bronze > none
  const sorted = [...results].sort((a, b) => a.rank - b.rank)

  return (
    <ScrollView 
      style={SharedStyles.page} 
      contentContainerStyle={{ padding: Space.xl, paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
    >
      <Text style={[SharedStyles.sectionTitle, { marginBottom: 16 }]}>Thành tích cá nhân</Text>

      {sorted.map(res => {
        const medalCfg = MEDAL_COLORS[res.medal]
        
        return (
          <View key={res.id} style={s.card}>
            <View style={[s.medalBox, { backgroundColor: medalCfg.bg }]}>
              {res.medal !== 'none' ? (
                <Icon name={VCTIcons.star} size={24} color={medalCfg.fg} />
              ) : (
                <Text style={{ color: medalCfg.fg, fontWeight: FontWeight.bold }}>#{res.rank}</Text>
              )}
            </View>
            <View style={s.infoBox}>
              <Text style={s.athleteName}>{res.athleteName}</Text>
              <Text style={s.categoryText}>{res.category}</Text>
            </View>
            {res.medal !== 'none' && (
              <Text style={[s.rankText, { color: medalCfg.fg }]}>{medalCfg.label}</Text>
            )}
          </View>
        )
      })}
    </ScrollView>
  )
}
