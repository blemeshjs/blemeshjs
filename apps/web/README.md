# web

A small Next.js playground for the BLEMeshJS web SDK.

This app lives inside the monorepo and exists mostly so we can poke at [`@blemeshjs/sdk-web`](../../packages/sdk-web) in a real browser while we develop it. If you're looking for a working example of how to use the SDK in a Next.js app, this is a good place to start.

## Run it

From the repo root:

```sh
yarn install
yarn workspace web dev
```

Then open [http://localhost:3000](http://localhost:3000).

You'll need a Chromium-based browser (Web Bluetooth is required) and a BLE Mesh device to talk to.

## Layout

- `app/` — Next.js App Router pages and layouts.
- `public/` — static assets.

## Notes

This is a development playground, not a production app. APIs and UI may change without warning as the SDK evolves.
