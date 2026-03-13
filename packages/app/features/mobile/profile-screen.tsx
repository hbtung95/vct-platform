import * as React from 'react'
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native'
import { useRouter } from 'solito/navigation'
import { useAuth } from '../auth/AuthProvider'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Mobile Profile Screen
// Athlete profile view with stats, belt info, and quick actions
// ═══════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: '#f8fafc' },
    content: { padding: 16, paddingBottom: 40 },

    // Hero card
    heroCard: {
        borderRadius: 20, padding: 24, marginBottom: 16,
        backgroundColor: '#0f172a',
        shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
    },
    avatarCircle: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: 'rgba(59, 130, 246, 0.2)', justifyContent: 'center', alignItems: 'center',
        marginBottom: 12, borderWidth: 2, borderColor: 'rgba(59, 130, 246, 0.4)',
    },
    avatarEmoji: { fontSize: 32 },
    heroName: { fontSize: 22, fontWeight: '900', color: '#ffffff', marginBottom: 4 },
    heroRole: { fontSize: 13, color: '#94a3b8', fontWeight: '600' },
    heroBadge: {
        marginTop: 8, flexDirection: 'row', gap: 8,
    },
    badge: {
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
    },
    badgeText: { fontSize: 11, fontWeight: '800', color: '#f59e0b' },

    // Stats row
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    statBox: {
        flex: 1, borderRadius: 16, padding: 14,
        backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0',
    },
    statValue: { fontSize: 22, fontWeight: '900', color: '#0f172a', marginBottom: 2 },
    statLabel: { fontSize: 10, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },

    // Section
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
    card: {
        borderRadius: 16, padding: 16, marginBottom: 12,
        backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0',
    },

    // Action buttons
    actionRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    actionBtn: {
        flex: 1, borderRadius: 14, padding: 14, alignItems: 'center',
        backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0',
    },
    actionIcon: { fontSize: 22, marginBottom: 6 },
    actionLabel: { fontSize: 11, fontWeight: '700', color: '#334155' },

    // Skill bar
    skillRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    skillLabel: { width: 64, fontSize: 11, fontWeight: '600', color: '#64748b', textAlign: 'right' },
    skillTrack: { flex: 1, height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
    skillFill: { height: '100%', borderRadius: 4 },
    skillValue: { width: 28, fontSize: 11, fontWeight: '800', textAlign: 'right' },
})

const SKILLS = [
    { label: 'Kỹ thuật', value: 78, color: '#3b82f6' },
    { label: 'Thể lực', value: 65, color: '#22c55e' },
    { label: 'Tốc độ', value: 72, color: '#f59e0b' },
    { label: 'Sức mạnh', value: 58, color: '#ef4444' },
    { label: 'Phản xạ', value: 82, color: '#8b5cf6' },
    { label: 'Tinh thần', value: 88, color: '#06b6d4' },
]

export function ProfileMobileScreen() {
    const { currentUser } = useAuth()
    const router = useRouter()

    return (
        <ScrollView style={styles.page} contentContainerStyle={styles.content}>
            {/* HERO */}
            <View style={styles.heroCard}>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarEmoji}>🥋</Text>
                </View>
                <Text style={styles.heroName}>{(currentUser as unknown as Record<string, string>).displayName || 'VĐV Demo'}</Text>
                <Text style={styles.heroRole}>Vận động viên · {currentUser.role}</Text>
                <View style={styles.heroBadge}>
                    <View style={styles.badge}><Text style={styles.badgeText}>🥋 Lam đai 2</Text></View>
                    <View style={[styles.badge, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                        <Text style={[styles.badgeText, { color: '#3b82f6' }]}>Elo: 1450</Text>
                    </View>
                </View>
            </View>

            {/* STATS */}
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>12</Text>
                    <Text style={styles.statLabel}>Giải đấu</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={[styles.statValue, { color: '#f59e0b' }]}>5</Text>
                    <Text style={styles.statLabel}>Huy chương</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={[styles.statValue, { color: '#22c55e' }]}>87%</Text>
                    <Text style={styles.statLabel}>Tỷ lệ tập</Text>
                </View>
            </View>

            {/* QUICK ACTIONS */}
            <View style={styles.actionRow}>
                <Pressable style={styles.actionBtn} onPress={() => router.push('/athlete-portal')}>
                    <Text style={styles.actionIcon}>🏠</Text>
                    <Text style={styles.actionLabel}>Cổng VĐV</Text>
                </Pressable>
                <Pressable style={styles.actionBtn} onPress={() => router.push('/athlete-training')}>
                    <Text style={styles.actionIcon}>📋</Text>
                    <Text style={styles.actionLabel}>Lịch tập</Text>
                </Pressable>
                <Pressable style={styles.actionBtn} onPress={() => router.push('/athlete-results')}>
                    <Text style={styles.actionIcon}>🏆</Text>
                    <Text style={styles.actionLabel}>Thành tích</Text>
                </Pressable>
                <Pressable style={styles.actionBtn} onPress={() => router.push('/athlete-rankings')}>
                    <Text style={styles.actionIcon}>📊</Text>
                    <Text style={styles.actionLabel}>Xếp hạng</Text>
                </Pressable>
            </View>

            {/* SKILL RADAR */}
            <Text style={styles.sectionTitle}>Chỉ số kỹ năng</Text>
            <View style={styles.card}>
                {SKILLS.map(s => (
                    <View key={s.label} style={styles.skillRow}>
                        <Text style={styles.skillLabel}>{s.label}</Text>
                        <View style={styles.skillTrack}>
                            <View style={[styles.skillFill, { width: `${s.value}%`, backgroundColor: s.color }]} />
                        </View>
                        <Text style={[styles.skillValue, { color: s.color }]}>{s.value}</Text>
                    </View>
                ))}
            </View>

            {/* COMPETITION HISTORY */}
            <Text style={styles.sectionTitle}>Lịch sử thi đấu gần đây</Text>
            {[
                { name: 'VĐ Toàn Quốc 2025', result: '🥇 HCV', date: '15/08/2025', category: 'ĐK Nam 60kg' },
                { name: 'Giải Trẻ TP.HCM 2025', result: '🥈 HCB', date: '20/06/2025', category: 'ĐK Nam 60kg' },
                { name: 'Cúp CLB 2025', result: '🥉 HCĐ', date: '10/04/2025', category: 'ĐK Nam 60kg' },
            ].map((c, i) => (
                <View key={i} style={styles.card}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: '#0f172a' }}>{c.name}</Text>
                        <Text style={{ fontSize: 13, fontWeight: '700' }}>{c.result}</Text>
                    </View>
                    <Text style={{ fontSize: 11, color: '#64748b' }}>{c.category} · {c.date}</Text>
                </View>
            ))}
        </ScrollView>
    )
}
