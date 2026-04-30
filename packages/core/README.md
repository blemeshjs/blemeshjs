# @blemeshjs/core

Core BLE Mesh bearer, provisioning, message, and lower-layer primitives.

## Scope

This package contains the lower-level protocol building blocks used by the higher-level SDK packages. Its public entrypoint re-exports bearer, layers, mesh messages, mesh models, model arrays, and provisioning modules.

## Installation

```sh
yarn add @blemeshjs/core
```

## Development

From this package directory:

```sh
yarn build
yarn test
yarn lint
```

## Related Packages

- `@blemeshjs/utils` provides shared types and helpers.
- `@blemeshjs/crypto` provides cryptographic helpers used by mesh layers.
- `@blemeshjs/sdk` builds the high-level developer API on top of this package.
