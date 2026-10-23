# TripPath — Data Models

> **Document:** 06 — TypeScript Interfaces, Types & Mock Data  
> **Status:** Finalized (Pre-development)

All types are exported from a single barrel file: `types/index.ts`. This prevents circular imports and provides one authoritative location for type discovery.

---

## 1. Core TypeScript Interfaces

```typescript
// types/index.ts

// ─────────────────────────────────────────────
// PRIMITIVES
// ─────────────────────────────────────────────

export interface Coordinate {
  latitude: number;
  longitude: number;
}

// ─────────────────────────────────────────────
// USER / AUTH
// ─────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean; // True while AsyncStorage is being read on app boot
}

export interface AuthContextValue extends AuthState {
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ─────────────────────────────────────────────
// LOCATION
// ─────────────────────────────────────────────

export type LocationType = 'recent' | 'popular' | 'current' | 'custom';

export interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinate;
  type: LocationType;
  distance?: string; // e.g., "2.1 km" — pre-computed for display
}

// ─────────────────────────────────────────────
// TRIP
// ─────────────────────────────────────────────

export type TravelMode = 'car' | 'walk' | 'transit';

export interface Trip {
  id: string;
  from: Location;
  to: Location;
  distance: string; // e.g., "12.4 km"
  estimatedDuration: string; // e.g., "24 min" or "1h 15min"
  travelMode: TravelMode;
  routeCoordinates: Coordinate[];
  createdAt: Date;
}

export interface TripState {
  fromLocation: Location | null;
  toLocation: Location | null;
  activeTrip: Trip | null;
}

export interface TripContextValue extends TripState {
  setFrom: (location: Location | null) => void;
  setTo: (location: Location | null) => void;
  swapLocations: () => void;
  setTrip: (trip: Trip) => void;
  clearTrip: () => void;
}

// ─────────────────────────────────────────────
// NAVIGATION PARAMS
// ─────────────────────────────────────────────

// Expo Router uses search params / route params as strings.
// Full Trip objects are stored in TripContext rather than passed through params
// to avoid serialization limits and URL-encoding issues.
// Params below are used as lightweight identifiers only.

export type RootStackParamList = {
  '(auth)/login': undefined;
  '(app)/set-locations': undefined;
  '(app)/trip-ready': undefined; // Trip data sourced from TripContext
  '(app)/route-view': undefined; // Trip data sourced from TripContext
};

// For Expo Router typed routes (expo-router v3 type-safe Links)
// These are inferred automatically from the file structure — no manual definition needed.

// ─────────────────────────────────────────────
// UI STATE
// ─────────────────────────────────────────────

export type ActiveInput = 'from' | 'to' | null;

export interface FormError {
  field: string;
  message: string;
}

export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
}

// ─────────────────────────────────────────────
// MAP
// ─────────────────────────────────────────────

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface MarkerType {
  coordinate: Coordinate;
  title?: string;
  description?: string;
  type: 'origin' | 'destination';
}
```

---

## 2. Zod Schemas (Runtime Validation)

```typescript
// utils/validation.ts
import { z } from 'zod';

// Login form
export const loginSchema = z.object({
  email: z.string().min(1, 'Email address is required').email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// Coordinate validation (for runtime guard on external data)
export const coordinateSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

// Location validation
export const locationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  address: z.string(),
  coordinates: coordinateSchema,
  type: z.enum(['recent', 'popular', 'current', 'custom']),
  distance: z.string().optional(),
});
```

---

## 3. Mock Data Constants

