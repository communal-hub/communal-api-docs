# Communal API documentation

Source for the Communal Platform API docs, a self-hosted [Zudoku](https://zudoku.dev/) static site deployed to Netlify at `docs.getcommunal.com`. Guides live in [`docs/`](docs/); each version's OpenAPI description is `docs/<date>/openapi.json`.

Navigation is one declarative tree, the `NAVIGATION` constant in [`generate-config.mjs`](generate-config.mjs). Three artifacts derive from it by pure function: the Zudoku `navigation` array, the legacy version-prefixed guide redirects in `public/_redirects`, and the URL inventory [`verify-docs.mjs`](verify-docs.mjs) asserts against. Editing the tree updates all three, so they cannot drift. Page titles and icons live in that tree, not in Markdown frontmatter; none of the guide files carry any.

A doc node's `slug` is its canonical URL path, and the empty slug is the site root, so `/` serves the Overview page itself rather than bouncing to another URL. A node's optional `previousSlug` is the path it used to be served at; it 301s to `slug`, and the version-prefixed redirects are built from it too, so a page that moves never leaves a redirect chain behind.

The API reference is built from [`versions.mjs`](versions.mjs). Every version reuses the same guides; only the `/reference` OpenAPI document differs, and Zudoku renders a version selector across them. Guides publish once at their canonical paths, and the version prefixes Scalar used (`/2026-03-25/...`, `/2026-02-01/...`) 301 to those paths.

## Prerequisites

- **Node.js 24+.** With [nvm](https://github.com/nvm-sh/nvm), run `nvm use` (see [`.nvmrc`](.nvmrc)). [netlify.toml](netlify.toml) pins `NODE_VERSION = "24"` so production builds match.
- `npm install` once, then any script below.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run fetch-spec` | Download each version's spec from S3 into `docs/<date>/openapi.json` (per [`versions.mjs`](versions.mjs)), then normalize each. Also snapshots the MCP tool manifest into `docs/mcp/tools.json`. |
| `npm run normalize-spec` | Remove per-path `servers` overrides from a version's spec so the reference uses the global production host. |
| `npm run generate-config` | Regenerate `zudoku.config.ts` and `public/_redirects` from the `NAVIGATION` tree, `docs/mcp-tools.md` from the MCP tool manifest, and stage each version's spec under a unique filename in `.zudoku-specs/`. |
| `npm run build` | Generate `public/llms.txt`, `public/llms-endpoints.json`, and `public/llms-summary-map.json` from the current OpenAPI spec. |
| `npm run dev` | Regenerate the config, then serve the site locally with hot reload. |
| `npm run build:docs` | Regenerate the config, then build the static site into `dist/`. |
| `npm run verify-docs` | Assert a built `dist/` against the navigation tree and `versions.mjs`. Exits non-zero on the first broken guarantee. |
| `npm run publish-registry` | Publish every version's spec to the Scalar registry API `@getcommunal/communal-platform-api`. Retained as the pre-cutover rollback path; not part of the Netlify build. |

`build` must run before `build:docs`: `build.mjs` writes the `llms.*` artifacts into `public/`, and the Zudoku build copies `public/` into `dist/`.

## Layout

- **`docs/*.md`, `docs/guides/*.md`** — Guide pages. No frontmatter; titles and icons come from `NAVIGATION`.
- **`docs/<date>/openapi.json`** — One normalized OpenAPI 3.1 document per version (committed snapshots; refresh with `fetch-spec`).
- **`docs/mcp/tools.json`, `docs/mcp-tools.md`, `docs/mcp-tool-reference.md`** — The MCP tool manifest snapshot and the two pages generated from it. See [MCP tools](#mcp-tools).
- **`public/`** — Served from the site root: logos, favicon, `_redirects`, and the generated `llms.*` artifacts.
- **`zudoku.config.ts`, `public/_redirects`** — Generated. Commit them, never hand-edit them.
- **`scalar.config.json`, `publish-registry.mjs`** — The Scalar setup, kept until the DNS cutover is confirmed. A follow-up removes them.

## Contributing

1. Add or edit Markdown under `docs/`, then add the page to `NAVIGATION` in `generate-config.mjs` with its full canonical `slug`, `label`, and an `icon`. Icons are written as the Phosphor names the Scalar config used and translated by the `PHOSPHOR_TO_LUCIDE` table, which throws on a name it does not know. Moving a page means changing its `slug` and setting `previousSlug` to the old one. A page left out of the tree gets no navigation entry, no redirect, and fails `verify-docs`.
2. Run `npm run generate-config` and commit the regenerated `zudoku.config.ts` and `public/_redirects` alongside your change.
3. Run `npm run build && npm run build:docs && npm run verify-docs` before opening a pull request.
4. `fetch-spec` overwrites each `docs/<date>/openapi.json` and then runs [`normalize-openapi.mjs`](normalize-openapi.mjs), which drops path-level `servers` entries pointing at tenant subdomains and re-applies `x-tagGroups`. For a permanent fix, remove those entries in the API generator that publishes `api.json`.

## MCP tools

Two generated pages document the tools the Communal MCP server offers. [What AI assistants can do](docs/mcp-tools.md) is written for the people who use an assistant day to day, most of whom are not developers: each tool's plain-language summary, grouped by area, with example requests. The [MCP tool reference](docs/mcp-tool-reference.md) is for developers: descriptions, parameters and REST operations. Their source is the public tool manifest that community-management builds from the tools' own `tools/list` entries: `php artisan docs:export-to-s3` uploads it to `docs/mcp-tools.json` in the same bucket as the specs (`php artisan mcp:export-manifest` writes it locally). The manifest carries each tool's name, title, plain-language summary, description, behaviour hints, input schema and the REST operations it uses; it deliberately carries no roles, scopes or feature flags.

- `fetch-spec` snapshots the manifest into `docs/mcp/tools.json`. A missing manifest keeps the committed snapshot rather than failing.
- [`mcp-tools.mjs`](mcp-tools.mjs) renders both pages, grouped by the manifest's `domain`. A new domain needs an entry in `DOMAINS` (label, intro and example requests, the only tool copy kept in this repo). REST operations link into the default version's reference and are omitted when the reference does not publish them.
- `build.mjs` appends an MCP tools section to `llms.txt`.
- `verify-docs` fails when a page is stale against the snapshot, a tool has no summary or is missing from either page, a reference link does not resolve, or `llms.txt` misses a tool.

To change what a tool says, edit it in community-management (`#[Summary]` for the plain-language page; title, description and schema for the reference), never the generated pages.

## Deployment

Netlify runs `npm ci && npm run build && npm run build:docs` and publishes `dist/`. `build.mjs` fetches the live spec from S3 at build time, so builds depend on that bucket being reachable.

Adding an API version needs only a `versions.mjs` edit; `sync-versions.mjs` performs that edit automatically when the upstream `info.version` changes. The version selector, the reference routes, and the guide redirect prefixes all follow from `VERSIONS`.
