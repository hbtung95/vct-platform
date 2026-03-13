# CI/CD Fix Walkthrough

## Commits Pushed

| Commit | Description |
|--------|-------------|
| `8b2eda0` | ESLint v10 config fix, lint script updates, CI Go cache fix |
| `7c217f9` | TypeScript `noUncheckedIndexedAccess` fixes across 5 files |

## Fixes Applied

### 1. ESLint v10 Flat Config (`eslint.config.mjs`)
- **Problem**: `FlatCompat.extends('next')` caused circular JSON error with ESLint v10
- **Fix**: Rewrote config to use `@typescript-eslint` + `react-hooks` plugins directly
- Next.js linting now handled by `next lint` in the workspace

### 2. Lint Script (`package.json`)
- **Problem**: `--ext .ts,.tsx` flag removed in ESLint v9+
- **Fix**: Updated to glob pattern `'packages/app/**/*.{ts,tsx}'`

### 3. Inline ESLint Directives (3 files)
- Replaced `@next/next/no-img-element` directives in shared components:
  - `VCT_Avatar.tsx`, `VCT_FileUpload.tsx`, `VCT_ImageGallery.tsx`

### 4. TypeScript Fixes (5 files)
- **Problem**: `split('T')[0]` returns `string | undefined` with `noUncheckedIndexedAccess`
- **Fix**: Added `!` non-null assertions (safe because ISO strings always contain 'T')
- Files: `Page_curriculum.tsx`, `Page_teams.tsx`, `Page_noi_dung.tsx`, `Page_parent_dashboard.tsx`, `Page_clubs.tsx`

### 5. CI Workflow (`.github/workflows/ci.yml`)
- Added `cache-dependency-path: backend/go.sum` to both `setup-go` steps

## Local Verification
- `tsc --noEmit` → **exit code 0** (0 errors)
- `npx eslint packages/app/**/*.{ts,tsx} --quiet` → **0 errors**
- Vercel deployment → **LIVE** at [vct-platform-next.vercel.app](https://vct-platform-next.vercel.app)
