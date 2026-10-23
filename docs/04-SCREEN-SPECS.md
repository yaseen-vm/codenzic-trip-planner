# TripPath — Screen Specs

> Behaviour of each screen as implemented. All copy is in `src/constants/strings.ts`. Related: [Navigation](09-NAVIGATION-FLOW.md) · [Components](05-COMPONENT-GUIDE.md).

## 1. Index (`/`)

`src/app/index.tsx` redirects to `/login`.

## 2. Login (`/login`)

Source: `src/features/auth/LoginScreen.tsx`, `AuthModals.tsx`.

**Layout:** brand mark, heading "Welcome back", subtitle, email field, password field (show/hide toggle), "Forgot password?" link, sticky footer with "Log in" and "New to Wayfare? Create an account".

| Behaviour       | Detail                                                                                                                                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Validation      | `validateLogin`: valid email, password ≥ 6 characters. Errors appear only after the first submit and update live afterwards                                                                                                     |
| Submit          | "Log in" or the keyboard "done" key; on success `router.push('/locations')`; otherwise stays and shows errors                                                                                                                   |
| Forgot password | `ForgotPasswordModal`. Validates the email, then shows "Demo complete for …. No reset email was sent." and "Back to log in". Nothing is sent                                                                                    |
| Create account  | `CreateAccountModal`: name, email, password, confirm. Validates with `validateSignup`, then shows "Demo complete, <name>. No account was created." and "Continue in demo mode", which closes the modal and goes to `/locations` |
| Reset on close  | Closing either modal clears its fields and state                                                                                                                                                                                |

Authentication is a demo: any well-formed email and password continues.

## 3. Set locations (`/locations`)

Source: `src/features/locations/`.

**Layout:** header (back, "Where are you going?", "Step 1 of 2 · Set pickup and drop-off"), scrolling content, sticky "Next" footer.

1. **Trip card (`TripFields`)** – rail, Pickup and Drop-off inputs, clear (✕) buttons shown when a field has text, swap button. The active field's label turns orange.
2. **Notices (`NoticeBanner`)** – missing Places key, autocomplete failure (announced as an alert), location permission / GPS messages.
3. **Actions** – "Use current" (spinner and "Locating…" while busy) and "Pick on map".
4. **List** – labelled "Set as pickup" or "Set as drop-off" for the active field. Shows live Google suggestions when there are any, otherwise the saved places matching the typed text. A spinner shows while searching or resolving; an empty card explains when nothing matches (and says search is not configured when there is no key).

| Behaviour              | Detail                                                                                                                                                                                                                                    |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Typing                 | Updates the text, makes that field active and **discards any committed place** for it                                                                                                                                                     |
| Autocomplete           | Needs a key, an unselected field and ≥ 3 characters; 300 ms debounce; older requests aborted; previous results stay visible while the next load                                                                                           |
| Choosing a saved place | Fills the active field with `"<name> · <short address>"` and uses its stored coordinates                                                                                                                                                  |
| Choosing a suggestion  | Fetches place details with the autocomplete session token; fills label and coordinates. Failure → alert "Could not select place"                                                                                                          |
| After choosing         | Choosing the pickup moves focus to the drop-off; choosing the drop-off stays                                                                                                                                                              |
| Use current            | Permission → position → reverse-geocoded label (coordinates if geocoding fails). Denied / failure → inline notice                                                                                                                         |
| Pick on map            | Opens `MapPicker`. Pickup opens on the field's place or the default centre (Doha); drop-off opens on the chosen pickup. Confirm reverse-geocodes the pin position                                                                         |
| Swap / clear           | Swap exchanges text and places and keeps the active field; clear empties one field and activates it                                                                                                                                       |
| Next                   | Always pressable (looks inactive until both places are chosen). Neither/one chosen → alert "Choose locations from suggestions"; identical coordinates → alert "Choose different locations"; otherwise pushes `/route` with the six params |

## 4. Route (`/route`)

Source: `src/features/route/`.

**Params:** `pickup`, `dropoff` (labels, default "Pickup" / "Destination"), `pickupLat`, `pickupLng`, `dropoffLat`, `dropoffLng` (parsed with `parseCoordinate`; `0,0` is valid).

**Invalid params** (missing, non-numeric, out of range) render `InvalidRouteState` — "Invalid locations" with a "Choose locations" button that `replace`s to `/locations`. No request is made.

**Valid params** render `RouteDetails`:

- **Map** – `RouteMap` with pickup and destination markers, the decoded polyline (when it has ≥ 2 points), fitted to the route once the map is ready. Floating back button (top-left) and layers button (top-right, toggles satellite). A traffic banner appears for moderate or heavy traffic.
- **Bottom sheet** – `RouteSummary` (eyebrow "Fastest route", duration, distance and "arrive HH:MM"), `ModeSelector` (Drive / Ride / Walk), `TripPlaces`, "Turn by turn" `StepList`, and "Start navigation".

| State   | Summary                                                                                                       | Steps area                      | Start navigation                   |
| ------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------- | ---------------------------------- |
| Loading | "Calculating…", distance "—"                                                                                  | spinner                         | disabled                           |
| Ready   | duration, distance, arrival time                                                                              | up to 20 steps (or placeholder) | enabled if the path has ≥ 2 points |
| Error   | headline ("Configuration required" for a missing key, otherwise "API setup required") and "Route unavailable" | the error message               | disabled                           |

Changing the mode requests a new route (traffic-aware only for Drive) and aborts the previous request. "Start navigation" asks "Open turn-by-turn navigation?"; "Open Maps" opens Google Maps directions with `travelmode` `driving`, `bicycling` (Ride) or `walking`.
