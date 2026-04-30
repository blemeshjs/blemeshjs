# @blemeshjs/sdk-web

Web transport and browser storage bindings for the blemeshjs SDK.

## Scope

This package wires the shared SDK to browser-specific dependencies. It exports the full `@blemeshjs/sdk` surface, re-exports `@blemeshjs/crypto`, and provides `createMesh(...)` for browser initialization with Web Bluetooth transport and `localStorage`-backed persistence.

## Installation

```sh
yarn add @blemeshjs/sdk-web
```

## Usage

```ts
import { createMesh } from "@blemeshjs/sdk-web";

const mesh = await createMesh();
```

## Development

From this package directory:

```sh
yarn build
yarn test
yarn lint
```
