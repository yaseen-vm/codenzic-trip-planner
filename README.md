# TripPath

A trip-planning app for Android and iOS built with React Native and Expo for the Codenzic Innovations technical evaluation. Log in, choose a pickup and drop-off, see the route on a map with duration, distance, arrival time, traffic and turn-by-turn steps, then hand the trip to Google Maps for live navigation.

## Features

- **Login** – email and password with inline validation, show/hide password, and in-app "Forgot password?" and "Create an account" flows. Authentication is a **demo** (no backend; nothing is checked or created).
- **Set locations** – pickup and drop-off fields with swap and clear, saved places, live Google Places (New) autocomplete, **Use current** (location permission + reverse geocoding) and **Pick on map** (full-screen map with a centre pin).
- **Route** – Google Map with pickup/destination markers and the road polyline, duration, distance and arrival time, Drive / Ride / Walk modes, traffic warning, turn-by-turn list, satellite toggle, and **Start navigation** (opens Google Maps).
- **Robust states** – invalid route parameters, missing API keys, a disabled API, HTTP and network errors, denied location permission and aborted/superseded requests are all handled and shown explicitly.
- **Web** – runs in the browser with a Leaflet route map and a simplified map picker.

## Tech stack

| Area        | Choice                                                                |
| ----------- | --------------------------------------------------------------------- |
| Framework   | Expo SDK 58, React Native 0.88, React 19, TypeScript (strict)         |
| Navigation  | Expo Router (file-based, typed routes)                                |
| Maps / APIs | `react-native-maps`, Google Places API (New), Google Routes API       |
| Device      | `expo-location`                                                       |
| UI          | `lucide-react-native` icons, `react-native-svg`, Nunito Sans          |
| Quality     | Jest + React Native Testing Library, ESLint, Prettier, GitHub Actions |

## Prerequisites

- Node.js 20 LTS or newer (CI uses Node 22) and npm
- For native maps: Android Studio with an emulator or device (and Xcode for iOS). Expo Go can show blank Google Maps tiles with some SDK / `react-native-maps` combinations, so use a development build to verify the app's own native Maps key.
- Google Cloud API keys (see below). The app still runs without them: search is disabled with a notice and the route screen explains the missing configuration.

## Getting started

```bash
git clone https://github.com/yaseen-vm/codenzic-trip-planner.git
cd codenzic-trip-planner
npm ci
cp .env.example .env     # then fill in your own keys
npx expo install --check
npm start
```

Press `a` for Android, `i` for iOS, or `w` for web in the Expo CLI. For the real native map, build a development app instead of using Expo Go:

```bash
npx expo run:android          # first time, or after changing native keys / config
npx expo start --dev-client   # later runs
```

## Google Maps, Places and Routes setup

1. In Google Cloud, enable billing and enable **Maps SDK for Android**, **Maps SDK for iOS**, **Places API (New)** and **Routes API**.
2. Create separate keys and put them in `.env` (never commit it):

   | Variable                            | Purpose                                                                               |
   | ----------------------------------- | ------------------------------------------------------------------------------------- |
   | `GOOGLE_MAPS_ANDROID_API_KEY`       | Native Maps SDK for Android. Restrict to `com.codenzic.trippath` + your signing SHA-1 |
   | `GOOGLE_MAPS_IOS_API_KEY`           | Native Maps SDK for iOS. Restrict to bundle id `com.codenzic.trippath`                |
   | `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` | Places API (New) only                                                                 |
   | `EXPO_PUBLIC_GOOGLE_ROUTES_API_KEY` | Routes API only                                                                       |

3. **Security:** `EXPO_PUBLIC_*` values are embedded in the app and can be extracted. Restrict the Places and Routes keys to their APIs, set quotas and billing alerts, and use a backend proxy in production. Never use a Places or Routes key as a native Maps key.
4. Changing native keys or native config requires rebuilding the app. With EAS, set `GOOGLE_MAPS_ANDROID_API_KEY` as an EAS environment variable and run `eas build --profile development --platform android`.

## Scripts

| Command                   | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| `npm start`               | Start the Expo dev server                              |
| `npm run android` / `ios` | Build and run the native app                           |
| `npm run web`             | Run in the browser                                     |
| `npm test`                | Run the Jest suite                                     |
| `npm run test:coverage`   | Run with coverage and enforce the thresholds           |
| `npm run type-check`      | TypeScript (`tsc --noEmit`)                            |
| `npm run lint`            | ESLint                                                 |
| `npm run format`          | Prettier (write)                                       |
| `npm run check`           | Tests with coverage, type-check, lint and format check |

## Testing

About 350 tests mirror `src/` under `tests/`: pure utils (validation, polyline, formatting), the Places and Routes services (request shape, malformed bodies, HTTP / network errors, abort), hooks (debounce, race conditions, stale responses, permission failures), the location-form reducer, and the login, locations and route screens. Coverage is enforced at 90% lines / statements / functions and 80% branches.

Native-only behaviour (permission prompts, the real map view, Google Maps hand-off, keyboard handling) is not covered by these tests; do a manual smoke test on a device or emulator before release. The checklist is in [docs/10-TESTING-AND-QA.md](docs/10-TESTING-AND-QA.md).

## Building an APK

**CI (recommended):** the `Build Android APK` workflow (`.github/workflows/build-apk.yml`) runs on every push and pull request to `master` / `main` and can be started manually from the Actions tab. It runs `expo prebuild` and `./gradlew assembleRelease`, uploads the APK as the `TripPath-apk` artifact, and on pushes refreshes the **Latest APK** release (`apk-latest`) for a stable download link.

