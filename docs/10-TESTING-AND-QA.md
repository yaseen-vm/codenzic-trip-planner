# TripPath — Testing & QA

> **Status note:** this document is the original pre-development plan. The shipped app differs (light theme with orange accent, flat Expo Router files in `app/`, local component state, no auth context, Google Places/Routes instead of mock data). The current state is in [README.md](../README.md) (`./README.md` for this file if at repo root) and [PROJECT-SETUP.md](PROJECT-SETUP.md).

> **Document:** 10 — Testing Strategy & Quality Assurance Checklists  
> **Status:** Finalized (Pre-development)

---

## 1. Testing Philosophy

For this evaluation project, the primary testing mode is **manual QA** — systematic, screen-by-screen validation against the spec. The QA process is structured to catch:

1. **Functional bugs** — features that don't work as specified
2. **Visual regressions** — UI that doesn't match the design spec
3. **Edge cases** — unusual inputs, device states, and error conditions
4. **Accessibility issues** — barriers for users with different abilities
5. **Performance issues** — jank, slow renders, excessive memory

---

## 2. Screen 1: Login Screen — QA Checklist

### Functional

- [ ] Screen renders without crashing on first open
- [ ] Email input accepts and displays typed text
- [ ] Password input masks characters with `•` by default
- [ ] Eye icon toggles password visibility — text becomes readable
- [ ] Eye icon toggles back — text is masked again
- [ ] Tapping "Sign In" with empty fields shows validation errors (not crashes)
- [ ] Email field shows error: _"Email address is required"_ when empty + submitted
- [ ] Email field shows error: _"Please enter a valid email address"_ for `notanemail`
- [ ] Password field shows error: _"Password is required"_ when empty + submitted
- [ ] Password field shows error: _"Password must be at least 6 characters"_ for `abc`
- [ ] Valid email + 6+ char password → loading spinner appears
- [ ] After mock delay (~1.2s), navigation moves to Set Locations screen
- [ ] Errors clear when user corrects the field and re-submits
- [ ] "Create Account" tap shows appropriate message (Alert or Toast)

### Visual

- [ ] Background is `#0A0E1A` (deep navy) — no white/light flash
- [ ] Logo and tagline are centered
- [ ] Form inputs have correct border color (`#2D3748` default, `#4F8EF7` focused)
- [ ] Error state shows red border (`#FF4444`) + red error message below field
- [ ] Sign In button is `#4F8EF7` blue with white text
- [ ] Loading state shows ActivityIndicator inside button — button text hidden
- [ ] Button press has subtle scale animation (shrinks slightly)

### Platform & Edge Cases

- [ ] **iOS:** Keyboard appears when tapping email input — form scrolls up, Sign In button still visible
- [ ] **Android:** Keyboard appears — layout adjusts correctly (no content hidden behind keyboard)
- [ ] Very long email address doesn't overflow — input scrolls horizontally
- [ ] Password with Unicode characters (emoji, accented chars) — no crash
- [ ] Form inputs are disabled while loading (cannot type during auth)
- [ ] App goes to background while loading — returns to correct state (not stuck in loading)
- [ ] Rotate to landscape (if not locked) — UI adapts without overflow

---

## 3. Screen 2: Set Locations Screen — QA Checklist

### Functional

- [ ] Screen renders with both inputs empty
- [ ] Tapping "From" input field focuses it (keyboard appears, `activeInput = 'from'`)
- [ ] Tapping "To" input field focuses it (`activeInput = 'to'`)
- [ ] Typing in active input filters the suggestions list in real time
- [ ] Empty search query shows all 6 mock locations
- [ ] Search for "mall" shows only "City Mall"
- [ ] Search for a non-existent term shows empty state ("No matching locations found")
- [ ] Tapping a suggestion item fills the active input field
- [ ] After filling "From", cursor/activeInput automatically moves to "To" (if "To" is empty)
- [ ] Swap button swaps "From" and "To" values correctly
- [ ] Swap when one field is empty — works (empty field moves to other slot)
- [ ] Clear (×) button on a field clears only that field
- [ ] "Use Current Location" button triggers location permission prompt
- [ ] Location permission granted → "Current Location" fills the "From" field
- [ ] Location permission denied → Alert shown, no crash
- [ ] "Proceed" button is **disabled** (opacity 0.5, unresponsive) when either field is empty
- [ ] "Proceed" button is **enabled** when both fields are filled
- [ ] Tapping "Proceed" with both fields → navigates to Trip Ready screen

