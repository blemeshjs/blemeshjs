# blemeshjs

TypeScript BLE Mesh SDK. Yarn 4 + Turbo monorepo. See @AGENTS.md for the package
and app map; this file covers how to work in the repo.

## Running commands

`yarn` is not always on PATH — use **`corepack yarn <script>`**. A bare `yarn`
can exit 0 while doing nothing, so a failure looks like a pass.

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

## Conventions

- No `any` in public API surfaces. `@ts-expect-error` is acceptable where a
  setter writes a readonly field; that pattern is established in `core`.
- Conventional commits, scoped to the package: `fix(@blemeshjs/sdk): ...`.
- Any change to a published package needs a changeset
  (`corepack yarn changeset`). CI checks this on pull requests.
- Branch and open a PR for every change. Nothing lands on `main` directly.
