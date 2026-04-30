# @blemeshjs/sdk

High-level BLE Mesh SDK with network management, models, and extensions.

## Scope

This is the main developer-facing SDK package. It exports the network manager, mesh models, model extensions, shared types, and the underlying `@blemeshjs/utils` surface.

## Installation

```sh
yarn add @blemeshjs/sdk
```

## Usage

```ts
import { MeshNetworkManager } from "@blemeshjs/sdk";

const mesh = MeshNetworkManager.instance;
```

## Development

From this package directory:

```sh
yarn build
yarn test
yarn lint
```

## Related Packages

- `@blemeshjs/core` provides the low-level protocol implementation.
- `@blemeshjs/sdk-web` and `@blemeshjs/sdk-react-native` add platform-specific bindings.