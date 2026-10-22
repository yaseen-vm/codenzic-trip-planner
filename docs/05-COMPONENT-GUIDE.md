# TripPath — Component Guide

> **Document:** 05 — Shared Component Implementation Guide  
> **Status:** Finalized (Pre-development)

---

## Overview

All shared components live in `components/`. They are organized by domain:

| Directory | Contents |
|---|---|
| `components/ui/` | Primitive design system components (Button, Input, Card, Badge) |
| `components/map/` | Map-specific rendering components |
| `components/location/` | Location search and list components |
| `components/trip/` | Trip summary and route info components |

**Component Rules:**
1. Every component has an exported TypeScript `Props` interface.
2. All style values come from `constants/` — never inline hex or pixel literals.
3. Components are pure/presentational by default. If a component needs to call a hook, document why it's a "smart" component exception.
4. All components are wrapped in `React.memo` unless they explicitly depend on context values that change frequently.

---

## 1. Button Component

**File:** `components/ui/Button.tsx`  
**Type:** Pure Presentational  

### Props Interface

```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}
```

### Variant Specifications

| Variant | Background | Text Color | Border | Use Case |
|---|---|---|---|---|
| `primary` | `Colors.Primary` | `Colors.TextPrimary` (white) | None | Main CTAs (Sign In, View Route, Proceed) |
| `secondary` | `Colors.SurfaceElevated` | `Colors.Primary` | `1px Colors.Primary` | Secondary actions |
| `ghost` | `transparent` | `Colors.TextSecondary` | None | Tertiary actions (Change Locations) |
| `danger` | `Colors.Error` | `Colors.TextPrimary` | None | Destructive actions |

### Size Specifications

| Size | Height | Padding H | Font Style | Icon Size |
|---|---|---|---|---|
| `sm` | 36px | 12px | `Typography.BodyMedium` | 16px |
| `md` | 48px | 20px | `Typography.BodyLarge` | 20px |
| `lg` | 56px | 24px | `Typography.H3` (semibold 18px) | 22px |

### Behavior

- **Loading state:** Replace title text with `ActivityIndicator`. Button remains pressable=false.
- **Disabled state:** `opacity: 0.5`, `pointerEvents: 'none'`.
- **Press animation:** `Animated.spring` to scale `0.96`, spring back to `1.0` on release.
- **Hit slop:** Small buttons get `hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}` to meet 44pt touch target.

### Usage Examples

```tsx
// Primary CTA
<Button variant="primary" size="lg" title="Sign In" onPress={handleLogin} loading={isLoading} />

// With icon
<Button
  variant="primary"
  size="lg"
  title="Start Navigation"
  onPress={handleNavigate}
  leftIcon={<Ionicons name="navigate" size={22} color={Colors.TextPrimary} />}
/>

// Ghost
<Button variant="ghost" size="md" title="Change Locations" onPress={() => router.back()} />
```

### Internal Implementation Notes

```typescript
// Animation setup
const scaleAnim = useRef(new Animated.Value(1)).current;

const handlePressIn = () => {
  Animated.spring(scaleAnim, {
    toValue: 0.96,
    useNativeDriver: true,
    speed: 50,
    bounciness: 0,
  }).start();
};

const handlePressOut = () => {
  Animated.spring(scaleAnim, {
    toValue: 1,
    useNativeDriver: true,
    speed: 30,
    bounciness: 4,
  }).start();
};

// Rendered as:
<Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
  <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} disabled={disabled || loading}>
    ...
  </Pressable>
</Animated.View>
```

---

## 2. Input Component

**File:** `components/ui/Input.tsx`  
**Type:** Pure Presentational  

### Props Interface

```typescript
interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  leftIcon?: React.ReactNode;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: AutoCompleteType;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  editable?: boolean;
  multiline?: boolean;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  ref?: React.Ref<TextInput>;
  testID?: string;
}
```

### Visual States

| State | Border | Border Width | Background | Label Color |
|---|---|---|---|---|
| Default | `Colors.Border` | 1px | `Colors.SurfaceElevated` | `Colors.TextSecondary` |
| Focused | `Colors.BorderFocused` (Primary) | 2px | `Colors.SurfaceElevated` | `Colors.Primary` |
| Error | `Colors.BorderError` (Error) | 2px | `Colors.SurfaceElevated` | `Colors.Error` |
| Disabled | `Colors.Border` | 1px | `Colors.Surface` (darker) | `Colors.TextMuted` |

