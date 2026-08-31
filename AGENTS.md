# blemeshjs

## Repository Overview

- Yarn 4 monorepo with Turbo workspaces.
- Root workspaces live under `packages/*` and `apps/*`.
- Primary SDK code is TypeScript and published from package-level `src/` directories.
- Do not edit generated outputs in `dist/` or coverage artifacts under `coverage/` unless the task explicitly targets them.

## Package Map

- `packages/utils`: shared enums, helpers, mesh-message/model primitives, and low-level utilities.
- `packages/crypto`: mesh crypto helpers built on top of `@blemeshjs/utils`.
- `packages/core`: bearer, provisioning, mesh messages, and lower-level mesh layers.
- `packages/pro`: private higher-level package built on `core` and `utils`.
- `packages/sdk`: higher-level SDK surface including `MeshNetworkManager`, mesh models, model extensions, and network helpers.
- `packages/sdk-web`: web transport and browser storage; exports `createBrowserMesh(...)`.
- `packages/sdk-react-native`: React Native transport and storage; exports `createRNMesh()`.
- `packages/sdk-pro`: private SDK layer that re-exports `@blemeshjs/sdk` plus pro-specific types/models.

## App Map

- `apps/web`: Next.js web app using `@blemeshjs/sdk-web` and `@blemeshjs/sdk-pro`.
- `apps/mobile`: Expo/React Native app using `@blemeshjs/sdk-react-native`.
- `apps/docs`: Next.js + Fumadocs documentation app.

## Working Rules

- Prefer the narrowest package-level change that fixes the task.
- Preserve existing package boundaries: transport/storage logic belongs in platform SDK packages, not in `packages/sdk`.
- Match the repo's TypeScript style and avoid `any`.
- Avoid silent breaking changes to exported package APIs.
- When changing SDK behavior, validate in the smallest relevant package first.

## Commands

- Root install: `pnpm install`
- Root build: `pnpm build`
- Root lint: `pnpm lint`
- Root format: `pnpm format`
- Root tests: `pnpm test`
- Root coverage: `pnpm coverage`

## Command Notes

- Root `build`, `lint`, and `format` intentionally exclude `apps/mobile`, `apps/docs`, and `packages/sdk-react-native`.
- Most packages expose `build`, `lint`, `format`, `test`, and `coverage` scripts.
- `apps/docs` also exposes `types:check`.
- `apps/mobile` uses Expo commands such as `pnpm --filter mobile start`, `android`, and `ios`.

## Validation Preference

- Use package-scoped tests or typechecks before broad workspace runs.
- If a task only touches one package, prefer that package's `test` or `build` script over root commands.
