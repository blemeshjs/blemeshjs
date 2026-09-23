# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm 11.21.0** (pinned in `mise.toml` and `packageManager`); task runner is **Turbo**.

```sh
pnpm install
pnpm build        # public packages only (utils, crypto, core, sdk, sdk-web, sdk-react-native)
pnpm test         # turbo test across all workspaces
pnpm lint         # rewrites files (eslint --fix); excludes apps/mobile, apps/docs, apps/web
pnpm lint:check   # reports only, no rewrites — this is what CI runs
pnpm format       # excludes apps/mobile, apps/docs
pnpm coverage     # non-interactive, public packages
```

`coverage` is non-interactive. A package's `coverage:ui` opens the Vitest UI and never exits — never call it from a script.

Prefer package-scoped runs while iterating — root `build`/`lint`/`format` deliberately exclude some workspaces:

```sh
pnpm --filter @blemeshjs/core test
pnpm --filter @blemeshjs/core build
pnpm --filter @blemeshjs/core lint:check
```

Run a single test file or test name (vitest is not exposed as a package script, so use `exec`):

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

Release (changesets; see `RELEASING.md`): `pnpm changeset`, `pnpm release:status`, `pnpm release:publish:dry-run`.

## Architecture

### Package graph

Strictly layered, each package depending only on the ones below it:

```
sdk-web  /  sdk-react-native      platform transport + storage
            sdk                   developer-facing API (MeshNetworkManager, models, extensions)
            core                  protocol: bearer, provisioning, mesh layers, messages
      utils  +  crypto            primitives, abstractions, enums; mesh cryptography
```

Both platform packages expose **exactly the same entry point** — keep these two signatures identical, they have drifted before:

```ts
createMesh({ meshNetworkManager? }?): Promise<MeshNetworkManager>
```

Each re-exports all of `@blemeshjs/sdk`, which re-exports all of `@blemeshjs/utils`, so a consumer reaches nearly the whole public surface through one platform import.

### The platform seam

The only thing separating web from React Native is two abstract classes in `@blemeshjs/utils`:

- `CBCentralManager` (+ `CBPeripheral`, and their `*Handler` event classes) in `src/constants/mesh-constants.ts` — BLE transport.
- `Storage` in `src/types/storage.ts` — persistence, with sync-or-async return types so both platforms fit.

Each platform package implements those two; `createMesh()` calls `init(centralManager, storage)` then `await setup()`. **Keep transport and storage in `sdk-web`/`sdk-react-native`; keep platform-agnostic orchestration in `sdk`.** Nothing below `sdk` may reference a browser or React Native API.

### Async contract

Every transport and connection operation returns a promise and rejects on failure. There are no delegate callbacks reporting results, and no methods that return an error value instead of throwing.

`CBPeripheralHandler` and `CBCentralManagerHandler` carry only genuinely unsolicited events — value updates, state changes, disconnections, discovery. If you are adding an event to report the outcome of something a caller asked for, return a promise instead.

Never leave a promise floating. In a synchronous context (an event handler, a React callback), attach a `.catch` that reports through the SDK logger — an unhandled rejection is a redbox on React Native.

### Message pipeline

`packages/core/src/layers/network-manager.ts` constructs the four mesh spec layers in order — `NetworkLayer`, `LowerTransportLayer`, `UpperTransportLayer`, `AccessLayer` — and owns send/receive (`handle`, `publish`, `sendMeshMessage`, `sendAcknowledgedMeshMessage`, `waitForMessageWithOpCode`, and the `notifyAbout*` callbacks). Bearers live in `packages/core/src/bearer`; provisioning is a separate state machine under `packages/core/src/provisioning`.

`packages/sdk` wraps this: `CoreMeshNetworkManager` adapts core, `MeshNetworkManager` is the public facade (a subclassable singleton via `static getInstance()`/`instance`), `NetworkConnection` handles connectivity, `ProvisioningManager` is exposed as `mesh.provision`.

### Two patterns that appear everywhere

**MobX** — mesh domain objects (`MeshNetwork`, `Node`, `Element`, `Model`, and the managers) call `makeObservable`, so app UIs observe them directly. Mutations go through `action`s; new state needs registering as `observable`.

**ts-mixer** — mesh messages are composed from mixins rather than a single inheritance chain (~35 files). Dispatch with `hasMixin(message, GenericOnOffStatus)`, never `instanceof`.

## Adding a model extension

