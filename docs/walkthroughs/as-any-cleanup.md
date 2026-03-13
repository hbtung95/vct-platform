# `as any` Cleanup — Complete ✅

## Result: **0 instances remaining** in `packages/app/features/`

### Files Modified (32+)

| Module | Files | Count |
|--------|-------|-------|
| Auth | `AuthProvider.tsx` | 2 |
| Components | `vct-ui.tsx`, `VCT_Table.tsx` | 5 |
| Layout | `sidebar-data.tsx` | 1 |
| Tournament (7) | `Page_teams`, `Page_san_dau`, `Page_combat`, `Page_medals`, `Page_giai_dau`, `Page_registration`, `Page_athletes` | 29 |
| Training (5) | `Page_curriculum`, `Page_training_plans`, `Page_techniques`, `Page_belt_exams`, `Page_attendance` | 16 |
| Clubs | `Page_clubs.tsx` | 4 |
| Organizations | `Page_organizations.tsx` | 3 |
| Calendar | `Page_calendar.tsx` | 2 |
| People | `Page_people.tsx` | 1 |
| Provincial | `Page_provincial_vo_sinh.tsx` | 1 |
| Federation (6) | `personnel`, `provinces`, `pr`, `international`, `workflow_config`, `finance` | 18 |
| Athletes (2) | `Page_athlete_portal`, `Page_athlete_tournaments` | 6 |
| Admin | `Page_admin_feature_flags.tsx` | 1 |
| Cert Verification | `Page_cert_verification.tsx` | 1 |
| PWA | `offline-support.tsx` | 2 |
| Public | `Page_scoreboard.tsx` | 1 |
| Mobile | `profile-screen.tsx` | 1 |

### Patterns Applied

- **Status casts**: `as any` → `as Type['status']` (e.g., `Club['status']`, `CalendarEvent['type']`)
- **CSS textAlign**: `as any` → `as React.CSSProperties['textAlign']`
- **Dynamic property access**: `(obj as any)[key]` → `(obj as unknown as Record<string, React.ReactNode>)[key]`
- **Badge types**: `as any` → `as 'info' | 'success' | 'warning' | 'danger'`
- **Error handling**: `catch (err: any)` → `catch (err: unknown)` + `instanceof Error`
- **API items extraction**: `'items' in (data as any)` → `typeof data === 'object' && 'items' in data`
- **Service Worker APIs**: `as any` → typed interfaces for `sync.register` and `BufferSource`

### Verification

```
grep -r "as any" packages/app/features/ --include="*.tsx" --include="*.ts" -l
# Result: No files found ✅
```
