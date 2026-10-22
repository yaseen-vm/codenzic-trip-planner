# TripPath

A React Native and Expo trip-planning app for Android and iOS, built for the Codenzic Innovations technical evaluation.

## Current implementation

- Login screen styled to match the supplied reference.
- Email format and minimum password length validation.
- Password visibility toggle.
- Forgot-password and create-account entry points (placeholder actions until authentication is connected).
- Responsive layout with a fixed bottom action area, safe-area handling, and keyboard-aware behavior.

Authentication is not connected to a backend yet. A valid form currently shows a demo confirmation; it does not create a real session.

## Tech stack

- Expo SDK 54 and Expo Router
- React Native 0.81
- TypeScript with strict checking
- React Native Safe Area Context
- Expo Vector Icons
- ESLint and Prettier

## Prerequisites

- Node.js 20 LTS
- npm
- Expo Go on a physical device, or Android Studio for an Android emulator

## Run locally

```bash
npm install
npm start
```

Scan the QR code with Expo Go. To start an Android emulator, run `npm run android`.

> A package lockfile is not included in this initial scaffold commit. Run `npm install` to resolve dependencies locally; commit the generated lockfile in a follow-up once dependency installation and Expo compatibility checks have been verified.

## Quality checks

```bash
npm run type-check
npm run lint
npm run format:check
npm run check
```

## Project structure

```text
app/
  _layout.tsx   # Root Expo Router layout
  index.tsx     # Redirect to login
  login.tsx     # Login screen
components/     # Shared UI components as features are implemented
constants/      # Shared design tokens and static data
context/        # App-level state
docs/           # Product and engineering documentation
```

The planned application flow and engineering specifications are documented in [AGENT.md](./AGENT.md) and [docs/](./docs/).

## Security

- Never commit `.env`, signing credentials, or API keys.
- Any `EXPO_PUBLIC_*` variable is embedded in the client bundle and must not contain secrets.
- Configure and restrict platform API keys before enabling native map integrations.

## License

MIT

## Google Maps configuration

Native Google Maps SDK keys are read from local environment variables by `app.config.ts`:

- `GOOGLE_MAPS_ANDROID_API_KEY`
- `GOOGLE_MAPS_IOS_API_KEY`

1. Copy `.env.example` to `.env`.
2. Set each variable to its platform-specific Google Maps SDK key.
3. In Google Cloud Console, enable billing and the relevant Maps SDK (Android/iOS). Restrict each key to its matching Android package/signing certificate or iOS bundle identifier, and restrict allowed APIs.
4. Rebuild the native development app after changing native map configuration; a Metro reload or Expo Go alone may not apply native SDK changes.

The `.env` file is ignored by Git. The native keys are still included in the built app, so they are not secrets; application and API restrictions are required. Keep server-side Routes/Places web-service keys separate and never put unrestricted server keys in the mobile app.
