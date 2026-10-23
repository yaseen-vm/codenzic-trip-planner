# TripPath — Project Overview

> **Assignment:** Codenzic Innovations — React Native Technical Evaluation  
> **Engineer:** [Your Name]  
> **Date:** October 2026  
> **Status:** Pre-development (Planning & Documentation Phase)

---

## 1. Project Identity

| Field                 | Value                                                     |
| --------------------- | --------------------------------------------------------- |
| **App Name**          | TripPath                                                  |
| **Platform**          | iOS & Android (React Native / Expo)                       |
| **Assignment Issuer** | Codenzic Innovations                                      |
| **Purpose**           | Technical evaluation — mobile app development proficiency |
| **Delivery**          | GitHub repository + Android APK                           |

---

## 2. App Description

**TripPath** is a sleek, dark-themed mobile trip planner application that enables users to plan routes from any starting location to a destination. The app provides a guided, four-screen flow: authentication, location selection, trip confirmation, and route visualization on a live map.

The application demonstrates core competencies expected of a senior React Native engineer:

- **Authentication flow** with form validation and session persistence
- **Location services** using the device GPS via `expo-location`
- **Interactive maps** with route rendering via `react-native-maps`
- **Clean navigation architecture** using Expo Router v3 with file-based routing
- **State management** with React Context API — appropriately lean for the problem scope
- **Design system consistency** with a professionally crafted dark UI

---

## 3. Tech Stack

| Category            | Technology                                | Version  | Role                                              |
| ------------------- | ----------------------------------------- | -------- | ------------------------------------------------- |
| **Framework**       | React Native                              | 0.74.x   | Cross-platform mobile runtime                     |
| **Build Toolchain** | Expo SDK                                  | ~51.0.0  | Managed workflow, OTA, build                      |
| **Routing**         | Expo Router                               | ~3.5.0   | File-based navigation (wraps React Navigation v6) |
| **Language**        | TypeScript                                | ~5.3.0   | Type safety, improved DX                          |
| **Navigation**      | React Navigation (via Expo Router)        | v6       | Stack, bottom tabs, navigation state              |
| **Maps**            | react-native-maps                         | ~1.14.0  | Interactive map, markers, polylines               |
| **Location**        | expo-location                             | ~17.0.0  | GPS coordinates, permissions                      |
| **Storage**         | @react-native-async-storage/async-storage | ~1.23.0  | Auth token persistence                            |
| **Forms**           | react-hook-form                           | ^7.51.0  | Performant form state management                  |
| **Validation**      | zod                                       | ^3.23.0  | Schema-based validation, type inference           |
| **Animations**      | react-native-reanimated                   | ~3.10.0  | Fluid, native-thread animations                   |
| **Gestures**        | react-native-gesture-handler              | ~2.16.0  | Gesture recognition for bottom sheet              |
| **Styling**         | React Native StyleSheet                   | built-in | Core styling (NativeWind optional upgrade)        |
| **Icons**           | @expo/vector-icons (Ionicons)             | built-in | Consistent iconography                            |
| **Fonts**           | expo-font                                 | ~12.0.0  | Inter font loading                                |

### Why This Stack?

- **Expo Managed Workflow** reduces native configuration overhead for an evaluation project, allowing focus on product quality.
- **Expo Router v3** provides production-grade file-based routing with type-safe links and deep linking out of the box.
- **react-hook-form + zod** is the industry-standard pairing for performant, type-safe forms — replacing legacy patterns like Formik.
- **react-native-reanimated** runs animations on the UI thread, ensuring 60fps smoothness even under JS thread load.
- **No Redux** — Context API is the correct scope for this app's state complexity. Over-engineering with Redux would be a red flag in a project of this size.

---

## 4. Application Flow

```
[Login Screen]
     │
     │ (auth success)
     ▼
[Set Locations Screen]
     │
     │ (both locations selected)
     ▼
[Trip Ready Screen]
     │
     │ (user taps "View Route")
     ▼
[Route View Screen]
```

The flow is strictly linear forward, with back navigation available at each step.

---

## 5. Timeline Breakdown (48-Hour Sprint)

> All times are approximate. The goal is to deliver a polished, reviewable deliverable — not to fill 48 hours.

