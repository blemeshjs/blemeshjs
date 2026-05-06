# @blemeshjs/sdk-react-native

BLEMeshJS for React Native and Expo.

If you're building a mobile app and want a BLE Mesh SDK that feels at home in React Native, this is the package for you. It bundles:

- The full [`@blemeshjs/sdk`](../sdk) surface.
- A React Native BLE transport (built on `react-native-ble-plx`).
- An `AsyncStorage`-backed persistence layer.

…and gives you `createMesh()` to wire everything up in one call.

## Install

```sh
yarn add @blemeshjs/sdk-react-native
```

You'll also need these peer dependencies in your app:

```sh
yarn add @react-native-async-storage/async-storage \
  react-native-ble-plx \
  react-native-get-random-values
```

Make sure to follow each library's setup instructions (native permissions, pods, etc.).

## Usage

```ts
import { createMesh } from "@blemeshjs/sdk-react-native";

const mesh = await createMesh();
```

Want to bring your own `MeshNetworkManager` (e.g. for testing or a custom subclass)?

```ts
const mesh = await createMesh({ meshNetworkManager: myMesh });
```

## License

Apache-2.0
