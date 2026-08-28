# mobile

An Expo app for trying out [`@blemeshjs/sdk-react-native`](../../packages/sdk-react-native) on real devices.

This is the React Native counterpart to `apps/web`: a small playground we use during SDK development. It's also the most realistic example of wiring the SDK into an Expo project — permissions, peer dependencies, and all.

## Run it

From the repo root:

```sh
yarn install
yarn workspace mobile start
```

Or jump straight to a platform:

```sh
yarn workspace mobile ios
yarn workspace mobile android
```

You'll need the usual React Native / Expo toolchain installed (Xcode, Android Studio, simulators or a physical device with BLE).

## What it shows

- Initializing the SDK with `createMesh()`.
- Hooking the SDK lifecycle into a React Native app.
- Talking to a BLE Mesh device over `react-native-ble-plx`.

## Notes

This app moves fast and is meant for development. Don't depend on its APIs or screens being stable.
