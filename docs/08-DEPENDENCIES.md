# TripPath — Dependencies

> **Status note:** this document is the original pre-development plan. The shipped app differs (light theme with orange accent, flat Expo Router files in `app/`, local component state, no auth context, Google Places/Routes instead of mock data). The current state is in [README.md](../README.md) (`./README.md` for this file if at repo root) and [PROJECT-SETUP.md](PROJECT-SETUP.md).

> **Document:** 08 — Dependency Manifest & Configuration  
> **Status:** Finalized (Pre-development)

---

## 1. Core Dependencies

### Production Dependencies

| Package        | Version   | Purpose                               | Justification                                                                                                                                    |
| -------------- | --------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `expo`         | `~51.0.0` | Expo SDK — managed workflow toolchain | Industry standard for React Native development. Provides build infrastructure, OTA updates, and native module management.                        |
| `react`        | `18.2.0`  | UI library                            | Peer dependency of React Native.                                                                                                                 |
| `react-native` | `0.74.x`  | Cross-platform mobile framework       | Managed by Expo SDK 51 — do not upgrade independently.                                                                                           |
| `expo-router`  | `~3.5.0`  | File-based navigation & routing       | v3 provides full TypeScript support, typed routes, and seamless integration with React Navigation v6. Eliminates manual navigator configuration. |
| `typescript`   | `~5.3.0`  | Static typing                         | TypeScript 5.3 adds features used in the codebase (const type params, etc.).                                                                     |

---

## 2. Navigation

| Package                          | Version   | Purpose                    | Notes                                                                                                   |
| -------------------------------- | --------- | -------------------------- | ------------------------------------------------------------------------------------------------------- |
| `@react-navigation/native`       | `^6.1.x`  | Navigation primitives      | **Included automatically via expo-router** — do not install separately unless adding custom navigators. |
| `@react-navigation/native-stack` | `^6.9.x`  | Native stack navigator     | **Included via expo-router**. Provides native iOS/Android transition animations.                        |
| `react-native-safe-area-context` | `4.x`     | Safe area insets           | **Included via expo-router**. Required by all React Navigation layouts.                                 |
| `react-native-screens`           | `~3.31.x` | Native screen optimization | **Included via expo-router**. Reduces memory usage by using native screen containers.                   |

---

## 3. UI & Styling

| Package              | Version   | Purpose                                | Justification                                                                                  |
| -------------------- | --------- | -------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `@expo/vector-icons` | `^14.0.0` | Icon library (Ionicons, MaterialIcons) | Built into Expo SDK — zero additional install. Provides 30,000+ icons across 10 icon families. |
| `expo-font`          | `~12.0.0` | Custom font loading                    | Required to load Inter font files. Integrates with Expo's asset system.                        |
| `expo-splash-screen` | `~0.27.0` | Splash screen management               | Prevents white flash on startup. Used to delay hide until fonts and auth state are loaded.     |
| `expo-status-bar`    | `~1.12.0` | Status bar styling                     | Simple API for light/dark status bar on both platforms.                                        |

---

## 4. Maps

| Package             | Version   | Purpose                             | Justification                                                                                                                 |
| ------------------- | --------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `react-native-maps` | `~1.14.0` | Interactive map, markers, polylines | The de-facto standard for maps in React Native. Expo SDK 51 includes a config plugin for it — no manual native configuration. |

### react-native-maps Configuration Notes

```json
// app.json — required plugin configuration
{
  "expo": {
    "plugins": [
      [
        "react-native-maps",
        {
          "googleMapsApiKey": "YOUR_API_KEY_HERE"
        }
      ]
    ]
  }
}
```

> **For this project:** Since all data is mocked, you can use a development-only API key with billing disabled. The map will render with a "Development Key" watermark but is fully functional.

**Android additional config** (`app.json`):

```json
{
  "android": {
    "config": {
      "googleMaps": {
        "apiKey": "YOUR_ANDROID_API_KEY"
      }
    }
  }
}
```

