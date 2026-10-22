# Project Setup

This guide records the agreed local workflow for TripPath. The product and screen-level specifications remain in [AGENT.md](../AGENT.md) and the numbered documents in this directory.

## Prerequisites

- Node.js 20 LTS (npm is included).
- Expo Go on a physical device for the simplest preview; an Android emulator requires Android Studio.
- A Google Maps API key only for native map configurations that require one. Restrict keys to the required SDKs and platforms.

## Local setup

1. Clone the repository and enter its directory.
2. Install the locked dependencies with `npm ci` (use `npm install` only when intentionally updating dependencies and committing the lockfile).
3. Copy `.env.example` to `.env` and fill only the local values required by the configuration. Never commit credentials.
4. Start Expo with `npm start` and scan the QR code using Expo Go, or use `npm run android` with an Android emulator configured.
5. Before opening a PR, run `npm run check`.

> The current repository is documentation-first. These commands become runnable once the Expo application scaffold and lockfile are added. Do not invent a package manifest or lockfile that is inconsistent with the chosen Expo SDK; scaffold with Expo tooling and validate the installed package versions together.

## Quality checks

- `npm run type-check`: TypeScript static validation.
- `npm run lint`: ESLint checks.
- `npm run format:check`: verifies repository formatting.
- `npm run check`: runs the local quality checks together.

CI runs type-checking and formatting on pull requests targeting `master` or `main`. Keep CI dependency installation deterministic with a committed `package-lock.json`.

## Configuration and secrets

- `.env.example` documents environment variable names, not real credentials.
- Expo `EXPO_PUBLIC_*` values are bundled into client applications and are **not secrets**. Do not place service-role keys, private tokens, or unrestricted credentials in them.
- Configure native Maps keys with platform restrictions and billing/usage limits in the provider console.
- Keep `.env`, keystores, signing credentials, and generated APK/AAB files out of Git.

## Dependency and SDK policy

Use `npx expo install` for Expo and React Native native-module dependencies so versions are compatible with the selected Expo SDK. Upgrade the Expo SDK as a deliberate change: update the SDK, align React Native and native modules, regenerate the lockfile, and smoke-test on Android and iOS before merging.
