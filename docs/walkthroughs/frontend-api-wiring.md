# Frontend API Wiring — Walkthrough

## Overview
Wired **13 frontend pages** from hardcoded mock data to real API hooks. Each page:
- Fetches data via typed React hooks (`useApiQuery`)
- Falls back to mock data when API returns empty or errors
- Shows loading indicators during fetch
- Computes KPI stats dynamically from live data

## Pages Wired

| Page | API Hook(s) | Module |
|------|-------------|--------|
| [Page_community.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/community/Page_community.tsx) | `useClubs`, `useCommunityEvents`, `useMembers` | Community |
| [Page_finance.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/finance/Page_finance.tsx) | `useTransactions` | Finance |
| [Page_heritage.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/heritage/Page_heritage.tsx) | `useBeltRanks`, `useLineageTree` | Heritage |
| [Page_rankings.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/rankings/Page_rankings.tsx) | `useAthleteRankings` | Rankings |
| [Page_curriculum.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/training/Page_curriculum.tsx) | `useCurriculums` | Training |
| [Page_training_plans.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/training/Page_training_plans.tsx) | `useTrainingPlans` | Training |
| [Page_attendance.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/training/Page_attendance.tsx) | `useAttendance` | Training |
| [Page_belt_exams.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/training/Page_belt_exams.tsx) | `useBeltExams` | Training |
| [Page_techniques.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/training/Page_techniques.tsx) | `useTechniques` | Training |
| [Page_elearning.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/training/Page_elearning.tsx) | `useELearningCourses` | Training |
| [Page_clubs.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/clubs/Page_clubs.tsx) | `useClubs` | Clubs |
| [Page_people.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/people/Page_people.tsx) | `useAthletes`, `useCoaches`, `useReferees` | People |
| [Page_calendar.tsx](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/calendar/Page_calendar.tsx) | `useCalendarEvents` | Calendar |

**Settings page** (`Page_settings.tsx`) — no API needed, purely local state.

## Type Fixes Applied

Extended type definitions in API hook files to support flexible backend responses:

- [usePeopleAPI.ts](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/hooks/usePeopleAPI.ts): Added `full_name`, `club_name`, `belt_rank`, `status`, `phone`, `federation` to `Athlete`, `Coach`, `Referee` interfaces
- [useCalendarAPI.ts](file:///d:/VCT%20PLATFORM/vct-platform/packages/app/features/hooks/useCalendarAPI.ts): Added `date`, `start_date`, `end_date`, `participants`, `seminar` type to `CalendarEvent`
- Fixed `Page_clubs.tsx` to use `useClubs()` from community API instead of `useClubDashboard()` which returns aggregate stats

## Pattern Used

```tsx
// 1. Import API hook
import { useTransactions } from '../hooks/useFinanceAPI'

// 2. Call hook with loading state
const { data: apiData, isLoading } = useTransactions()

// 3. Merge with fallback
const items = useMemo(() => {
    if (apiData && apiData.length > 0) return apiData.map(...)
    return FALLBACK_DATA
}, [apiData])

// 4. Show loading state
{isLoading && <div className="animate-pulse">Loading...</div>}
```
