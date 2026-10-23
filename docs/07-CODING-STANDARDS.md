# TripPath — Coding Standards

> **Status note:** this document is the original pre-development plan. The shipped app differs (light theme with orange accent, flat Expo Router files in `app/`, local component state, no auth context, Google Places/Routes instead of mock data). The current state is in [README.md](../README.md) (`./README.md` for this file if at repo root) and [PROJECT-SETUP.md](PROJECT-SETUP.md).

> **Document:** 07 — Coding Standards & Engineering Conventions  
> **Status:** Finalized (Pre-development)

---

## 1. TypeScript Configuration

### Strict Mode

TypeScript is configured in strict mode. The following flags are **all enabled** in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "bundler",
    "jsx": "react-native",
    "lib": ["ES2022"],
    "target": "ES2022",
    "baseUrl": ".",
    "paths": {
      "@components/*": ["components/*"],
      "@constants/*": ["constants/*"],
      "@hooks/*": ["hooks/*"],
      "@context/*": ["context/*"],
      "@types/*": ["types/*"],
      "@utils/*": ["utils/*"],
      "@assets/*": ["assets/*"]
    }
  }
}
```

### TypeScript Rules (Enforced)

| Rule                              | Requirement                                                                              |
| --------------------------------- | ---------------------------------------------------------------------------------------- |
| `any` type                        | **Forbidden.** Use `unknown` and narrow with type guards.                                |
| Non-null assertion (`!`)          | **Forbidden** except in contexts where null-safety is provably guaranteed and commented. |
| Type casting (`as`)               | Use sparingly. Prefer type guards. Never cast `unknown as Foo`.                          |
| `@ts-ignore` / `@ts-expect-error` | Requires a comment explaining why, reviewed in PR.                                       |
| Optional chaining (`?.`)          | Preferred over null checks.                                                              |
| Nullish coalescing (`??`)         | Preferred over `\|\|` for null/undefined defaults.                                       |
| Return types                      | Required on all exported functions and component props.                                  |
| Generic parameters                | Required on `useState`, `useRef`, `useCallback`, etc. when type cannot be inferred.      |

---

## 2. File Naming Conventions

| Entity                         | Convention                             | Rule                                   | Examples                                                             |
| ------------------------------ | -------------------------------------- | -------------------------------------- | -------------------------------------------------------------------- |
| **Screen files** (Expo Router) | `kebab-case.tsx`                       | File name becomes the URL segment      | `login.tsx`, `set-locations.tsx`, `trip-ready.tsx`, `route-view.tsx` |
| **Layout files**               | `_layout.tsx`                          | Underscore prefix = Expo Router layout | `_layout.tsx`                                                        |
| **React components**           | `PascalCase.tsx`                       | Matches exported component name        | `Button.tsx`, `LocationItem.tsx`, `TripSummaryCard.tsx`              |
| **Hooks**                      | `camelCase.ts` with `use` prefix       |                                        | `useAuth.ts`, `useLocation.ts`, `useTrip.ts`                         |
| **Context providers**          | `PascalCase.tsx` with `Context` suffix |                                        | `AuthContext.tsx`, `TripContext.tsx`                                 |
| **Utility modules**            | `camelCase.ts`                         |                                        | `helpers.ts`, `validation.ts`                                        |
| **Constant files**             | `camelCase.ts`                         |                                        | `colors.ts`, `typography.ts`, `spacing.ts`, `mockData.ts`            |
| **Type files**                 | `index.ts` (barrel)                    | Single export point                    | `types/index.ts`                                                     |
| **Test files**                 | `[filename].test.ts(x)`                | Co-located with source                 | `Button.test.tsx`                                                    |

---

## 3. Component File Structure Template

Every component file follows this exact ordering:

```tsx
// 1. ─── React imports ────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';

// 2. ─── React Native imports ─────────────────────────────────────────────────
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Platform,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';