---

## 5. Location

| Package         | Version   | Purpose                               | Justification                                                                                    |
| --------------- | --------- | ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `expo-location` | `~17.0.0` | GPS coordinates, location permissions | Official Expo location module. Handles permission flows on both platforms with a consistent API. |

### expo-location Configuration

```json
// app.json — required permissions
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "TripPath uses your location to set your starting point for trip planning."
      }
    },
    "android": {
      "permissions": ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"]
    }
  }
}
```

---

## 6. Storage

| Package                                     | Version   | Purpose                      | Justification                                                                                             |
| ------------------------------------------- | --------- | ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| `@react-native-async-storage/async-storage` | `~1.23.0` | Persistent key-value storage | The community standard for simple persistence in React Native. Used for auth token and user data storage. |

---

## 7. Forms & Validation

| Package               | Version   | Purpose                                           | Justification                                                                                             |
| --------------------- | --------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `react-hook-form`     | `^7.51.0` | Performant form state management                  | Significantly outperforms Formik in renders and bundle size. Integrates with zod via resolver.            |
| `zod`                 | `^3.23.0` | Schema-based validation with TypeScript inference | Best-in-class runtime validation library. `z.infer<typeof schema>` eliminates duplicate type definitions. |
| `@hookform/resolvers` | `^3.3.4`  | Zod resolver for react-hook-form                  | Connects zod schemas to react-hook-form validation.                                                       |

---

## 8. Animations & Gestures

| Package                        | Version   | Purpose              | Justification                                                                                                                                               |
| ------------------------------ | --------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `react-native-reanimated`      | `~3.10.0` | UI-thread animations | **Included in Expo SDK 51.** Runs animations on the native UI thread — guarantees 60fps even under heavy JS load. Required for production-grade animations. |
| `react-native-gesture-handler` | `~2.16.0` | Gesture recognition  | **Included in Expo SDK 51.** Required by React Navigation and used for bottom sheet drag gesture.                                                           |

### Reanimated Babel Config (Critical)

```javascript
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Reanimated MUST be last
      'react-native-reanimated/plugin',
    ],
  };
};
```

> ⚠️ **Warning:** `react-native-reanimated/plugin` MUST be the last entry in the `plugins` array. Incorrect ordering causes subtle runtime errors.

---

## 9. Development Dependencies

| Package                            | Version            | Purpose                                           |
| ---------------------------------- | ------------------ | ------------------------------------------------- |
| `@types/react`                     | `~18.2.0`          | React TypeScript types                            |
| `@types/react-native`              | (via react-native) | React Native TypeScript types — included with RN  |
| `eslint`                           | `^8.x`             | JavaScript/TypeScript linter                      |
| `eslint-config-expo`               | `~7.0.0`           | Expo-maintained ESLint config base                |
| `@typescript-eslint/eslint-plugin` | `^7.x`             | TypeScript ESLint rules                           |
| `@typescript-eslint/parser`        | `^7.x`             | TypeScript parser for ESLint                      |
| `eslint-plugin-react-hooks`        | `^4.6.0`           | Hooks linting rules                               |
| `eslint-plugin-import`             | `^2.29.0`          | Import order and cycle detection                  |
| `eslint-config-prettier`           | `^9.x`             | Disables ESLint rules that conflict with Prettier |
| `prettier`                         | `^3.x`             | Code formatter                                    |

---

## 10. Complete `package.json`

