# TripPath — Build & Deployment

> **Document:** 11 — Development Setup, Build Process & APK Generation  
> **Status:** Finalized (Pre-development)

---

## 1. Prerequisites

Before starting, ensure the following are installed and configured on your machine:

| Tool | Version | Check Command | Install |
|---|---|---|---|
| **Node.js** | 20.x LTS (minimum 18.x) | `node --version` | [nodejs.org](https://nodejs.org) |
| **npm** | 10.x (bundled with Node 20) | `npm --version` | Bundled with Node |
| **Git** | 2.x+ | `git --version` | [git-scm.com](https://git-scm.com) |
| **Expo CLI** | Latest | `npx expo --version` | Auto-installed via npx |
| **EAS CLI** | Latest | `eas --version` | `npm install -g eas-cli` |
| **Expo Account** | — | `eas whoami` | [expo.dev/signup](https://expo.dev/signup) |

> **Note:** You do NOT need Xcode or Android Studio to run the app via Expo Go. You only need them if you are doing a local native build.

---

## 2. Project Setup (Fresh Clone)

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/codenzic-trip-planner.git
cd codenzic-trip-planner

# 2. Install dependencies
npm install

# 3. Verify TypeScript setup
npm run type-check

# 4. Verify linting
npm run lint:check

# 5. Start the development server
npm start
# or equivalently:
npx expo start --clear
```

After running `npm start`, you will see a QR code in your terminal and the Expo DevTools in your browser.

---

## 3. Running on a Physical Device (Expo Go)

### Prerequisites
- Install **Expo Go** on your device:
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- Your device and development machine must be on the **same Wi-Fi network**

### Steps

**Android:**
1. Open Expo Go on your Android device
2. Tap "Scan QR code"
3. Scan the QR code from the terminal
4. App will bundle and open on your device

**iOS:**
1. Open the iOS Camera app
2. Point it at the QR code from the terminal
3. Tap the Expo Go notification banner that appears
4. App will bundle and open on your device

### Common Expo Go Issue — Network Tunnel

If the QR code doesn't connect (common on corporate or restrictive Wi-Fi):

```bash
# Use tunnel mode (slower but works on any network)
npx expo start --tunnel
```

---

## 4. Running in Emulator / Simulator

### Android Emulator

```bash
# Start Android emulator from Android Studio first, then:
npm run android
# or:
npx expo start --android
```

Requires Android Studio with an AVD (Android Virtual Device) configured. Recommended: Pixel 7 API 34.

### iOS Simulator (macOS only)

```bash
npm run ios
# or:
npx expo start --ios
```

Requires Xcode with a simulator configured. Recommended: iPhone 14 (iOS 17).

---

## 5. EAS Build Setup (APK Generation)

EAS (Expo Application Services) is the official cloud build service for Expo projects. It generates native builds without requiring Xcode or Android Studio locally.

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Log In to Expo Account

```bash
eas login
# Enter your expo.dev credentials when prompted
# Verify login:
eas whoami
```

### Step 3: Configure EAS Project

```bash
# Run this in the project root:
eas build:configure
```

This command:
- Links the project to your Expo account
- Generates a `projectId` in `app.json` under `expo.extra.eas.projectId`
- Creates or verifies `eas.json` configuration

### Step 4: Verify `eas.json`

Ensure your `eas.json` matches the configuration documented in `08-DEPENDENCIES.md`. The `preview` profile should produce a `.apk` file:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### Step 5: Generate Android APK

```bash
# Build for Android using the preview profile
eas build --platform android --profile preview

# The CLI will:
# 1. Package your project
# 2. Upload to EAS Build servers
# 3. Compile natively in the cloud
# 4. Provide a download URL when complete (~10-20 minutes)
```

**Build progress:** Monitor at [expo.dev/accounts/YOUR_USERNAME/builds](https://expo.dev)

**Download:** Once complete, you'll receive a link to download the `.apk` file directly.

### Step 6: Install APK on Android Device

```bash
# Option 1: Direct download — download APK on your Android device and open to install
# (Enable "Install from unknown sources" in Android Settings)

# Option 2: ADB install (requires Android SDK platform tools)
adb install path/to/downloaded.apk
```

---

## 6. Build Profiles Reference

| Profile | Command | Output | Intended Use |
|---|---|---|---|
| `development` | `eas build --platform android --profile development` | Debug APK (with dev client) | Internal development + debugging |
| `preview` | `eas build --platform android --profile preview` | Release APK | **Use this for assignment submission** |
| `production` | `eas build --platform android --profile production` | AAB (App Bundle) | Play Store submission only |

> **Assignment Submission:** Always use the `preview` profile. It produces a standalone `.apk` that reviewers can install without any development setup.

---

## 7. Environment Variables

**No environment variables are required for this project.** All data is mocked and there are no real API endpoints.

The only configuration item that needs updating is the Google Maps API key in `app.json` — this is required for the map to load on physical devices.

```json
// app.json — update before building
{
  "expo": {
    "plugins": [
      [
        "react-native-maps",
        {
          "googleMapsApiKey": "YOUR_ACTUAL_GOOGLE_MAPS_API_KEY"
        }
      ]
    ],
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ACTUAL_GOOGLE_MAPS_API_KEY"
        }
      }
    }
  }
}
```

### Getting a Free Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Enable **Maps SDK for Android** and **Maps SDK for iOS**
4. Create credentials → API Key
5. (Optional) Restrict the key to your app's package name for security

> For development/evaluation only, you can leave the key unrestricted. For production, always restrict by app package name and platform.

---

## 8. Common Build Issues & Fixes

### Issue: `Metro bundler fails to start`

**Symptom:** `Error: EADDRINUSE: address already in use :::8081`  
**Fix:**
```bash
# Kill the process using port 8081
npx kill-port 8081
# or on macOS/Linux:
lsof -ti:8081 | xargs kill -9
# Then restart:
npx expo start --clear
```

---

### Issue: `expo-router: No routes found`

**Symptom:** App shows "No routes" error on first render  
**Fix:** Ensure `app/index.tsx` exists and the `main` field in `package.json` is `"expo-router/entry"`:
```json
{
  "main": "expo-router/entry"
}
```

---

### Issue: `react-native-reanimated: Worklet not found`

**Symptom:** Crash with `ReanimatedError: [Reanimated] Worklet function...`  
**Fix:** Ensure `react-native-reanimated/plugin` is **last** in `babel.config.js`:
```javascript
// babel.config.js
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    // ... other plugins FIRST ...
    'react-native-reanimated/plugin', // MUST be last
  ],
};
```
Then clear cache:
```bash
npx expo start --clear
```

---

### Issue: `react-native-maps: Map shows blank/gray area`

**Symptom:** MapView renders but shows empty gray screen  
**Possible Causes & Fixes:**

1. **Missing API key:**
   - Add Google Maps API key to `app.json` as documented above
   - Rebuild (`eas build --platform android --profile preview`)

2. **API key restrictions too strict:**
   - In Google Cloud Console, check the API key isn't restricted to a different package name

3. **Maps SDK not enabled:**
   - In Google Cloud Console → Library → Enable "Maps SDK for Android"

4. **Development build (not Expo Go):**
   - `react-native-maps` requires a custom dev client or standalone build to work fully
   - Run `eas build --profile development` and install the dev client

---

### Issue: `expo-location: Permission request fails silently`

**Symptom:** `requestForegroundPermissionsAsync()` returns `denied` immediately without showing a prompt  
**Fix:** The user may have previously denied permission. Guide them:
```typescript
// Check if we should show rationale (Android)
const { status } = await Location.requestForegroundPermissionsAsync();
if (status !== 'granted') {
  Alert.alert(
    'Location Access Required',
    'Please enable location access in your device settings to use this feature.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings() },
    ]
  );
}
```

---

### Issue: EAS Build fails with `Gradle build error`

**Symptom:** Build log shows Android Gradle compilation error  
**Common Causes:**

1. **Incorrect `compileSdkVersion` / `targetSdkVersion`:**
   - Expo SDK 51 targets SDK 34. Don't override these.
   
2. **Conflicting native dependencies:**
   - Run `npx expo-doctor` to detect dependency conflicts
   - Follow suggestions to align versions

3. **Keystore issues:**
   - For `preview` builds, EAS manages the keystore automatically. Don't configure `credentials.json` unless doing local signing.

---

### Issue: TypeScript errors after `npm install`

**Symptom:** Type errors that weren't there before  
**Fix:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Verify TypeScript version matches package.json
npm list typescript
```

