# TripPath — Testing and QA

> Automated tests run with Jest and React Native Testing Library. Related: [Coding standards](07-CODING-STANDARDS.md) · [Build and deploy](11-BUILD-AND-DEPLOY.md).

## 1. Commands

| Command                 | What it does                                                   |
| ----------------------- | -------------------------------------------------------------- |
| `npm test`              | Runs the whole suite                                           |
| `npm run test:coverage` | Runs with coverage and fails below the thresholds              |
| `npm run type-check`    | `tsc --noEmit`                                                 |
| `npm run lint`          | ESLint                                                         |
| `npm run format:check`  | Prettier                                                       |
| `npm run check`         | Coverage run + type-check + lint + format check (what CI runs) |

Coverage thresholds (`jest.config.js`): 90% lines, statements and functions; 80% branches. Excluded from coverage: `src/app` (one-line re-exports), `src/types`, `src/constants/savedPlaces.ts`, `src/constants/mapStyle.ts`. The current suite is ~350 tests at ~100% line coverage.

## 2. Layout

Tests mirror `src/`:

```text
tests/
├── setupEnv.js          sets the test Places / Routes keys
├── helpers.ts           deferred() promises, START / END coordinates
├── mocks/
│   └── reactNativeMaps.tsx   MapView / Marker / Polyline stand-ins that record props
├── utils/               auth, coordinates, format, inlineScriptJson, mapRegion, polyline, sessionToken
├── services/            placesApi, routesApi, geocoding
├── hooks/               useRoute, usePlaceSuggestions, useCurrentLocation
├── features/
│   ├── auth/            LoginScreen (incl. both demo modals)
│   ├── locations/       tripForm, locationRows, LocationsScreen (+ no-key variant)
│   └── route/           RouteScreen (+ no-key variant), parts: icons, URL, summary, steps, modes
└── components/          shared components, AppModal, TextField, and map/ (native, web, HTML builder)
```

## 3. What is covered

| Area       | Cases                                                                                                                                                                                                                                                                                                      |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Utils      | Boundary values (±90 / ±180, 999 m vs 1000 m, 59 vs 60 min), hex / exponent / blank / array coordinates, truncated and invalid polylines, HTML-significant characters in inline JSON, password length edges                                                                                                |
| Services   | Request shape (URL, headers, field mask, body), abort signal forwarding, HTTP errors, network errors, malformed bodies, disabled-API detection, non-JSON error bodies, label fallbacks, `0,0` coordinates, URL-encoded ids                                                                                 |
| Hooks      | Loading → ready / error, missing key, mode change aborting the previous request, stale success and stale failure ignored, unmount abort, debounce, minimum length, keeping previous suggestions while loading, session token stability and reset, permission denied, GPS failure, notice clearing          |
| Reducer    | Every action, the "typing discards the place" invariant, swap round-trip, immutability, all `validateTrip` outcomes                                                                                                                                                                                        |
| Screens    | Login validation and both demo modals (including reset on close); locations autocomplete races, saved places, selection failures, clear, swap, current location, map picking, continue guards; route invalid params, `0,0`, travel modes, traffic banners, failures, satellite toggle, navigation hand-off |
| Components | Press / disabled / dimmed behaviour, accessibility roles and labels, modal backdrop vs card taps, password toggle, native map props and fitting, picker centre reset, web map HTML escaping                                                                                                                |

Security-relevant tests: hostile place labels (`</script>…`) must never appear verbatim in the generated web-map HTML, and popups are built from DOM text nodes.

## 4. Writing tests

- Mock at the boundary: `expo-router`, `expo-location`, `react-native-safe-area-context` (use its jest mock), `react-native-maps` (use `tests/mocks/reactNativeMaps`), and `fetch`.
- Use `deferred()` to control response order for race-condition tests; use fake timers for debounce.
- Cover success, failure and edge cases, not only the happy path. Prefer asserting visible behaviour (text, roles, labels) over implementation details.
- To test the "no API key" paths, mock `src/constants/config` in a separate test file (see the `*NoKey` tests).
- `await` Testing Library calls (`render`, `fireEvent`, `act`). Do not leave a press un-awaited — overlapping `act()` calls corrupt later assertions.

## 5. Manual QA (device or emulator)

Automated tests cannot cover native behaviour. Before a release, on a **development build** (not Expo Go) check:

- [ ] Login validation, show/hide password, keyboard "done" submits; both modals open, validate and close.
- [ ] Autocomplete shows suggestions; selecting one fills the field; offline shows the retry notice.
- [ ] "Use current": permission prompt, allowed and denied paths; address appears.
- [ ] "Pick on map": the map renders (not black), pan moves the pin target, confirm fills the field, close cancels.
- [ ] Route screen: markers, dashed route, duration / distance / arrival, mode switching, traffic banner, satellite toggle, steps scroll.
- [ ] "Start navigation" opens Google Maps with the right origin, destination and mode.
- [ ] Safe areas on notched devices; keyboard never hides the active input.
- [ ] Back navigation through the whole flow.
- [ ] A black map: check logcat for Maps authorization errors and that the package name and SHA-1 match the key restriction.
