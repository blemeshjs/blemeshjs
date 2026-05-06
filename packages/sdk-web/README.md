# @blemeshjs/sdk-web

BLEMeshJS for the browser.

This is the package you want if you're building a web app and you'd like to talk to BLE Mesh devices over Web Bluetooth. It bundles up:

- The full [`@blemeshjs/sdk`](../sdk) surface.
- A re-export of [`@blemeshjs/crypto`](../crypto).
- A Web Bluetooth transport.
- A `localStorage`-backed persistence layer.

…and exposes a single `createMesh()` helper to wire it all together.

## Install

```sh
yarn add @blemeshjs/sdk-web
```

## Usage

```ts
import { createMesh } from "@blemeshjs/sdk-web";

const mesh = await createMesh();
// mesh is a ready-to-use MeshNetworkManager.
```

That's it — no manual transport setup, no storage glue. You can pass your own `MeshNetworkManager` if you've already constructed one (for example, in a singleton or test fixture):

```ts
const mesh = await createMesh({ meshNetworkManager: myMesh });
```

## Browser support

Web Bluetooth is required. Make sure your target browsers support it (Chrome, Edge, and other Chromium-based browsers do; Safari and Firefox currently don't).

## License

Apache-2.0
