# TripPath — Screen Specifications

> **Document:** 04 — Screen-Level Design & Interaction Specifications  
> **Status:** Finalized (Pre-development)

---

## Overview

| Screen | Route | Auth Required |
|---|---|---|
| Login | `/(auth)/login` | No |
| Set Locations | `/(app)/set-locations` | Yes |
| Trip Ready | `/(app)/trip-ready` | Yes |
| Route View | `/(app)/route-view` | Yes |

---

## Screen 1: Login Screen

### Route
`/(auth)/login`

### Purpose
Authenticate the user and persist their session. This is the entry point for all unauthenticated users. The screen uses a mock authentication system — any syntactically valid email + password (≥6 chars) is accepted.

---

### Layout Description

```
┌──────────────────────────────────┐
│         [Background: #0A0E1A]    │
│                                  │
│  ┌────────────────────────────┐  │
│  │  🗺️  TripPath             │  │  ← Logo + App Name (centered)
│  │  Your journey starts here  │  │  ← Tagline
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │  Email Address             │  │  ← Input (email)
│  │  [john@example.com      ]  │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │  Password                  │  │  ← Input (password + eye toggle)
│  │  [••••••••             👁] │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │      [Sign In]             │  │  ← Primary CTA Button (full width)
│  └────────────────────────────┘  │
│                                  │
│  ─────────── or ────────────     │  ← Divider with text
│                                  │
│     Don't have an account?       │
│     [Create Account]             │  ← TextLink (navigates to… or shows toast for v1)
│                                  │
└──────────────────────────────────┘
```

**Visual notes:**
- The logo area occupies approximately 30% of screen height.
- The form card has `paddingHorizontal: Spacing.lg` (16px).
- `KeyboardAvoidingView` wraps the entire screen (`behavior="padding"` on iOS, `behavior="height"` on Android).
- A `ScrollView` inside `KeyboardAvoidingView` prevents content clipping on small screens.
- The tagline uses `Typography.Body` in `Colors.TextSecondary`.

---

### Component Tree

```
LoginScreen
├── KeyboardAvoidingView
│   └── ScrollView (contentContainerStyle: flex-grow, justify-center)
│       ├── AppLogo                           (logo image + app name text)
│       ├── View (formContainer)
│       │   ├── Input (email)                 (react-hook-form Controller)
│       │   ├── Input (password)              (react-hook-form Controller, secureTextEntry)
│       │   ├── Button (primary, "Sign In")   (onPress → handleSubmit)
│       │   └── ErrorMessage                  (global auth error if credentials mocked invalid)
│       └── View (footer)
│           ├── Text ("Don't have an account?")
│           └── TouchableOpacity / TextLink ("Create Account")
```

---

### State

```typescript
// Managed by react-hook-form
interface LoginFormValues {
  email: string;
  password: string;
}

// Local UI state
const [showPassword, setShowPassword] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [authError, setAuthError] = useState<string | null>(null);

// react-hook-form
const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
  resolver: zodResolver(loginSchema),
  mode: 'onBlur', // Validate on blur for better UX
});
```

---

### Validation Schema (Zod)

```typescript
// utils/validation.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
```

**Field-level error messages:**

| Field | Trigger | Error Message |
|---|---|---|
| Email | Empty on submit | `"Email address is required"` |
| Email | Invalid format | `"Please enter a valid email address"` |
| Password | Empty on submit | `"Password is required"` |
| Password | Less than 6 chars | `"Password must be at least 6 characters"` |

---

### Mock Auth Logic

```typescript
// Pseudo-code for the login handler
const handleLogin = async (data: LoginFormValues) => {
  setIsLoading(true);
  setAuthError(null);

  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Mock: accept any valid-format email + password
    // In production: POST /auth/login
    const mockToken = `mock_token_${Date.now()}`;
    const mockUser: User = {
      id: 'user_001',
      email: data.email,
      name: data.email.split('@')[0],
    };

    // Persist session
    await AsyncStorage.setItem('auth_token', mockToken);
    await AsyncStorage.setItem('auth_user', JSON.stringify(mockUser));

    // Update AuthContext → triggers auth guard → navigates to /(app)/set-locations
    login(mockUser, mockToken);
  } catch (error) {
    setAuthError('Something went wrong. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
```

