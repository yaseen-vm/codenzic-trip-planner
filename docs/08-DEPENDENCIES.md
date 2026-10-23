# TripPath — Dependencies

> Mirrors `package.json`. Use `npx expo install <pkg>` for anything with native code so versions stay compatible with Expo SDK 58, and run `npx expo install --check` after changes (CI does).

## 1. Runtime dependencies

| Package                                        | Version         | Purpose                                              |
| ---------------------------------------------- | --------------- | ---------------------------------------------------- |
| `expo`                                         | ^58.0.0         | Expo SDK                                             |
| `react` / `react-dom`                          | 19.3.0          | React (DOM only for the web build)                   |
| `react-native`                                 | 0.88.0          | Native runtime                                       |
| `react-native-web`                             | ~0.21.0         | Web target                                           |
| `expo-router`                                  | ~58.0.25        | File-based navigation, typed routes                  |
| `react-native-screens`                         | ~4.30.0         | Native screens for the stack navigator               |
| `react-native-safe-area-context`               | ~5.10.1         | Safe-area insets and provider                        |
| `expo-linking`                                 | ~58.0.14        | Deep-link support required by Expo Router            |
| `expo-status-bar`                              | ~58.0.4         | Status bar style                                     |
| `expo-constants`                               | ~58.0.13        | Detect Expo Go to choose the map provider            |
| `expo-font` + `@expo-google-fonts/nunito-sans` | ~58.0.9 / 0.4.2 | Nunito Sans typography                               |
| `expo-location`                                | ~58.0.18        | Permission, current position, reverse geocoding      |
| `react-native-maps`                            | 1.29.11         | Native Google Maps (route map and map picker)        |
| `react-native-svg`                             | 15.16.0         | Logo and map pins                                    |
| `lucide-react-native`                          | ^1.59.0         | Icons                                                |
| `expo-dev-client`                              | ~58.0.14        | Development build with the app's own native Maps key |

There is deliberately no state library, form library, HTTP client or storage package: local state and `fetch` are enough for this flow.

## 2. Development dependencies

| Package                                | Purpose                                                         |
| -------------------------------------- | --------------------------------------------------------------- |
| `typescript` ~6.0.3, `@types/react`    | Type checking                                                   |
| `eslint` ^9.25, `eslint-config-expo`   | Linting                                                         |
| `prettier` ^3.6                        | Formatting                                                      |
| `jest` 30.5.2, `jest-expo` 58.0.12     | Test runner and Expo preset                                     |
| `@react-native/jest-preset`            | Preset used by `jest-expo` (pinned to the React Native version) |
| `@testing-library/react-native` 14.1.0 | Rendering and querying components and hooks                     |
| `test-renderer`                        | Renderer used by Testing Library 14                             |
| `react-server-dom-webpack`             | Peer dependency required by Expo Router                         |
| `@types/jest`                          | Jest globals for TypeScript                                     |

## 3. Configuration files

| File               | Role                                                                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `app.json`         | Name, slug, scheme `trippath`, icons, `expo-router` and `expo-location` plugins, `typedRoutes`, bundle ids `com.codenzic.trippath` |
| `app.config.ts`    | Injects `GOOGLE_MAPS_ANDROID_API_KEY` / `GOOGLE_MAPS_IOS_API_KEY` into the `react-native-maps` plugin and native config            |
| `eas.json`         | `development` (dev client), `preview` (APK), `production` profiles                                                                 |
| `metro.config.js`  | Disables worker threads and limits workers to 2 (avoids out-of-memory crashes on Windows)                                          |
| `tsconfig.json`    | Extends `expo/tsconfig.base`; strict, `noUncheckedIndexedAccess`                                                                   |
| `jest.config.js`   | `jest-expo` preset, test match `tests/**/*.test.{ts,tsx}`, coverage rules and thresholds                                           |
| `eslint.config.js` | Flat config on `eslint-config-expo`; ignores `dist`, `build`, `coverage`                                                           |
| `.prettierrc.json` | Formatting rules                                                                                                                   |
| `.env.example`     | Names of the four Google keys (no values)                                                                                          |

## 4. Native configuration notes

- **Location:** the `expo-location` plugin sets the when-in-use permission text ("TripPath uses your location to set your pickup point."). Adding or changing it requires rebuilding the dev client.
- **Maps keys:** native Maps SDK keys are separate from the Places / Routes keys and are applied at prebuild / build time, so changing them needs a rebuild. Expo Go is not valid for verifying them.
- **Expo Go on iOS** has no Google Maps SDK; `mapConfig.ts` leaves the provider undefined there so the map still renders.

## 5. Upgrade policy

Upgrade the Expo SDK deliberately: bump `expo`, run `npx expo install --fix`, regenerate the lockfile, run `npm run check`, then smoke-test Android and iOS. Do not bump React Native or native modules independently of the SDK.
