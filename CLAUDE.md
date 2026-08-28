# blemeshjs

TypeScript BLE Mesh SDK. Yarn 4 + Turbo monorepo. See @AGENTS.md for the package
and app map; this file covers how to work in the repo.

## Running commands

`mise.toml` pins node 24 and yarn 4 to match CI. If mise is not activating in
your shell, `yarn` will not be on PATH — use **`corepack yarn <script>`**. A
bare `yarn` can exit 0 while doing nothing, so a failure looks like a pass.

| Task | Command |
| --- | --- |
| Install | `corepack yarn install` |
| Build public packages | `corepack yarn build` |
| Lint (rewrites files) | `corepack yarn lint` |
| Lint (reports only, what CI runs) | `corepack yarn lint:check` |
| All tests | `corepack yarn test` |
| Coverage for one package | `corepack yarn workspace @blemeshjs/<pkg> coverage` |
| Type-check an app | `corepack yarn workspace <docs\|web\|mobile> types:check` |

Prefer package-scoped commands while iterating:
`corepack yarn workspace @blemeshjs/sdk test`.

`coverage` is non-interactive. `coverage:ui` opens the Vitest UI and does not
exit — never call it from a script.

## Toolchain

One version of each tool across the repo: TypeScript 6.0.3, prettier 3.8.2,
typescript-eslint 8.68.0.

ESLint is the exception and deliberately so. Packages and the shared config in
`eslint.package.config.mjs` are on 10.x; the three apps are pinned to 9.x
because `eslint-config-next` and `eslint-config-expo` pull an
`eslint-plugin-react` that crashes under ESLint 10. Do not "fix" that drift by
bumping the apps — check whether those configs support 10 first.

## Layering

`utils` → `crypto` → `core` → `sdk` → `sdk-web` / `sdk-react-native`

Transport and storage belong in the platform packages, never in `packages/sdk`.
Protocol work belongs in `core`. Prefer the narrowest package-level change.

Both platform packages expose exactly the same entry point:

```ts
createMesh({ meshNetworkManager? }?): Promise<MeshNetworkManager>
```

Keep those two signatures identical. They have drifted before.

## Async contract

Every transport and connection operation returns a promise and rejects on
failure. There are no delegate callbacks reporting results, and no methods that
return an error value instead of throwing.

`CBPeripheralHandler` and `CBCentralManagerHandler` carry only genuinely
unsolicited events — value updates, state changes, disconnections, discovery.
If you are adding an event to report the outcome of something a caller asked
for, return a promise instead.

Never leave a promise floating. In a synchronous context (an event handler, a
React callback), attach a `.catch` that reports through the SDK logger — an
unhandled rejection is a redbox on React Native.

## Generated files

`apps/docs/content/docs/api/**` is generated from `packages/*/src/index.ts` by
`apps/docs/scripts/generate-api-docs.mjs`, and committed. After changing a
public entry point, run `corepack yarn workspace docs api:generate` and commit
the result — CI fails if it is stale. Fix wrong text in the generator template,
not in the output.

`apps/docs/content/examples/**` holds real, type-checked `.ts` files embedded
into the docs by `<FileCodeBlock>`. Put example code there rather than in a
fenced block, so it cannot drift.

## Testing

Vitest, one config per package, each defining its own node and browser
projects. Specs live beside their source as `*.spec.ts`.

`react-native-ble-plx` ships untranspiled sources Vite cannot parse — mock the
module surface (see
`packages/sdk-react-native/src/transport/peripheral.spec.ts`).

When fixing a bug, verify the test fails without the fix before committing it.

## Adding a model extension

The road to 1.0 is Generic Level, Lighting (Lightness / CTL / HSL) and Sensor.
Every `SigModelId` already exists in `packages/utils/src/enums/sig-model-id.ts`;
what is missing is the messages and the developer-facing extension. Each model
is one PR, built in this order:

1. **Messages** in `packages/core/src/mesh-messages/<group>/` — one class per
   opcode (`...Get`, `...Set`, `...Status`), mirroring
   `mesh-messages/generic/generic-on-off-*.ts`. Export them from that
   directory's `index.ts`.
2. **PDU round-trip tests** in `packages/core/tests/`, using the vectors in the
   Bluetooth Mesh Model Specification. Encode a known message, compare bytes;
   decode known bytes, compare fields.
3. **The extension** in `packages/sdk/src/model-extensions/<model>.ts`, built
   with `Object.assign` over a `makeObservable` state bag, exactly like
   `generic-on-off.ts`. Observable state, a `get()` that resolves when the
   status arrives, and a `set()` taking `{ acknowledged }`. Export it from
   `model-extensions/index.ts`.
4. **Extension tests** beside it, following `generic-on-off.spec.ts`.
5. **A changeset**, then regenerate the API reference.

Reach a model from an element with `element.models.find(...)` and attach the
extension with `model.use(TheExtension)`. `get()` resolves `void`; read the
value from the extension's observable state afterwards.

Do not add a model to `packages/sdk` without the `core` messages underneath it —
transport and protocol concerns stay in `core`.

## Conventions

- No `any` in public API surfaces. `@ts-expect-error` is acceptable where a
  setter writes a readonly field; that pattern is established in `core`.
- Conventional commits, scoped to the package: `fix(@blemeshjs/sdk): ...`.
- Any change to a published package needs a changeset
  (`corepack yarn changeset`). CI checks this on pull requests.
- Branch and open a PR for every change. Nothing lands on `main` directly.