### Component Structure

```
<View (wrapper)>
  <Text (label)>          ← Optional, renders above input
  <View (inputRow)>
    {leftIcon}             ← Optional left icon
    <TextInput>            ← Core input
    {rightIcon}            ← Optional right icon (e.g., eye toggle, clear button)
  </View>
  {error && <Text (errorMessage)>}  ← Shows below input, in Colors.Error
</View>
```

### Focus Animation

The border color and width transition smoothly using `Animated.Value` interpolation:

```typescript
const borderAnim = useRef(new Animated.Value(0)).current; // 0 = unfocused, 1 = focused

const handleFocus = () => {
  Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  onFocus?.();
};

const handleBlur = () => {
  Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  onBlur?.();
};

const borderColor = borderAnim.interpolate({
  inputRange: [0, 1],
  outputRange: [error ? Colors.BorderError : Colors.Border, error ? Colors.BorderError : Colors.BorderFocused],
});
```

### Error Display

```tsx
{error && (
  <View style={styles.errorContainer}>
    <Ionicons name="alert-circle" size={12} color={Colors.Error} />
    <Text style={styles.errorText}>{error}</Text>
  </View>
)}
```

### Usage Examples

```tsx
// Email input with react-hook-form
<Controller
  control={control}
  name="email"
  render={({ field: { onChange, onBlur, value } }) => (
    <Input
      label="Email Address"
      placeholder="john@example.com"
      value={value}
      onChangeText={onChange}
      onBlur={onBlur}
      error={errors.email?.message}
      keyboardType="email-address"
      autoCapitalize="none"
      autoComplete="email"
      returnKeyType="next"
    />
  )}
/>

// Password input
<Input
  label="Password"
  placeholder="Enter your password"
  value={password}
  onChangeText={setPassword}
  secureTextEntry={!showPassword}
  rightIcon={
    <Ionicons
      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
      size={20}
      color={Colors.TextSecondary}
    />
  }
  onRightIconPress={() => setShowPassword(prev => !prev)}
  error={errors.password?.message}
/>
```

---

## 3. Card Component

**File:** `components/ui/Card.tsx`  
**Type:** Pure Presentational  

### Props Interface

```typescript
interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;        // If true, uses SurfaceElevated bg + medium shadow
  onPress?: () => void;      // If provided, renders as TouchableOpacity
  activeOpacity?: number;    // Default: 0.85 (for touchable)
  testID?: string;
}
```

### Variants

| Prop | Background | Shadow Level |
|---|---|---|
| `elevated={false}` (default) | `Colors.Surface` | None |
| `elevated={true}` | `Colors.SurfaceElevated` | `Shadows.low` |
| `onPress` provided | Any of above + ripple/opacity press feedback | Appropriate to variant |

### Implementation Notes

- If `onPress` is provided → wrap with `Pressable` (not `TouchableOpacity` — Pressable has better animation control).
- Border radius is always `Radius.lg` (16px) unless overridden via `style`.
- Default padding is `Spacing.lg` (16px) on all sides — overridable via `style`.

### Usage Examples

```tsx
// Static card
<Card elevated>
  <TripSummaryCard from={trip.from} to={trip.to} />
</Card>

// Pressable card (e.g., a location item wrapped in a card)
<Card onPress={() => handleSelectLocation(item)} elevated={false}>
  <LocationItem location={item} />
</Card>
```

---

## 4. Badge Component

**File:** `components/ui/Badge.tsx`  
**Type:** Pure Presentational  

### Props Interface

```typescript
interface BadgeProps {
  label: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}
```

### Variant Colors

| Variant | Background | Text Color |
|---|---|---|
| `default` | `Colors.SurfaceElevated` | `Colors.TextSecondary` |
| `primary` | `Colors.Primary + '22'` (10% opacity) | `Colors.Primary` |
| `success` | `Colors.Success + '22'` | `Colors.Success` |
| `warning` | `Colors.Warning + '22'` | `Colors.Warning` |
| `error` | `Colors.Error + '22'` | `Colors.Error` |

Always uses `borderRadius: Radius.full` (pill shape).

### Usage

