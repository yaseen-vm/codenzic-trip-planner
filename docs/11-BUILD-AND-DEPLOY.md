# TripPath — Build and Deploy

> Related: [Project setup](PROJECT-SETUP.md) · [Dependencies](08-DEPENDENCIES.md) · [Testing](10-TESTING-AND-QA.md).

## 1. Environment variables

Copy `.env.example` to `.env` (ignored by Git). Never commit real values.

| Variable                            | Used by                       | Notes                                                                     |
| ----------------------------------- | ----------------------------- | ------------------------------------------------------------------------- |
| `GOOGLE_MAPS_ANDROID_API_KEY`       | `app.config.ts` at build time | Maps SDK for Android; restrict to `com.codenzic.trippath` + signing SHA-1 |
| `GOOGLE_MAPS_IOS_API_KEY`           | `app.config.ts` at build time | Maps SDK for iOS; restrict to the bundle id                               |
| `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` | `src/constants/config.ts`     | Places API (New) only. Bundled into the client                            |
| `EXPO_PUBLIC_GOOGLE_ROUTES_API_KEY` | `src/constants/config.ts`     | Routes API only. Bundled into the client                                  |

Enable billing and these APIs in Google Cloud: Maps SDK for Android, Maps SDK for iOS, Places API (New), Routes API. Use a separate key per purpose and never use a Places or Routes key as a native Maps key. `EXPO_PUBLIC_*` values can be extracted from the app: restrict them, set quotas and billing alerts, and use a backend proxy in production. Without the Places / Routes keys the app still runs: search is disabled with a notice and the route screen explains the missing configuration.

## 2. Local development

```bash
npm ci
npx expo install --check
npm start                      # quick preview in Expo Go (maps may be blank)
npx expo run:android           # build + install the native app with your Maps key
npx expo start --dev-client    # later runs
```

Changing native keys or native config (plugins, permissions) requires rebuilding the app. `src/app` is the router root; if you ever move it, restart `expo start --clear` so typed-route generation picks up the new location.

## 3. Continuous integration

### Quality (`.github/workflows/quality.yml`)

On push and pull request to `master` / `main`: `npm ci` → `npx expo install --check` → `npm run test:coverage` → `npm run type-check` → `npm run lint` → `npm run format:check`.

### Android APK (`.github/workflows/build-apk.yml`)

On push, pull request or manual dispatch: Node 22 and Java 17, `npm ci`, `npx expo prebuild --platform android`, R8 shrinking disabled (it strips a Room class WorkManager needs at startup), `./gradlew assembleRelease`, upload artifact `TripPath-apk` (30 days). On pushes it also refreshes the pre-release **Latest APK** (`apk-latest`) for a stable download link.

Repository secrets required for a working map in the built APK: `GOOGLE_MAPS_ANDROID_API_KEY`, `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY`, `EXPO_PUBLIC_GOOGLE_ROUTES_API_KEY`. Pull requests from forks do not receive secrets, so their APK has no live maps. The APK is signed with the default debug keystore: fine for sideloading and review, not for the Play Store.

## 4. EAS builds

| Profile       | Result                                  |
| ------------- | --------------------------------------- |
| `development` | Internal development client             |
| `preview`     | Internal APK (`android.buildType: apk`) |
| `production`  | Store build with `autoIncrement`        |

```bash
eas build --profile development --platform android
eas build --profile preview --platform android
```

Configure `GOOGLE_MAPS_ANDROID_API_KEY` (and the `EXPO_PUBLIC_*` keys) as EAS environment variables; the native key is not injected into Expo Go.

## 5. Release checklist

- [ ] `npm run check` is green and CI passes.
- [ ] Secrets are set and the APK build succeeded; install the APK on a device.
- [ ] Run the manual QA checklist in [Testing](10-TESTING-AND-QA.md).
- [ ] Key restrictions (app id, SHA-1, API scope) and quotas are in place.
- [ ] No credentials, keystores or build artifacts in the commit.
- [ ] For a store release: replace the debug keystore, replace demo auth with a real service, move Places / Routes calls behind a backend.