---

### Animations

| Element | Animation | Trigger | Details |
|---|---|---|---|
| Entire screen | Fade in (opacity 0→1) | Mount | 500ms, `Easing.out(Easing.cubic)` |
| Logo | Slide down + fade (translateY -20→0) | Mount | 600ms, 100ms delay |
| Form container | Slide up + fade (translateY 20→0) | Mount | 600ms, 200ms delay |
| Sign In button | Scale spring (0.96→1) | Press | `withSpring({ damping: 15 })` |
| Loading indicator | Replace button text | isLoading=true | Crossfade 200ms |

---

### Edge Cases

| Case | Behavior |
|---|---|
| Keyboard overlaps inputs | `KeyboardAvoidingView` with platform-specific `behavior` lifts content |
| Submit while loading | Button disabled, form inputs disabled via `editable={false}` |
| Long email address | Input scrolls horizontally (default `TextInput` behavior) |
| Paste into email field | Supported natively, validation runs on blur |
| Back button on Android | Not applicable — this is the root auth screen, back exits app |
| Already authenticated on mount | Auth guard in `_layout.tsx` immediately redirects to `/(app)/set-locations` |
| Network-like delay (mock) | 1200ms timeout simulates real API call — shows loading spinner |
| Create Account tap (v1) | Shows `Alert` or `Toast`: "Registration coming soon! Use any email to sign in." |

---

---

## Screen 2: Set Locations Screen

### Route
`/(app)/set-locations`

### Purpose
Allow the user to select a starting location and a destination. Supports GPS-based current location, manual text entry (with filtered suggestions), and recent/popular location quick-picks.

---

### Layout Description

```
┌──────────────────────────────────┐
│  ← Back    Set Your Route    ··· │  ← ScreenHeader
├──────────────────────────────────┤
│                                  │
│  ┌────────────────────────────┐  │
│  │ 🟢 From                   │  │  ← LocationInputCard (From)
│  │ [Enter starting point    ] │  │
│  └────────────────────────────┘  │
│           ⇅  (swap button)       │
│  ┌────────────────────────────┐  │
│  │ 🔴 To                     │  │  ← LocationInputCard (To)
│  │ [Enter destination       ] │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │ 📍 Use Current Location   │  │  ← CurrentLocationButton
│  └────────────────────────────┘  │
│                                  │
│  ─────── Suggestions ──────────  │  ← Section header
│                                  │
│  ┌────────────────────────────┐  │
│  │ 🕐  Home            2.1km │  │
│  │     123 Main Street        │  │
│  ├────────────────────────────┤  │
│  │ ⭐  City Mall         4.8km│  │  ← FlatList of LocationItems
│  │     Downtown, Block C      │  │
│  ├────────────────────────────┤  │
│  │ 🕐  Office          6.2km │  │
│  │     Tech Park, Tower 2     │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │    [   Proceed →   ]       │  │  ← ProceedButton (disabled until both filled)
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

---

### Component Tree

```
SetLocationsScreen
├── SafeAreaView
│   ├── ScreenHeader (title="Set Your Route", showBack=true)
│   ├── ScrollView
│   │   ├── View (inputsContainer)
│   │   │   ├── LocationInputCard (type="from", value=fromLocation, onFocus, onClear)
│   │   │   ├── SwapButton (onPress → swapLocations())
│   │   │   └── LocationInputCard (type="to", value=toLocation, onFocus, onClear)
│   │   │
│   │   ├── CurrentLocationButton (onPress → fetchCurrentLocation)
│   │   │   └── [ActivityIndicator if isLoadingLocation]
│   │   │
│   │   ├── Divider
│   │   │
│   │   ├── Text ("Suggestions") [section label]
│   │   │
│   │   └── FlatList (data=filteredSuggestions, renderItem=LocationItem)
│   │
│   └── View (bottomBar)
│       └── Button (primary, "Proceed", disabled=!fromLocation || !toLocation)
```

---

### State

```typescript
// TripContext provides setFrom, setTo, swapLocations, fromLocation, toLocation
const { fromLocation, toLocation, setFrom, setTo, swapLocations } = useTrip();