Add these repository secrets (Settings → Secrets and variables → Actions) so the built app has working maps: `GOOGLE_MAPS_ANDROID_API_KEY`, `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY`, `EXPO_PUBLIC_GOOGLE_ROUTES_API_KEY`. Pull requests from forks do not receive secrets, so their APK has no live maps. The APK is signed with the debug keystore: fine for sideloading and review, not for the Play Store.

**EAS (alternative):** `eas build --profile preview --platform android` produces an APK.

## Project structure

```text
src/
  app/              Expo Router routes: thin re-exports of the screens in features/
  features/
    auth/           LoginScreen, demo AuthModals
    locations/      LocationsScreen, TripFields, SuggestionList, trip form reducer, row building
    route/          RouteScreen, RouteDetails, summary / mode / step components, navigation hand-off
  hooks/            useRoute, usePlaceSuggestions, useCurrentLocation
  services/         placesApi, routesApi, geocoding (the only code that does network / OS I/O)
  components/       shared UI (PrimaryButton, TextField, AppModal, NoticeBanner, ...)
    map/            native and .web map components, markers, Leaflet page builder
  constants/        config (URLs, keys, timings, limits), strings (all UI copy), theme, map style
  types/            shared domain types (Coordinate, SelectedPlace, RouteResult, ...)
  utils/            pure helpers (formatting, coordinates, polyline, validation)
tests/              mirrors src/, plus mocks/ and helpers
docs/               numbered guides (01–11) and project setup
```

Conventions: no literals in components (copy, colors, spacing, URLs and limits come from `src/constants`); components render, hooks own async state, services own network and OS calls, utils stay pure.

## Documentation

Start with [AGENT.md](AGENT.md), then the guides in [`docs/`](docs): [overview](docs/01-PROJECT-OVERVIEW.md), [architecture](docs/02-ARCHITECTURE.md), [design system](docs/03-DESIGN-SYSTEM.md), [screen specs](docs/04-SCREEN-SPECS.md), [components](docs/05-COMPONENT-GUIDE.md), [data models](docs/06-DATA-MODELS.md), [coding standards](docs/07-CODING-STANDARDS.md), [dependencies](docs/08-DEPENDENCIES.md), [navigation](docs/09-NAVIGATION-FLOW.md), [testing and QA](docs/10-TESTING-AND-QA.md), [build and deploy](docs/11-BUILD-AND-DEPLOY.md) and [project setup](docs/PROJECT-SETUP.md). Contribution rules are in [CONTRIBUTING.md](CONTRIBUTING.md).

## Assignment coverage

Status against the Codenzic brief: ✅ done · ⚠️ partial · ❌ not done.

| Requirement                                                                   | Status | Notes                                                                                                                                                   | Where                                                          |
| ----------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **1. Login** – email/password, validation, login, create account              | ✅     | Validated fields, show/hide password, "Forgot password?" and "Create an account" modals. Authentication is a demo: no backend                           | `src/features/auth/`                                           |
| **2. Set Locations** – start/destination, current vs manual, suggestions list | ✅     | Swap/clear, saved places, Google Places autocomplete, Use current, Pick on map. "Next" explains what is missing or wrong (incomplete, identical places) | `src/features/locations/`, `src/components/map/MapPicker.tsx`  |
| **3. Trip Ready** – selected trip info, proceed action                        | ✅     | In the Figma design this is the Set Locations screen with the drop-off active, so there is no separate screen; "Next" proceeds to the route             | `src/features/locations/`, `src/features/route/`               |
| **4. Route View** – map, ETA, route info, start navigation                    | ✅     | Markers, polyline, duration, distance, arrival, modes, traffic, steps, satellite toggle, hand-off to Google Maps. Web uses a Leaflet map                | `src/features/route/`, `src/components/map/RouteMap(.web).tsx` |

| Technical expectation                  | Status | Notes                                                                                                        |
| -------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------ |
| React Native + Expo                    | ✅     | Expo SDK 58, React Native 0.88, TypeScript                                                                   |
| Proper navigation                      | ✅     | Expo Router stack: `/` → `/login` → `/locations` → `/route`; route params carry the places                   |
| Responsive UI matching Figma           | ✅     | Shared tokens in `src/constants/theme.ts`, Nunito Sans, safe-area handling; matched by hand                  |
| Component-based, reusable architecture | ✅     | Feature folders, shared components, hooks, services, pure utils. See [Architecture](docs/02-ARCHITECTURE.md) |
| Application state                      | ✅     | Local state per screen (a pure reducer for the location form) and router params; no global store needed      |
| Basic form validation                  | ✅     | Login, sign-up and location validation                                                                       |
| Mock/static data                       | ✅     | Saved places are static; routes and places use Google APIs when keys are configured                          |
| Clean code                             | ✅     | Strict TypeScript, ESLint, Prettier, no hardcoded literals in components, tests with enforced coverage, CI   |

| Deliverable                    | Status                                                                                         |
| ------------------------------ | ---------------------------------------------------------------------------------------------- |
| GitHub repository              | ✅                                                                                             |
| README with setup instructions | ✅ (this file)                                                                                 |
| APK                            | ✅ built by CI (`build-apk.yml`); download from the Actions artifact or the Latest APK release |

## Known limitations

1. Authentication is a demo; connect a real auth service before presenting those flows as functional.
2. `EXPO_PUBLIC_*` keys ship in the client bundle; use restricted keys and a backend proxy for production.
3. Native checks of Use current, Pick on map and the modals have not been run on a device/emulator in this repository's history; rebuild the dev client (`npx expo run:android`) when native config changes.

## License

MIT