The road to 1.0 is Generic Level, Lighting (Lightness / CTL / HSL) and Sensor. Every `SigModelId` already exists in `packages/utils/src/enums/sig-model-id.ts`; what is missing is the messages and the developer-facing extension. Each model is one PR, built in this order:

1. **Messages** in `packages/core/src/mesh-messages/<group>/` — one class per opcode (`...Get`, `...Set`, `...Status`), mirroring `mesh-messages/generic/generic-on-off-*.ts`. Export them from that directory's `index.ts`.
2. **PDU round-trip tests**, using the vectors in the Bluetooth Mesh Model Specification. Encode a known message, compare bytes; decode known bytes, compare fields.
3. **The extension** in `packages/sdk/src/model-extensions/<model>.ts`, built with `Object.assign` over a `makeObservable` state bag, exactly like `generic-on-off.ts`. Observable state, a `get()` that resolves when the status arrives, and a `set()` taking `{ acknowledged }`. Export it from `model-extensions/index.ts`.
4. **Extension tests** beside it, following `generic-on-off.spec.ts`.
5. **A changeset**, then regenerate the API reference.

Reach a model from an element with `element.models.find(...)` and attach the extension with `model.use(TheExtension)`. `get()` resolves `void`; read the value from the extension's observable state afterwards.

Do not add a model to `packages/sdk` without the `core` messages underneath it — transport and protocol concerns stay in `core`.

## Testing

Vitest, one config per package, each re-exporting a shared config from `vitest.config.base.ts`. Specs live beside their source as `*.spec.ts` under `src/`, not in a separate `tests/` tree.

`utils`, `crypto` and `core` use `nodeBrowserConfig`, which runs **every spec twice** (node and jsdom projects); `sdk`, `sdk-web` and `sdk-react-native` use `browserConfig` (jsdom only). Name a file `*.node.spec.ts` or `*.browser.spec.ts` to restrict it to one environment.

`react-native-ble-plx` ships untranspiled sources Vite cannot parse — mock the module surface (see `packages/sdk-react-native/src/transport/peripheral.spec.ts`).

When fixing a bug, verify the test fails without the fix before committing it.

## Generated files

`apps/docs/content/docs/api/**` is generated from each package's `src/index.ts` by `apps/docs/scripts/generate-api-docs.mjs` (typedoc + typedoc-plugin-markdown) and **committed**. After changing a public entry point *or any TSDoc comment on one*, run `pnpm --filter docs api:generate` and commit the result in the same commit — CI fails the PR if it is stale. Fix wrong prose in the generator template, not in the output; the output is overwritten.

It is also wired to `prebuild`/`predev`/`pretypes:check`/`postinstall`, so a plain `pnpm install` can dirty the working tree.

`apps/docs/content/examples/**` holds real, type-checked `.ts` files embedded into the docs by `<FileCodeBlock>`. Put example code there rather than in a fenced block, so it cannot drift.

Do not edit `dist/` or `coverage/` output.

## Conventions

- **ESM with NodeNext.** `"type": "module"`, `moduleResolution: NodeNext`, `strict: true`, `composite: true`. Relative imports generally carry the `.js` extension. Each package builds with `tsc --project tsconfig.build.json` to `dist/`, excluding `*.spec.ts`.
- **No `any` in public API surfaces.** `@ts-expect-error` is acceptable where a setter writes a readonly field; that pattern is established in `core`. Narrowly scoped `eslint-disable-next-line` over a loosened config.
- **`packages/pro` and `packages/sdk-pro` are gitignored private checkouts**, not workspace members — absent in CI and on a fresh clone. Never assume they exist, and never add them to `pnpm-workspace.yaml`.
- **`.npmrc` settings are load-bearing** and documented inline: `node-linker=hoisted` (Metro/autolinking break on isolated symlinks), `link-workspace-packages=true`, and `enable-pre-post-scripts=true` (without it the docs API-doc regeneration silently stops running).
- **One toolchain version across the repo**, except ESLint: packages and the shared `eslint.package.config.mjs` are on 10.x; `apps/web`, `apps/mobile` and `apps/docs` are pinned to 9.x because `eslint-config-next` and `eslint-config-expo` pull an `eslint-plugin-react` that crashes under ESLint 10. Do not "fix" that drift by bumping the apps.
- Conventional commits, scoped to the package: `fix(@blemeshjs/sdk): ...`.
- Any change to a published package needs a changeset (`pnpm changeset`). CI checks this on pull requests.
- Branch and open a PR for every change. Nothing lands on `main` directly.