```tsx
<Badge label="2.1 km" variant="default" size="sm" />
<Badge label="Popular" variant="primary" size="sm" />
```

---

## 5. LocationItem Component

**File:** `components/location/LocationItem.tsx`  
**Type:** Pure Presentational  

### Props Interface

```typescript
interface LocationItemProps {
  location: Location;
  onPress: (location: Location) => void;
  isSelected?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
```

### Layout

```
┌──────────────────────────────────────────┐
│  [Icon]  [Name]                  [Badge] │
│          [Address]                       │
└──────────────────────────────────────────┘
```

```
<Pressable (onPress)>
  <View (iconContainer)>         ← 40x40 circle, Colors.SurfaceElevated bg
    <Ionicons (icon by type) />
  </View>
  <View (textContainer)>
    <Text (name)>                ← Typography.BodyMedium, TextPrimary
    <Text (address)>             ← Typography.Caption, TextSecondary, numberOfLines={1}
  </View>
  {location.distance && <Badge label={location.distance} variant="default" />}
</Pressable>
```

### Icon by Location Type

| `location.type` | Icon Name | Icon Color |
|---|---|---|
| `recent` | `time-outline` | `Colors.TextSecondary` |
| `popular` | `star-outline` | `Colors.Warning` |
| `current` | `navigate-circle` | `Colors.Primary` |
| `custom` | `location-outline` | `Colors.Primary` |

### Selected State

When `isSelected={true}`:
- Background: `Colors.Primary + '15'` (8% opacity tint)
- Left border: 3px `Colors.Primary` (visual selection indicator)

### Performance Note

`LocationItem` is memoized with `React.memo` and a custom comparator that checks `location.id` and `isSelected` only — preventing unnecessary re-renders as the suggestions list filters.

---

## 6. LocationSearchBar Component

**File:** `components/location/LocationSearchBar.tsx`  
**Type:** Pure Presentational  

### Props Interface

```typescript
interface LocationSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onClear?: () => void;
  isFocused?: boolean;
  dotColor?: string;           // Color of the leading dot (green for from, red for to)
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
```

This is a specialized input variant for location entry — not the generic `Input` component. It has:
- A colored dot indicator (not a standard icon) to match the From/To scheme
- A clear (×) button that appears only when `value.length > 0`
- Custom focus state with `isFocused` prop (controlled from parent — parent manages which field is "active")

---

## 7. TripSummaryCard Component

**File:** `components/trip/TripSummaryCard.tsx`  
**Type:** Pure Presentational  

### Props Interface

```typescript
interface TripSummaryCardProps {
  from: Location;
  to: Location;
  distance?: string;
  duration?: string;
  travelMode?: 'car' | 'walk' | 'transit';
  isCalculating?: boolean;   // Shows shimmer on meta row when true
  style?: StyleProp<ViewStyle>;
}
```

### Layout

```
┌────────────────────────────────┐
│  Your Trip                     │   ← Typography.H3, TextPrimary
│                                │
│  ●──  [From Name]              │   ← Green dot, Typography.BodyMedium
│  │    [From Address]           │   ← Typography.Caption, TextSecondary
│  │                             │
│  │  (vertical connector line)  │   ← 2px dashed, Colors.Border, height 24px
│  │                             │
│  ●──  [To Name]                │   ← Red dot, Typography.BodyMedium
│       [To Address]             │   ← Typography.Caption, TextSecondary
│                                │
│  ┌──────┐  ┌──────┐  ┌──────┐ │
│  │dist  │  │time  │  │mode  │ │   ← MetaChip × 3 (or shimmer)
│  └──────┘  └──────┘  └──────┘ │
└────────────────────────────────┘
```

### Connector Line

The vertical line between From and To uses a `View` with:
```typescript
{
  width: 2,
  height: 24,
  backgroundColor: Colors.Divider,
  marginLeft: 6, // aligns with dot center
  borderStyle: 'dashed', // NOTE: dashed borders on RN require workaround — use a series of small Views instead
}
```

> **Note:** React Native does not support `borderStyle: 'dashed'` on `View` reliably. Use a column of 4px-height Views with 4px gaps to simulate a dashed line.

### MetaChip

Each MetaChip is a small `Card`-like element:

```typescript
interface MetaChipProps {
  icon: string;         // Ionicons name
  value: string;        // Display text
  isLoading?: boolean;  // Shows shimmer if true
}
```

