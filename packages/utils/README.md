# @blemeshjs/utils

Shared BLE Mesh enums, helpers, messages, models, and low-level utilities.

## Scope

This package is the shared foundation for the rest of the blemeshjs stack. Its public entrypoint re-exports helpers, types, constants, enums, mesh messages, and mesh models.

## Installation

```sh
yarn add @blemeshjs/utils
```

## Development

From this package directory:

```sh
yarn build
yarn test
yarn lint
```

## Related Packages

- `@blemeshjs/crypto` builds mesh cryptographic helpers on top of these primitives.
- `@blemeshjs/core` and `@blemeshjs/sdk` use this package as a shared dependency layer.
