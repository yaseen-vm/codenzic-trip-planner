# TripPath — Design System

> The tokens below are the source of truth in `src/constants/theme.ts`. Components must use them instead of literals. Related: [Component guide](05-COMPONENT-GUIDE.md).

The UI is a light theme with an orange accent and Nunito Sans typography.

## 1. Colors (`COLORS`)

| Token              | Value                 | Use                                                             |
| ------------------ | --------------------- | --------------------------------------------------------------- |
| `background`       | `#F3F5F7`             | Screen background, icon wells, tinted cards                     |
| `white`            | `#FFFFFF`             | Cards, sheets, inputs, button text                              |
| `text`             | `#111F2C`             | Primary text, icons, drop-off marker                            |
| `muted`            | `#7C8B99`             | Secondary text, input icons                                     |
| `faint`            | `#A9B4BE`             | Section labels, inactive button text                            |
| `placeholder`      | `#9CA3AF`             | Input placeholders                                              |
| `border`           | `#E6EBEF`             | Hairlines, inactive button fill                                 |
| `orange`           | `#F1521F`             | Accent: primary button, active label, pickup marker, route line |
| `orangeDark`       | `#D3410F`             | Text on the selected mode chip                                  |
| `paleOrange`       | `#FDEBE3`             | Selected mode chip fill                                         |
| `dark`             | `#17212F`             | Destination pin and web map end marker                          |
| `banner`           | `rgba(17,31,44,0.9)`  | Traffic banner                                                  |
| `overlay`          | `rgba(17,31,44,0.55)` | Modal backdrops                                                 |
| `noticeBackground` | `#FFF5E9`             | Notice banner fill                                              |
| `noticeText`       | `#8B4B17`             | Notice banner text                                              |
| `mapBackground`    | `#E9E3D9`             | Behind the map while it loads                                   |

## 2. Typography (`FONTS`)

Nunito Sans, loaded in `src/app/_layout.tsx`. If loading fails the app falls back to the system font instead of blocking.

| Token       | Family                    | Typical use                            |
| ----------- | ------------------------- | -------------------------------------- |
| `regular`   | `NunitoSans_400Regular`   | Body copy, subtitles, notices          |
| `semiBold`  | `NunitoSans_600SemiBold`  | Distance / ETA line, success messages  |
| `bold`      | `NunitoSans_700Bold`      | Inputs, row titles, labels, mode chips |
| `extraBold` | `NunitoSans_800ExtraBold` | Headings, buttons, section labels      |

Common sizes: screen headings 26–32, route duration 34, buttons 17, body 15, secondary 13–14. Section labels are 13 px, extra-bold, `faint`, with 1.04 letter spacing (`SectionLabel`).

## 3. Radius, spacing, sizes

| Group     | Tokens                                                                      |
| --------- | --------------------------------------------------------------------------- |
| `RADIUS`  | `control` 16 · `card` 24 · `sheet` 28 · `notice` 12                         |
| `SPACING` | `xs` 4 · `sm` 8 · `md` 12 · `lg` 16 · `xl` 20 · `xxl` 24                    |
| `SIZES`   | `button` 56 · `floatingButton` 44 · `iconSm` 16 · `iconMd` 18 · `iconLg` 24 |

## 4. Shadows (`SHADOWS`)

| Token      | Use                                                  |
| ---------- | ---------------------------------------------------- |
| `floating` | Buttons floating over the map (`FloatingIconButton`) |
| `sheet`    | The route bottom sheet                               |
| `subtle`   | Text fields and the pickup/drop-off card             |

## 5. Map styling

`src/constants/mapStyle.ts` defines the muted beige/blue Google basemap (land `#ECE7DD`, water `#9FC4D8`, parks `#DDE5D3`, POI and transit hidden). Satellite mode ignores it and uses the hybrid map type. Markers are SVG components in `components/map/RoutePins.tsx`; the route polyline is orange, 2 px, dashed `[5, 4]`.

## 6. Rules

1. No hex colors, font names or magic spacing numbers in components — add a token if one is missing.
2. Repeated UI becomes a shared component (`NoticeBanner`, `SectionLabel`, `RouteRail`, `FloatingIconButton`, `PrimaryButton`).
3. Icons come from `lucide-react-native`; sizes use `SIZES.icon*`.
4. Interactive elements carry an `accessibilityRole` and, when they have no text, an `accessibilityLabel` from `src/constants/strings.ts`.
5. Always use safe-area insets for bottom padding on sheets and footers.
