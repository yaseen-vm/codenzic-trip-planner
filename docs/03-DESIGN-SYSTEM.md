# TripPath — Design System

> **Document:** 03 — Design System & Visual Language  
> **Status:** Finalized (Pre-development)

---

## 1. Design Philosophy

TripPath uses a **dark, high-contrast design language** inspired by modern navigation apps (Google Maps dark mode, Waze night theme). The UI communicates precision and confidence — a tool you trust with your journey. Every visual decision reinforces three traits:

- **Clarity:** Information is scannable. Primary data is always largest and brightest.
- **Depth:** Layered dark surfaces create visual hierarchy without borders.
- **Motion:** Purposeful animations guide attention — nothing animates for decoration alone.

---

## 2. Color Palette

All colors are defined in `constants/colors.ts` and referenced by token name throughout the app. **No hex values appear in component files.**

### Background & Surface

| Token | Hex | Usage |
|---|---|---|
| `Background` | `#0A0E1A` | Screen background, full-page fills |
| `Surface` | `#141828` | Cards, bottom sheets, modals |
| `SurfaceElevated` | `#1E2538` | Elevated cards, input backgrounds, active states |
| `Overlay` | `rgba(0, 0, 0, 0.6)` | Map overlays, modal backdrops |

### Brand Colors

| Token | Hex | Usage |
|---|---|---|
| `Primary` | `#4F8EF7` | CTA buttons, active states, links, selected indicators |
| `PrimaryLight` | `#7AADFF` | Button hover, icon highlights, tint on focus rings |
| `PrimaryDark` | `#2D6BD4` | Button pressed state |
| `Secondary` | `#FF6B6B` | Destination pin, danger-adjacent actions, coral accents |
| `SecondaryLight` | `#FF9090` | Destination icon tint |

### Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| `Success` | `#4CAF50` | Start/origin pin, success toasts, confirmation states |
| `SuccessLight` | `#81C784` | Success icon backgrounds |
| `Error` | `#FF4444` | Form validation errors, destructive action indicators |
| `ErrorLight` | `#FF7676` | Error icon tint |
| `Warning` | `#FFA726` | Caution banners (not used in v1) |

### Text

| Token | Hex | Usage |
|---|---|---|
| `TextPrimary` | `#FFFFFF` | Headings, primary body text, active labels |
| `TextSecondary` | `#8A9BB0` | Secondary labels, captions, placeholder text |
| `TextMuted` | `#4A5568` | Disabled labels, dividers text, hint text |
| `TextInverse` | `#0A0E1A` | Text on light-colored backgrounds |

### Border & Divider

| Token | Hex | Usage |
|---|---|---|
| `Border` | `#2D3748` | Input borders, card outlines |
| `BorderFocused` | `#4F8EF7` | Input border when focused |
| `BorderError` | `#FF4444` | Input border in error state |
| `Divider` | `#1A2033` | Section dividers, horizontal rules |

### Map-Specific

| Token | Hex | Usage |
|---|---|---|
| `MapRouteColor` | `#4F8EF7` | Route polyline stroke |
| `MapOriginPin` | `#4CAF50` | Start location marker |
| `MapDestinationPin` | `#FF6B6B` | End location marker |

---

### Color Palette Visual Reference

```
Backgrounds (darkest → lightest):
  #0A0E1A  ██  Background
  #141828  ██  Surface
  #1A2033  ██  Divider
  #1E2538  ██  Surface Elevated
  #2D3748  ██  Border

Brand:
  #4F8EF7  ██  Primary
  #7AADFF  ██  Primary Light
  #FF6B6B  ██  Secondary

Text (most prominent → least):
  #FFFFFF  ██  Text Primary
  #8A9BB0  ██  Text Secondary
  #4A5568  ██  Text Muted

Semantic:
  #4CAF50  ██  Success
  #FF4444  ██  Error
  #FFA726  ██  Warning
```