// 3. ─── Expo imports ──────────────────────────────────────────────────────────
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// 4. ─── Third-party imports ───────────────────────────────────────────────────
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// 5. ─── Internal absolute imports (via path aliases) ─────────────────────────
import { Colors } from '@constants/colors';
import { Typography } from '@constants/typography';
import { Spacing, Radius, Shadows } from '@constants/spacing';
import { useAuth } from '@hooks/useAuth';
import { loginSchema, type LoginFormValues } from '@utils/validation';

// 6. ─── Relative imports ──────────────────────────────────────────────────────
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

// 7. ─── Type imports (always `import type`) ───────────────────────────────────
import type { User, Location } from '@types/index';

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

interface MyComponentProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const MyComponent = memo<MyComponentProps>(({ title, onPress, disabled = false, style }) => {
  // 1. Hooks (in order: state, refs, context, derived)
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const animValue = useRef<Animated.Value>(new Animated.Value(0)).current;

  // 2. Derived / memoized values
  const containerStyle = useMemo(
    () => [styles.container, disabled && styles.disabled, style],
    [disabled, style],
  );

  // 3. Effects
  useEffect(() => {
    // Effect logic
    return () => {
      // Cleanup
    };
  }, []);

  // 4. Event handlers (useCallback for all handlers passed as props)
  const handlePress = useCallback(() => {
    if (disabled || isLoading) return;
    onPress();
  }, [disabled, isLoading, onPress]);

  // 5. Early returns / guards
  if (!title) return null;

  // 6. Render
  return (
    <Pressable
      style={containerStyle}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  );
});

