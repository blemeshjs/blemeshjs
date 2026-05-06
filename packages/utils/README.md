# @blemeshjs/utils

The shared toolbox that the rest of BLEMeshJS is built on.

If you're using `@blemeshjs/sdk`, `@blemeshjs/sdk-web`, or `@blemeshjs/sdk-react-native`, you already have everything from here re-exported for you — you usually don't need to install this package directly. It lives as its own package so the lower layers (crypto, core) can depend on a small, stable foundation.

## What's inside

- BLE Mesh **enums and constants** that match the spec.
- **Helpers** for parsing, encoding, and working with mesh primitives.
- Type definitions for **mesh messages** and **mesh models**.
- Small utilities (byte arrays, hex, etc.) that are handy across the stack.

## Install

```sh
yarn add @blemeshjs/utils
```

## Usage

```ts
import { /* enums, helpers, types */ } from "@blemeshjs/utils";
```

## Related

- [`@blemeshjs/crypto`](../crypto) — mesh cryptography built on top of these primitives.
- [`@blemeshjs/core`](../core) — uses utils for the protocol layers.
- [`@blemeshjs/sdk`](../sdk) — the high-level SDK that re-exports this package.

## License

Apache-2.0
