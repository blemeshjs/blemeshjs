---
"@blemeshjs/core": patch
"@blemeshjs/sdk": patch
---

Fix three connection lifecycle bugs.

- `NetworkConnection`'s central manager handler fell through from `poweredOn`
  into `poweredOff`, so every power-on notification closed and cleared all
  connected proxies.
- The GATT bearer no longer emitted `bearerDidClose` when the radio left the
  poweredOn state, so consumers were never told the link had gone away.
- `meshNetworkDidChange` left the connection's `close()` and `open()`
  promises floating, turning an ordinary open failure into an unhandled
  rejection. Failures are now reported through the logger.
