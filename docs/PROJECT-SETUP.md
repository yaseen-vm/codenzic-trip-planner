# Project Setup

Local workflow for TripPath. Product and architecture detail is in [AGENT.md](../AGENT.md) and the numbered documents in this directory.

## Prerequisites

- Node.js 20 LTS or newer (npm included; CI uses Node 22).
- Android Studio and an emulator or device for native map testing. A black map can be an Expo Go limitation for some SDK / `react-native-maps` combinations; use a development build with this app's own native Maps SDK key to diagnose and verify tile rendering.
- Google Cloud keys (see [Build and deploy](11-BUILD-AND-DEPLOY.md)): native Maps SDK keys, a Places API (New) key and a Routes API key. The app runs without them, with search and routing disabled and explained on screen.

## Local setup

1. Clone the repository and enter its directory.
2. `npm ci` (or `npm install` if you are intentionally updating dependencies).
3. Copy `.env.example` to `.env` and fill in your own keys. Never commit `.env`.
4. For non-map work, `npm start` and Expo Go give a quick preview. For Google Maps, set `GOOGLE_MAPS_ANDROID_API_KEY` in `.env`, run `npx expo run:android` to build and install the native app, then start Metro with `npx expo start --dev-client`. Do not use Expo Go as the acceptance test for the native Maps key.
5. Before opening a PR run `npm run check`.

## Current implementation status

Implemented: login with validation and in-app forgot-password / create-account modals (demo), Set locations (saved places, Google Places autocomplete, Use current, Pick on map), and Route (map, Routes API polyline, ETA, traffic, turn list, hand-off to Google Maps), plus an Android APK build in CI.

Not implemented: real authentication (the modals are demo-only), persistence, a backend proxy for the Google web-service keys. See "Assignment coverage" in [README.md](../README.md).

## Quality checks

| Command                 | Purpose                           |
| ----------------------- | --------------------------------- |
| `npm test`              | Jest suite                        |
| `npm run test:coverage` | Coverage with enforced thresholds |
| `npm run type-check`    | TypeScript                        |
| `npm run lint`          | ESLint                            |
| `npm run format:check`  | Prettier                          |
| `npm run check`         | All of the above                  |

CI installs the committed lockfile and runs Expo dependency compatibility, tests with coverage, TypeScript, lint and formatting checks.

## Configuration and secrets

- `.env.example` documents variable names, not credentials.
- `EXPO_PUBLIC_*` values are bundled into the client and are **not secrets**. Restrict their API scope, apply quotas, and use a backend proxy in production.
- Use dedicated `GOOGLE_MAPS_ANDROID_API_KEY` and `GOOGLE_MAPS_IOS_API_KEY` values for the native Maps SDKs; do not reuse Places or Routes keys.
- For a black map, inspect Android logcat for Maps authorization errors and confirm the package name and signing SHA-1 match the key restriction. Do not remove restrictions as a committed workaround.
- Keep `.env`, keystores, signing credentials, generated `android/`, APK / AAB files and `coverage/` out of Git.

## Troubleshooting

- **`tsc` reports route paths like `/../src/app/index`:** a dev server started before `src/app` existed generated stale typed routes. Stop it, delete `.expo/types/router.d.ts` and restart with `npx expo start --clear`.
- **Search shows "EXPO_PUBLIC_GOOGLE_PLACES_API_KEY" notice:** the key is missing from `.env`; restart Metro after adding it.
- **Route shows "Configuration required" / "API setup required":** missing or restricted Routes key, or Routes API not enabled.

## Dependency and SDK policy

Use `npx expo install` for Expo and native-module dependencies. Upgrade the SDK deliberately: align React Native and native modules, regenerate the lockfile, run `npm run check`, and smoke-test Android and iOS before merging.