// Local screen state
const [activeInput, setActiveInput] = useState<'from' | 'to' | null>(null);
const [searchQuery, setSearchQuery] = useState('');
const [isLoadingLocation, setIsLoadingLocation] = useState(false);
const [suggestions, setSuggestions] = useState<Location[]>(MOCK_LOCATIONS);

// Derived
const filteredSuggestions = useMemo(
  () => suggestions.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchQuery.toLowerCase())
  ),
  [suggestions, searchQuery]
);
```

---

### Mock Suggestions Data

```typescript
// constants/mockData.ts — 6 location suggestions
export const MOCK_LOCATIONS: Location[] = [
  {
    id: 'loc_001',
    name: 'Home',
    address: '123 Maple Street, Suburbs',
    coordinates: { latitude: 37.7749, longitude: -122.4194 },
    type: 'recent',
    distance: '2.1 km',
  },
  {
    id: 'loc_002',
    name: 'City Mall',
    address: 'Downtown, Block C, City Center',
    coordinates: { latitude: 37.7849, longitude: -122.4094 },
    type: 'popular',
    distance: '4.8 km',
  },
  {
    id: 'loc_003',
    name: 'Office',
    address: 'Tech Park, Tower 2, Business District',
    coordinates: { latitude: 37.7649, longitude: -122.4294 },
    type: 'recent',
    distance: '6.2 km',
  },
  {
    id: 'loc_004',
    name: 'Central Park',
    address: 'Park Avenue, Midtown',
    coordinates: { latitude: 37.7949, longitude: -122.3994 },
    type: 'popular',
    distance: '3.5 km',
  },
  {
    id: 'loc_005',
    name: 'Airport Terminal 1',
    address: 'International Airport, Gate A',
    coordinates: { latitude: 37.6213, longitude: -122.3790 },
    type: 'popular',
    distance: '18.4 km',
  },
  {
    id: 'loc_006',
    name: 'University Campus',
    address: 'University Boulevard, Academic Block',
    coordinates: { latitude: 37.8044, longitude: -122.2712 },
    type: 'recent',
    distance: '11.7 km',
  },
];
```

---

### Interactions

| Interaction | Behavior |
|---|---|
| Tap **From** card | `activeInput = 'from'`, input field gains focus |
| Tap **To** card | `activeInput = 'to'`, input field gains focus |
| Type in active input | Updates `searchQuery`, filters `filteredSuggestions` |
| Tap a **LocationItem** | Fills `activeInput` field with selected location, clears query, focuses other empty field |
| Tap **Swap** button | Calls `swapLocations()` in TripContext — swaps From and To |
| Tap **Use Current Location** | Requests expo-location permission → gets coords → reverse geocodes (mock) → fills `activeInput` (defaults to 'from' if none active) |
| Clear button (×) on a card | Clears that location field, resets `activeInput` to that field |
| Tap **Proceed** | Navigates to `/(app)/trip-ready` with trip data (only active when both fields filled) |

---

### Current Location Flow

```typescript
const fetchCurrentLocation = async () => {
  setIsLoadingLocation(true);
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
      return;
    }
    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const currentLoc: Location = {
      id: 'current',
      name: 'Current Location',
      address: `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`,
      coordinates: { latitude: location.coords.latitude, longitude: location.coords.longitude },
      type: 'current',
    };
    setFrom(currentLoc); // Always fills "From"
  } catch {
    Alert.alert('Error', 'Could not fetch your location. Please try again.');
  } finally {
    setIsLoadingLocation(false);
  }
};
```

---

### Edge Cases

| Case | Behavior |
|---|---|
| Both fields empty on mount | Proceed button is disabled (opacity 0.5, `disabled` prop) |
| Location permission denied | Alert with explanation, button shows error state briefly |
| Very long location name | Text truncates with `numberOfLines={1}` ellipsis |
| No matches in search | FlatList shows empty component: "No matching locations found" |
| Swap when one field empty | Swap still executes — the empty field becomes the filled field and vice versa |
| Device location services off | expo-location returns error — handled with Alert |

---

---

## Screen 3: Trip Ready Screen

### Route
`/(app)/trip-ready`

### Purpose
Confirm the selected trip before viewing the route. Shows the user's from/to selection with mock-calculated distance and estimated time, with a clear CTA to proceed to the map.

---

### Layout Description

```
┌──────────────────────────────────┐
│         [Background: #0A0E1A]    │
│                                  │
│  ← Back                          │  ← back arrow (ghost, top-left)
│                                  │
│  ┌────────────────────────────┐  │
│  │                            │  │
│  │    🗺️  [Illustration]     │  │  ← TripIllustration (map/route icon graphic)
│  │                            │  │
│  └────────────────────────────┘  │  (35% screen height)
│                                  │
│  ┌────────────────────────────┐  │  ← TripSummaryCard (slides up on mount)
│  │  Your Trip                 │  │
│  │                            │  │
│  │  🟢  Home                 │  │  ← From location name
│  │      123 Maple Street      │  │  ← From address
│  │       │                    │  │
│  │       │ (connector line)   │  │
│  │       │                    │  │
│  │  🔴  City Mall            │  │  ← To location name
│  │      Downtown, Block C     │  │  ← To address
│  │                            │  │
│  │  ┌──────┐ ┌──────┐ ┌────┐ │  │
│  │  │12.4km│ │24 min│ │🚗 │ │  │  ← TripMetaRow (distance | time | mode)
│  │  └──────┘ └──────┘ └────┘ │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │     [  View Route  →  ]    │  │  ← Primary CTA Button
│  └────────────────────────────┘  │
│                                  │
│  [ Change Locations ]            │  ← GhostButton (centered)
│                                  │
└──────────────────────────────────┘
```

---

### Component Tree

```
TripReadyScreen
├── SafeAreaView
│   ├── TouchableOpacity (back arrow, top-left)
│   │
│   ├── Animated.View (hero area — fade in)
│   │   └── TripIllustration
│   │
│   ├── Animated.View (card — slide up + fade)
│   │   └── TripSummaryCard
│   │       ├── LocationRow (type="from", location=fromLocation)
│   │       ├── ConnectorLine (vertical dashed line)
│   │       ├── LocationRow (type="to", location=toLocation)
│   │       └── TripMetaRow
│   │           ├── MetaChip (icon="map", value=distance)
│   │           ├── MetaChip (icon="time", value=duration)
│   │           └── MetaChip (icon="car", value="Car")
│   │
│   └── View (actionsContainer)
│       ├── Button (primary, large, "View Route", onPress → navigateToRouteView)
│       └── Button (ghost, md, "Change Locations", onPress → router.back())
```

---

### State

```typescript
// Receives data from TripContext (populated in Set Locations screen)
const { fromLocation, toLocation } = useTrip();

// Local computed state — mock trip calculation
const [tripData, setTripData] = useState<TripMeta | null>(null);
const [isCalculating, setIsCalculating] = useState(true);

// Derived on mount:
interface TripMeta {
  distance: string;      // e.g., "12.4 km"
  duration: string;      // e.g., "24 min"
  travelMode: 'car';
}
```

---

### Mock Trip Calculation

```typescript
// Runs once on mount, simulates API "calculation" with a delay
useEffect(() => {
  const calculate = async () => {
    setIsCalculating(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay

    // Mock: random distance between 5-50km
    const distKm = (Math.random() * 45 + 5).toFixed(1);
    // Mock: rough time estimate (avg 40km/h in city)
    const durationMin = Math.round((parseFloat(distKm) / 40) * 60);
    const durationFormatted = durationMin >= 60
      ? `${Math.floor(durationMin / 60)}h ${durationMin % 60}min`
      : `${durationMin} min`;

    setTripData({
      distance: `${distKm} km`,
      duration: durationFormatted,
      travelMode: 'car',
    });
    setIsCalculating(false);
  };

  calculate();
}, []);
```

---

### Animations

| Element | Animation | Details |
|---|---|---|
| Illustration | Fade in | 500ms on mount |
| TripSummaryCard | Slide up (translateY: 60→0) + fade | 500ms, 200ms delay, spring easing |
| MetaChips | Shimmer while `isCalculating=true` | Replaced with real data on resolve |
| "View Route" button | Fade in | 500ms, 400ms delay (appears after card) |

### Shimmer State

While `isCalculating` is true, the TripMetaRow chips show animated shimmer placeholders (gray pulsing rectangles). When calculation completes, the shimmer crossfades to real values.

---

### Navigation

```typescript
const handleViewRoute = () => {
  const trip: Trip = {
    id: `trip_${Date.now()}`,
    from: fromLocation!,
    to: toLocation!,
    distance: tripData!.distance,
    estimatedDuration: tripData!.duration,
    travelMode: 'car',
    routeCoordinates: generateMockRoute(fromLocation!.coordinates, toLocation!.coordinates),
    createdAt: new Date(),
  };

  router.push({
    pathname: '/(app)/route-view',
    params: { tripId: trip.id }, // Full object stored in TripContext to avoid param size limits
  });
  setTrip(trip); // Store in TripContext
};
```

---

### Edge Cases

| Case | Behavior |
|---|---|
| Screen mounted without fromLocation/toLocation | Should not occur (auth guard + flow guard), but if it does → redirect to set-locations |
| Very long location name | Text truncates with `numberOfLines={2}` |
| Calculation delay UI | Shimmer placeholders prevent layout shift |

---

---

## Screen 4: Route View Screen

### Route
`/(app)/route-view`

### Purpose
Display the planned route on a dark-styled interactive map with markers and a polyline. A floating bottom sheet shows trip details and the final "Start Navigation" CTA.

---

### Layout Description

```
┌──────────────────────────────────┐
│  [Full-Screen Dark Map]          │
│                                  │
│  ┌────────────────────────────┐  │  ← FloatingHeader (absolute top overlay)
│  │ ←  Route View              │  │
│  └────────────────────────────┘  │
│                                  │
│        🟢 [Origin Marker]        │  ← Green pin at start coord
│                                  │
│     ~~~~~~~~~~~~~~~~             │
│    ~~~ Route Polyline ~~~        │  ← Blue animated polyline
│     ~~~~~~~~~~~~~~~~             │
│                                  │
│              🔴 [Dest Marker]    │  ← Red pin at destination coord
│                                  │
│                                  │
│                                  │
│                                  │
│  ┌────────────────────────────┐  │  ← BottomSheet (30% height, draggable)
│  │ ────  (drag handle)        │  │
│  │                            │  │
│  │  🟢 Home                  │  │
│  │     ↓                      │  │
│  │  🔴 City Mall              │  │
│  │                            │  │
│  │  12.4 km    24 min   🚗   │  │  ← RouteDetailRow
│  │                            │  │
│  │  [  🧭  Start Navigation ] │  │  ← Primary CTA Button
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

---

### Component Tree

```
RouteViewScreen
├── View (container, flex: 1)
│   ├── MapViewComponent (flex: 1, full screen)
│   │   ├── Marker (coordinate=fromLocation.coords, color=Success)
│   │   ├── Marker (coordinate=toLocation.coords, color=Secondary)
│   │   └── RoutePolyline (coordinates=trip.routeCoordinates, color=Primary)
│   │
│   ├── FloatingHeader (absolute, top: SafeArea top)
│   │   ├── TouchableOpacity (back arrow)
│   │   └── Text ("Route View")
│   │
│   └── BottomSheet (absolute, bottom: 0, height: 30% → 65% expanded)
│       ├── DragHandle
│       ├── View (routeInfo)
│       │   ├── RouteDetailRow (from=fromLocation, to=toLocation)
│       │   └── TripMetaRow (distance, duration, mode)
│       └── Button (primary, large, "Start Navigation", leftIcon="navigate")
```

---

### State

```typescript
const { activeTrip } = useTrip();
// activeTrip contains: from, to, distance, estimatedDuration, travelMode, routeCoordinates

// Local map state
const mapRef = useRef<MapView>(null);
const [isMapReady, setIsMapReady] = useState(false);

// Bottom sheet state (using Animated for drag)
const bottomSheetAnim = useRef(new Animated.Value(0)).current; // 0 = collapsed, 1 = expanded
const [isExpanded, setIsExpanded] = useState(false);
```

---

### Map Configuration

```typescript
// Initial region: center between start and end, with padding
const getInitialRegion = (from: Coordinate, to: Coordinate): Region => {
  const midLat = (from.latitude + to.latitude) / 2;
  const midLng = (from.longitude + to.longitude) / 2;
  const latDelta = Math.abs(from.latitude - to.latitude) * 1.5 + 0.02;
  const lngDelta = Math.abs(from.longitude - to.longitude) * 1.5 + 0.02;
  return { latitude: midLat, longitude: midLng, latitudeDelta: latDelta, longitudeDelta: lngDelta };
};

// MapView props
<MapView
  ref={mapRef}
  style={StyleSheet.absoluteFillObject}
  customMapStyle={DARK_MAP_STYLE}     // from constants/mapStyle.ts
  initialRegion={getInitialRegion(from.coordinates, to.coordinates)}
  onMapReady={() => setIsMapReady(true)}
  showsUserLocation={false}           // We have custom markers
  showsMyLocationButton={false}
  showsCompass={false}
  toolbarEnabled={false}              // Android: hide Google Maps toolbar
/>
```

---

### Mock Route Generation

```typescript
// utils/helpers.ts
export const generateMockRoute = (from: Coordinate, to: Coordinate): Coordinate[] => {
  const points: Coordinate[] = [];
  const steps = 12;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Linear interpolation with slight random curvature
    const lat = from.latitude + (to.latitude - from.latitude) * t
      + (Math.random() - 0.5) * 0.005 * Math.sin(t * Math.PI);
    const lng = from.longitude + (to.longitude - from.longitude) * t
      + (Math.random() - 0.5) * 0.005 * Math.sin(t * Math.PI);
    points.push({ latitude: lat, longitude: lng });
  }

  return points;
};
```

---

### Bottom Sheet Behavior

| State | Height | Trigger |
|---|---|---|
| Resting (default) | `SCREEN_HEIGHT * 0.30` | Initial render |
| Expanded | `SCREEN_HEIGHT * 0.65` | Drag up / tap drag handle |
| Collapsed (resting) | `SCREEN_HEIGHT * 0.30` | Drag down from expanded |

The bottom sheet uses `PanResponder` (or `react-native-gesture-handler`'s `PanGestureHandler`) to detect drag. It snaps to either resting or expanded based on velocity and position thresholds.

```
Snap thresholds:
  - If drag velocity > 0.5 (upward) → snap to expanded
  - If drag velocity > 0.5 (downward) → snap to resting
  - If slow drag: snap based on current position (>50% of range = expanded)
```

---

### FloatingHeader Style

```typescript
// Absolutely positioned on top of the map
{
  position: 'absolute',
  top: insets.top + Spacing.sm,   // Safe area aware
  left: Spacing.lg,
  right: Spacing.lg,
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: Colors.Surface + 'E6', // 90% opacity — glassmorphism feel
  borderRadius: Radius.lg,
  padding: Spacing.md,
  ...Shadows.medium,
}
```

---

### "Start Navigation" Action

In this mock implementation, "Start Navigation" opens the device's native maps application via `Linking.openURL`:

```typescript
const handleStartNavigation = async () => {
  const { latitude, longitude } = activeTrip.to.coordinates;
  const url = Platform.select({
    ios: `maps://app?daddr=${latitude},${longitude}`,
    android: `google.navigation:q=${latitude},${longitude}`,
  });

  const canOpen = await Linking.canOpenURL(url!);
  if (canOpen) {
    await Linking.openURL(url!);
  } else {
    // Fallback: open Google Maps in browser
    await Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    );
  }
};
```

---

### Edge Cases

| Case | Behavior |
|---|---|
| Map fails to load | Show error state overlay with retry button |
| No route coordinates | Show straight-line polyline between two points as fallback |
| Small screen (SE) | Bottom sheet takes 35% height to ensure map is still visible |
| Landscape orientation | Not officially supported in v1 — lock to portrait via `app.json` orientation setting |
| Back navigation | Navigates back to Trip Ready screen (stack behavior) |
| "Start Navigation" — no maps app | Falls back to browser-based Google Maps URL |

---

*See `05-COMPONENT-GUIDE.md` for detailed component implementation specs.*
