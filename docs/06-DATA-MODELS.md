# TripPath — Data Models

> Types and payloads as implemented. Domain types live in `src/types`. Related: [Architecture](02-ARCHITECTURE.md).

## 1. Domain types

```ts
// src/types/geo.ts
type Coordinate = { latitude: number; longitude: number };
type MapRegion = Coordinate & { latitudeDelta: number; longitudeDelta: number };

// src/types/places.ts
type PlaceSuggestion = { placeId: string; description: string };
type SelectedPlace = Coordinate & { label: string }; // a place the user committed to

// src/types/route.ts
type TravelMode = 'DRIVE' | 'TWO_WHEELER' | 'WALK';
type TrafficLevel = 'none' | 'moderate' | 'heavy';
type RouteStep = { title: string; subtitle?: string; distanceMeters?: number; maneuver?: string };
type RouteResult = {
  path: Coordinate[];
  distanceMeters: number;
  durationSeconds: number;
  steps: RouteStep[];
  traffic: TrafficLevel;
};
```

## 2. Saved places

`src/constants/savedPlaces.ts` exports `SAVED_PLACES: SavedPlace[]` — sample data with approximate coordinates.

```ts
type SavedPlace = {
  id: string;
  name: string;
  address: string;
  short: string; // used in the field label: "Home · Villa 12, Street 840"
  icon: 'home' | 'building' | 'ferry' | 'train' | 'plane';
  latitude: number;
  longitude: number;
};
```

## 3. Form state (`src/features/locations/tripForm.ts`)

```ts
type FieldKey = 'pickup' | 'dropoff';
type FieldState = { text: string; place: SelectedPlace | null };
type TripFormState = Record<FieldKey, FieldState> & { active: FieldKey };

type TripFormAction =
  | { type: 'focus'; field: FieldKey }
  | { type: 'type'; field: FieldKey; text: string } // clears the field's place
  | { type: 'clear'; field: FieldKey }
  | { type: 'choose'; place: SelectedPlace } // fills the active field; pickup → focus drop-off
  | { type: 'swap' };

type TripValidation = 'ok' | 'incomplete' | 'same-location';
```

Invariant: a field has a `place` only if its `text` is that place's label — typing always resets `place` to `null`.

## 4. Hook state

```ts
// useRoute
type RouteState =
  | { status: 'loading' }
  | { status: 'ready'; route: RouteResult; receivedAt: number }
  | { status: 'error'; headline: string; message: string };

// usePlaceSuggestions
type PlaceSuggestionsResult = {
  suggestions: PlaceSuggestion[];
  loading: boolean;
  failed: boolean;
  sessionToken: () => string; // stable for the current autocomplete session
  endSession: () => void; // call after a selection so the next search starts a new session
};

// useCurrentLocation
// { locate(): Promise<SelectedPlace | null>, locating: boolean, notice: string, clearNotice(): void }
```

## 5. Route params (`/route`)

All values are strings (Expo Router params):

| Param                      | Meaning                              |
| -------------------------- | ------------------------------------ |
| `pickup`, `dropoff`        | Display labels (optional)            |
| `pickupLat`, `pickupLng`   | Pickup coordinate, decimal degrees   |
| `dropoffLat`, `dropoffLng` | Drop-off coordinate, decimal degrees |

`parseCoordinate` accepts only plain decimals (`-9.5`, `+.5`, `0`) within ±90 / ±180 and rejects hex, exponent forms, blanks and arrays.

## 6. External APIs

| API                       | Call                                                      | Mapped by                                |
| ------------------------- | --------------------------------------------------------- | ---------------------------------------- |
| Places Autocomplete (New) | `POST places:autocomplete` with `{ input, sessionToken }` | `parseSuggestions` → `PlaceSuggestion[]` |
| Place Details (New)       | `GET places/{id}?sessionToken=…` with a field mask        | `fetchPlaceDetails` → `SelectedPlace`    |
| Routes `computeRoutes`    | `POST` with origin, destination, mode, routing preference | `fetchRoute` → `RouteResult`             |

Field masks, URLs and limits are constants in `src/constants/config.ts`. Responses are validated, not trusted: a missing `suggestions` key is an empty result, anything structurally wrong throws `PlacesError` / `RoutesApiError`.

**Routes details:** driving uses `TRAFFIC_AWARE` with `TRAFFIC_ON_POLYLINE`; other modes use `TRAFFIC_UNAWARE`. Duration arrives as `"600s"` and is parsed to seconds. Steps come from the first leg, their instruction is split on `\n` into title and subtitle, blank steps are dropped and the list is capped at 20. Traffic is `heavy` if any speed interval is `TRAFFIC_JAM`, else `moderate` if any is `SLOW`, else `none`. The polyline is decoded with `decodePolyline`.

## 7. Errors

```ts
class PlacesError extends Error {}
class RoutesApiError extends Error {
  kind: 'api-disabled' | 'request-failed' | 'invalid-response';
}
```
