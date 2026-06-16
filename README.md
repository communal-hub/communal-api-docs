# Communal API documentation

Source for the Communal Platform API docs published with [Scalar](https://scalar.com/). Guides live in [`docs/`](docs/); the OpenAPI description is [`docs/openapi.json`](docs/openapi.json). Navigation uses **Scalar 2.0** in [`scalar.config.json`](scalar.config.json) (Scalar expects this exact filename for preview and hosted Docs): top tabs (**Get Started** first, then **API Reference**), grouped guide sections (**Basics** / **Platform guides** with nested modules—**Programs** contains programs, registration opportunities, program signups, and attendance; **Membership** is its own section; **Activities** and **Users** are each their own section), and the reference in **nested** mode with **`x-tagGroups`** (applied by [`normalize-openapi.mjs`](normalize-openapi.mjs) after each `fetch-spec`).

## Prerequisites

- **Node.js 24+** — required by `@scalar/cli` for `npm run preview`, `npm run publish`, and `npx scalar upgrade`. **Netlify supports Node 24** in builds; this repo sets `NODE_VERSION = "24"` in [netlify.toml](netlify.toml) so production installs match the CLI. With [nvm](https://github.com/nvm-sh/nvm), run `nvm use` (see [`.nvmrc`](.nvmrc)).
- `npm run build` only needs Node 18+ in practice, but the repo standardizes on 24 for one toolchain.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run fetch-spec` | Download each version's spec from S3 into `docs/<date>/openapi.json` (per [`versions.mjs`](versions.mjs)), then normalize each. |
| `npm run normalize-spec` | Remove per-path `servers` overrides from a version's spec so Try It uses global servers (production central host). |
| `npm run build` | Generate `public/llms.txt`, `public/llms-endpoints.json`, and `public/llms-summary-map.json` from the OpenAPI spec. |
| `npm run preview` | Fetch specs, then open a local Scalar preview. Reference reads the on-disk specs (preview unpublished spec changes); keeps all servers (Local/Staging/Prod) selectable. |
| `npm run publish-registry` | Publish every version's spec to the single registry API `@getcommunal/communal-platform-api`, each as its own registry **version** (requires Scalar CLI auth). |
| `npm run publish` | Fetch specs, publish them to the registry, then publish the docs project (requires Scalar CLI auth). Runs in `SCALAR_ENV=production`, which (a) reduces the OpenAPI `servers` array to **Prod only** (`https://api.getcommunal.com/api`) and (b) points each docs version's reference at the shared versioned registry API, so the registry shows **one** entry with a version selector rather than `communal-platform-api`, `communal-platform-api-1`, … |

## Layout

- **`docs/*.md`** — Guide pages (overview, auth, concepts, API usage, per-area guides under `docs/guides/`).
- **`docs/openapi.json`** — OpenAPI 3.1 document (committed snapshot; refresh with `fetch-spec` when the API changes).
- **`public/`** — Static assets for Netlify (`index.html`, logos) plus generated LLM helper files from `build`.

## Contributing

1. Edit Markdown or config locally; keep content aligned with the published OpenAPI (avoid undocumented headers or paths).
2. Run `npm run build` before committing if `docs/openapi.json` changed (regenerates `public/llms.*`).
3. `fetch-spec` overwrites `docs/openapi.json`. This repo runs [`normalize-openapi.mjs`](normalize-openapi.mjs) afterward to drop path-level `servers` entries that pointed at tenant subdomains, so Scalar matches the central API host. For a permanent fix, remove those entries in the API generator that publishes `api.json`.

## Deployment

Netlify runs `npm install && npm run build` and publishes the `public/` directory. Scalar-hosted API reference and guides are synced via Scalar’s GitHub integration or `npm run publish` depending on your workflow.
