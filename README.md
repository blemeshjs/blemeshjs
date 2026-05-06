<p align="center">
	<img src="./logo.svg" alt="blemeshjs logo" />
</p>

<h1 align="center">BLEMeshJS</h1>

<p align="center">
	<em>A friendly TypeScript SDK for building Bluetooth Mesh apps on the web and React Native.</em>
</p>

---

BLE Mesh is powerful, but the spec is dense and the tooling is scattered across native platforms. **BLEMeshJS** brings it into the JavaScript world: one familiar API, the same mental model on every platform, and sensible defaults so you can get a node provisioned and a light turned on without reading 400 pages of specification first.

If you've ever wished you could just `import` a mesh manager and start sending messages, this is for you.

## Highlights

- 🌐 **Cross-platform** — the same SDK runs in the browser (Web Bluetooth) and in React Native (via `react-native-ble-plx`).
- 🧠 **Batteries included** — provisioning, mesh models, model extensions, key management, and storage are all wired up for you.
- 🧩 **Composable** — start with the high-level SDK, drop down to `@blemeshjs/core` when you need to.
- 🟦 **TypeScript first** — strong types throughout, no `any` smuggled in the public API.
- 🧪 **Tested** — each package ships with its own test suite and coverage.

## Pick your package

Most apps only need one of these. Choose based on where your code runs:

| I'm building for...        | Install                          | Entry point                              |
| -------------------------- | -------------------------------- | ---------------------------------------- |
| The browser                | `@blemeshjs/sdk-web`             | `createMesh()`                           |
| React Native / Expo        | `@blemeshjs/sdk-react-native`    | `createMesh()`                         |
| A custom platform / Node   | `@blemeshjs/sdk`                 | `MeshNetworkManager.instance`            |
| Low-level protocol work    | `@blemeshjs/core`                | bearer / provisioning / message layers   |

## Install

```sh
# Web
yarn add @blemeshjs/sdk-web

# React Native
yarn add @blemeshjs/sdk-react-native \
  @react-native-async-storage/async-storage \
  react-native-ble-plx \
  react-native-get-random-values
```

## Quick start

### In the browser

```ts
import { createMesh } from "@blemeshjs/sdk-web";

const mesh = await createMesh();
// mesh is a fully-initialized MeshNetworkManager,
// already wired up to Web Bluetooth and localStorage.
```

### In React Native

```ts
import { createMesh } from "@blemeshjs/sdk-react-native";

const mesh = await createMesh();
// transport: react-native-ble-plx
// storage:   AsyncStorage
```

### Anywhere else

```ts
import { MeshNetworkManager } from "@blemeshjs/sdk";

const mesh = MeshNetworkManager.instance;
// Bring your own transport + storage and call mesh.init(...)
```

## How the packages fit together

```
          ┌─────────────────────────┐    ┌──────────────────────────────┐
   apps → │     @blemeshjs/sdk-web  │    │ @blemeshjs/sdk-react-native  │
          └────────────┬────────────┘    └──────────────┬───────────────┘
                       │                                │
                       └────────────────┬───────────────┘
                                        ▼
                            ┌──────────────────────┐
                            │   @blemeshjs/sdk     │   high-level API
                            └──────────┬───────────┘
                                       ▼
                            ┌──────────────────────┐
                            │   @blemeshjs/core    │   protocol layers
                            └──────────┬───────────┘
                                       ▼
                  ┌─────────────────────┴─────────────────────┐
                  ▼                                           ▼
        ┌──────────────────┐                       ┌──────────────────┐
        │ @blemeshjs/utils │                       │ @blemeshjs/crypto│
        └──────────────────┘                       └──────────────────┘
```

| Package                         | What it gives you                                                       |
| ------------------------------- | ----------------------------------------------------------------------- |
| `@blemeshjs/utils`              | Shared types, enums, helpers, mesh message and model primitives.        |
| `@blemeshjs/crypto`             | Mesh-flavored cryptography: key derivation, security material, AEAD.    |
| `@blemeshjs/core`               | Bearer, provisioning, mesh layers, and message handling.                |
| `@blemeshjs/sdk`                | The developer-facing API: `MeshNetworkManager`, models, extensions.     |
| `@blemeshjs/sdk-web`            | Web Bluetooth transport + browser storage.                              |
| `@blemeshjs/sdk-react-native`   | React Native BLE transport + AsyncStorage.                              |

There are also two private companion packages — `@blemeshjs/pro` and `@blemeshjs/sdk-pro` — used by closed-source apps built on top of the SDK.

## Where to learn more

- **Docs site** — see `apps/docs` for the in-progress documentation site.
- **Web example** — `apps/web` is a small Next.js playground that uses `@blemeshjs/sdk-web`.
- **Mobile example** — `apps/mobile` is an Expo app that uses `@blemeshjs/sdk-react-native`.

## Contributing

This repo is a Yarn 4 + Turbo monorepo. If you'd like to hack on it locally:

```sh
yarn install
yarn build
yarn test
```

Most changes only need the package-level scripts — no need to rebuild the entire world. PRs and issues are welcome.

## License

[Apache-2.0](./LICENSE) for all public packages. The private `pro` packages follow the licensing of the repositories that own them.