```json
{
  "name": "codenzic-trip-planner",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "description": "TripPath — A trip planner mobile app. Codenzic Innovations technical assignment.",
  "scripts": {
    "start": "expo start",
    "start:clear": "expo start --clear",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build:android": "eas build --platform android --profile preview",
    "build:ios": "eas build --platform ios --profile preview",
    "build:development": "eas build --platform android --profile development",
    "lint": "eslint . --ext .ts,.tsx --fix",
    "lint:check": "eslint . --ext .ts,.tsx",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,json,md}\"",
    "check": "npm run type-check && npm run lint:check && npm run format:check",
    "prebuild": "expo prebuild --clean",
    "prebuild:android": "expo prebuild --platform android --clean"
  },
  "dependencies": {
    "@expo/vector-icons": "^14.0.2",
    "@hookform/resolvers": "^3.3.4",
    "@react-native-async-storage/async-storage": "~1.23.1",
    "expo": "~51.0.28",
    "expo-font": "~12.0.10",
    "expo-linking": "~6.3.1",
    "expo-location": "~17.0.1",
    "expo-router": "~3.5.23",
    "expo-splash-screen": "~0.27.5",
    "expo-status-bar": "~1.12.1",
    "react": "18.2.0",
    "react-hook-form": "^7.52.1",
    "react-native": "0.74.5",
    "react-native-gesture-handler": "~2.16.1",
    "react-native-maps": "1.14.0",
    "react-native-reanimated": "~3.10.1",
    "react-native-safe-area-context": "4.10.5",
    "react-native-screens": "~3.31.1",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/react": "~18.2.79",
    "@typescript-eslint/eslint-plugin": "^7.14.1",
    "@typescript-eslint/parser": "^7.14.1",
    "eslint": "^8.57.0",
    "eslint-config-expo": "~7.0.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-import": "^2.29.1",
    "eslint-plugin-react-hooks": "^4.6.2",
    "prettier": "^3.3.2",
    "typescript": "~5.3.3"
  },
  "private": true
}
```

---

## 11. `app.json` Configuration

```json
{
  "expo": {
    "name": "TripPath",
    "slug": "trippath",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "trippath",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0A0E1A"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.codenzic.trippath",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "TripPath uses your location to set your starting point for trip planning.",
        "UIBackgroundModes": []
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#0A0E1A"
      },
      "package": "com.codenzic.trippath",
      "permissions": ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"],
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_ANDROID_API_KEY"
        }
      }
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-font",
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow TripPath to use your location.",
          "locationWhenInUsePermission": "TripPath uses your location to set your starting point."
        }
      ],
      [
        "react-native-maps",
        {
          "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "eas": {
        "projectId": "YOUR_EAS_PROJECT_ID"
      }
    }
  }
}
```

---

## 12. `eas.json` Configuration

```json
{
  "cli": {
    "version": ">= 10.0.0",
    "appVersionSource": "local"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug",
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      },
      "env": {
        "EXPO_PUBLIC_APP_ENV": "development"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": false
      },
      "env": {
        "EXPO_PUBLIC_APP_ENV": "preview"
      }
    },
    "production": {
      "autoIncrement": true,
      "android": {
        "buildType": "app-bundle"
      },
      "env": {
        "EXPO_PUBLIC_APP_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### EAS Profile Usage

| Profile       | Command                                              | Output           | Use When                                      |
| ------------- | ---------------------------------------------------- | ---------------- | --------------------------------------------- |
| `development` | `eas build --platform android --profile development` | Debug APK        | Running on physical device with dev client    |
| `preview`     | `eas build --platform android --profile preview`     | Release APK      | Sharing with reviewers, assignment submission |
| `production`  | `eas build --platform android --profile production`  | AAB (App Bundle) | Play Store submission                         |

---

## 13. Dependency Upgrade Policy

| Category                            | Policy                                                                                                                                                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Expo SDK                            | Only upgrade to a new major version when EAS Build requires it or when a critical fix is needed. Follow the [Expo upgrade guide](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/). |
| React / React Native                | **Never** upgrade independently of Expo SDK. The Expo SDK pins compatible RN versions.                                                                                                            |
| Third-party packages                | Minor/patch upgrades: check changelog for breaking changes. `npm audit` weekly.                                                                                                                   |
| Dev dependencies (ESLint, Prettier) | Can upgrade freely — no production impact.                                                                                                                                                        |

---

_See `11-BUILD-AND-DEPLOY.md` for the step-by-step build and release process._