---

## 3. Typography System

Font family: **Inter** (loaded via `expo-font`). Falls back to `System` font if Inter fails to load.

```
expo-font loads Inter variants:
  - Inter_400Regular
  - Inter_500Medium
  - Inter_600SemiBold
  - Inter_700Bold
```

### Type Scale

| Style Name | Token | Size | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|---|
| Display | `Typography.Display` | 32px | Bold (700) | 40px | -0.5 | Hero text, splash |
| H1 | `Typography.H1` | 28px | Bold (700) | 36px | -0.3 | Screen titles |
| H2 | `Typography.H2` | 22px | SemiBold (600) | 30px | -0.2 | Section headers |
| H3 | `Typography.H3` | 18px | SemiBold (600) | 26px | 0 | Card titles, group labels |
| Body Large | `Typography.BodyLarge` | 16px | Regular (400) | 24px | 0 | Primary body text |
| Body | `Typography.Body` | 14px | Regular (400) | 22px | 0 | Secondary body, list items |
| Body Medium | `Typography.BodyMedium` | 14px | Medium (500) | 22px | 0 | Emphasized body text |
| Caption | `Typography.Caption` | 12px | Regular (400) | 18px | 0.2 | Metadata, timestamps, badges |
| Label | `Typography.Label` | 11px | Medium (500) | 16px | 0.5 | Tags, chip labels, tiny UI elements |

### Typography Rules

1. **Never** specify `fontSize` directly in component StyleSheets — always reference a typography token.
2. **Never** hardcode font family strings — use the `Typography` constant which handles platform fallbacks.
3. **Text contrast:** `TextPrimary` on `Background` = 18.5:1 (AAA). `TextSecondary` on `Surface` ≈ 5.3:1 (AA).
4. **Line height** must always be defined — prevents clipping with Inter's ascender/descender metrics.

---

## 4. Spacing Scale

Base unit: **4px**. All spacing values are multiples of 4.

```typescript
// constants/spacing.ts
export const Spacing = {
  xs: 4,    // Micro gaps — icon padding, tight label gaps
  sm: 8,    // Small gaps — between related elements
  md: 12,   // Medium gaps — list item internal padding
  lg: 16,   // Large gaps — section padding, card padding (default)
  xl: 20,   // Extra large — between distinct elements
  xxl: 24,  // Double section gap
  xxxl: 32, // Major section breaks
  huge: 40, // Screen top padding, large visual separators
  giant: 48,// Bottom safe area, modal header heights
  max: 64,  // Hero section padding, full-bleed areas
} as const;
```

### Usage Rules

- **Padding inside cards:** `Spacing.lg` (16px) on all sides.
- **Gap between cards in a list:** `Spacing.md` (12px).
- **Screen horizontal padding:** `Spacing.lg` (16px) on left and right.
- **Vertical spacing between form fields:** `Spacing.lg` (16px).
- **Icon-to-label gap:** `Spacing.sm` (8px).
- **Section title margin bottom:** `Spacing.md` (12px).

---

## 5. Border Radius System

```typescript
// constants/spacing.ts (or a dedicated borderRadius constant)
export const Radius = {
  xs: 4,    // Tags, badges, small chips
  sm: 8,    // Input fields, small buttons
  md: 12,   // Cards, modals, medium containers
  lg: 16,   // Large cards, bottom sheets
  xl: 24,   // Hero cards, prominent containers
  full: 9999, // Pills, circular elements (avatars, FABs)
} as const;
```

### Component Border Radius Reference

| Component | Radius Token | px |
|---|---|---|
| Button (sm) | `Radius.sm` | 8 |
| Button (md, lg) | `Radius.md` | 12 |
| Input | `Radius.sm` | 8 |
| Card (default) | `Radius.lg` | 16 |
| Badge | `Radius.full` | 9999 |
| Bottom Sheet | `Radius.xl` top corners only | 24 |
| Map Overlay | `Radius.lg` | 16 |
| Location Item | `Radius.md` | 12 |

