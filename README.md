# TripPath

<div align="center">

### 🗺️ Your journey starts here.

A sleek, dark-themed trip planner mobile app built with React Native & Expo.

![React Native](https://img.shields.io/badge/React_Native-0.74-61DAFB?style=flat-square&logo=react)
![Expo](https://img.shields.io/badge/Expo-SDK_51-000020?style=flat-square&logo=expo)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript)
![Platform](https://img.shields.io/badge/Platform-Android_|_iOS-lightgrey?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**Built for the Codenzic Innovations React Native Technical Evaluation**

</div>

---

## 📸 Screenshots

> *Screenshots will be added after the first complete build.*

| Login | Set Locations | Trip Ready | Route View |
|---|---|---|---|
| *(Coming soon)* | *(Coming soon)* | *(Coming soon)* | *(Coming soon)* |

---

## ✨ Features

- 🔐 **Email / Password Authentication** — Form validation with `react-hook-form` + `zod`, session persistence via AsyncStorage
- 📍 **Location Selection** — Search and select start/destination from mock suggestions or use device GPS
- 🔄 **Location Swap** — Instantly swap From and To locations
- 🗺️ **Route Visualization** — Full-screen dark-styled interactive map with route polyline and location markers
- 📊 **Trip Summary** — Estimated distance and travel time before confirming the route
- 🧭 **Start Navigation** — Hands off to the device's native maps application
- 💡 **Professional Dark UI** — Navy/blue design system, fluid animations, 60fps

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React Native 0.74 + Expo SDK 51 |
| **Navigation** | Expo Router v3 (file-based, wraps React Navigation v6) |
| **Language** | TypeScript 5.3 (strict mode) |
| **Maps** | react-native-maps 1.14 |
| **Location** | expo-location 17 |
| **Forms** | react-hook-form 7 + zod 3 |
| **Animations** | react-native-reanimated 3 |
| **Storage** | @react-native-async-storage/async-storage |
| **Icons** | @expo/vector-icons (Ionicons) |
| **State** | React Context API |

---

## 📋 Prerequisites

Before running the project locally, ensure you have:

- **Node.js** `>= 18.x` ([Download](https://nodejs.org))
- **npm** `>= 9.x` (bundled with Node)
- **Expo Go** app on your physical device
  - [Android (Play Store)](https://play.google.com/store/apps/details?id=host.exp.exponent)
  - [iOS (App Store)](https://apps.apple.com/app/expo-go/id982107779)
- A Google Maps API Key (for map to render on device — see setup below)

---

## 🚀 Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/codenzic-trip-planner.git

# 2. Navigate to the project directory
cd codenzic-trip-planner

# 3. Install dependencies
npm install
```

---

## ▶️ Running the App

### On Physical Device (Recommended)

```bash
# Start the Expo development server
npm start
```

Then:
- **Android:** Open Expo Go → Scan the QR code from your terminal
- **iOS:** Open Camera → Scan the QR code → Tap the Expo Go banner

> If you're on a restricted network, use `npm start -- --tunnel` to use a public tunnel.

### On Emulator / Simulator

```bash
# Android (requires Android Studio + AVD)
npm run android

# iOS (requires Xcode — macOS only)
npm run ios
```

---

## 🔑 Google Maps API Key

The Route View screen requires a Google Maps API key for the map to render on physical devices.

1. Get a free key from [Google Cloud Console](https://console.cloud.google.com) (enable Maps SDK for Android/iOS)
2. Update `app.json`:

```json
{
  "expo": {
    "plugins": [
      ["react-native-maps", { "googleMapsApiKey": "YOUR_KEY_HERE" }]
    ],
    "android": {
      "config": {
        "googleMaps": { "apiKey": "YOUR_KEY_HERE" }
      }
    }
  }
}
```

> Without an API key, the map may show as a blank gray screen on physical devices. The Expo Go development environment may work without a key in some configurations.

---

## 📁 Project Structure

```
codenzic-trip-planner/
├── app/                    # Expo Router screens & layouts
│   ├── _layout.tsx         # Root layout + auth guard
│   ├── (auth)/login.tsx    # Login screen
│   └── (app)/              # Authenticated screens
│       ├── set-locations.tsx
│       ├── trip-ready.tsx
│       └── route-view.tsx
├── components/             # Shared UI components
│   ├── ui/                 # Button, Input, Card, Badge
│   ├── map/                # MapView, RoutePolyline
│   ├── location/           # LocationItem, LocationSearchBar
│   └── trip/               # TripSummaryCard, RouteInfoPanel
├── constants/              # Colors, typography, spacing, mock data
├── context/                # AuthContext, TripContext
├── hooks/                  # useAuth, useLocation, useTrip
├── types/                  # TypeScript interfaces (barrel: index.ts)
├── utils/                  # Pure helper functions, validation schemas
└── docs/                   # Engineering documentation (12 files)
```

---

## 📱 Screen Descriptions

### 1. Login Screen (`/(auth)/login`)

Email + password authentication with client-side validation. Any syntactically valid email + password ≥6 characters is accepted (mock auth). Session is persisted to AsyncStorage.

### 2. Set Locations Screen (`/(app)/set-locations`)

Select your starting point and destination. Type to filter the suggestions list, or tap "Use Current Location" to fill the From field with your GPS position. A swap button lets you reverse the direction.

### 3. Trip Ready Screen (`/(app)/trip-ready`)

A confirmation screen showing your selected From → To route with mock-calculated distance and estimated travel time. A slide-up animation reveals the trip card. Proceed to the map or go back to change locations.

### 4. Route View Screen (`/(app)/route-view`)

Full-screen dark map displaying your route. A polyline connects the start (green pin) and destination (red pin). A draggable bottom sheet shows trip details. "Start Navigation" hands off to your device's native Maps app.

---

## 📦 APK Download

**Android APK (Preview Build):**  
🔗 *Link will be added after EAS build completes*

```
Install steps:
1. Download the APK on your Android device
2. Open your device Settings → Security → Enable "Install from unknown sources"
3. Open the downloaded APK file and follow the installation prompts
```

---

## 📚 Engineering Documentation

Full documentation suite in [`/docs`](./docs/):

| # | Document | Description |
|---|---|---|
| 01 | [Project Overview](./docs/01-PROJECT-OVERVIEW.md) | App purpose, tech stack, timeline, engineering principles |
| 02 | [Architecture](./docs/02-ARCHITECTURE.md) | Folder structure, navigation, state management, data flow |
| 03 | [Design System](./docs/03-DESIGN-SYSTEM.md) | Colors, typography, spacing, shadows, animation guidelines |
| 04 | [Screen Specs](./docs/04-SCREEN-SPECS.md) | Detailed per-screen layout, state, interactions, edge cases |
| 05 | [Component Guide](./docs/05-COMPONENT-GUIDE.md) | All shared component interfaces and implementation notes |
| 06 | [Data Models](./docs/06-DATA-MODELS.md) | TypeScript interfaces, Zod schemas, mock data constants |
| 07 | [Coding Standards](./docs/07-CODING-STANDARDS.md) | TypeScript rules, naming, structure templates, ESLint config |
| 08 | [Dependencies](./docs/08-DEPENDENCIES.md) | Full dependency table with versions and justifications |
| 09 | [Navigation Flow](./docs/09-NAVIGATION-FLOW.md) | Auth guard, screen transitions, deep links, back behavior |
| 10 | [Testing & QA](./docs/10-TESTING-AND-QA.md) | Manual QA checklists, edge cases, accessibility |
| 11 | [Build & Deploy](./docs/11-BUILD-AND-DEPLOY.md) | Setup, EAS build, APK generation, common issues |
| 12 | [README](./README.md) | This file |

---

## 🧪 Running Code Quality Checks

```bash
# TypeScript type checking
npm run type-check

# ESLint
npm run lint:check

# Prettier format check
npm run format:check

# Run all checks
npm run check
```

---

## 🏗️ Building the APK

```bash
# Install EAS CLI (one-time)
npm install -g eas-cli

# Log in to your Expo account
eas login

# Configure EAS (one-time per project)
eas build:configure

# Build Android APK (preview profile)
npm run build:android
# equivalent to: eas build --platform android --profile preview
```

Build progress can be monitored at [expo.dev](https://expo.dev). The APK download link is available in the EAS dashboard once the build completes (~10–20 minutes).

---

## 🤝 Contributing

This is a technical evaluation project — contributions are not accepted at this time.

---

## 📝 License

MIT License — see [LICENSE](./LICENSE) for details.

---

<div align="center">

Built with ❤️ using React Native & Expo  
Submitted to **Codenzic Innovations** as part of a React Native technical evaluation

</div>
