# AGENT.md — TripPath: Codenzic Innovations Assignment

> **Status note:** this document is the original pre-development plan. The shipped app differs (light theme with orange accent, flat Expo Router files in `app/`, local component state, no auth context, Google Places/Routes instead of mock data). The current state is in [README.md](README.md) and [PROJECT-SETUP.md](docs/PROJECT-SETUP.md).

> This file is the **single source of truth** for any AI agent, developer, or collaborator picking up this project.
> Read this file first before touching any other file. Everything you need to know about the project — what it is,
> how it's structured, what conventions to follow, how to build it, and how to ship it — is documented here or
> linked to from here.

---

## 📋 Table of Contents

1. [Project Identity](#1-project-identity)
2. [Assignment Brief](#2-assignment-brief)
3. [Application Flow](#3-application-flow)
4. [Tech Stack](#4-tech-stack)
5. [Folder Structure](#5-folder-structure)
6. [Navigation Architecture](#6-navigation-architecture)
7. [Design System](#7-design-system)
8. [Screen-by-Screen Specs](#8-screen-by-screen-specs)
9. [Component Contracts](#9-component-contracts)
10. [Data Models & Types](#10-data-models--types)
11. [State Management](#11-state-management)
12. [Coding Standards](#12-coding-standards)
13. [Dependencies](#13-dependencies)
14. [Mock Data Strategy](#14-mock-data-strategy)
15. [Build & APK Generation](#15-build--apk-generation)
16. [QA Checklist](#16-qa-checklist)
17. [Submission Requirements](#17-submission-requirements)
18. [Documentation Index](#18-documentation-index)

---

## 1. Project Identity

| Field             | Value                               |
| ----------------- | ----------------------------------- |
| **App Name**      | TripPath                            |
| **Platform**      | iOS & Android (React Native / Expo) |
| **Assignment By** | Codenzic Innovations                |
| **Position**      | React Native Developer / Intern     |
| **Deadline**      | 48 hours from receipt               |
| **Deliverables**  | GitHub repo + Android APK + README  |

**TripPath** is a dark-themed mobile trip/route planning app. Users log in, pick a start and destination, confirm the trip, then view it on a map.

---

## 2. Assignment Brief

Four required screens:

| #   | Screen            | Key Requirements                                                          |
| --- | ----------------- | ------------------------------------------------------------------------- |
| 1   | **Login**         | Email + password fields, basic validation, create account option          |
| 2   | **Set Locations** | Start + destination input, current location option, suggested/recent list |
| 3   | **Trip Ready**    | Show selected start/destination, trip metadata, proceed action            |
| 4   | **Route View**    | Map with route, estimated travel time, start navigation action            |

**Technical expectations:**

- React Native + Expo
- Component-based, reusable architecture
- Proper screen-to-screen navigation
- Responsive UI matching the Figma design
- Appropriate state management
- Basic input/form validation
- Clean, maintainable code
- Mock/static data where backend isn't required
- Expo-compatible map solution

---

## 3. Application Flow

```
[App Launch]
     │
     ├── Not authenticated ──► [Login Screen]
     │                               │
     │                         Sign In success
     │                               │
     └── Authenticated ─────────────►│
                                      ▼
                           [Set Locations Screen]
                            (pick From + To)
                                      │
                             Both selected + Proceed
                                      │
                                      ▼
                            [Trip Ready Screen]
                             (confirm trip details)
                                      │
                              "View Route" tap
                                      │
                                      ▼
                            [Route View Screen]
                             (map + start nav)
```

Flow is **strictly linear forward**. Back navigation works at every step. Logout resets to Login.

---

## 4. Tech Stack

| Category    | Technology                    | Version  | Why                                               |
| ----------- | ----------------------------- | -------- | ------------------------------------------------- |
| Framework   | React Native                  | 0.74.x   | Cross-platform mobile runtime                     |
| Build Chain | Expo SDK                      | ~51.0.0  | Managed workflow, EAS builds, OTA updates         |
| Routing     | Expo Router                   | ~3.5.0   | File-based routing, type-safe links, deep linking |
| Language    | TypeScript                    | ~5.3.0   | Type safety, better DX, strict mode               |
| Maps        | react-native-maps             | ~1.14.0  | Industry standard, supports dark map styles       |
| Location    | expo-location                 | ~17.0.0  | GPS coordinates + permissions (Expo managed)      |
| Storage     | @react-native-async-storage   | ~1.23.0  | Auth token persistence                            |
| Forms       | react-hook-form               | ^7.51.0  | Performant, minimal re-renders                    |
| Validation  | zod                           | ^3.23.0  | Type-safe schema validation                       |
| Animations  | react-native-reanimated       | ~3.10.0  | UI-thread animations, 60fps                       |
| Gestures    | react-native-gesture-handler  | ~2.16.0  | Bottom sheet drag on Route View                   |
| Styling     | StyleSheet (built-in)         | —        | Universal, debuggable, no setup needed            |
| Icons       | @expo/vector-icons (Ionicons) | built-in | Consistent iconography, zero setup                |
| Fonts       | expo-font                     | ~12.0.0  | Inter font loading                                |

> **No Redux.** Context API is the correct scope for 4 screens. Redux would be over-engineering.

---

## 5. Folder Structure

```
codenzic-trip-planner/
├── app/                                # Expo Router — every file = a route
│   ├── _layout.tsx                     # Root layout: auth guard, fonts, status bar
│   ├── index.tsx                       # Entry: checks auth → redirects
│   ├── (auth)/
│   │   ├── _layout.tsx                 # Auth stack (no header shown)
│   │   └── login.tsx                   # ← SCREEN 1: Login
│   └── (app)/
│       ├── _layout.tsx                 # App stack layout
│       ├── set-locations.tsx           # ← SCREEN 2: Set Locations
│       ├── trip-ready.tsx              # ← SCREEN 3: Trip Ready
│       └── route-view.tsx              # ← SCREEN 4: Route View
│
├── components/
│   ├── ui/                             # Generic, reusable primitives
│   │   ├── Button.tsx                  # Variants: primary, secondary, ghost, danger
│   │   ├── Input.tsx                   # Label + error + secure toggle
│   │   ├── Card.tsx                    # Elevated card wrapper
│   │   └── Badge.tsx                   # Small label chips
│   ├── map/
│   │   ├── AppMapView.tsx              # Dark-styled MapView wrapper
│   │   └── RoutePolyline.tsx           # Animated route polyline
│   ├── location/
│   │   ├── LocationSearchBar.tsx       # Search input with clear button
│   │   └── LocationItem.tsx            # Row: icon + name + address + distance
│   └── trip/
│       ├── TripSummaryCard.tsx         # From → To visual card with connector line
│       └── RouteInfoPanel.tsx          # Distance + ETA + mode row
│
├── constants/
│   ├── colors.ts                       # ALL color tokens (never hardcode hex in components)
│   ├── typography.ts                   # Font sizes, weights, line heights
│   ├── spacing.ts                      # Spacing + border radius scales
│   └── mockData.ts                     # Mock locations and trip routes
│
├── context/
│   ├── AuthContext.tsx                 # Login/logout, token read/write
│   └── TripContext.tsx                 # Active trip state (from, to, route)
│
├── hooks/
│   ├── useAuth.ts                      # Consume AuthContext
│   ├── useLocation.ts                  # expo-location wrapper + permission handling
│   └── useTrip.ts                      # Trip helpers + TripContext consumer
│
├── types/
│   └── index.ts                        # All interfaces, enums, and param lists
│
├── utils/
│   ├── validation.ts                   # Zod schemas (loginSchema, etc.)
│   └── helpers.ts                      # formatDistance, formatDuration, generateMockRoute
│
├── assets/
│   ├── fonts/                          # Inter font files
│   └── images/                         # App icons, splash
│
├── docs/                               # Full engineering documentation (do not delete)
├── AGENT.md                            # ← YOU ARE HERE
├── app.json                            # Expo config
├── eas.json                            # EAS Build profiles
├── package.json
├── tsconfig.json
└── README.md
```

---

## 6. Navigation Architecture

```
Root Layout (_layout.tsx)
├── Auth Group /(auth)
│   └── login.tsx           → Expo Router Stack (no header)
└── App Group /(app)
    ├── set-locations.tsx   → Stack screen (slide from right)
    ├── trip-ready.tsx      → Stack screen (slide from right)
    └── route-view.tsx      → Stack screen (slide from right)
```

**Auth Guard pattern (in `app/_layout.tsx`):**

```typescript
// On every render, check AsyncStorage for token
// If no token → redirect to /(auth)/login
// If token found → redirect to /(app)/set-locations
// Use useSegments() + router.replace() — NEVER router.push() for auth redirects
```

**Data between screens:**

- Auth state → `AuthContext` (global)
- Trip data (from, to) → `TripContext` (global, set on Set Locations screen)
- Trip details (calculated) → `TripContext` (enriched before Trip Ready renders)
- Use `router.push()` to navigate; never pass large objects as URL params

---

## 7. Design System

### Colors (`constants/colors.ts`)

```typescript
export const Colors = {
  // Backgrounds
  BgPrimary: '#0A0E1A', // Screen backgrounds
  BgSurface: '#141828', // Cards, input fields
  BgElevated: '#1E2538', // Elevated cards, modals

  // Accents
  Primary: '#4F8EF7', // Primary buttons, active states, links
  PrimaryLight: '#7AADFF', // Hover / pressed states
  Secondary: '#FF6B6B', // Destination pins, errors
  Success: '#4CAF50', // Origin pins, success toasts

  // Text
  TextPrimary: '#FFFFFF', // Headings, main text
  TextSecondary: '#8A9BB0', // Labels, subtitles
  TextMuted: '#4A5568', // Placeholders, disabled

  // Structure
  Border: '#2D3748', // Input borders, card borders
  Divider: '#1A2033', // List separators

  // Status
  Error: '#FF4444',
  Warning: '#FFAA00',
} as const;
```

### Typography (`constants/typography.ts`)

| Level   | Size | Weight | Line Height | Use              |
| ------- | ---- | ------ | ----------- | ---------------- |
| Display | 32px | 700    | 40px        | Hero text        |
| H1      | 28px | 700    | 36px        | Screen titles    |
| H2      | 22px | 600    | 30px        | Section headers  |
| H3      | 18px | 600    | 26px        | Card titles      |
| BodyLg  | 16px | 400    | 24px        | Main content     |
| Body    | 14px | 400    | 22px        | General text     |
| Caption | 12px | 400    | 18px        | Meta, timestamps |
| Label   | 11px | 500    | 16px        | Tags, badges     |

### Spacing (`constants/spacing.ts`)

Base-4 grid: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`

```typescript
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};
export const Radius = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, full: 9999 };
```

### Component Sizing

| Component    | Height | Padding H |
| ------------ | ------ | --------- |
| Button (lg)  | 56px   | 24px      |
| Button (md)  | 48px   | 20px      |
| Button (sm)  | 36px   | 16px      |
| Input field  | 56px   | 16px      |
| LocationItem | 72px   | 16px      |

---

## 8. Screen-by-Screen Specs

### Screen 1: Login `/(auth)/login`

**Layout (top → bottom):**

1. App logo + app name ("TripPath") + tagline
2. Email `Input` component
3. Password `Input` component (with eye toggle)
4. Inline field-level error messages
5. "Sign In" `Button` (primary, lg, full-width)
6. Divider
7. "Don't have an account? **Create Account**" link

**State:**

```typescript
{ email: string, password: string, showPassword: boolean, isLoading: boolean }
// Errors managed by react-hook-form
```

**Validation (Zod schema):**

```typescript
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});
```

**Mock auth logic:** Any email that passes validation + any password ≥6 chars → success. Store `mock-token-12345` in AsyncStorage. Navigate to `/(app)/set-locations`.

**Edge cases:**

- `KeyboardAvoidingView`: `behavior="padding"` on iOS, `behavior="height"` on Android
- Disable entire form + show spinner during `isLoading`
- Clear errors on field focus

---

### Screen 2: Set Locations `/(app)/set-locations`

**Layout:**

1. Screen header with back arrow + title "Plan Your Route"
2. Location input card:
   - Row 1: Green dot + "From" input (tappable, activates 'from' field)
   - Vertical connector line
   - Row 2: Red dot + "To" input (tappable, activates 'to' field)
   - Swap button (⇅) on the right
3. "Use My Current Location" button (GPS icon)
4. Section label "Suggestions"
5. `FlatList` of `LocationItem` rows (6 mock items)
6. "Set Route →" `Button` — **disabled** until both From and To are set

**State (in TripContext):**

```typescript
{ fromLocation: Location | null, toLocation: Location | null }
// Local:
{ activeInput: 'from' | 'to' | null, isLoadingGPS: boolean }
```

**Interaction rules:**

- Tap "From" row → `activeInput = 'from'`; tap any suggestion → fills From
- Tap "To" row → `activeInput = 'to'`; tap any suggestion → fills To
- Swap button → swaps `fromLocation` ↔ `toLocation`
- "Use Current Location" → calls `expo-location` → fills `activeInput` field (or From if null)

---

### Screen 3: Trip Ready `/(app)/trip-ready`

**Layout:**

1. Large illustration/icon (map pin SVG or emoji-style graphic)
2. "Your trip is ready!" heading
3. `TripSummaryCard`: From location name → connector → To location name
4. `RouteInfoPanel`: `[🚗 Car]` `[📏 X km]` `[⏱ Y min]`
5. "View Route →" `Button` (primary, lg)
6. "Change Locations" ghost button

**Mock calculation:**

```typescript
// In helpers.ts
const distance = (Math.random() * 45 + 5).toFixed(1) + ' km'; // 5–50 km
const minutes = Math.floor(Math.random() * 105 + 15); // 15–120 min
const duration = minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes} min`;
```

**Animation:** Card slides up from bottom with `react-native-reanimated` on mount. Metadata rows show shimmer for 1.2s then reveal values.

---

### Screen 4: Route View `/(app)/route-view`

**Layout:**

1. Full-screen `MapView` (dark style, fills entire screen)
2. Floating header overlay (top): Back button + "TripPath Route" title
3. Two `Marker` components: green (origin) + red (destination)
4. `Polyline` connecting origin to destination (mock coordinate array)
5. Bottom sheet (fixed 32% height, rounded top corners):
   - From → To labels with icons
   - Distance + ETA
   - "🧭 Start Navigation" primary button

**Map configuration:**

```typescript
// Center camera between both coordinates
const region = {
  latitude: (from.lat + to.lat) / 2,
  longitude: (from.lng + to.lng) / 2,
  latitudeDelta: Math.abs(from.lat - to.lat) * 1.5 + 0.02,
  longitudeDelta: Math.abs(from.lng - to.lng) * 1.5 + 0.02,
};
// Apply dark map style JSON (see docs/03-DESIGN-SYSTEM.md for full JSON)
```

**"Start Navigation":** Shows a Toast/Alert "Navigation started!" — no real navigation needed.

---

## 9. Component Contracts

### `<Button />`

```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; // default: 'primary'
  size?: 'sm' | 'md' | 'lg'; // default: 'md'
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean; // default: false
}
```

- Loading → show `ActivityIndicator`, hide title
- Disabled → `opacity: 0.5`, `pointerEvents: 'none'`
- Press feedback → `Animated.spring` scale: 1 → 0.97 → 1

### `<Input />`

```typescript
interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  showToggle?: boolean; // show eye icon for password
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
}
```

- Error state → red border (`Colors.Error`) + error text below
- Focus state → primary border (`Colors.Primary`)

### `<LocationItem />`

```typescript
interface LocationItemProps {
  location: Location;
  onPress: (location: Location) => void;
  type?: 'recent' | 'popular' | 'current';
}
// Icon: clock (recent) | star (popular) | navigation (current)
```

### `<TripSummaryCard />`

```typescript
interface TripSummaryCardProps {
  from: Location;
  to: Location;
}
// Renders: green dot → vertical line → red dot, with names and addresses
```

---

## 10. Data Models & Types

All types live in `types/index.ts`:

```typescript
interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: { latitude: number; longitude: number };
  type: 'recent' | 'popular' | 'current' | 'custom';
  distance?: string;
}

interface Trip {
  id: string;
  from: Location;
  to: Location;
  distance: string; // e.g. "12.4 km"
  estimatedDuration: string; // e.g. "24 min"
  travelMode: 'car' | 'walk' | 'transit';
  routeCoordinates: Coordinate[];
  createdAt: Date;
}

interface Coordinate {
  latitude: number;
  longitude: number;
}
```

---

## 11. State Management

Two contexts only:

### `AuthContext`

```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}
```

- On `login()` → validate → store `mock-token-12345` in AsyncStorage → set user
- On `logout()` → clear AsyncStorage → reset user → `router.replace('/(auth)/login')`
- On app start → read AsyncStorage → hydrate (prevents flash of login screen)

### `TripContext`

```typescript
interface TripContextType {
  fromLocation: Location | null;
  toLocation: Location | null;
  activeTrip: Trip | null;
  setFromLocation: (location: Location | null) => void;
  setToLocation: (location: Location | null) => void;
  setActiveTrip: (trip: Trip) => void;
  swapLocations: () => void;
  clearTrip: () => void;
}
```

---

## 12. Coding Standards

### TypeScript

- `strict: true` in `tsconfig.json` — non-negotiable
- Zero `any` types. Use `unknown` + type guard if truly unknown
- All component props have explicit interfaces (not inline types)
- All async functions have explicit return types

### File Naming

| Type       | Convention | Example             |
| ---------- | ---------- | ------------------- |
| Components | PascalCase | `LocationItem.tsx`  |
| Screens    | kebab-case | `set-locations.tsx` |
| Hooks      | camelCase  | `useLocation.ts`    |
| Utils      | camelCase  | `helpers.ts`        |
| Constants  | camelCase  | `colors.ts`         |
| Types      | camelCase  | `index.ts`          |

### Import Order (enforce via ESLint)

```typescript
// 1. React
import React, { useState, useCallback } from 'react';

// 2. React Native
import { View, Text, StyleSheet } from 'react-native';

// 3. Expo
import { router } from 'expo-router';

// 4. Third-party
import { useForm, Controller } from 'react-hook-form';

// 5. Internal — context / hooks
import { useAuth } from '@/hooks/useAuth';

// 6. Internal — components
import { Button } from '@/components/ui/Button';

// 7. Constants / types
import { Colors } from '@/constants/colors';
import type { Location } from '@/types';

// 8. Styles (always last)
// (StyleSheet.create at bottom of file)
```

### StyleSheet Rules

- **No inline styles** except dynamic values (e.g., `{ width: progress + '%' }`)
- Name styles semantically: `container`, `header`, `title`, `inputRow`, not `view1`, `text2`
- Group related styles together
- `StyleSheet.create()` always at the **bottom** of the file

### Component Size Limits

- Max **150 lines** per component (excluding StyleSheet block)
- Max **40 lines** per function
- Split into sub-components early rather than late

### Commit Convention (Conventional Commits)

```
feat(login): add password visibility toggle
fix(locations): correct swap button not updating TripContext
style(route-view): adjust bottom sheet border radius
refactor(hooks): extract location permission into useLocation
docs: update AGENT.md with screen 4 specs
chore(deps): upgrade expo-location to 17.0.1
```

### Performance Rules

- `React.memo` on every presentational component
- `useCallback` on all handlers passed as props
- `useMemo` on filtered/derived data
- `FlatList` (never `ScrollView`) for variable-length lists
- Stable `keyExtractor` using `item.id` (never array index)
- Never create objects/arrays inline in JSX (`style={{ margin: 8 }}` in a component that re-renders = new ref every time)

---

## 13. Dependencies

### Install Command

```bash
npx create-expo-app codenzic-trip-planner --template blank-typescript
cd codenzic-trip-planner
npx expo install expo-router expo-location expo-font expo-status-bar expo-splash-screen
npx expo install react-native-maps react-native-reanimated react-native-gesture-handler
npx expo install @react-native-async-storage/async-storage
npm install react-hook-form zod
```

### Full `package.json` dependencies

```json
{
  "dependencies": {
    "expo": "~51.0.0",
    "expo-router": "~3.5.0",
    "expo-location": "~17.0.0",
    "expo-font": "~12.0.0",
    "expo-status-bar": "~1.12.0",
    "expo-splash-screen": "~0.27.0",
    "react": "18.2.0",
    "react-native": "0.74.5",
    "react-native-maps": "~1.14.0",
    "react-native-reanimated": "~3.10.0",
    "react-native-gesture-handler": "~2.16.0",
    "react-native-safe-area-context": "4.10.5",
    "react-native-screens": "3.31.1",
    "@react-native-async-storage/async-storage": "~1.23.0",
    "react-hook-form": "^7.51.0",
    "zod": "^3.23.0",
    "@expo/vector-icons": "^14.0.0"
  },
  "devDependencies": {
    "@types/react": "~18.2.0",
    "typescript": "~5.3.0",
    "eslint": "^8.57.0",
    "eslint-config-expo": "~7.0.0",
    "prettier": "^3.2.0"
  }
}
```

### `app.json` — Key Settings

```json
{
  "expo": {
    "name": "TripPath",
    "slug": "trippath",
    "scheme": "trippath",
    "plugins": [
      "expo-router",
      "expo-location",
      ["react-native-maps", { "googleMapsApiKey": "YOUR_API_KEY" }]
    ],
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#0A0E1A"
      },
      "config": { "googleMaps": { "apiKey": "YOUR_API_KEY" } }
    }
  }
}
```

### `eas.json` — Build Profiles

```json
{
  "cli": { "version": ">= 10.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "android": { "buildType": "apk" },
      "distribution": "internal"
    },
    "production": {
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

---

## 14. Mock Data Strategy

All mock data lives in `constants/mockData.ts`. **Never hardcode values directly in screen files.**

### Mock Locations (6 entries)

```typescript
export const MOCK_LOCATIONS: Location[] = [
  {
    id: 'loc-1',
    name: 'Central Park',
    address: 'New York, NY 10024, USA',
    coordinates: { latitude: 40.7851, longitude: -73.9683 },
    type: 'popular',
  },
  {
    id: 'loc-2',
    name: 'Brooklyn Bridge',
    address: 'Brooklyn, NY 11201, USA',
    coordinates: { latitude: 40.7061, longitude: -73.9969 },
    type: 'recent',
  },
  {
    id: 'loc-3',
    name: 'Times Square',
    address: 'Manhattan, NY 10036, USA',
    coordinates: { latitude: 40.758, longitude: -73.9855 },
    type: 'recent',
  },
  {
    id: 'loc-4',
    name: 'Statue of Liberty',
    address: 'Liberty Island, NY 10004, USA',
    coordinates: { latitude: 40.6892, longitude: -74.0445 },
    type: 'popular',
  },
  {
    id: 'loc-5',
    name: 'Empire State Building',
    address: '20 W 34th St, New York, NY 10001',
    coordinates: { latitude: 40.7484, longitude: -73.9856 },
    type: 'popular',
  },
  {
    id: 'loc-6',
    name: 'Grand Central Terminal',
    address: '89 E 42nd St, New York, NY 10017',
    coordinates: { latitude: 40.7527, longitude: -73.9772 },
    type: 'recent',
  },
];
```

### Mock Route Generation

```typescript
export function generateMockRoute(from: Coordinate, to: Coordinate): Coordinate[] {
  const steps = 8;
  return Array.from({ length: steps }, (_, i) => ({
    latitude: from.latitude + (to.latitude - from.latitude) * (i / (steps - 1)),
    longitude: from.longitude + (to.longitude - from.longitude) * (i / (steps - 1)),
  }));
}
```

---

## 15. Build & APK Generation

### Development

```bash
npm install
npx expo start
# Scan QR with Expo Go app on Android/iOS
```

### Generate APK (via EAS)

```bash
npm install -g eas-cli
eas login                                           # Log in to Expo account
eas build:configure                                 # Creates eas.json
eas build --platform android --profile preview      # Builds APK (~10-15 min)
# Download APK from Expo dashboard or terminal URL
```

### Common Build Issues

| Issue                                      | Fix                                                       |
| ------------------------------------------ | --------------------------------------------------------- |
| `react-native-maps` not working in Expo Go | Use development build or mock map on Expo Go              |
| Google Maps API key error                  | Add key to `app.json` android config                      |
| `expo-location` permission denied          | Test on physical device, not emulator                     |
| Font not loading                           | Check `useFonts` hook in root `_layout.tsx`               |
| Reanimated worklet error                   | Add `react-native-reanimated/plugin` to `babel.config.js` |

---

## 16. QA Checklist

### Per-Screen Manual Tests

**Login:**

- [ ] Empty submit shows both field errors
- [ ] Invalid email format shows error
- [ ] Password < 6 chars shows error
- [ ] Valid credentials → navigates to Set Locations
- [ ] Loading spinner shows during fake auth delay
- [ ] Keyboard dismisses on outside tap
- [ ] Password eye toggle works
- [ ] Works on small screen (iPhone SE size) — no content cut off

**Set Locations:**

- [ ] Tapping From/To row activates correct input
- [ ] Tapping suggestion fills active input field
- [ ] Swap button swaps both locations
- [ ] "Use Current Location" fills From field
- [ ] Proceed button disabled until both set
- [ ] Proceed button enabled → navigates to Trip Ready
- [ ] FlatList scrollable with 6+ items

**Trip Ready:**

- [ ] Correct From and To names shown
- [ ] Distance and duration values appear after shimmer
- [ ] "View Route" → navigates to Route View
- [ ] "Change Locations" → goes back to Set Locations

**Route View:**

- [ ] Map renders with dark style
- [ ] Two markers visible (green + red)
- [ ] Polyline connects markers
- [ ] Map camera centers between both points
- [ ] Bottom sheet shows From, To, distance, ETA
- [ ] "Start Navigation" shows alert/toast

### Responsive Testing

| Device            | Screen Size | Must Pass                         |
| ----------------- | ----------- | --------------------------------- |
| iPhone SE 3rd     | 375×667     | No overflow, all elements visible |
| iPhone 14         | 390×844     | Balanced layout                   |
| iPhone 14 Pro Max | 430×932     | No excessive whitespace           |
| Galaxy S21        | 360×800     | Same as SE constraints            |

---

## 17. Submission Requirements

```
✅ GitHub repository (public)
   - Clean commit history using Conventional Commits
   - All 4 screens implemented
   - No secrets / API keys committed

✅ Android APK file
   - Generated via EAS Build (preview profile)
   - Tested on a physical device or emulator
   - App installs and runs without crashing

✅ README.md (in repo root)
   - Project description
   - Setup + run instructions
   - APK download link
   - Screen overview with descriptions
   - Tech stack table
```

---

## 18. Documentation Index

All detailed documentation is in the `docs/` folder:

| File                                                           | Contents                                                |
| -------------------------------------------------------------- | ------------------------------------------------------- |
| [`docs/01-PROJECT-OVERVIEW.md`](./docs/01-PROJECT-OVERVIEW.md) | Full project context, goals, timeline                   |
| [`docs/02-ARCHITECTURE.md`](./docs/02-ARCHITECTURE.md)         | Folder structure, data flow diagrams                    |
| [`docs/03-DESIGN-SYSTEM.md`](./docs/03-DESIGN-SYSTEM.md)       | Full color palette, typography, spacing, dark map style |
| [`docs/04-SCREEN-SPECS.md`](./docs/04-SCREEN-SPECS.md)         | Per-screen layout, state, validation, edge cases        |
| [`docs/05-COMPONENT-GUIDE.md`](./docs/05-COMPONENT-GUIDE.md)   | Every component's props, variants, behavior             |
| [`docs/06-DATA-MODELS.md`](./docs/06-DATA-MODELS.md)           | All TypeScript interfaces, mock data, utility functions |
| [`docs/07-CODING-STANDARDS.md`](./docs/07-CODING-STANDARDS.md) | Conventions, ESLint, Prettier, commit style, perf rules |
| [`docs/08-DEPENDENCIES.md`](./docs/08-DEPENDENCIES.md)         | All packages, versions, full configs                    |
| [`docs/09-NAVIGATION-FLOW.md`](./docs/09-NAVIGATION-FLOW.md)   | Transitions, auth guard, deep links                     |
| [`docs/10-TESTING-AND-QA.md`](./docs/10-TESTING-AND-QA.md)     | QA checklists, accessibility, responsive matrix         |
| [`docs/11-BUILD-AND-DEPLOY.md`](./docs/11-BUILD-AND-DEPLOY.md) | EAS Build, APK steps, troubleshooting                   |

---

_Last updated: October 2026 — Planning phase complete. Ready for implementation._
