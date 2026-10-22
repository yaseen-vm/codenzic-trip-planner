# Project Setup

This guide records the local workflow for TripPath. Product and screen-level specifications remain in [AGENT.md](../AGENT.md) and the numbered documents in this directory.

## Prerequisites

- Node.js 20 LTS (npm is included).
- Expo Go on a physical device for the simplest preview; an Android emulator requires Android Studio.
- A Google Maps API key only when native map configuration requires one. Restrict keys to the required SDKs and platforms.

## Local setup

1. Clone the repository and enter its directory.
2. Install dependencies with `npm install`. A lockfile has not yet been committed; generate and review one after verifying dependency compatibility.
3. Copy `.env.example` to `.env` if you need local configuration. Never commit real credentials.
4. Start Expo with `npm start` and scan the QR code using Expo Go, or use `npm run android` with an Android emulator configured.
5. Before opening a PR, run `npm run check`.

## Current implementation status

The Expo Router scaffold and login screen are now present. Login validates email syntax and a minimum password length, but authentication, password recovery, and account creation remain placeholders. Map and trip-planning screens are not implemented yet.

## Quality checks

- `npm run type-check`: TypeScript static validation.
- `npm run lint`: ESLint checks.
- `npm run format:check`: verifies repository formatting.
- `npm run check`: runs all local quality checks.

CI defers these checks until both `package.json` and `package-lock.json` are present. This avoids a guaranteed failure while the lockfile is absent; commit the lockfile to activate deterministic CI installs and checks.

## Configuration and secrets

- `.env.example` documents environment variable names, not real credentials.
- Expo `EXPO_PUBLIC_*` values are bundled into client applications and are **not secrets**. Do not place service-role keys, private tokens, or unrestricted credentials in them.
- Configure native Maps keys with platform restrictions and billing/usage limits in the provider console.
- Keep `.env`, keystores, signing credentials, and generated APK/AAB files out of Git.

## Dependency and SDK policy

Use `npx expo install` for Expo and React Native native-module dependencies so versions stay compatible with the selected Expo SDK. Upgrade the SDK deliberately: align React Native and native modules, regenerate the lockfile, and smoke-test Android and iOS before merging.
