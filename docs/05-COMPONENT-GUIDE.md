# TripPath — Component Guide

> Props and behaviour of the components as implemented. Shared components live in `src/components`; feature components stay inside their feature folder. Related: [Design system](03-DESIGN-SYSTEM.md).

## 1. Shared components (`src/components`)

| Component            | Props                                                          | Notes                                                                                                                                                           |
| -------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PrimaryButton`      | `label`, `onPress`, `disabled?`, `dimmed?`, `icon?`            | Orange 56 px button. `disabled` blocks presses; `dimmed` only looks inactive so a tap can still explain what is missing. Both set `accessibilityState.disabled` |
| `TextField`          | `label`, `error?`, `icon?`, `password?` + all `TextInputProps` | Labelled input with optional leading icon; `password` hides the text and adds a show/hide toggle. Error text is orange                                          |
| `AppModal`           | `visible`, `title`, `subtitle?`, `onClose`, `children`         | Dimmed backdrop and rounded card. Backdrop and ✕ close it; taps inside the card do not                                                                          |
| `NoticeBanner`       | `text`, `alert?`                                               | Pale-orange info box. `alert` makes it an accessible `alert`                                                                                                    |
| `SectionLabel`       | `children`, `style?`                                           | Small tracked caps heading                                                                                                                                      |
| `FloatingIconButton` | `label`, `onPress`, `children`, `style?`                       | 44 px white button positioned over a map (top-left by default; override via `style`)                                                                            |
| `RouteRail`          | `style?`                                                       | Pickup dot, line and square drop-off marker                                                                                                                     |
| `TripPlaces`         | `pickup`, `dropoff`, `tinted?`                                 | Pickup/drop-off pair beside a `RouteRail`; `tinted` suits a white sheet                                                                                         |
| `BrandMark`          | none                                                           | Orange logo tile with the route glyph (`accessibilityLabel` "Codenzic logo")                                                                                    |

## 2. Map components (`src/components/map`)

| Component       | Props                                                                | Notes                                                                                                                                                                          |
| --------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `RouteMap`      | `start`, `pickup`, `end`, `dropoff`, `route`, `region`, `satellite?` | Native Google map: markers, dashed polyline when `route.length ≥ 2`, `fitToCoordinates` once ready, loader until `onMapReady`. Markers stop tracking view changes after 800 ms |
| `RouteMap.web`  | same props (`region`, `satellite` ignored)                           | Leaflet page from `buildRouteMapHtml` in an iframe                                                                                                                             |
| `MapPicker`     | `visible`, `title`, `initialCenter`, `onCancel`, `onConfirm`         | Full-screen modal with a fixed centre pin. Confirm returns the map centre; the centre resets on every open                                                                     |
| `MapPicker.web` | same props                                                           | Card that offers the initial centre only                                                                                                                                       |
| `RoutePins`     | `VehiclePin`, `DropPin` (no props)                                   | SVG markers                                                                                                                                                                    |

`mapConfig.ts` (provider selection: Expo Go on iOS has no Google SDK so the provider is left undefined) imports the native module and must not be imported from `.web` files.

## 3. Feature components

### Auth (`src/features/auth`)

| Component             | Props                             | Notes                                                     |
| --------------------- | --------------------------------- | --------------------------------------------------------- |
| `LoginScreen`         | none                              | Form, validation, modals, navigation to `/locations`      |
| `ForgotPasswordModal` | `visible`, `onClose`              | Demo flow; resets its state on close                      |
| `CreateAccountModal`  | `visible`, `onClose`, `onCreated` | Demo flow; `onCreated` fires from "Continue in demo mode" |

### Locations (`src/features/locations`)

| Component / module | Contract                                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------------------------- |
| `LocationsScreen`  | Wires the reducer, `usePlaceSuggestions`, `useCurrentLocation`, place-details lookup, map picker and navigation |
| `TripFields`       | `form`, `onChangeText`, `onFocus`, `onClear`, `onSwap` — the pickup/drop-off card                               |
| `SuggestionList`   | `rows: ListRow[]`, `onSelect(row)` — tappable rows with icon, title and optional subtitle                       |
| `tripForm.ts`      | `tripFormReducer`, `initialTripForm`, `validateTrip` → `'ok' \| 'incomplete' \| 'same-location'`                |
| `locationRows.ts`  | `filterSavedPlaces(places, query)`, `buildRows(suggestions, savedPlaces)`                                       |

### Route (`src/features/route`)

| Component / module  | Contract                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------- |
| `RouteScreen`       | Parses params; renders `InvalidRouteState` or `RouteDetails`                              |
| `RouteDetails`      | `start`, `end`, `pickup`, `dropoff` — map, sheet, mode state, satellite state, navigation |
| `RouteSummary`      | `state: RouteState` — duration, distance and arrival for loading / ready / error          |
| `ModeSelector`      | `mode`, `onChange` — Drive / Ride / Walk chips                                            |
| `StepList`          | `loading`, `steps`, `message?` — spinner, steps, or placeholder / failure message         |
| `InvalidRouteState` | `onChooseLocations`                                                                       |
| `maneuverIcon`      | Maps a Routes API maneuver code to a lucide icon (default: straight arrow)                |
| `startNavigation`   | `buildNavigationUrl`, `confirmStartNavigation`                                            |
| `travelModes`       | `TRAVEL_MODES`, `DEFAULT_TRAVEL_MODE`, `GOOGLE_MAPS_TRAVEL_MODE`                          |

## 4. Writing a new component

1. Decide where it lives: used by one feature → that feature folder; used by two or more → `src/components`.
2. Type the props with an interface; keep it presentational (data and callbacks in, JSX out). Put async work in a hook and network calls in a service.
3. Take copy from `src/constants/strings.ts` and styles from `src/constants/theme.ts`; name any remaining numeric literal as a constant.
4. Add `accessibilityRole` / `accessibilityLabel` for interactive elements.
5. Add a test under `tests/` mirroring the path (see [Testing](10-TESTING-AND-QA.md)).
