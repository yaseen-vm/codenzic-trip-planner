# TripPath

A React Native and Expo trip-planning app for Android and iOS, built for the Codenzic Innovations technical evaluation.

## Current implementation

- Login screen styled to match the supplied reference (authentication is still a demo).
- Google Places (New) autocomplete for pickup and destination, with coordinates retained from selected places.
- Native Google Maps map view with pickup/drop-off markers and a Google Routes API road polyline.
- Route distance, duration, turn instructions, drive/two-wheeler/walk mode selection, and a hand-off to Google Maps for live turn-by-turn navigation.
- Responsive layouts, safe-area handling, and basic input validation.

## Tech stack

- Expo SDK 57 and Expo Router
- React Native 0.86 and TypeScript
- `react-native-maps`
- Google Places API (New) and Routes API
- ESLint and Prettier

## Prerequisites

- Node.js 20 LTS
- npm
- Expo Go for initial map preview, or a development build for native Google Maps configuration

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
5. Rebuild the native app after changing native Maps SDK keys or config:
   ```bash
   npx expo run:ios
   npx expo run:android
   ```
   Google Maps provider configuration on iOS requires a native build; Expo Go may use its bundled provider rather than your configured Google Maps SDK.

The `.env` file is ignored by Git. No live keys are stored in this repository.

## Quality checks

```bash
npm run type-check
npm run lint
npm run format:check
npm run check
```

Run these checks locally before merging. A native iOS/Android smoke test is also required; these checks have not been run as part of the GitHub edits.

## Project structure

```text
app/
  _layout.tsx
  index.tsx
  login.tsx
  locations.tsx
  route.tsx
docs/
```

## License

MIT