---

## 6. Shadow & Elevation System

Three elevation levels are defined to create depth on the dark surface.

```typescript
// constants/colors.ts or theme.ts

export const Shadows = {
  low: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3, // Android
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  high: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.50,
    shadowRadius: 24,
    elevation: 16,
  },
};
```

| Level | Usage |
|---|---|
| `low` | Location list items, subtle card lift |
| `medium` | Trip summary card, bottom sheet |
| `high` | Floating action buttons, active modals |

---

## 7. Icon Library

**Library:** `@expo/vector-icons` → `Ionicons` (primary), with `MaterialIcons` as secondary for any gaps.

### Icon Size Scale

| Context | Size |
|---|---|
| Navigation header icons | 24px |
| List item leading icons | 20px |
| Inline text icons | 16px |
| Tab bar icons | 26px |
| FAB / prominent icons | 32px |
| Map pin icons (overlay) | 28px |

### Icon Color Rules

- Active/primary icons: `Colors.Primary` (`#4F8EF7`)
- Secondary/inactive icons: `Colors.TextSecondary` (`#8A9BB0`)
- Destructive icons: `Colors.Error` (`#FF4444`)
- Success/origin icons: `Colors.Success` (`#4CAF50`)
- Destination icons: `Colors.Secondary` (`#FF6B6B`)

### Icon Reference (Key Icons by Screen)

| Icon Name (Ionicons) | Usage |
|---|---|
| `mail-outline` | Email input |
| `lock-closed-outline` | Password input |
| `eye-outline` / `eye-off-outline` | Password visibility toggle |
| `navigate-circle-outline` | Current location button |
| `location-outline` | Location input from field |
| `location` (filled) | Location input to field |
| `time-outline` | Recent location in suggestions |
| `star-outline` | Popular location in suggestions |
| `swap-vertical-outline` | Swap From/To locations |
| `arrow-back` | Back navigation header |
| `car-outline` | Travel mode: car |
| `walk-outline` | Travel mode: walk |
| `map-outline` | Route view tab / header |
| `navigate` | Start navigation CTA |
| `close-outline` | Clear / dismiss |
| `checkmark-circle` | Success confirmation |

---

## 8. Component Tokens

Standardized height and sizing for interactive elements, ensuring consistency and meeting touch target minimums.

### Button

| Variant | Height | Min Width | Padding H | Font Style |
|---|---|---|---|---|
| Small (sm) | 36px | 80px | 12px | `Typography.BodyMedium` |
| Medium (md) | 48px | 120px | 20px | `Typography.BodyLarge` |
| Large (lg) | 56px | 160px | 24px | `Typography.H3` |

All buttons have a minimum touch target of 44×44pt (enforced by `hitSlop` on small sizes).

### Input

| State | Height | Border Width |
|---|---|---|
| Default | 52px | 1px (`Colors.Border`) |
| Focused | 52px | 2px (`Colors.BorderFocused`) |
| Error | 52px | 2px (`Colors.BorderError`) |
| Disabled | 52px | 1px (`Colors.Border`, opacity 0.5) |

### Card

| Property | Value |
|---|---|
| Padding | `Spacing.lg` (16px) |
| Border Radius | `Radius.lg` (16px) |
| Background | `Colors.Surface` |
| Elevated Background | `Colors.SurfaceElevated` |

### Bottom Sheet

| Property | Value |
|---|---|
| Default Height | 30% of screen height |
| Max Height | 65% of screen height |
| Top Border Radius | `Radius.xl` (24px) |
| Handle Width | 40px |
| Handle Height | 4px |
| Handle Color | `Colors.Border` |

---

## 9. Animation Guidelines

All animations use `react-native-reanimated` v3 for UI-thread performance.

### Standard Durations