| Block       | Hours     | Milestone                | Deliverables                                                                                                                   |
| ----------- | --------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| **Block 1** | 0–8 hrs   | **Setup & Foundation**   | Expo project init, Expo Router config, folder structure, constants (colors, typography, spacing), TypeScript types, mock data  |
| **Block 2** | 8–16 hrs  | **Auth & Design System** | Login screen (fully styled, validation with react-hook-form + zod, AsyncStorage, animations), Button + Input + Card components |
| **Block 3** | 16–24 hrs | **Location Screen**      | Set Locations screen, LocationItem, LocationSearchBar, expo-location integration, suggestions filtering, TripContext           |
| **Block 4** | 24–32 hrs | **Trip Ready Screen**    | Trip Ready screen, TripSummaryCard, TripMetaRow, slide-up animation, mock distance/duration calculation                        |
| **Block 5** | 32–40 hrs | **Route View Screen**    | Route View screen, MapView integration, dark map style, RoutePolyline, LocationMarker, floating BottomSheet                    |
| **Block 6** | 40–48 hrs | **Polish & Delivery**    | End-to-end QA, edge case handling, README, APK build via EAS, GitHub push                                                      |

### Daily Checkpoints

**End of Day 1 (Hour 24):** Login, Set Locations, and Trip Ready screens functional with navigation wired.  
**End of Day 2 (Hour 48):** Route View with map, full APK, documentation complete.

---

## 6. Submission Checklist

### GitHub Repository

- [ ] Clean `main` branch with meaningful commit history (Conventional Commits)
- [ ] Complete folder structure as documented in `02-ARCHITECTURE.md`
- [ ] No `.env` secrets or API keys committed (none required for this project)
- [ ] `.gitignore` covers: `node_modules/`, `.expo/`, `dist/`, `*.jks`, `*.keystore`
- [ ] All 12 documentation files in `/docs`
- [ ] Professional `README.md` with setup instructions

### Android APK

- [ ] Generated via `eas build --platform android --profile preview`
- [ ] APK installs and runs on Android 10+ (API 29+)
- [ ] All 4 screens navigable without crashes
- [ ] Map renders correctly
- [ ] Location permission prompt appears
- [ ] Login validation works
- [ ] No visible console errors in production build

### Code Quality

- [ ] TypeScript strict mode — zero `any` types
- [ ] No `eslint` errors
- [ ] No commented-out dead code
- [ ] All components have proper prop interfaces
- [ ] Consistent file naming per `07-CODING-STANDARDS.md`

---

## 7. Key Engineering Principles

### 1. Component Reusability

Every UI primitive (Button, Input, Card, Badge) is built as a generic, prop-driven component stored in `components/ui/`. No one-off styled components that live inside screen files. If a pattern appears more than once, it becomes a component.

### 2. Separation of Concerns

- **Screens** = layout and composition only. No business logic.
- **Hooks** = all side effects, data fetching, and state manipulation.
- **Context** = shared application state (auth session, active trip).
- **Utils** = pure functions with no side effects (formatters, validators).
- **Constants** = zero magic numbers or hardcoded strings in component files.

### 3. Clean Code

- Functions do one thing.
- Variables and props are named to read like sentences.
- No function exceeds 40 lines without refactoring into sub-functions.
- All TypeScript interfaces are defined in `types/index.ts` — never inline unless trivially simple.

### 4. Pixel-Perfect UI

- All measurements come from the spacing scale in `constants/spacing.ts`.
- All colors come from `constants/colors.ts` — never hardcoded hex strings in components.
- All text styles come from `constants/typography.ts` — no orphan `fontSize` declarations.
- UI is tested on SE (small), standard, and Pro Max (large) screen sizes.

### 5. Performance First

- `FlatList` (not `ScrollView`) for any list of variable-length data.
- `React.memo` on all pure presentational components.
- `useCallback` on all event handlers passed as props.
- `useMemo` on derived/computed values.
- No anonymous arrow functions in JSX props (except where unavoidable with hooks).

### 6. Accessibility

- All interactive elements have `accessibilityLabel` and `accessibilityRole`.
- Touch targets are minimum 44×44pt.
- Text color contrast meets WCAG AA (4.5:1 for body text).
- App works with font scaling enabled (no fixed-height text containers).

---

## 8. Out of Scope

The following are explicitly excluded from this evaluation project and should not be added:

- Real backend or API calls (all data is mocked)
- Real routing engine (Google Maps Directions API, etc.) — mock polyline only
- User registration (mock auth accepts any valid-format credentials)
- Push notifications
- Real-time updates or WebSockets
- Payments or in-app purchases
- App Store / Play Store submission

---

## 9. Contact & Assignment Reference

| Field                 | Detail                          |
| --------------------- | ------------------------------- |
| **Assignment Issuer** | Codenzic Innovations            |
| **Evaluation Type**   | Take-home technical assignment  |
| **Target Role**       | React Native / Mobile Developer |
| **Delivery Format**   | GitHub repo + APK download link |

---

_This document is part of the TripPath engineering documentation suite. See the full doc index in `README.md`._
