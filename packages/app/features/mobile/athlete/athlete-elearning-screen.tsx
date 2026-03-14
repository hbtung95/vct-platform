import * as React from 'react'
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { Colors, SharedStyles, FontWeight, Radius, Space, Touch } from '../mobile-theme'
import { Badge, ScreenHeader, SearchBar, AnimatedCard, ProgressRing, EmptyState } from '../mobile-ui'
import { Icon, VCTIcons } from '../icons'
import { hapticLight } from '../haptics'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — Athlete E-Learning Screen
// Course categories, course cards with progress, video placeholder
// ═══════════════════════════════════════════════════════════════

const COURSE_CATEGORIES = [
  { key: 'quyen', label: 'Bài Quyền', icon: VCTIcons.fitness, color: Colors.accent, count: 12 },
  { key: 'kythuat', label: 'Kỹ Thuật', icon: VCTIcons.flash, color: Colors.gold, count: 8 },
  { key: 'luat', label: 'Luật Thi Đấu', icon: VCTIcons.document, color: Colors.green, count: 5 },
  { key: 'thedu', label: 'Thể Dục', icon: VCTIcons.flame, color: Colors.purple, count: 6 },
] as const

const FEATURED_COURSES = [
  {
    id: '1', title: 'Quyền Lão Mai', category: 'Bài Quyền',
    description: '18 bài — Lão Mai Quyền cơ bản đến nâng cao',
    progress: 45, color: Colors.accent, icon: VCTIcons.fitness,
    lessons: 18, completedLessons: 8,
  },
  {
    id: '2', title: 'Kỹ thuật đối kháng', category: 'Kỹ Thuật',
    description: 'Tấn công, phòng thủ, và phản đòn cơ bản',
    progress: 30, color: Colors.gold, icon: VCTIcons.flash,
    lessons: 12, completedLessons: 4,
  },
  {
    id: '3', title: 'Luật thi đấu VCT 2026', category: 'Luật Thi Đấu',
    description: 'Quy chế thi đấu mới nhất của Liên đoàn',
    progress: 80, color: Colors.green, icon: VCTIcons.document,
    lessons: 5, completedLessons: 4,
  },
  {
    id: '4', title: 'Ngũ Bộ Quyền', category: 'Bài Quyền',
    description: 'Bài quyền căn bản — 5 thế tay chân cơ bản',
    progress: 100, color: Colors.accent, icon: VCTIcons.fitness,
    lessons: 8, completedLessons: 8,
  },
]

