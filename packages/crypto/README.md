# @blemeshjs/crypto

Mesh-flavored cryptography for BLEMeshJS.

BLE Mesh has its own family of crypto primitives — `s1`, `k1`–`k4`, AES-CMAC, AES-CCM with mesh-specific nonces, and friends. This package wraps them up into ergonomic TypeScript helpers so you can derive keys, encrypt PDUs, and validate security material without rebuilding the spec by hand.

## Install

```sh
yarn add @blemeshjs/crypto
```

`@blemeshjs/sdk-web` already re-exports this package, so browser apps usually don't need to install it directly.

## Usage

```ts
import { /* key derivation, encryption helpers */ } from "@blemeshjs/crypto";
```

## Related

- [`@blemeshjs/utils`](../utils) — shared types and helpers used by this package.
- [`@blemeshjs/core`](../core) — consumes these helpers in the mesh layers.
- [`@blemeshjs/sdk-web`](../sdk-web) — re-exports this package for browser consumers.

## License

Apache-2.0
