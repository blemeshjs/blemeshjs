# Releasing

This repository publishes the public SDK packages to npm:

- `@blemeshjs/utils`
- `@blemeshjs/crypto`
- `@blemeshjs/core`
- `@blemeshjs/sdk`
- `@blemeshjs/sdk-web`
- `@blemeshjs/sdk-react-native`

## Prerequisites

- Add an `NPM_TOKEN` repository secret with publish access to the `@blemeshjs` npm scope.
- Keep `packages/pro` and `packages/sdk-pro` private.

## Normal release flow

1. Add a changeset with `pnpm changeset`.
2. Merge the generated release PR created by `.github/workflows/release.yml`.
3. The same workflow publishes the versioned packages to npm.

## Manual publish fallback

- Run the `Release` GitHub Actions workflow with `workflow_dispatch`.
- For a local verification without publishing, run `pnpm release:publish:dry-run`.