```typescript
// constants/mockData.ts

import { Location, Trip, Coordinate } from '@types/index';

// ─────────────────────────────────────────────
// MOCK LOCATIONS (6 items)
// ─────────────────────────────────────────────

export const MOCK_LOCATIONS: Location[] = [
  {
    id: 'loc_001',
    name: 'Home',
    address: '123 Maple Street, Riverside Suburbs',
    coordinates: { latitude: 37.7749, longitude: -122.4194 },
    type: 'recent',
    distance: '2.1 km',
  },
  {
    id: 'loc_002',
    name: 'City Mall',
    address: 'Downtown, Block C, City Center Plaza',
    coordinates: { latitude: 37.7849, longitude: -122.4094 },
    type: 'popular',
    distance: '4.8 km',
  },
  {
    id: 'loc_003',
    name: 'Office — Tech Park',
    address: 'Tech Park, Tower 2, Business District',
    coordinates: { latitude: 37.7649, longitude: -122.4294 },
    type: 'recent',
    distance: '6.2 km',
  },
  {
    id: 'loc_004',
    name: 'Central Park',
    address: 'Park Avenue, Midtown Green Zone',
    coordinates: { latitude: 37.7949, longitude: -122.3994 },
    type: 'popular',
    distance: '3.5 km',
  },
  {
    id: 'loc_005',
    name: 'International Airport',
    address: 'Airport Boulevard, Terminal 1, Gate A',
    coordinates: { latitude: 37.6213, longitude: -122.379 },
    type: 'popular',
    distance: '18.4 km',
  },
  {
    id: 'loc_006',
    name: 'University Campus',
    address: 'University Boulevard, Main Academic Block',
    coordinates: { latitude: 37.8044, longitude: -122.2712 },
    type: 'recent',
    distance: '11.7 km',
  },
];

// ─────────────────────────────────────────────
// MOCK ROUTE COORDINATES (2 predefined routes)
// ─────────────────────────────────────────────

// Route 1: Home → City Mall (short urban route)
export const MOCK_ROUTE_HOME_TO_MALL: Coordinate[] = [
  { latitude: 37.7749, longitude: -122.4194 },
  { latitude: 37.7762, longitude: -122.418 },
  { latitude: 37.7775, longitude: -122.416 },
  { latitude: 37.779, longitude: -122.4145 },
  { latitude: 37.7808, longitude: -122.413 },
  { latitude: 37.782, longitude: -122.4115 },
  { latitude: 37.7835, longitude: -122.4105 },
  { latitude: 37.7849, longitude: -122.4094 },
];

// Route 2: Office → Airport (longer route with slight curve)
export const MOCK_ROUTE_OFFICE_TO_AIRPORT: Coordinate[] = [
  { latitude: 37.7649, longitude: -122.4294 },
  { latitude: 37.758, longitude: -122.432 },
  { latitude: 37.75, longitude: -122.428 },
  { latitude: 37.742, longitude: -122.42 },
  { latitude: 37.732, longitude: -122.41 },
  { latitude: 37.72, longitude: -122.4 },
  { latitude: 37.705, longitude: -122.395 },
  { latitude: 37.69, longitude: -122.389 },
  { latitude: 37.67, longitude: -122.385 },
  { latitude: 37.65, longitude: -122.382 },
  { latitude: 37.635, longitude: -122.38 },
  { latitude: 37.6213, longitude: -122.379 },
];

// ─────────────────────────────────────────────
// MOCK TRIPS (2 predefined complete trips)
// ─────────────────────────────────────────────

export const MOCK_TRIP_HOME_TO_MALL: Trip = {
  id: 'trip_mock_001',
  from: MOCK_LOCATIONS[0], // Home
  to: MOCK_LOCATIONS[1], // City Mall
  distance: '4.8 km',
  estimatedDuration: '14 min',
  travelMode: 'car',
  routeCoordinates: MOCK_ROUTE_HOME_TO_MALL,
  createdAt: new Date('2026-10-22T09:00:00Z'),
};

export const MOCK_TRIP_OFFICE_TO_AIRPORT: Trip = {
  id: 'trip_mock_002',
  from: MOCK_LOCATIONS[2], // Office
  to: MOCK_LOCATIONS[4], // Airport
  distance: '18.4 km',
  estimatedDuration: '32 min',
  travelMode: 'car',
  routeCoordinates: MOCK_ROUTE_OFFICE_TO_AIRPORT,
  createdAt: new Date('2026-10-22T10:00:00Z'),
};

// ─────────────────────────────────────────────
// MOCK AUTH TOKEN (for AsyncStorage hydration tests)
// ─────────────────────────────────────────────

export const MOCK_AUTH_TOKEN = 'mock_token_dev_session_001';

export const MOCK_USER = {
  id: 'user_mock_001',
  email: 'demo@trippath.app',
  name: 'Demo User',
};
```

