# TripPath — Coding Standards

> The conventions the codebase follows and the checks that enforce them. Related: [Architecture](02-ARCHITECTURE.md) · [Testing](10-TESTING-AND-QA.md).

## 1. Tooling

| Tool       | Config                                                  | Command                           |
| ---------- | ------------------------------------------------------- | --------------------------------- |
| TypeScript | `tsconfig.json` — `strict`, `noUncheckedIndexedAccess`  | `npm run type-check`              |
| ESLint     | `eslint-config-expo` (flat)                             | `npm run lint`                    |
| Prettier   | single quotes, trailing commas, semicolons, 100 columns | `npm run format` / `format:check` |
| Jest       | `jest-expo` preset, coverage thresholds                 | `npm test` / `test:coverage`      |

`npm run check` runs tests with coverage, type-check, lint and format check; CI runs the same.

## 2. Clean-code rules used here

1. **No literals in components.** User-facing text → `constants/strings.ts`; colors, spacing, radii, sizes, shadows → `constants/theme.ts`; URLs, field masks, timings and limits → `constants/config.ts`. Any other number gets a named constant at the top of its file.
2. **Single responsibility per layer.** Screens compose; hooks own async state; services own network / OS calls; utils are pure. A component that fetches or a util that touches React is a defect. See the layer table in [Architecture](02-ARCHITECTURE.md).
3. **Small files.** Split a screen when it mixes concerns; extract repeated UI into `src/components`. Route files in `src/app` stay one-line re-exports.
4. **Typed boundaries.** No `any` in application code. Validate external data at the service boundary and expose domain types (`RouteResult`, `PlaceSuggestion`) to the rest of the app. Use discriminated unions for state (`RouteState`).
5. **Errors are values with meaning.** Services throw `PlacesError` / `RoutesApiError`; hooks translate them into state; the UI renders the state. Never swallow an error without a comment saying why (e.g. best-effort geocoding).
6. **Async safety.** Every request that can be superseded takes an `AbortSignal`. Results are keyed by the inputs that produced them so stale answers are ignored. Effects return a cleanup.
7. **Derive, don't sync.** Prefer derived values over `setState` in effects (e.g. loading is derived from the request key in `useRoute`).
8. **Pure reducers for multi-field forms.** `tripFormReducer` has no side effects and is unit-tested directly.
9. **Accessibility.** Interactive elements have a role; icon-only buttons have a label; error banners that should be announced use `accessibilityRole="alert"`.
10. **Comments explain why, not what.** Keep them for non-obvious decisions (platform limits, API quirks, invariants).

## 3. Naming and files

- Components and screens: `PascalCase.tsx`, default export. Hooks: `useThing.ts`. Services, utils, constants: `camelCase.ts`.
- Platform variants use extensions: `Thing.tsx` and `Thing.web.tsx`. Shared prop types go in a neutral file (`routeMapTypes.ts`).
- Constants are `UPPER_SNAKE_CASE` (or an `UPPER_SNAKE` object for groups such as `ROUTE_STRINGS`).
- Tests mirror the source path: `src/utils/format.ts` → `tests/utils/format.test.ts`.
- Imports use relative paths (no path aliases are configured).

## 4. Git

- Branches: `feat/…`, `fix/…`, `refactor/…`, `chore/…`.
- Conventional Commit messages (`feat: …`, `fix: …`, `refactor: …`).
- Never commit `.env`, keystores, generated `android/`, APK/AAB files or `coverage/`.

## 5. Definition of done

- `npm run check` passes.
- New logic has tests covering success, failure and edge cases.
- No new literals, `any`, or dead code.
- Documentation updated when behaviour, structure, dependencies or setup change.