| Type | Duration | Easing |
|---|---|---|
| Micro (press feedback) | 100ms | `Easing.out(Easing.quad)` |
| Fast (icon change, badge) | 200ms | `Easing.out(Easing.quad)` |
| Normal (card transitions) | 300ms | `Easing.out(Easing.cubic)` |
| Slow (screen entry) | 400ms | `Easing.out(Easing.exp)` |
| Spring (button press) | — | `withSpring({ damping: 15, stiffness: 200 })` |

### Standard Animation Patterns

| Pattern | Implementation | Usage |
|---|---|---|
| **Fade in** | `opacity: 0 → 1` (400ms) | Screen mount, card entry |
| **Slide up** | `translateY: 40 → 0` + fade (400ms) | Bottom sheet, trip card |
| **Scale press** | `scale: 1 → 0.96` on press, spring back | All touchable elements |
| **Shimmer** | Animated gradient overlay (600ms loop) | Loading placeholders |
| **Input focus ring** | Border color + width transition (200ms) | Input focused state |

### Animation Rules

1. **Never** animate `width` or `height` of a layout element — it causes expensive layout recalculation. Animate `transform` instead.
2. **Always** add `useNativeDriver: true` when using the classic `Animated` API.
3. **Prefer** `withTiming` and `withSpring` from Reanimated 3 over `Animated.timing`.
4. **Respect** `AccessibilityInfo.isReduceMotionEnabled` — disable non-essential animations when the user has enabled Reduce Motion.

---

## 10. Responsive Strategy

TripPath targets **three canonical screen size groups:**

| Group | Example Devices | Width Range |
|---|---|---|
| Small | iPhone SE (3rd gen), Galaxy A series | 320px – 375px |
| Medium | iPhone 14, Pixel 7 | 375px – 414px |
| Large | iPhone 14 Pro Max, Galaxy S24+ | 414px – 430px+ |

### Implementation Approach

```typescript
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Percentage-based widths for full-bleed elements
const CARD_WIDTH = SCREEN_WIDTH - Spacing.lg * 2; // 16px margin each side

// Relative heights for bottom sheets and hero areas
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.3;
const HERO_HEIGHT = SCREEN_HEIGHT * 0.35;
```

### Rules

- **Horizontal padding:** Fixed 16px on each side via `Spacing.lg`. Let content fill naturally.
- **List items:** Full width minus horizontal padding. Never fixed pixel widths.
- **Map region:** Always calculated from actual coordinates, never hardcoded.
- **Bottom sheet:** Percentage of screen height (`30%` resting, `65%` expanded).
- **Font sizes:** Fixed values from the type scale (do NOT scale with screen size — use `Text` with `allowFontScaling={true}` and let the OS handle accessibility scaling).
- **Touch targets:** Minimum 44×44pt enforced via `minHeight`, `minWidth`, or `hitSlop`.

### Pixel Density Awareness

- Use `PixelRatio.roundToNearestPixel()` for values that must snap to physical pixels (borders, dividers).
- Map tiles and images use `@2x`/`@3x` asset variants via Expo's asset resolution.
- `StyleSheet.hairlineWidth` for single-pixel dividers (device-accurate 1px).

---

## 11. Dark Map Style

The map in Route View uses a custom dark style JSON to match the app's visual language. This JSON is passed to `react-native-maps` MapView's `customMapStyle` prop.

Key style overrides (abbreviated):

```json
[
  { "elementType": "geometry", "stylers": [{ "color": "#0A0E1A" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#8A9BB0" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#141828" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#1E2538" }] },
  { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#2D3748" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#050A14" }] },
  { "featureType": "poi", "stylers": [{ "visibility": "off" }] }
]
```

The full style JSON will be stored in `constants/mapStyle.ts`.

---

*See `04-SCREEN-SPECS.md` for per-screen design application, `05-COMPONENT-GUIDE.md` for component-level implementation.*
