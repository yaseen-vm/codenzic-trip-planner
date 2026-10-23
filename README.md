# TripPath

A React Native and Expo trip-planning app for Android and iOS, built for the Codenzic Innovations technical evaluation.

## Assignment coverage

Status against the Codenzic brief: ✅ done · ⚠️ partial · ❌ not done.

| Requirement                                                                   | Status | What is implemented                                                                                                                                                                                                                                                                                                                                                                                                           | Where                                                          |
| ----------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **1. Login** – email/password, validation, login, create account              | ✅     | Email and password fields, regex email check, minimum 6-character password, inline errors, show/hide password. "Forgot password?" and "Create an account" open in-app modals (reset email form; name/email/password/confirm form with validation and a success state). Authentication itself is a demo: no backend.                                                                                                           | `src/features/auth/`                                           |
| **2. Set Locations** – start/destination, current vs manual, suggestions list | ✅     | Pickup and drop-off fields, swap and clear, saved/recent places (mock data), live Google Places (New) autocomplete when a key is set. **Use current** requests location permission via `expo-location` and reverse-geocodes the fix. **Pick on map** opens a full-screen map with a centre pin. "Next" looks inactive until both places are chosen and explains what is missing or wrong (incomplete, identical) when tapped. | `src/features/locations/`, `src/components/map/MapPicker.tsx`  |
| **3. Trip Ready** – selected trip info, proceed action                        | ✅     | The Figma "Trip ready" frame is the Set Locations screen with the drop-off field active, so there is no separate screen. The selected pickup and drop-off are confirmed by the filled fields, and "Next" proceeds to Route View, where both are shown again in the sheet.                                                                                                                                                     | `src/features/locations/`, `src/features/route/`               |
| **4. Route View** – map, ETA, route info, start navigation                    | ✅     | Google Map with start/end markers and road polyline, duration, distance, arrival time, drive/ride/walk modes, traffic warning, turn-by-turn list, satellite toggle, "Start navigation" hands off to Google Maps. Web falls back to a placeholder map.                                                                                                                                                                         | `src/features/route/`, `src/components/map/RouteMap(.web).tsx` |

| Technical expectation                  | Status | Notes                                                                                                                                                                                                                              |
| -------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React Native + Expo                    | ✅     | Expo SDK 58, React Native 0.88, TypeScript                                                                                                                                                                                         |
| Proper navigation                      | ✅     | Expo Router stack: `/` → `/login` → `/locations` → `/route`; route params carry the selected places                                                                                                                                |
| Responsive UI matching Figma           | ✅     | Shared tokens in `src/constants/theme.ts`, Nunito Sans, safe-area handling. Matched by hand in commit `02532c5`; no automated visual comparison                                                                                    |
| Component-based, reusable architecture | ✅     | Feature folders (`auth`, `locations`, `route`), shared components, hooks for async state, services for network / OS calls, pure utils; all copy, tokens and config in `src/constants`. See [Architecture](docs/02-ARCHITECTURE.md) |
| Application state                      | ✅     | Local state per screen (a pure reducer for the location form), selection passed via router params. No global store (not needed for this flow)                                                                                      |
| Basic form validation                  | ✅     | Login and sign-up (email format, password length, name, confirmation) and locations (both required, must differ)                                                                                                                   |
| Mock/static data                       | ✅     | Saved places are static; routes and places use Google APIs when keys are configured                                                                                                                                                |
| Clean code                             | ✅     | Strict TypeScript, ESLint, Prettier, no hardcoded literals in components, ~350 tests with enforced coverage, CI quality workflow (`npm run check`)                                                                                 |

### Deliverables