---

### Issue: Expo Go shows "SDK Version mismatch"

**Symptom:** "The project requests SDK 51, but the installed Expo Go supports SDK X"  
**Fix:**
```bash
# Update Expo Go on your device to the latest version
# Or use Expo Go compatible with SDK 51:
# iOS: Expo Go version 2.31.x
# Android: Expo Go version 2.31.x
```

---

## 9. Development Scripts Reference

```bash
npm start              # Start Expo dev server (interactive menu)
npm run start:clear    # Start with cleared Metro bundler cache
npm run android        # Start and open Android emulator
npm run ios            # Start and open iOS simulator
npm run lint           # Run ESLint and auto-fix fixable issues
npm run lint:check     # Run ESLint (no auto-fix, CI mode)
npm run type-check     # Run TypeScript compiler check (no emit)
npm run format         # Auto-format all files with Prettier
npm run format:check   # Check formatting (CI mode)
npm run check          # Run type-check + lint:check + format:check (full validation)
npm run build:android  # EAS build for Android (preview profile → APK)
npm run build:ios      # EAS build for iOS (preview profile)
npm run prebuild       # Generate native android/ and ios/ folders (local builds)
```

---

## 10. Submission Artifacts

When submitting for the Codenzic Innovations evaluation, provide:

| Artifact | Location | Notes |
|---|---|---|
| **GitHub Repository URL** | Public repo | All code, docs, clean history |
| **APK Download Link** | EAS Build dashboard URL | Generated with `preview` profile |
| **README** | `README.md` in repo root | Setup instructions, screen descriptions |
| **Documentation** | `docs/` directory | All 12 documentation files |

### APK Download URL

After running `eas build --platform android --profile preview`, the EAS dashboard provides a temporary download URL (valid for 30 days). Include this URL directly in your README's "Download" section.

Example format:
```
https://expo.dev/artifacts/eas/XXXXXXXXXXXXXXXXXXXXXXXXXX.apk
```

---

*See `10-TESTING-AND-QA.md` for the full pre-submission QA checklist. See `README.md` for the public-facing project overview.*
