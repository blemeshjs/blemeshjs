# @blemeshjs/sdk

The high-level BLEMeshJS SDK.

This is the package most developers actually want to use. It gives you `MeshNetworkManager` — a single entry point that owns your network state, your local node, your models, and your message routing — plus a collection of mesh models and model extensions you can compose into your app.

`@blemeshjs/sdk` is platform-agnostic on its own. To actually talk to devices you'll pair it with a transport + storage adapter:

- [`@blemeshjs/sdk-web`](../sdk-web) for browsers
- [`@blemeshjs/sdk-react-native`](../sdk-react-native) for React Native / Expo

…or you can plug in your own.

## Install

```sh
yarn add @blemeshjs/sdk
```

## Usage

```ts
import { MeshNetworkManager } from "@blemeshjs/sdk";

const mesh = MeshNetworkManager.instance;
// Provide your own central manager + storage:
mesh.init(myCentralManager, myStorage);
await mesh.setup();
```

If you're on the web or React Native, you'll usually skip the manual `init` and use the platform package's `createMesh()` / `createRNMesh()` helper instead — they handle the wiring for you.

## What you get

- `MeshNetworkManager` — your single source of truth for the mesh.
- A library of standard **mesh models**.
- **Model extensions** for common app-level patterns.
- Shared SDK **types** and a re-export of [`@blemeshjs/utils`](../utils).

## License

Apache-2.0
