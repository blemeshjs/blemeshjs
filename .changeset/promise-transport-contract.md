---
"@blemeshjs/sdk-react-native": minor
"@blemeshjs/sdk-web": minor
"@blemeshjs/utils": minor
"@blemeshjs/core": minor
"@blemeshjs/sdk": minor
---

Drive the BLE transport through promises instead of delegate callbacks.

`CBPeripheral.readRSSI`, `discoverServices`, `discoverCharacteristics` and
`setNotifyValue` now return promises carrying their results, and the delegate
events that existed only to report those results are removed from
`CBPeripheralHandler` and `CBCentralManagerHandler`. `Bearer.open()` and
`Bearer.close()` return `Promise<void>`. `NetworkConnection.open/close/use/scan`
and the provisioning manager are awaitable and reject on failure rather than
resolving with an error value.

`@blemeshjs/sdk-web` also gains a default for `createMesh`'s argument, so
`createMesh()` works with no arguments and matches the
`@blemeshjs/sdk-react-native` signature exactly.

Custom transport implementations must be updated. Applications using
`createMesh` from either platform package are unaffected.
