# Athlete Module Round 2 — Walkthrough

## What Was Built

### Backend (Go)

**Training Session System** — Full CRUD with real domain models:

- **Models**: `TrainingSession`, `SessionType` (regular/sparring/exam/special), `SessionStatus` (scheduled/completed/cancelled/absent), `AttendanceStats`
- **Service**: `TrainingService` with `CreateSession`, `GetSession`, `ListByAthlete`, `UpdateSession`, `DeleteSession`, `GetAttendanceStats`
- **Store**: `InMemTrainingStore` with seed data (9 sessions for demo athlete across a week)
- **HTTP Endpoints**:
  - `GET /api/v1/training-sessions?athleteId=` — List sessions
  - `POST /api/v1/training-sessions` — Create session
  - `GET/PATCH/DELETE /api/v1/training-sessions/:id` — Single session CRUD
  - `GET /api/v1/training-sessions/stats?athleteId=` — Attendance stats

**Files Modified:**
- [profile_service.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/domain/athlete/profile_service.go) — +150 lines (TrainingSession domain)
- [profile_store.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/domain/athlete/profile_store.go) — +133 lines (InMemTrainingStore)
- [athlete_profile_handler.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/httpapi/athlete_profile_handler.go) — +100 lines (HTTP handlers)
- [server.go](file:///d:/VCT%20PLATFORM/vct-platform/backend/internal/httpapi/server.go) — Wired `trainingSessionSvc`

---

### Shared Types (TypeScript)

Added to [athlete.ts](file:///d:/VCT%20PLATFORM/vct-platform/packages/shared-types/src/athlete.ts):

| Type | Purpose |
|------|---------|
| `TrainingSession` | Training session data |
| `AttendanceStats` | Attendance metrics |
| `ELearningCourse` | Course structure |
| `CourseModule` | Module within a course |
| `CourseCertificate` | Issued certificate |
| `MedalBreakdown` | Gold/Silver/Bronze counts |
| `ProfileUpdatePayload` | PATCH payload type |

---

### Frontend Pages

#### 🥋 [Training Page](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/athletes/Page_athlete_training.tsx)
- Attendance stats dashboard (total, attended, streak, absent)
- Interactive weekly schedule grid with day-by-day view
- Color-coded session types with status indicators
- Upcoming sessions detail cards
- Training type breakdown with progress bars

#### 📚 [E-Learning Page](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/athletes/Page_athlete_elearning.tsx)
- Course cards with category icons and progress bars
- Category filter tabs (Bài quyền, Kỹ thuật, Luật, Thể lực, Lý thuyết)
- Course detail view with module checklist (video/document/quiz)
- Earned certificates section with grades

#### 🏆 [Results Page](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/athletes/Page_athlete_results.tsx)
- Medal breakdown header (🥇🥈🥉) with Elo rating
- Year filter buttons for tournament history
- Enhanced entry cards with dates and organization details
- Summary stats (total tournaments, completed, clubs)

#### ✏️ [Profile Page](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/athletes/Page_athlete_profile.tsx)
- Inline edit mode for all personal fields (phone, email, address, province, ID)
- Controlled form state with save/cancel buttons
- PATCH API integration with success/error feedback
- Cancel resets form to original values

---

## Verification

| Check | Status |
|-------|--------|
| Go build (`go build ./...`) | ✅ Pass |
| Go tests (14 tests in athlete domain) | ✅ All pass |
| TypeScript lint errors | ✅ Fixed |