```
┌──────────────┐
│  [icon]      │
│  [value]     │
└──────────────┘
```
Background: `Colors.SurfaceElevated`, radius: `Radius.md`, padding: `Spacing.sm`.

---

## 8. RouteInfoPanel Component

**File:** `components/trip/RouteInfoPanel.tsx`  
**Type:** Pure Presentational  

### Props Interface

```typescript
interface RouteInfoPanelProps {
  trip: Trip;
  style?: StyleProp<ViewStyle>;
}
```

Used inside the Route View bottom sheet. Shows:
- Compact From → To location row (names only, no full addresses)
- Distance, ETA, and mode meta row
- Passes through to button rendering in the parent screen

### Layout

```
[🟢 From Name]  →  [🔴 To Name]   ← compact, single line
[12.4 km]  ·  [24 min]  ·  [🚗 Car]
```

---

## 9. MapView Component (Wrapper)

**File:** `components/map/MapView.tsx`  
**Type:** Smart Component (owns map ref and ready state)  

### Props Interface

```typescript
interface TripMapViewProps {
  from: Coordinate;
  to: Coordinate;
  routeCoordinates: Coordinate[];
  style?: StyleProp<ViewStyle>;
  onMapReady?: () => void;
}
```

This wrapper abstracts away the `react-native-maps` API and owns:
- The `MapView` ref
- `fitToCoordinates` call once `onMapReady` fires
- Dark map style JSON application
- Marker and polyline rendering (via child components)

```tsx
// Internal structure
<MapView
  ref={mapRef}
  style={style ?? StyleSheet.absoluteFillObject}
  customMapStyle={DARK_MAP_STYLE}
  initialRegion={getInitialRegion(from, to)}
  onMapReady={() => {
    mapRef.current?.fitToCoordinates([from, to], {
      edgePadding: { top: 80, right: 40, bottom: 320, left: 40 },
      animated: true,
    });
    onMapReady?.();
  }}
  provider={PROVIDER_GOOGLE}    // Use Google Maps for consistent rendering
>
  <LocationMarker coordinate={from} type="origin" />
  <LocationMarker coordinate={to} type="destination" />
  <RoutePolyline coordinates={routeCoordinates} />
</MapView>
```

---

## 10. RoutePolyline Component

**File:** `components/map/RoutePolyline.tsx`  
**Type:** Pure Presentational  

### Props Interface

```typescript
interface RoutePolylineProps {
  coordinates: Coordinate[];
  color?: string;          // Default: Colors.Primary (#4F8EF7)
  strokeWidth?: number;    // Default: 4
}
```

Renders `react-native-maps` `Polyline` with:
- `lineDashPattern={[]}` (solid line — dashed is not performant)
- `strokeColor={color ?? Colors.MapRouteColor}`
- `strokeWidth={strokeWidth ?? 4}`
- `geodesic={false}` (for short city-scale routes)
- `zIndex={1}`

---

## 11. ScreenHeader Component

**File:** `components/ui/ScreenHeader.tsx` *(utility, not listed in original tree — add as needed)*  
**Type:** Pure Presentational  

### Props Interface

```typescript
interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;           // Defaults to router.back()
  rightAction?: React.ReactNode; // Optional right-side element
  style?: StyleProp<ViewStyle>;
}
```

Height: 56px. Background: `Colors.Background` (blends with screen). Title: `Typography.H2`, `TextPrimary`, centered.

---

## Component Performance Checklist

Before marking any component as complete, verify:

- [ ] Wrapped in `React.memo` (unless it's a screen-level component)
- [ ] Event handler callbacks memoized with `useCallback` in parent before being passed as props
- [ ] No anonymous arrow functions in JSX `onPress` props (use named handlers)
- [ ] `StyleSheet.create()` used (not inline objects) for all static styles
- [ ] `testID` prop threaded through to the outermost `View` for testing
- [ ] `accessibilityLabel` on all interactive elements
- [ ] `accessibilityRole` set ('button', 'text', 'image', etc.)
- [ ] Handles `undefined`/`null` prop values gracefully with defaults

---

*See `06-DATA-MODELS.md` for TypeScript interface definitions and `07-CODING-STANDARDS.md` for code style rules.*