### Visual

- [ ] From input has green dot indicator (`#4CAF50`)
- [ ] To input has red dot indicator (`#FF6B6B`)
- [ ] Swap button visible between the two inputs
- [ ] Suggestions list shows icon (clock/star/navigate), name, address, and distance badge
- [ ] "Recent" type locations show clock icon
- [ ] "Popular" type locations show star icon
- [ ] "Current" type locations show navigation icon
- [ ] FlatList separator visible between items
- [ ] Location item tap has press feedback (opacity change)

### Platform & Edge Cases

- [ ] Very long location name truncates with `...` (ellipsis) — no overflow
- [ ] Very long address truncates to 1 line — no overflow
- [ ] Location services disabled on device → informative Alert, no crash
- [ ] No GPS signal (simulate by enabling airplane mode) → handled gracefully
- [ ] Slow device — list scrolling remains smooth (no jank)
- [ ] 0 locations in suggestions after filter → empty state component renders

---

## 4. Screen 3: Trip Ready Screen — QA Checklist

### Functional

- [ ] Screen renders with correct From and To location names
- [ ] Screen renders correct addresses for both locations
- [ ] Shimmer loading animation plays on MetaChips while calculating
- [ ] After ~800ms, shimmer disappears and real values appear (distance, duration, mode)
- [ ] Distance value is a number string (e.g., "12.4 km")
- [ ] Duration value is a time string (e.g., "24 min" or "1h 5min")
- [ ] Travel mode shows Car icon
- [ ] "View Route" button is present and tappable
- [ ] Tapping "View Route" navigates to Route View screen
- [ ] "Change Locations" button is present and tappable
- [ ] Tapping "Change Locations" navigates back to Set Locations screen
- [ ] Back button (arrow icon, top-left) navigates back to Set Locations

### Visual

- [ ] Background is `#0A0E1A` (matches rest of app)
- [ ] Illustration/icon area renders in upper portion of screen
- [ ] TripSummaryCard slides up with fade animation on mount
- [ ] Green dot for From location, red dot for To location
- [ ] Vertical connector line between From and To (dashed or solid)
- [ ] MetaChips have correct background (`#1E2538`) and border radius
- [ ] "View Route" is primary (blue) button, full width
- [ ] "Change Locations" is ghost button (transparent, muted text)

### Platform & Edge Cases

- [ ] Very long location name in TripSummaryCard — wraps to 2 lines (no overflow)
- [ ] Duration > 60 minutes formats correctly as `1h 15min` (not `75 min`)
- [ ] Screen navigated to without TripContext data (edge case guard) — redirected to set-locations
- [ ] App goes to background during calculation delay — resumes correctly on return

---

## 5. Screen 4: Route View Screen — QA Checklist

### Functional

- [ ] Screen renders without crashing
- [ ] Map loads and displays (not a blank gray screen)
- [ ] Dark map style is applied (dark background, not default Google Maps light)
- [ ] Green marker renders at "From" location coordinate
- [ ] Red marker renders at "To" location coordinate
- [ ] Route polyline (blue) renders between the two markers
- [ ] Map initial view shows both markers within the viewport (padded)
- [ ] FloatingHeader visible at top of map with back arrow and title
- [ ] Back arrow navigates back to Trip Ready screen
- [ ] Bottom sheet renders at 30% height by default
- [ ] Bottom sheet shows From location name, To location name
- [ ] Bottom sheet shows distance and ETA
- [ ] "Start Navigation" button is visible and tappable
- [ ] Tapping "Start Navigation" opens native Maps app (or browser fallback)
- [ ] Bottom sheet is draggable — drag up expands to 65%
- [ ] Bottom sheet is draggable — drag down collapses to 30%