export function AthleteElearningMobileScreen() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [refreshing, setRefreshing] = React.useState(false)

  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 800)
  }, [])

  const filteredCourses = React.useMemo(() => {
    if (!searchQuery) return FEATURED_COURSES
    const q = searchQuery.toLowerCase()
    return FEATURED_COURSES.filter(c => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q))
  }, [searchQuery])

  return (
    <ScrollView
      style={SharedStyles.page}
      contentContainerStyle={SharedStyles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
    >
      <ScreenHeader
        title="E-Learning"
        subtitle="Học bài quyền & kỹ thuật"
        icon={VCTIcons.book}
        onBack={() => router.back()}
      />

      <View style={{ marginBottom: Space.lg }}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Tìm bài quyền, kỹ thuật..."
        />
      </View>

      {/* CATEGORY GRID */}
      {!searchQuery && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: Space.lg }}>
        {COURSE_CATEGORIES.map(cat => (
          <Pressable
            key={cat.key}
            style={{
              width: '47%', flexGrow: 1,
              borderRadius: Radius.lg, padding: Space.lg,
              backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
              minHeight: 90,
            }}
            onPress={() => { hapticLight() }}
            accessibilityRole="button"
            accessibilityLabel={`${cat.label}: ${cat.count} khóa học`}
          >
            <View style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: Colors.overlay(cat.color, 0.1), justifyContent: 'center', alignItems: 'center',
              marginBottom: 8,
            }}>
              <Icon name={cat.icon} size={18} color={cat.color} />
            </View>
            <Text style={{ fontSize: 13, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>{cat.label}</Text>
            <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>{cat.count} khóa học</Text>
          </Pressable>
        ))}
        </View>
      )}

      {/* LEARNING PROGRESS */}
      {(!searchQuery || filteredCourses.some(c => c.progress > 0 && c.progress < 100)) && (
        <Text style={SharedStyles.sectionTitle}>Đang học</Text>
      )}
      {filteredCourses.filter(c => c.progress > 0 && c.progress < 100).map(course => (
        <AnimatedCard
          key={course.id}
          onPress={() => { router.push(`/course-detail?id=${course.id}`) }}
        >
          <View style={[SharedStyles.rowBetween, { marginBottom: 8 }]}>
            <View style={[SharedStyles.row, { gap: 10, flex: 1 }]}>
              <View style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: Colors.overlay(course.color, 0.1), justifyContent: 'center', alignItems: 'center',
              }}>
                <Icon name={course.icon} size={18} color={course.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>{course.title}</Text>
                <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>{course.category}</Text>
              </View>
            </View>
            <ProgressRing progress={course.progress} size={42} strokeWidth={4} color={course.color} />
          </View>
          <Text style={{ fontSize: 11, color: Colors.textSecondary, marginBottom: 8, lineHeight: 16 }}>{course.description}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name={VCTIcons.document} size={12} color={Colors.textMuted} />
            <Text style={{ fontSize: 10, fontWeight: FontWeight.bold, color: Colors.textSecondary }}>
              Đã học {course.completedLessons}/{course.lessons} bài
            </Text>
          </View>
        </AnimatedCard>
      ))}

      {/* COMPLETED COURSES */}
      {(!searchQuery || filteredCourses.some(c => c.progress >= 100)) && (
        <Text style={SharedStyles.sectionTitle}>Đã hoàn thành</Text>
      )}
      {filteredCourses.filter(c => c.progress >= 100).map(course => (
        <AnimatedCard key={course.id} style={{ borderColor: Colors.overlay(Colors.green, 0.2) }} onPress={() => { router.push(`/course-detail?id=${course.id}`) }}>
          <View style={[SharedStyles.row, { gap: 10 }]}>
            <View style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: Colors.overlay(Colors.green, 0.1), justifyContent: 'center', alignItems: 'center',
            }}>
              <Icon name={VCTIcons.checkmark} size={18} color={Colors.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>{course.title}</Text>
              <Text style={{ fontSize: 11, color: Colors.green, marginTop: 2, fontWeight: FontWeight.bold }}>✓ Hoàn thành · {course.lessons} bài</Text>
            </View>
          </View>
        </AnimatedCard>
      ))}

      {/* ALL COURSES */}
      {(!searchQuery || filteredCourses.some(c => c.progress === 0)) && (
        <Text style={SharedStyles.sectionTitle}>Khóa học mới</Text>
      )}
      {filteredCourses.filter(c => c.progress === 0).length === 0 && !searchQuery && (
        <EmptyState icon={VCTIcons.book} title="Bạn đã bắt đầu tất cả khóa học!" message="Tiếp tục hoàn thành các khóa đang dở để nâng cao kỹ năng." />
      )}
      {filteredCourses.filter(c => c.progress === 0).map(course => (
        <AnimatedCard
          key={course.id}
          onPress={() => { router.push(`/course-detail?id=${course.id}`) }}
        >
          <View style={[SharedStyles.rowBetween, { marginBottom: 8 }]}>
            <View style={[SharedStyles.row, { gap: 10, flex: 1 }]}>
              <View style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: Colors.overlay(course.color, 0.1), justifyContent: 'center', alignItems: 'center',
              }}>
                <Icon name={course.icon} size={18} color={course.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: FontWeight.extrabold, color: Colors.textPrimary }}>{course.title}</Text>
                <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>{course.category}</Text>
              </View>
            </View>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.overlay(Colors.accent, 0.1), justifyContent: 'center', alignItems: 'center' }}>
              <Icon name={VCTIcons.forward} size={14} color={Colors.accent} />
            </View>
          </View>
          <Text style={{ fontSize: 11, color: Colors.textSecondary, marginBottom: 8, lineHeight: 16 }}>{course.description}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name={VCTIcons.document} size={12} color={Colors.textMuted} />
            <Text style={{ fontSize: 10, fontWeight: FontWeight.bold, color: Colors.textSecondary }}>
              {course.lessons} bài học
            </Text>
          </View>
        </AnimatedCard>
      ))}

      {searchQuery && filteredCourses.length === 0 && (
        <EmptyState icon={VCTIcons.search} title="Không tìm thấy kết quả" message={`Không có khóa học nào khớp với '${searchQuery}'`} />
      )}

      {/* Info */}
      <View style={{
        borderRadius: Radius.md, padding: Space.md, marginTop: Space.sm,
        backgroundColor: Colors.overlay(Colors.accent, 0.06),
        borderWidth: 1, borderColor: Colors.overlay(Colors.accent, 0.12),
        flexDirection: 'row', gap: 8,
      }}>
        <Icon name={VCTIcons.info} size={16} color={Colors.accent} style={{ marginTop: 1 }} />
        <Text style={{ fontSize: 11, color: Colors.textSecondary, lineHeight: 16, flex: 1 }}>
          Nội dung E-Learning đang được cập nhật thêm. Video bài quyền và kỹ thuật sẽ có trong phiên bản tiếp theo.
        </Text>
      </View>
    </ScrollView>
  )
}