---

## 4. AsyncStorage Key Constants

```typescript
// constants/storageKeys.ts

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@trippath:auth_token',
  AUTH_USER: '@trippath:auth_user',
} as const;

// Usage:
// await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
// await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
```

Prefixing keys with `@appname:` is best practice to prevent collision with other libraries that may use AsyncStorage.

---

## 5. Context Default Values

```typescript
// context/AuthContext.tsx — defaultValue

export const AUTH_CONTEXT_DEFAULT: AuthContextValue = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // Starts true until AsyncStorage hydration completes
  login: async () => {},
  logout: async () => {},
};

// context/TripContext.tsx — defaultValue

export const TRIP_CONTEXT_DEFAULT: TripContextValue = {
  fromLocation: null,
  toLocation: null,
  activeTrip: null,
  setFrom: () => {},
  setTo: () => {},
  swapLocations: () => {},
  setTrip: () => {},
  clearTrip: () => {},
};
```

---

## 6. Type Guards & Utility Types

```typescript
// utils/helpers.ts

import { Location, Trip, Coordinate } from '@types/index';

// Type guard: check if an object is a valid Location
export const isLocation = (obj: unknown): obj is Location => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Location).id === 'string' &&
    typeof (obj as Location).name === 'string' &&
    typeof (obj as Location).coordinates === 'object'
  );
};

// Type guard: check if a Trip is fully formed
export const isTripComplete = (trip: Partial<Trip>): trip is Trip => {
  return (
    trip.from !== undefined &&
    trip.to !== undefined &&
    trip.distance !== undefined &&
    trip.estimatedDuration !== undefined &&
    Array.isArray(trip.routeCoordinates) &&
    trip.routeCoordinates.length >= 2
  );
};

// Utility: format distance from number (km) to string
export const formatDistance = (km: number): string => {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
};

// Utility: format duration from minutes to string
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

// Utility: calculate Haversine distance between two coordinates (km)
export const haversineDistance = (a: Coordinate, b: Coordinate): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const c =
    2 *
    Math.asin(
      Math.sqrt(
        sinLat * sinLat +
          Math.cos((a.latitude * Math.PI) / 180) *
            Math.cos((b.latitude * Math.PI) / 180) *
            sinLon *
            sinLon,
      ),
    );
  return R * c;
};

// Utility: generate mock route between two coordinates
export const generateMockRoute = (
  from: Coordinate,
  to: Coordinate,
  steps: number = 12,
): Coordinate[] => {
  const points: Coordinate[] = [from];
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const curvature = Math.sin(t * Math.PI) * 0.003;
    points.push({
      latitude:
        from.latitude + (to.latitude - from.latitude) * t + (Math.random() - 0.5) * curvature,
      longitude:
        from.longitude + (to.longitude - from.longitude) * t + (Math.random() - 0.5) * curvature,
    });
  }
  points.push(to);
  return points;
};

// Utility: get map region that fits both coordinates with padding
export const getMapRegion = (
  from: Coordinate,
  to: Coordinate,
  paddingFactor: number = 1.5,
): { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number } => {
  const midLat = (from.latitude + to.latitude) / 2;
  const midLng = (from.longitude + to.longitude) / 2;
  const latDelta = Math.abs(from.latitude - to.latitude) * paddingFactor + 0.02;
  const lngDelta = Math.abs(from.longitude - to.longitude) * paddingFactor + 0.02;
  return { latitude: midLat, longitude: midLng, latitudeDelta: latDelta, longitudeDelta: lngDelta };
};
```

---

_See `05-COMPONENT-GUIDE.md` for component-level usage of these types. See `07-CODING-STANDARDS.md` for import conventions._
