# docs

The BLEMeshJS documentation site.

Built with [Next.js](https://nextjs.org) and [Fumadocs](https://fumadocs.dev). MDX content lives under `content/` and the rendered site is what you'd browse to learn how to use the SDK.

## Run it locally

From the repo root:

```sh
yarn install
yarn workspace docs dev
```

Then open [http://localhost:3000](http://localhost:3000).

## How it's organized

| Path                       | What lives there                                          |
| -------------------------- | --------------------------------------------------------- |
| `app/(home)`               | Landing page and other top-level routes.                  |
| `app/docs`                 | The documentation layout and pages.                       |
| `app/api/search/route.ts`  | Search endpoint used by the docs UI.                      |
| `content/`                 | The actual MDX documentation content.                     |
| `lib/source.ts`            | Fumadocs content source adapter.                          |
| `lib/layout.shared.tsx`    | Shared layout options for the site.                       |

Frontmatter and other content options are configured in `source.config.ts`. See the [Fumadocs MDX docs](https://fumadocs.dev/docs/mdx) for what's available.

## Contributing docs

If you're adding or editing pages, just drop MDX files into `content/` — Fumadocs will pick them up. Run `yarn workspace docs types:check` before opening a PR to catch type errors in the site code.
