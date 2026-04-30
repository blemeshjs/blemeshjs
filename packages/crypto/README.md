# @blemeshjs/crypto

BLE Mesh cryptographic helpers built on top of `@blemeshjs/utils`.

## Scope

Use this package when you need the standalone cryptographic utilities that support key derivation, security material handling, and mesh-specific crypto flows.

## Installation

```sh
yarn add @blemeshjs/crypto
```

## Development

From this package directory:

```sh
yarn build
yarn test
yarn lint
```

## Related Packages

- `@blemeshjs/utils` provides the shared low-level types used here.
- `@blemeshjs/core` and `@blemeshjs/sdk-web` consume this package.
