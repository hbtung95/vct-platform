---
name: vct-mobile
description: "VCT Platform mobile app — Expo/React Native, EAS Build, offline-first architecture, CI/CD pipelines, performance optimization, and testing strategies."
---

# VCT Mobile — Expo/React Native Engineering

> Consolidated: mobile-lead + mobile-build + mobile-cicd + mobile-offline + mobile-performance + mobile-testing

## 1. Architecture

- **Framework**: Expo SDK (managed workflow) + React Native
- **Code sharing**: Feature code in `packages/app/features/` shared with web
- **Navigation**: Expo Router (file-based)
- **State**: Zustand 5 (shared with web)

## 2. Build Pipeline (EAS Build)

### Profiles
| Profile | Purpose | Distribution |
|---------|---------|-------------|
| `development` | Dev builds with dev client | Internal |
| `preview` | QA/stakeholder testing | Internal |
| `production` | App Store / Play Store | External |

### App Signing
- **iOS**: Managed by EAS (certificates + provisioning profiles)
- **Android**: Upload keystore to EAS, managed signing
- **OTA Updates**: `expo-updates` for JS-only changes (no native rebuild)

## 3. Offline-First Architecture

```
User Action → Local Store (MMKV) → Sync Queue → API → Confirm → Update Local
```

- **Local storage**: MMKV for key-value, SQLite for structured data
- **Sync queue**: Background upload when network available
- **Conflict resolution**: Last-write-wins (server) with client conflict UI
- **Key use case**: Tournament scoring offline (gym without internet)

## 4. Performance Optimization

### Startup
- Reduce bundle size: tree-shaking, lazy imports, code splitting
- Preload critical screens, defer non-essential
- Hermes engine: enabled by default

### Runtime
- `FlatList`: `getItemLayout`, `maxToRenderPerBatch`, `windowSize`
- Avoid inline styles/functions in render
- Use `React.memo` for list items
- Images: progressive JPEG, proper caching, resize server-side

### Profiling
- React DevTools Profiler
- Flipper for network/layout
- Hermes sampling profiler for JS performance

## 5. CI/CD Pipeline

```
Push → Lint/Type-check → Unit Tests → EAS Build → E2E Tests (Maestro) → Deploy
```

- GitHub Actions triggers EAS Build
- Automated store submission via `eas submit`
- OTA updates: `eas update` for hotfixes

## 6. Testing

| Layer | Tool | Focus |
|-------|------|-------|
| Unit | Jest + RTL | Component logic, hooks, utils |
| Integration | Jest | Store + service interactions |
| E2E | Maestro | Critical user flows on real devices |
| Performance | Flashlight | Startup time, frame rate benchmarks |
| Accessibility | manual + axe | VoiceOver (iOS), TalkBack (Android) |

### Device Matrix
- iOS: iPhone SE (small), iPhone 15 (standard), iPad (tablet)
- Android: Pixel 7 (stock), Samsung Galaxy (custom UI), low-end device
