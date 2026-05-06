# @blemeshjs/core

The protocol guts of BLEMeshJS.

This is where the BLE Mesh layers actually live — the bearer, network/transport/access layers, provisioning, and the message types that flow between them. Most apps don't import this package directly; they use [`@blemeshjs/sdk`](../sdk) instead, which gives you a friendlier, higher-level API on top of these pieces.

Reach for this package when you're building something custom: a new model, a debugging tool, or a transport that doesn't fit the standard SDK adapters.

## What's inside

- **Bearer** — PB-ADV / proxy / GATT bearer building blocks.
- **Provisioning** — the full provisioning state machine.
- **Mesh layers** — network, transport, access.
- **Mesh messages** — typed message definitions and codecs.
- **Mesh models** — base model implementations.

## Install

```sh
yarn add @blemeshjs/core
```

## Related

- [`@blemeshjs/utils`](../utils) — shared types and helpers.
- [`@blemeshjs/crypto`](../crypto) — mesh cryptography used by the layers.
- [`@blemeshjs/sdk`](../sdk) — the high-level developer API built on top of this package.

## License

Apache-2.0
