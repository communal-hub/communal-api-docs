# Communal API documentation

Source for the Communal Platform API docs, a self-hosted [Zudoku](https://zudoku.dev/) static site deployed to Netlify at `docs.getcommunal.com`. Guides live in [`docs/`](docs/); each version's OpenAPI description is `docs/<date>/openapi.json`.

Navigation is one declarative tree, the `NAVIGATION` constant in [`generate-config.mjs`](generate-config.mjs). Three artifacts derive from it by pure function: the Zudoku `navigation` array, the legacy version-prefixed guide redirects in `public/_redirects`, and the URL inventory [`verify-docs.mjs`](verify-docs.mjs) asserts against. Editing the tree updates all three, so they cannot drift. Page titles and icons live in that tree, not in Markdown frontmatter; none of the guide files carry any.

The API reference is built from [`versions.mjs`](versions.mjs). Every version reuses the same guides; only the `/reference` OpenAPI document differs, and Zudoku renders a version selector across them. Guides publish once at their canonical paths, and the version prefixes Scalar used (`/2026-03-25/...`, `/2026-02-01/...`) 301 to those paths.

## Prerequisites

- **Node.js 24+.** With [nvm](https://github.com/nvm-sh/nvm), run `nvm use` (see [`.nvmrc`](.nvmrc)). [netlify.toml](netlify.toml) pins `NODE_VERSION = "24"` so production builds match.
- `npm install` once, then any script below.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run fetch-spec` | Download each version's spec from S3 into `docs/<date>/openapi.json` (per [`versions.mjs`](versions.mjs)), then normalize each. |
| `npm run normalize-spec` | Remove per-path `servers` overrides from a version's spec so the reference uses the global production host. |
| `npm run generate-config` | Regenerate `zudoku.config.ts` and `public/_redirects` from the `NAVIGATION` tree, and stage each version's spec under a unique filename in `.zudoku-specs/`. |
| `npm run build` | Generate `public/llms.txt`, `public/llms-endpoints.json`, and `public/llms-summary-map.json` from the current OpenAPI spec. |
| `npm run dev` | Regenerate the config, then serve the site locally with hot reload. |
| `npm run build:docs` | Regenerate the config, then build the static site into `dist/`. |
| `npm run verify-docs` | Assert a built `dist/` against the navigation tree and `versions.mjs`. Exits non-zero on the first broken guarantee. |
| `npm run publish-registry` | Publish every version's spec to the Scalar registry API `@getcommunal/communal-platform-api`. Retained as the pre-cutover rollback path; not part of the Netlify build. |

`build` must run before `build:docs`: `build.mjs` writes the `llms.*` artifacts into `public/`, and the Zudoku build copies `public/` into `dist/`.

## Layout

- **`docs/*.md`, `docs/guides/*.md`** — Guide pages. No frontmatter; titles and icons come from `NAVIGATION`.
- **`docs/<date>/openapi.json`** — One normalized OpenAPI 3.1 document per version (committed snapshots; refresh with `fetch-spec`).
- **`public/`** — Served from the site root: logos, favicon, `_redirects`, and the generated `llms.*` artifacts.
- **`zudoku.config.ts`, `public/_redirects`** — Generated. Commit them, never hand-edit them.
- **`scalar.config.json`, `publish-registry.mjs`** — The Scalar setup, kept until the DNS cutover is confirmed. A follow-up removes them.

## Contributing

1. Add or edit Markdown under `docs/`, then add the page to `NAVIGATION` in `generate-config.mjs` with its full canonical `slug`, `label`, and a [Lucide](https://lucide.dev/icons/) `icon`. A page not in the tree gets no navigation entry and no redirect.
2. Run `npm run generate-config` and commit the regenerated `zudoku.config.ts` and `public/_redirects` alongside your change.
3. Run `npm run build && npm run build:docs && npm run verify-docs` before opening a pull request.
4. `fetch-spec` overwrites each `docs/<date>/openapi.json` and then runs [`normalize-openapi.mjs`](normalize-openapi.mjs), which drops path-level `servers` entries pointing at tenant subdomains and re-applies `x-tagGroups`. For a permanent fix, remove those entries in the API generator that publishes `api.json`.

## Deployment

Netlify runs `npm ci && npm run build && npm run build:docs` and publishes `dist/`. `build.mjs` fetches the live spec from S3 at build time, so builds depend on that bucket being reachable.

Adding an API version needs only a `versions.mjs` edit; `sync-versions.mjs` performs that edit automatically when the upstream `info.version` changes. The version selector, the reference routes, and the guide redirect prefixes all follow from `VERSIONS`.
