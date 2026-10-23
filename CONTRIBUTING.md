# Contributing

## Branches and commits

- Use short, descriptive branches such as `feat/location-search`, `fix/auth-redirect`, and `chore/project-setup`.
- Use Conventional Commit messages, for example `feat: add location selection` or `chore: configure project checks`.
- Keep pull requests focused and explain user-facing changes, implementation choices, tests run, and known limitations.

## Before opening a pull request

1. Follow [AGENT.md](./AGENT.md) and the relevant design/architecture notes in `docs/`.
2. Run `npm run check` when the application scaffold is present.
3. Verify that no credentials, local environment files, signing material, or build artifacts are included.
4. Update documentation when the setup, architecture, dependencies, or behavior changes.

## Scope and compatibility

This repository targets React Native with Expo. Use `npx expo install` for packages that include native code and confirm the selected versions are compatible with the project's Expo SDK. Avoid introducing backend services, state libraries, or abstractions unless the product requirements justify them.