### Visual

- [ ] Map fills the entire screen (no margins)
- [ ] FloatingHeader has semi-transparent `Surface` background (glassmorphism)
- [ ] Bottom sheet has rounded top corners (`borderTopRadius: 24px`)
- [ ] Drag handle visible on bottom sheet (short gray bar at top)
- [ ] "Start Navigation" button is primary (blue), full width inside bottom sheet
- [ ] Polyline stroke color is `#4F8EF7` (Primary)
- [ ] Marker pins are colored correctly (green origin, red destination)

### Platform & Edge Cases

- [ ] Google Maps not installed (Android) → "Start Navigation" falls back to browser URL
- [ ] Map renders on device without Google Play Services (unlikely, but handle gracefully)
- [ ] Very short route (same neighborhood) — map zooms in appropriately
- [ ] Very long route (city to airport) — map zooms out to fit both markers
- [ ] Small screen (iPhone SE) — bottom sheet doesn't cover the entire map
- [ ] Map tiles fail to load (airplane mode) — map shows gray, no crash
- [ ] Bottom sheet expanded — "Start Navigation" button still fully visible and tappable

---

## 6. End-to-End Flow Tests

| Test Case               | Steps                                                                                                          | Expected Result                                                  |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **Happy Path**          | Open app → Login with valid credentials → Select From + To locations → Proceed → View Route → Start Navigation | Smooth navigation through all 4 screens, no errors               |
| **Validation path**     | Open app → Login → Submit empty form                                                                           | Both error messages appear, no navigation                        |
| **Location swap**       | Set Locations → Fill both → Swap                                                                               | From and To values exchange correctly                            |
| **Current location**    | Set Locations → Use Current Location                                                                           | "From" fills with "Current Location", GPS coordinates in context |
| **Back navigation**     | Route View → Back → Trip Ready → Back → Set Locations                                                          | Each back lands on correct screen                                |
| **Change locations**    | Trip Ready → Change Locations → Modify To → Proceed                                                            | New trip data appears in Trip Ready                              |
| **Auth persistence**    | Login → Background app for 5 min → Resume                                                                      | Still logged in, Set Locations shows                             |
| **Logout and re-login** | (If logout implemented) Logout → Login again                                                                   | Clean state, can plan new trip                                   |

---

## 7. Responsive Testing Matrix

Test every screen on these three representative sizes:

| Device Class | Example             | Screen Width | Screen Height | Notes                                       |
| ------------ | ------------------- | ------------ | ------------- | ------------------------------------------- |
| **Small**    | iPhone SE 3rd gen   | 375 pt       | 667 pt        | No Dynamic Island. Smallest supported size. |
| **Medium**   | iPhone 14 / Pixel 7 | 390 pt       | 844 pt        | Most common size. Primary dev target.       |
| **Large**    | iPhone 14 Pro Max   | 430 pt       | 932 pt        | Dynamic Island (iOS). Largest size.         |

### Responsive Test Points

For each screen × each device:

- [ ] No content overflow or clipping
- [ ] No excessive whitespace on large screens
- [ ] All touch targets reachable without awkward stretching
- [ ] Keyboard doesn't hide active input
- [ ] Bottom sheet doesn't cover the entire map on small screens
- [ ] Text doesn't wrap unexpectedly on small screens

---

## 8. Accessibility Checklist

### Color Contrast

All text must meet WCAG AA (minimum 4.5:1 for body text, 3:1 for large text ≥ 18pt bold).

