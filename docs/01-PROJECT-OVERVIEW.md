# TripPath — Project Overview

> Describes the app as implemented. Related: [Architecture](02-ARCHITECTURE.md) · [Screens](04-SCREEN-SPECS.md) · [README](../README.md).

## 1. What it is

TripPath is an Expo / React Native trip-planning app for Android and iOS (with a reduced web build), built for the Codenzic Innovations technical evaluation. A user logs in (demo auth), picks a pickup and drop-off, and sees the route on a map with duration, distance, arrival time, traffic and turn-by-turn steps, then hands the trip to Google Maps for live navigation.

| Field      | Value                                          |
| ---------- | ---------------------------------------------- |
| App name   | TripPath (login copy reads "New to Wayfare?")  |
| Package    | `com.codenzic.trippath` (Android and iOS)      |
| Scheme     | `trippath`                                     |
| Platforms  | Android, iOS, web (map picker and map reduced) |
| Language   | TypeScript (strict)                            |
| Navigation | Expo Router (file-based), typed routes on      |

## 2. User flow

```
/  →  /login  →  /locations  →  /route
```

1. **Login** – email and password with inline validation. "Forgot password?" and "Create an account" open in-app modals. Authentication is a **demo**: no backend, nothing is checked or created.
2. **Set locations** – two fields (pickup, drop-off), swap and clear, saved places, live Google Places (New) autocomplete, "Use current" and "Pick on map". "Next" validates and opens the route.
3. **Route** – map with markers and the road polyline, duration, distance, arrival time, drive/ride/walk modes, traffic warning, up to 20 turn-by-turn steps, satellite toggle and "Start navigation".

There is no separate "Trip ready" screen: in the design that frame is the Set locations screen with the drop-off field active.

## 3. Feature summary

| Area           | Behaviour                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| Validation     | Email format, password ≥ 6 characters, name required, passwords match; both places required and different |
| Search         | Debounced (300 ms), minimum 3 characters, abortable, one billed Places session per selection              |
| Saved places   | Static sample places (`src/constants/savedPlaces.ts`), filtered by the text typed                         |
| Current place  | Foreground permission via `expo-location`, then reverse geocoding with a coordinate fallback              |
| Map picking    | Full-screen map with a centre pin (native); a "use map centre" card on web                                |
| Routing        | Google Routes API (`DRIVE`, `TWO_WHEELER`, `WALK`); traffic-aware for driving                             |
| Hand-off       | Confirmation dialog, then Google Maps directions URL in the matching travel mode                          |
| Failure states | Invalid route params, missing API keys, disabled API, HTTP and network errors are all shown explicitly    |

## 4. Tech stack

Expo SDK 58, React Native 0.88, React 19, Expo Router, TypeScript 6, `react-native-maps`, `expo-location`, `lucide-react-native`, `react-native-svg`, Nunito Sans (`@expo-google-fonts`), Jest + React Native Testing Library, ESLint and Prettier. See [Dependencies](08-DEPENDENCIES.md).

## 5. Scope

**In scope:** the four flow steps above, Google Places and Routes integration, native maps, CI quality checks and an Android APK build.

**Out of scope:** real authentication or a backend, persistence of trips or places, global state management, offline support, localisation (all copy is English and centralised in `src/constants/strings.ts`).

## 6. Known limitations

- `EXPO_PUBLIC_*` keys ship inside the client bundle; use restricted keys and a backend proxy for production.
- Native behaviour (permission prompts, the real map view, Google Maps hand-off, keyboard handling) is not covered by automated tests and needs a device smoke test.
- The APK is signed with the debug keystore (fine for sideloading, not for the Play Store).
