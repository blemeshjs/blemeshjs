# @blemeshjs/sdk-react-native

React Native transport and storage bindings for the blemeshjs SDK.

## Scope

This package wires the shared SDK to React Native BLE transport and async storage. It exports the full `@blemeshjs/sdk` surface and provides `createRNMesh(...)` to initialize a `MeshNetworkManager` with the React Native platform adapters.

## Installation

```sh
yarn add @blemeshjs/sdk-react-native
```

Peer dependencies:

- `@react-native-async-storage/async-storage`
- `react-native`
- `react-native-ble-plx`
- `react-native-get-random-values`

## Usage

```ts
import { createRNMesh } from "@blemeshjs/sdk-react-native";

const mesh = await createRNMesh();
```

## Development

From this package directory:

```sh
yarn build
yarn test
yarn lint
```
