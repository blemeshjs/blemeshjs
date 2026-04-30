# Changesets

This directory stores release intent for the public npm packages in this repository.

- Add a changeset with `yarn changeset` when a change should ship.
- Merge the generated release PR on `main` to publish the new versions.
- Private packages stay excluded through `.changeset/config.json`.