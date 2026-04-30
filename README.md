<p align="center">
	<img src="./logo.svg" alt="blemeshjs logo" />
</p>

# BLEMeshJS

TypeScript BLE Mesh monorepo for shared utilities, core layers, platform bindings, and higher-level SDK packages.

## Packages

| Package | Purpose | Publish status |
| --- | --- | --- |
| `@blemeshjs/utils` | Shared enums, helpers, mesh message/model types, and low-level utilities. | Public |
| `@blemeshjs/crypto` | BLE Mesh cryptographic helpers built on top of `@blemeshjs/utils`. | Public |
| `@blemeshjs/core` | Bearer, provisioning, mesh messages, and lower-level mesh primitives. | Public |
| `@blemeshjs/sdk` | High-level SDK surface including network management, models, and extensions. | Public |
| `@blemeshjs/sdk-web` | Browser transport and storage bindings for the SDK. | Public |
| `@blemeshjs/sdk-react-native` | React Native transport and storage bindings for the SDK. | Public |
| `@blemeshjs/pro` | Private higher-level BLE Mesh package built on core and shared utilities. | Private |
| `@blemeshjs/sdk-pro` | Private SDK layer that re-exports `@blemeshjs/sdk` with pro-specific additions. | Private |

## Apps

| App | Purpose |
| --- | --- |
| `apps/web` | Next.js web application using `@blemeshjs/sdk-web`. |
| `apps/mobile` | Expo / React Native application using `@blemeshjs/sdk-react-native`. |
| `apps/docs` | Documentation site built with Next.js and Fumadocs. |

## Getting Started

```sh
yarn install
yarn build
yarn test
```

## Common Commands

```sh
yarn lint
yarn format
yarn coverage
yarn release:status
```

Root `build`, `lint`, and `format` intentionally exclude `apps/mobile`, `apps/docs`, and `packages/sdk-react-native`.

## Package Layout

- `packages/utils`: shared types, helpers, constants, enums, and mesh primitives.
- `packages/crypto`: cryptographic helpers and mesh key material helpers.
- `packages/core`: low-level bearer, provisioning, layer, and message logic.
- `packages/sdk`: high-level network manager, models, and extensions.
- `packages/sdk-web`: browser-specific transport and local storage integration.
- `packages/sdk-react-native`: React Native BLE transport and async storage integration.
- `packages/pro`: private higher-level package used by companion private repos.
- `packages/sdk-pro`: private SDK layer used by companion private repos.

## Development Notes

- Package builds are emitted from package-level `src/` directories into `dist/`.
- Prefer package-scoped validation when changing a single package.
- Avoid editing generated output under `dist/` and coverage artifacts under `coverage/`.

## License

Apache-2.0 for the public monorepo packages. Private companion packages follow the policies of their owning repositories.