| Text                                              | Background | Ratio  | Standard             | Pass?                                    |
| ------------------------------------------------- | ---------- | ------ | -------------------- | ---------------------------------------- |
| `#FFFFFF` (TextPrimary) on `#0A0E1A` (Background) | —          | 18.5:1 | AAA                  | ✅                                       |
| `#FFFFFF` on `#4F8EF7` (Primary button)           | —          | 4.0:1  | AA (large text)      | ✅                                       |
| `#8A9BB0` (TextSecondary) on `#141828` (Surface)  | —          | 5.3:1  | AA                   | ✅                                       |
| `#FF4444` (Error) on `#141828`                    | —          | 4.6:1  | AA                   | ✅                                       |
| `#4A5568` (TextMuted) on `#141828`                | —          | 2.8:1  | ❌ (decorative only) | ⚠️ Use only for non-essential decoration |

> `TextMuted` (`#4A5568`) does not meet AA contrast. It is used **only** for placeholder text and decorative dividers — never for required-to-read information.

### Touch Targets

- [ ] All buttons are at minimum 44×44pt (use `minHeight: 44, minWidth: 44` or `hitSlop`)
- [ ] Location list items are at minimum 48pt tall
- [ ] Input fields are at minimum 52pt tall
- [ ] Small icon buttons use `hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}`

### Screen Reader (VoiceOver / TalkBack)

- [ ] Every interactive element has `accessibilityLabel`
- [ ] Every interactive element has `accessibilityRole` ('button', 'text', 'image', etc.)
- [ ] Error messages are announced via `accessibilityLiveRegion="polite"`
- [ ] Loading states announce via `accessibilityLabel` on the button ("Loading, please wait")
- [ ] Map region has `accessibilityLabel="Route map"` on the MapView wrapper
- [ ] Location items have comprehensive labels: "Home, 123 Maple Street, 2.1 kilometers, recent location"

### Font Scaling

- [ ] Enable "Larger Text" in device accessibility settings
- [ ] Verify no text is clipped in fixed-height containers
- [ ] Verify layout doesn't break at 130% and 150% font scale
- [ ] All `Text` components have `allowFontScaling={true}` (default) — NOT disabled

### Motion Sensitivity

- [ ] Enable "Reduce Motion" on device
- [ ] Verify animations are disabled or reduced
- [ ] Verify app is still fully usable without animations
- [ ] Check `AccessibilityInfo.isReduceMotionEnabled()` is called before animating

---

## 9. Pre-Submission Final Checklist

### Code Quality

- [ ] `npm run type-check` — zero TypeScript errors
- [ ] `npm run lint:check` — zero ESLint errors
- [ ] `npm run format:check` — no Prettier violations
- [ ] No `console.log` statements in production code (warnings and errors only)
- [ ] No commented-out code blocks
- [ ] No `// TODO` or `// FIXME` comments

### Build Verification

- [ ] `expo start --clear` — dev server starts cleanly
- [ ] App runs on Android device via Expo Go
- [ ] App runs on iOS device via Expo Go (if available)
- [ ] `eas build --platform android --profile preview` — build completes without error
- [ ] APK installs successfully on a clean Android 10+ device
- [ ] APK runs through the complete happy path flow without crashes

### Navigation

- [ ] All 4 screens are reachable following the intended flow
- [ ] Back navigation works correctly from all screens
- [ ] Auth guard prevents accessing app screens without auth
- [ ] Auth guard redirects to Set Locations if already authenticated

### Data & State

- [ ] Login persists after app restart (AsyncStorage hydration)
- [ ] Trip data correctly passed from Set Locations → Trip Ready → Route View
- [ ] TripContext state is correct at each screen

### Map & Location

- [ ] Map renders with dark style
- [ ] Both markers appear
- [ ] Polyline appears
- [ ] Location permission prompt appears correctly (not silently failing)

### GitHub Repository

- [ ] All 12 documentation files in `docs/` directory
- [ ] Clean commit history with Conventional Commit messages
- [ ] `.gitignore` excludes `node_modules/`, `.expo/`, build artifacts
- [ ] `README.md` is complete with setup instructions
- [ ] No API keys or secrets committed

---

_This document defines the QA gate. A build is submission-ready only when all checked items pass._
