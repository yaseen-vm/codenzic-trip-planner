# Contributing

## Branches and commits

- Use short, descriptive branches such as `feat/location-search`, `fix/auth-redirect`, `refactor/clean-architecture`, `chore/project-setup`.
- Use Conventional Commit messages, for example `feat: add location selection` or `fix: ignore stale route responses`.
- Keep pull requests focused and explain user-facing changes, implementation choices, tests run, and known limitations.

## Before opening a pull request

1. Follow [AGENT.md](./AGENT.md) (layout and rules) and the relevant notes in [`docs/`](./docs).
2. Run `npm run check` (tests with coverage, type-check, lint, format check). It must pass.
3. Add or update tests under `tests/` for every behaviour change: success, failure and edge cases.
4. Do not add hardcoded strings, colors, spacing, URLs or magic numbers to components; use `src/constants`.
5. Verify that no credentials, `.env` files, signing material, `coverage/` output or build artifacts are included.
6. Update `README.md` and the affected `docs/` files when setup, architecture, dependencies or behaviour change.

## Scope and compatibility

This repository targets React Native with Expo. Use `npx expo install` for packages that include native code and confirm the versions match the project's Expo SDK. Avoid introducing backend services, state libraries or abstractions unless the product requirements justify them.