MyComponent.displayName = 'MyComponent';

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.Primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  title: {
    ...Typography.BodyLarge,
    color: Colors.TextPrimary,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export { MyComponent };
export type { MyComponentProps };
```

---

## 4. StyleSheet Conventions

### Rules

| Rule                           | Description                                                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| **No inline style objects**    | ❌ `style={{ marginTop: 16 }}` — creates a new object every render. ✅ `style={styles.marginTop}`                              |
| **Exception: dynamic styles**  | ✅ `style={[styles.container, { opacity: animValue }]}` — allowed when value changes at runtime                                |
| **Exception: memoized styles** | ✅ `style={useMemo(() => [styles.a, isDark && styles.dark], [isDark])}`                                                        |
| **Semantic naming**            | Style keys describe _what the element is_, not _what it looks like_. ✅ `errorContainer`, `labelText`. ❌ `redBox`, `bigFont`. |
| **Group related styles**       | Keep container, text, and icon styles adjacent. Add comments for major groups.                                                 |
| **No magic numbers**           | Every numeric value comes from `Spacing.*`, `Radius.*`, `Typography.*`, or `Colors.*`.                                         |
| **Platform-specific styles**   | Use `Platform.select({ ios: {...}, android: {...} })` or `Platform.OS` checks.                                                 |
| **Spread Typography**          | `...Typography.Body` applies `fontSize`, `fontFamily`, `lineHeight` in one spread.                                             |

### StyleSheet Group Template

```typescript
const styles = StyleSheet.create({
  // ─── Container ───────────────────────────────────
  container: { ... },
  contentContainer: { ... },

  // ─── Header ──────────────────────────────────────
  header: { ... },
  headerTitle: { ... },

  // ─── Input ───────────────────────────────────────
  inputWrapper: { ... },
  inputRow: { ... },
  inputField: { ... },

  // ─── Error ───────────────────────────────────────
  errorContainer: { ... },
  errorText: { ... },

  // ─── States ──────────────────────────────────────
  disabled: { opacity: 0.5 },
  focused: { borderColor: Colors.BorderFocused, borderWidth: 2 },
});
```

---

## 5. Hook Rules

| Rule                             | Description                                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Prefix**                       | Every hook filename and export starts with `use`.                                                            |
| **Single responsibility**        | Each hook does one thing. `useLocation` handles GPS — not auth, not form state.                              |
| **No hooks in hooks**            | Avoid deeply nested hook calls. If a hook needs too many other hooks, it should be split.                    |
| **Return objects, not arrays**   | Hooks return named objects `{ value, setValue, isLoading }`, not arrays (except `useState`-mirror patterns). |
| **Document side effects**        | Every `useEffect` inside a hook has a comment explaining its trigger and intent.                             |
| **No business logic in screens** | Screen files call hooks. Hooks contain the logic.                                                            |

### Hook Template

```typescript
// hooks/useLocation.ts

import { useState, useEffect, useCallback } from 'react';
import * as ExpoLocation from 'expo-location';
import type { Coordinate } from '@types/index';

interface UseLocationReturn {
  currentCoordinate: Coordinate | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => Promise<void>;
}

export const useLocation = (): UseLocationReturn => {
  const [currentCoordinate, setCurrentCoordinate] = useState<Coordinate | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setError('Location permission was denied.');
        return;
      }

      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      });

      setCurrentCoordinate({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (err) {
      setError('Failed to retrieve location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { currentCoordinate, isLoading, error, requestLocation };
};
```

---

## 6. Import Order

Enforced by ESLint (`import/order` rule). Imports must appear in this order, with blank lines between groups:

```typescript
// Group 1: React
import React, { useState, useEffect } from 'react';

// Group 2: React Native
import { View, Text, StyleSheet } from 'react-native';

// Group 3: Expo packages
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

// Group 4: Third-party npm packages
import { useForm } from 'react-hook-form';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Group 5: Internal absolute imports (path aliases @components/, @hooks/, etc.)
import { Button } from '@components/ui/Button';
import { Colors } from '@constants/colors';
import { useAuth } from '@hooks/useAuth';

// Group 6: Relative imports
import { Input } from '../Input';
import { helperFn } from './helpers';

// Group 7: Type imports (always use `import type`)
import type { User, Location as LocationType } from '@types/index';

// Group 8: Style imports (if StyleSheet is in a separate file — uncommon)
import styles from './ComponentName.styles';
```

---

## 7. ESLint Configuration

**File:** `.eslintrc.js`

```javascript
module.exports = {
  root: true,
  extends: [
    'expo',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'react-hooks', 'import'],
  rules: {
    // TypeScript
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off', // Too noisy for React components
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',

    // React
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Imports
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/no-cycle': 'error',

    // Style
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
};
```

---

## 8. Prettier Configuration

**File:** `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 100,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

---

## 9. Git Commit Convention

Follow **Conventional Commits** specification: `<type>(<scope>): <description>`

### Commit Types

| Type       | Usage                                                      |
| ---------- | ---------------------------------------------------------- |
| `feat`     | A new feature (screen, component, hook)                    |
| `fix`      | A bug fix                                                  |
| `style`    | UI-only changes (colors, spacing, fonts — no logic change) |
| `refactor` | Code restructure without behavior change                   |
| `docs`     | Documentation only                                         |
| `chore`    | Build, config, dependency updates                          |
| `perf`     | Performance improvements                                   |
| `test`     | Tests only                                                 |
| `revert`   | Reverting a previous commit                                |

### Scope Options

`login`, `locations`, `trip-ready`, `route-view`, `map`, `auth`, `navigation`, `components`, `hooks`, `context`, `constants`, `types`, `deps`, `build`, `ci`

### Examples

```
feat(login): add password visibility toggle
fix(locations): correct swap button not updating TripContext
style(route-view): adjust bottom sheet border radius to 24px
refactor(hooks): extract location permission logic into useLocation
docs: add component guide for Button and Input
chore(deps): upgrade expo-location to 17.0.1
feat(map): implement dark map style with custom JSON
fix(auth): resolve AsyncStorage hydration race condition on app boot
```

### Branch Naming

```
feature/<ticket>-<short-description>
fix/<ticket>-<short-description>
chore/<description>

Examples:
  feature/001-login-screen
  feature/002-set-locations
  fix/003-keyboard-avoid-android
```

---

## 10. Code Review Checklist

Before raising a PR, the author must verify every item:

### Correctness

- [ ] Feature works as specified in `04-SCREEN-SPECS.md`
- [ ] Edge cases from the spec are handled
- [ ] No console errors or warnings in development build
- [ ] TypeScript strict mode — zero errors

### Code Quality

- [ ] No `any` types
- [ ] No `TODO` or `FIXME` comments (create a GitHub issue instead)
- [ ] No commented-out code
- [ ] All functions ≤ 40 lines
- [ ] All components ≤ 150 lines (excluding StyleSheet)
- [ ] Import order matches spec (Section 6)

### Performance

- [ ] `React.memo` applied to all presentational components
- [ ] `useCallback` on all handlers passed as props
- [ ] `useMemo` on expensive derived values
- [ ] `FlatList` used (not `ScrollView`) for variable-length lists
- [ ] `keyExtractor` uses stable `id` field (not array index)

### UI/UX

- [ ] Matches design spec (colors from `Colors.*`, spacing from `Spacing.*`)
- [ ] Works on small (SE) screen — no content overflow
- [ ] Works on large (Pro Max) screen — no excessive whitespace
- [ ] Keyboard avoiding behavior tested on iOS and Android

### Accessibility

- [ ] `accessibilityLabel` on all interactive elements
- [ ] `accessibilityRole` set appropriately
- [ ] Touch targets ≥ 44×44pt

---

## 11. Performance Guidelines

### Memoization

```typescript
// ✅ Memoize expensive computations
const filteredLocations = useMemo(
  () => allLocations.filter(loc => loc.name.toLowerCase().includes(query.toLowerCase())),
  [allLocations, query]
);

// ✅ Memoize all callbacks passed as props
const handleLocationSelect = useCallback((location: Location) => {
  setFrom(location);
  setActiveInput(null);
}, [setFrom]);

// ✅ Memoize components that receive stable props
const LocationItem = memo<LocationItemProps>(({ location, onPress }) => { ... });

// ❌ NEVER: anonymous functions in JSX
<FlatList renderItem={({ item }) => <LocationItem ... />} />  // new function each render

// ✅ Extract as memoized callback
const renderItem = useCallback(
  ({ item }: { item: Location }) => (
    <LocationItem location={item} onPress={handleLocationSelect} />
  ),
  [handleLocationSelect]
);
<FlatList renderItem={renderItem} />
```

### FlatList Optimization

```typescript
<FlatList
  data={filteredLocations}
  renderItem={renderItem}                              // Memoized callback
  keyExtractor={item => item.id}                       // Stable key — NOT index
  getItemLayout={(_, index) => ({                      // Enables scroll optimization
    length: LOCATION_ITEM_HEIGHT,                      // 72px per item
    offset: LOCATION_ITEM_HEIGHT * index,
    index,
  })}
  removeClippedSubviews={true}                         // Unmount off-screen items
  maxToRenderPerBatch={10}                             // Batch rendering
  windowSize={10}                                      // Render window
  initialNumToRender={6}                               // Initial render count
  ItemSeparatorComponent={Divider}                     // Component, not inline JSX
/>
```

### Avoid Re-renders

```typescript
// ❌ BAD: new object/array reference every render
<Component style={{ marginTop: 16 }} colors={['red', 'blue']} />

// ✅ GOOD: stable references
const GRADIENT_COLORS: [string, string] = [Colors.Primary, Colors.PrimaryDark];
<Component style={styles.container} colors={GRADIENT_COLORS} />
```

### Reduce Motion Support

```typescript
import { AccessibilityInfo } from 'react-native';

const [reduceMotion, setReduceMotion] = useState(false);

useEffect(() => {
  AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
  return () => listener.remove();
}, []);

// Use in animation config:
const duration = reduceMotion ? 0 : 400;
```

---

_This document defines the non-negotiable engineering baseline for TripPath. Deviation requires explicit team agreement._
