# AGENT.md — TripPath

> Start here if you are an AI agent or a developer picking up this project. It summarises how the code is organised and the rules to follow; the numbered documents in [`docs/`](docs/) hold the detail.

## 1. Project

TripPath is an Expo / React Native (TypeScript) trip-planning app built for the Codenzic Innovations evaluation. Flow: **Login (demo auth) → Set locations → Route**. It uses Google Places (New) for search, the Routes API for directions and `react-native-maps` for maps; routes are handed to Google Maps for live navigation.

## 2. Commands

```bash
npm ci                  # install
npm start               # Expo dev server (use a dev build for native maps)
npm test                # Jest suite
npm run test:coverage   # + coverage thresholds
npm run type-check      # tsc --noEmit
npm run lint            # ESLint
npm run format          # Prettier (write)
npm run check           # everything CI runs
```

## 3. Layout

```text
src/app/          route files (one-line re-exports of screens)
src/features/     auth · locations · route  (screens + feature-only parts)
src/hooks/        useRoute · usePlaceSuggestions · useCurrentLocation
src/services/     placesApi · routesApi · geocoding   (only code that does I/O)
src/components/   shared UI, and map/ (native + .web variants)
src/constants/    config · strings · theme · mapStyle · savedPlaces
src/types/        geo · places · route
src/utils/        pure helpers
tests/            mirrors src/
```

Dependency direction: `app → features → hooks → services`, with `components`, `utils`, `constants`, `types` as leaves. Details: [docs/02-ARCHITECTURE.md](docs/02-ARCHITECTURE.md).

## 4. Rules

1. **No literals in components.** Copy → `constants/strings.ts`; colors / spacing / radii / sizes / shadows → `constants/theme.ts`; URLs, field masks, timings, limits → `constants/config.ts`. Name any other magic number.
2. **Respect the layers.** Screens compose; hooks own async state; services own `fetch` and `expo-location`; utils are pure. Route files stay one-liners.
3. **Type everything.** Strict TypeScript, no `any`. Validate external data in services and expose domain types.
4. **Async safety.** Abortable requests, results keyed by their inputs, effect cleanup.
5. **Reuse before creating.** Check `src/components` (`PrimaryButton`, `TextField`, `NoticeBanner`, `SectionLabel`, `FloatingIconButton`, `RouteRail`, …) first.
6. **Platform splits** use `.web.tsx` files; never import `react-native-maps` (or `mapConfig.ts`) from web code.
7. **Tests.** Every behaviour change ships with tests under `tests/` covering success, failure and edge cases; `npm run check` must pass.
8. **Docs.** Update `README.md` and the relevant file in `docs/` when behaviour, structure, dependencies or setup change.
9. **Security.** Never commit `.env`, keystores or keys. `EXPO_PUBLIC_*` values are public; native Maps keys are separate from Places / Routes keys.
10. **Design source of truth is Figma.** Keep the shipped copy (e.g. "New to Wayfare?") and layout aligned with it.

## 5. Gotchas

- Authentication is a demo (no backend). The forgot-password and sign-up modals say so.
- "Next" on the locations screen is always pressable but _looks_ inactive until both places are chosen, so a tap can explain what is missing (`PrimaryButton` `dimmed`).
- A route with `0,0` coordinates is valid; do not use truthiness checks on coordinates.
- After moving or renaming the router root, restart `expo start --clear` or typed-route generation keeps the old path and `tsc` fails locally.
- Expo Go cannot verify the native Maps key; use `npx expo run:android`.

## 6. Documentation index

| #   | Document                                        | Contents                                              |
| --- | ----------------------------------------------- | ----------------------------------------------------- |
| 01  | [Project overview](docs/01-PROJECT-OVERVIEW.md) | Purpose, flow, features, scope, limitations           |
| 02  | [Architecture](docs/02-ARCHITECTURE.md)         | Structure, layers, state, data flow, error handling   |
| 03  | [Design system](docs/03-DESIGN-SYSTEM.md)       | Color, type, spacing, shadow tokens, map style        |
| 04  | [Screen specs](docs/04-SCREEN-SPECS.md)         | Behaviour of each screen                              |
| 05  | [Component guide](docs/05-COMPONENT-GUIDE.md)   | Props and contracts of every component                |
| 06  | [Data models](docs/06-DATA-MODELS.md)           | Types, form state, params, API mapping                |
| 07  | [Coding standards](docs/07-CODING-STANDARDS.md) | Tooling, clean-code rules, naming, definition of done |
| 08  | [Dependencies](docs/08-DEPENDENCIES.md)         | Packages, config files, native notes                  |
| 09  | [Navigation flow](docs/09-NAVIGATION-FLOW.md)   | Routes, params, transitions, guards                   |
| 10  | [Testing and QA](docs/10-TESTING-AND-QA.md)     | Test layout, coverage, manual QA checklist            |
| 11  | [Build and deploy](docs/11-BUILD-AND-DEPLOY.md) | Env vars, CI, APK, EAS, release checklist             |
|     | [Project setup](docs/PROJECT-SETUP.md)          | Local setup walkthrough                               |
