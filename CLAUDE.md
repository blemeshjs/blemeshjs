# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm 11.21.0** (pinned in `mise.toml` and `packageManager`); task runner is **Turbo**.

```sh
pnpm install
pnpm build      # turbo build, public packages only (utils, crypto, core, sdk, sdk-web, sdk-react-native)
pnpm test       # turbo test across all workspaces
pnpm lint       # excludes apps/mobile, apps/docs, apps/web
pnpm format     # excludes apps/mobile, apps/docs
pnpm coverage   # vitest UI + coverage
```

Prefer package-scoped runs over root runs — root `build`/`lint`/`format` deliberately exclude some workspaces:

```sh
pnpm --filter @blemeshjs/core test
pnpm --filter @blemeshjs/core build
pnpm --filter @blemeshjs/core lint     # note: package lint scripts run eslint with --fix
```

Run a single test file or a single test name (vitest is not exposed as a package script, so use `exec`):

```sh
pnpm --filter @blemeshjs/utils exec vitest run src/types/uuid.spec.ts
pnpm --filter @blemeshjs/utils exec vitest run -t "parses a UUID"
pnpm --filter @blemeshjs/utils exec vitest run --project node src/types/uuid.spec.ts
```

Apps:

```sh
pnpm --filter docs dev            # Next.js + Fumadocs; regenerates API docs first
pnpm --filter docs types:check    # regenerates API docs, then fumadocs-mdx + next typegen + tsc --noEmit
pnpm --filter web dev
pnpm --filter mobile start        # Expo; also `android`, `ios`
```

Release (changesets; see `RELEASING.md`):

```sh
pnpm changeset
pnpm release:status
pnpm release:publish:dry-run
```

## Architecture

### Package graph

Strictly layered, each package depending only on the ones below it:

```
sdk-web  /  sdk-react-native      platform transport + storage
            sdk                   developer-facing API (MeshNetworkManager, models, extensions)
            core                  protocol: bearer, provisioning, mesh layers, messages
      utils  +  crypto            primitives, abstractions, enums; mesh cryptography
```

`packages/sdk-web/src/index.ts` and `packages/sdk-react-native/src/index.ts` both export a function named **`createMesh()`** (not `createBrowserMesh`/`createRNMesh` — those names appear in stale docs) and re-export all of `@blemeshjs/sdk`, which in turn re-exports all of `@blemeshjs/utils`. A consumer therefore reaches nearly the whole public surface through one platform import.

### The platform seam

The only thing separating web from React Native is two abstract classes in `@blemeshjs/utils`:

- `CBCentralManager` (+ `CBPeripheral`, and their `*Handler` event classes) in `src/constants/mesh-constants.ts` — BLE transport.
- `Storage` in `src/types/storage.ts` — persistence, with sync-or-async return types (`Value | Promise<Value>`) so both platforms fit.

Each platform package implements those two, and `createMesh()` does `meshNetworkManager.init(centralManager, storage)` followed by `await meshNetworkManager.setup()`. **Keep transport and storage code in `sdk-web`/`sdk-react-native`; keep platform-agnostic orchestration in `sdk`.** Nothing below `sdk` may reference a browser or React Native API.

### Message pipeline

`packages/core/src/layers/network-manager.ts` constructs the four mesh spec layers in order — `NetworkLayer`, `LowerTransportLayer`, `UpperTransportLayer`, `AccessLayer` — and owns send/receive (`handle`, `publish`, `sendMeshMessage`, `sendAcknowledgedMeshMessage`, `waitForMessageWithOpCode`, and the `notifyAbout*` callbacks). Bearers live in `packages/core/src/bearer` (`gatt-bearer`, `pb-gatt-bearer`, `proxy-protocol-handler`); provisioning is a separate state machine under `packages/core/src/provisioning`.

`packages/sdk` wraps this: `CoreMeshNetworkManager` adapts core, `MeshNetworkManager` is the public facade (a subclassable singleton via `static getInstance()`/`instance`), `NetworkConnection` handles connectivity, and `ProvisioningManager` is exposed as `mesh.provision`.

### Two patterns that appear everywhere

**MobX** — mesh domain objects (`MeshNetwork`, `Node`, `Element`, `Model`, and the managers) call `makeObservable`, so app UIs observe them directly. Mutations must go through `action`s, and new state on those classes needs to be registered as `observable`.

**ts-mixer** — mesh messages are composed from mixins rather than a single inheritance chain (~35 files). Dispatch is done with `hasMixin(message, GenericOnOffStatus)` rather than `instanceof`; use `hasMixin` when matching message types.

**Model extensions** (`packages/sdk/src/model-extensions/`) are the pattern for exposing a mesh model to apps: an `Object.assign`'d factory taking `(model, coreMeshNetworkManager)` that returns an observable object holding `state`/`targetState`/`remainingTime` plus message-sending methods. `generic-on-off.ts` is the reference implementation, with `helper.ts` providing `sendMessageToModel`/`addMessageListeners`. Server/client message handlers live alongside in `mesh-model-handlers/`.

## Repo conventions

- **ESM with NodeNext.** `"type": "module"`, `moduleResolution: NodeNext`, `strict: true`, `composite: true`. Relative imports generally carry the `.js` extension. Each package builds with `tsc --project tsconfig.build.json` to `dist/`, and `tsconfig.build.json` excludes `*.spec.ts`.
- **Tests sit next to sources** as `*.spec.ts` under `src/`, not in a separate `tests/` tree. Every package's `vitest.config.ts` re-exports a shared config from `vitest.config.base.ts`: `utils`, `crypto` and `core` use `nodeBrowserConfig`, which runs **every spec twice** (node and jsdom projects); `sdk`, `sdk-web` and `sdk-react-native` use `browserConfig` (jsdom only). Name a file `*.node.spec.ts` or `*.browser.spec.ts` to restrict it to one environment.
- **No `any` in public API surfaces.** Where the codebase needs an escape hatch it uses a narrowly scoped `eslint-disable-next-line` (see `MeshNetworkManager.getInstance`), not a loosened config.
- **`packages/pro` and `packages/sdk-pro` are gitignored private checkouts**, not workspace members — they are absent in CI and on a fresh clone. Never assume they exist, and never add them to `pnpm-workspace.yaml`.
- **Generated API docs are committed**: `apps/docs/content/docs/api/*.mdx` is produced by typedoc via `apps/docs/scripts/generate-api-docs.mjs` from package `src/index.ts` entry points. It is wired to `prebuild`/`predev`/`pretypes:check`/`postinstall`, so it reruns automatically — regenerate and commit after any TSDoc or public-export change.
- **`.npmrc` settings are load-bearing** and documented inline: `node-linker=hoisted` (Metro/autolinking break on isolated symlinks), `link-workspace-packages=true`, and `enable-pre-post-scripts=true` (without it the docs API-doc regeneration silently stops running).
- **ESLint is deliberately split**: packages and `eslint.package.config.mjs` use ESLint 10 with `typescript-eslint` type-checked rules; `apps/web` and `apps/mobile` stay on ESLint 9 because `eslint-config-next`/`eslint-config-expo` pull a react plugin that breaks on 10. Don't unify them.
- Do not edit `dist/` or `coverage/` output.

## Related files

`AGENTS.md` and `.github/agents/mesh-sdk.agent.md` cover similar ground for other tools; both still describe the repo as a Yarn 4 monorepo and reference the old `createBrowserMesh`/`createRNMesh` names.