| Deliverable                    | Status                                                                                                                            |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| GitHub repository              | ✅                                                                                                                                |
| README with setup instructions | ✅ (this file)                                                                                                                    |
| APK                            | ✅ built by CI (`build-apk.yml`); download from the Actions artifact or the Latest APK release. See [Build an APK](#build-an-apk) |

### Known gaps / next steps

1. Add the three Google API keys as repository secrets, then confirm the first CI APK build succeeds and install it on a device.
2. Real authentication behind the login and create-account modals.
3. Native checks of Use current, Pick on map and the modals on a device/emulator have not been run. `expo-location` was added to the app config, so rebuild the dev client (`npx expo run:android`).

## Documentation

Start with [AGENT.md](AGENT.md), then the numbered guides in [`docs/`](docs): overview, architecture, design system, screen specs, components, data models, coding standards, dependencies, navigation, testing and QA, build and deploy, and [project setup](docs/PROJECT-SETUP.md). Contribution rules are in [CONTRIBUTING.md](CONTRIBUTING.md).

## Tech stack

- Expo SDK 58 and Expo Router
- React Native 0.88 and TypeScript
- `react-native-maps`
- Google Places API (New) and Routes API
- Jest and React Native Testing Library
- ESLint and Prettier

## Prerequisites

- Node.js 20 LTS or newer (CI uses Node 22)
- npm
- Android Studio with an Android emulator/device for native map testing. Expo Go can show blank Google Maps tiles with some Expo SDK / `react-native-maps` combinations; use a development build to verify this app's own native Maps key.

## Run locally

```bash
npm install
npx expo install --check
npm start
```

## Google Maps, Places and Routes setup

1. Copy `.env.example` to `.env` and fill in your own keys. Never commit `.env`.
2. Enable billing and enable **Maps SDK for Android**, **Maps SDK for iOS**, **Places API (New)**, and **Routes API** in the Google Cloud project.
3. Use separate keys where possible:
   - `GOOGLE_MAPS_ANDROID_API_KEY`: restrict to Android app `com.codenzic.trippath` plus your signing certificate and Maps SDK for Android.
   - `GOOGLE_MAPS_IOS_API_KEY`: restrict to iOS bundle ID `com.codenzic.trippath` and Maps SDK for iOS.
   - `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY`: Places API (New) only.
   - `EXPO_PUBLIC_GOOGLE_ROUTES_API_KEY`: Routes API only (development/testing only; this key is exposed in the client bundle).
4. **Security:** `EXPO_PUBLIC_*` keys are embedded in the client app and can be extracted. Restrict Places and Routes keys to only their required APIs, apply quotas and billing alerts, and use a secured backend proxy for production web-service requests. Never use a Places or Routes key as a native Maps SDK key.
5. Set the native key in your local `.env`, then build and run your own Android app (not Expo Go):
   ```bash
   npx expo run:android
   ```
   This generates/uses the native Android project and embeds `GOOGLE_MAPS_ANDROID_API_KEY`. For subsequent starts use `npx expo start --dev-client`. Changing native keys or native config requires rebuilding the app. On Android, the Google Cloud key restriction must match `com.codenzic.trippath` and the SHA-1 certificate used to sign this build.
6. If building with EAS, configure `GOOGLE_MAPS_ANDROID_API_KEY` as an EAS environment variable available to the development build, then run `eas build --profile development --platform android`. Install that build on the device and launch the Metro server in development-client mode. Do not expect the native key from this app's config to be injected into Expo Go.

The `.env` file is ignored by Git. No live keys are stored in this repository.

## Build an APK

**CI (recommended):** the `Build Android APK` workflow (`.github/workflows/build-apk.yml`) runs on every push and pull request to `master`/`main`, and can be started manually from the Actions tab. It runs `expo prebuild`, then `./gradlew assembleRelease`, and uploads the APK as the `TripPath-apk` artifact. On pushes to the default branch it also refreshes the **Latest APK** release (`apk-latest`) on GitHub, which gives a stable download link.

Add these repository secrets (Settings → Secrets and variables → Actions) so the built app has working maps:

- `GOOGLE_MAPS_ANDROID_API_KEY`
- `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY`
- `EXPO_PUBLIC_GOOGLE_ROUTES_API_KEY`

The APK is signed with the default debug keystore, which is fine for sideloading and review but not for the Play Store. Pull requests from forks do not receive secrets, so their APK has no live maps. Restrict the Android key to `com.codenzic.trippath` and the SHA-1 of the signing keystore.

**EAS (alternative):** `eas build --profile preview --platform android` (the `preview` profile is set to produce an APK).

## Demo authentication

Login, password reset and account creation are **demos**: there is no backend, no credential check, and no account or email is created. Both modals are labelled "(demo)" and say so in their copy, and success states read "Demo complete" rather than claiming a real account exists. Connect a real auth service before presenting these flows as functional.

## Quality checks

`npm test` runs the whole suite with Jest and React Native Testing Library (`npm run test:coverage` adds a coverage report and enforces the thresholds in `jest.config.js`: 90% lines, statements and functions, 80% branches). Tests live in `tests/`, mirroring `src/`:

- **`tests/utils`**: coordinate validation, polyline decoding, auth validation, formatting, map regions, safe web-map label serialization.
- **`tests/services`**: the Places and Routes clients (request shape, response validation, HTTP and network failures, disabled-API detection, abort signals) and reverse geocoding.
- **`tests/hooks`**: `useRoute`, `usePlaceSuggestions` and `useCurrentLocation`, including debouncing, aborting superseded requests, ignoring stale responses, and permission failures.
- **`tests/features`**: login and the demo-auth modals, the location form reducer and screen (autocomplete races, saved places, swap/clear, current location, map picking, validation), and the route screen (invalid coordinates, travel modes, traffic, failures, navigation hand-off).
- **`tests/components`**: shared components and the native and web map components (native maps are mocked).

Native-only behaviour (Expo Location permission prompts, the real native map view, Google Maps hand-off, device keyboard handling) is not covered by these tests and needs a manual smoke test on a device or emulator before release.

```bash
npm test
npm run test:coverage
npm run type-check
npm run lint
npm run format:check
npm run check   # everything above
```

Run these checks locally before merging. A native iOS/Android smoke test is also required.

## Project structure

```text
src/
  app/              Expo Router routes: thin re-exports of the screens in features/
  features/
    auth/           LoginScreen, demo AuthModals
    locations/      LocationsScreen, TripFields, SuggestionList, trip form reducer, row building
    route/          RouteScreen, RouteDetails, summary / mode / step components, navigation hand-off
  hooks/            useRoute, usePlaceSuggestions, useCurrentLocation
  services/         placesApi, routesApi, geocoding (the only code that talks to Google or the OS)
  components/       shared UI (PrimaryButton, TextField, AppModal, NoticeBanner, ...)
    map/            native and .web map components, markers, Leaflet page builder
  constants/        config (URLs, keys, timings, limits), strings (all UI copy), theme, map style
  types/            shared domain types (Coordinate, SelectedPlace, RouteResult, ...)
  utils/            pure helpers (formatting, coordinates, polyline, validation)
tests/              mirrors src/, plus mocks/ and helpers
docs/               architecture, design system, screen specs, component guide, data models, standards, dependencies, navigation, testing, build and deploy (01-11) and setup notes
```

Conventions: no literals in components (strings, colors, spacing, URLs and limits come from `src/constants`); components render, hooks own async state, services own network and OS calls; utils stay pure.

## License

MIT
