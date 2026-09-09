# Migrating the Communal API docs from Scalar to Zudoku

**Date:** 2026-09-09
**Status:** Approved design, pending implementation plan

## Context

`docs.getcommunal.com` is published with Scalar's hosted docs product. The
hosting cost is no longer justifiable, so the docs move to a self-hosted
open-source static site on Netlify, which this repo already builds against.

Scalar currently provides:

- Hosting for `docs.getcommunal.com` (a `CNAME` to `dns.scalar.com`).
- Rendering of 20 Markdown guides, with the tab/group/icon navigation defined
  in the generated `scalar.config.json` (~24KB).
- An API reference built from three OpenAPI 3.1 specs (37 paths each), nested
  by `x-tagGroups`, with a version selector across `2026-08-25`, `2026-03-25`,
  and `2026-02-01`.
- Full-text search across guides and reference.
- A "Try It" playground backed by `proxy.scalar.com`.
- The Scalar Registry publishing flow (`publish-registry.mjs`).

## Goals

Replace Scalar-the-host while preserving three capabilities the team named as
must-keep:

1. The API reference **version selector**.
2. **Unified search** across guides and reference in one index.
3. The **guides navigation structure** (tabs, nested groups, icons).

Reduce recurring cost to approximately zero, and keep `docs.getcommunal.com`.

## Non-goals

- **The "Try It" playground is dropped.** This is a deliberate scope
  reduction, and it removes the need for a CORS proxy and for handling API
  credentials in the browser.
- The Scalar Registry is retired. The OpenAPI specs are already published to
  S3, which becomes the public spec location.
- No rewriting of guide content. All 20 Markdown files migrate as-is.

## Decision: Zudoku

[Zudoku](https://github.com/zuplo/zudoku) (MIT, by Zuplo) is the target. It
covers all three must-keeps natively: file-array OpenAPI versioning with a
version selector, Pagefind local search, and a config-driven navigation tree
with per-item labels and icons. It builds to static files and deploys to
Netlify.

### Alternatives considered

**Astro Starlight + `starlight-openapi`.** Larger community and lower
abandonment risk, and Pagefind search is built in. Rejected as the primary
choice because API versioning is not first-class: each version's reference
would need hand-built routing and a custom version switcher — permanent
owned complexity in service of a must-keep requirement. **Retained as the
fallback** if the de-risking spike (below) fails.

**Static guides plus an embedded `@scalar/api-reference`.** The reference
would look identical to today, and `public/index.html` already does exactly
this. Rejected because the embed is a client-side SPA that Pagefind cannot
crawl, which breaks unified search — a stated must-keep.

## What survives unchanged

The migration touches the config emitter and the host, not the content or the
spec pipeline. These are untouched:

- `versions.mjs` — remains the single source of truth for versions.
- `fetch-spec.mjs` — S3 spec download.
- `normalize-openapi.mjs` — spec normalization.
- `build.mjs` — generates `llms.txt`, `llms-endpoints.json`,
  `llms-summary-map.json`.
- All 20 Markdown files under `docs/`.
- The logo and favicon SVGs in `public/`.

## Architecture

### Navigation

`generate-config.mjs` remains the single source of navigation truth. Only its
output target changes: it emits `zudoku.config.ts` instead of
`scalar.config.json`. The shared `DOCS_GROUP` tree is rewritten to Zudoku's
navigation item types.

Zudoku's `type: "doc"` accepts `file`, `path`, `label`, and `icon` directly in
config, so page titles continue to live in configuration. **No frontmatter is
added to any Markdown file** — this matters, because none of the 20 files
currently have any.

```ts
{ type: "doc", file: "docs/guides/view-attendance.md",
  path: "platform/programs/view-attendance",
  label: "View attendance", icon: "clipboard-list" }
```

Setting `path` explicitly preserves all 21 existing guide URLs exactly.

**Icon mapping.** Zudoku uses Lucide icons; the current config uses
`phosphor/regular/*`. Roughly 30 icon names need a hand-checked mapping table,
maintained as a constant in `generate-config.mjs`. Where no close Lucide
equivalent exists, prefer a neutral icon over an approximate one.

### Versioning and the reference

The reference is configured from `versions.mjs`:

```ts
apis: {
  type: "file",
  input: VERSIONS.map(v => ({
    path: v.date, label: v.date, input: specPath(v),
  })),
  path: "/reference",
}
```

with `showVersionSelect` enabled. Adding a version continues to require only a
`versions.mjs` edit, preserving the existing automatic version-detection flow
in `sync-versions.mjs`.

### Guides are published once

Scalar currently publishes all 21 guide pages three times — once canonically
and once under each of `/2026-03-25/` and `/2026-02-01/` — producing 61 URLs
for 21 pages of near-identical content. The guides are not version-specific; only
the reference is.

Guides are therefore published **once** at their canonical paths. Version
prefixes apply only to `/reference`. This removes 40 duplicate-content URLs.

### Search

Pagefind, Zudoku's local search provider. No external service and no
recurring cost. Pagefind runs after the static build and indexes the generated
site, so coverage of the reference depends on Zudoku prerendering those pages
(see Risks).

### Static assets

Zudoku uses the same `public/` convention as the current setup: files are
served from the root, so `public/logo-dark.svg` resolves at `/logo-dark.svg`.
Logos, the favicon, and the generated `llms.*` artifacts need no path changes.

`public/index.html` is **deleted**. It is the legacy standalone Scalar SPA and
would collide with Zudoku's root route.

## Redirects

Written to `public/_redirects` so Zudoku copies the file into the build output.

**Reference deep links (257 URLs).** Current reference URLs are shaped
`/reference/tag/program/get/parent_programs`. Zudoku's scheme differs, so
these do not survive one-to-one. Splat rules degrade them to the correct
tag page rather than a 404:

```
/reference/description/introduction  /reference       301
/reference/tag/:tag                  /reference/:tag  301
/reference/tag/:tag/*                /reference/:tag  301
```

Three rules, not one. A Netlify splat does not reliably match an empty
segment, so the bare tag-index URLs (`/reference/tag/program`, roughly 30 of
them) need their own rule alongside the operation-level splat. The
`/reference/description/introduction` page maps to the reference root.

This is a deliberate, accepted loss of precision: a bookmarked individual
operation lands on its tag page, not the exact operation.

**Version-prefixed guides (40 URLs).** One-to-one 301s to canonical paths,
generated by `generate-config.mjs` from the same navigation tree that produces
the config, so the two cannot drift:

```
/2026-03-25/basics/authentication  /basics/authentication  301
```

## Build and deployment

`netlify.toml` becomes:

```toml
[build]
  command = "npm ci && npm run build && npx zudoku build"
  publish = "dist"
```

**Ordering is load-bearing:** `npm run build` (`build.mjs`) writes the
`llms.*` artifacts into `public/`, and the Zudoku build copies `public/` into
`dist`. Running the Zudoku build first would ship stale or missing artifacts.

Note that `build.mjs` fetches the spec from S3 at build time, so Netlify
builds have a network dependency on the S3 bucket. This is pre-existing
behaviour and is not changed here.

## Cutover and rollback

1. Merge the migration with DNS still pointed at Scalar.
2. Verify on the Netlify preview URL against the verification checklist below.
3. Repoint the `docs.getcommunal.com` CNAME from `dns.scalar.com` to Netlify.
4. Leave the Scalar plan active for several days.
5. Cancel the Scalar subscription, then delete the Scalar-specific files.

Rollback at any point before step 5 is a DNS flip back to `dns.scalar.com`.

## Removed after cutover

- `scalar.config.json`
- `publish-registry.mjs`
- `public/index.html`
- The `@scalar/cli` devDependency
- The `publish`, `publish:pipeline`, and Scalar-based `preview` npm scripts
- `REGISTRY_NAMESPACE`, `REGISTRY_SLUG`, and `registryUrl()` in `versions.mjs`
- The `IS_PRODUCTION` registry branch in `generate-config.mjs`

`IS_PRODUCTION` itself is retained: it still filters the OpenAPI `servers`
array down to production only.

`README.md` needs a full pass, as it documents the Scalar workflow throughout.

## Risks

**Zudoku is pre-1.0 (`0.86.0` as installed).** Config APIs may churn between releases. The
dependency is pinned to an exact version and upgraded deliberately. The
license is MIT, so the exposure is maintenance churn, not lock-in.

**Pagefind coverage of the reference is now build-verified.** See Spike
results below. This risk is retired.

**Single-vendor OSS.** Zudoku is developed primarily by Zuplo. The Starlight
fallback remains viable because the expensive assets — `versions.mjs`, the
spec pipeline, and the Markdown content — are framework-independent.

## Spike results (2026-09-09, zudoku 0.86.0)

A throwaway scaffold with two OpenAPI versions and three guide pages was built
and its Pagefind index decompressed and inspected. **The gate passed.**

- 61 HTML pages prerendered. 59 Pagefind fragments: **54 reference, 3 guides**,
  plus the error pages.
- `request_hash`, a term appearing only in the OpenAPI document and in none of
  the guide pages, is indexed in 9 reference fragments. Unified search across
  guides and reference is real.

Facts the spike established, which the implementation depends on:

**`package.json` must set `"type": "module"`.** Without it the Vite build
succeeds and the prerender step then fails with `Could not find zudoku.config
entry in server build output`. The error does not name the cause.

**The reference has no per-operation pages.** Output is one page per tag:
`/reference/<tag>` for the default version and `/reference/<version>/<tag>`
for the others. Operations are sections within a tag page. The splat redirect
is therefore the only available mapping for old operation deep links, not
merely the cheaper one.

**Output is flat `.html` files**, not `<dir>/index.html`. Netlify serves these
at extensionless paths.

**`category.link` accepts a doc**, which resolves the `/basics` open question:
a category renders its own page when given `link: { type: "doc", ... }`.

**The default version renders twice**, at `/reference/<tag>` and at
`/reference/2026-08-25/<tag>`. This is the same duplicate-content shape just
removed from the guides. Worth a canonical tag or a decision later; it does
not block.

**Zudoku has native `docs.publishMarkdown` and `docs.llms`.** The build
already emits a `.md` alongside each page. Whether these subsume part of
`build.mjs` is a follow-up, not part of this migration.

**`llms-endpoints.json` and `llms-summary-map.json` have exactly one consumer
in the repo: `public/index.html`**, which this migration deletes. They are
retained for now because third-party consumers of those public URLs cannot be
observed from inside the repo. Removing them is a proposed follow-up.

**`npm audit` reports 4 advisories** (`toml` high, `hono` moderate) from
Zudoku's transitive dependencies. Both are build-time only and are not served
in the static output.


## Verification checklist

- All 21 canonical guide URLs resolve with correct titles and nesting.
- The navigation tree matches the current structure: two tabs, `Basics` and
  `Platform guides`, with `Users` / `Membership` / `Programs` / `Activities`
  nested correctly.
- Every navigation icon renders (no missing-glyph fallbacks).
- The version selector lists all three versions and switches the reference.
- The reference nests by `x-tagGroups` for each version.
- Search returns hits from guides **and** from the reference.
- A sample of version-prefixed guide URLs 301s to canonical.
- `/basics` resolves via `category.link` (it is a live URL today, not only `/`).
- A sample of old reference deep links lands on the right tag page.
- `llms.txt`, `llms-endpoints.json`, and `llms-summary-map.json` are present
  at the site root in `dist`.
- Logos and favicon render in both light and dark mode.

## Open questions

- Exact Lucide equivalents for several Phosphor icons
  (`brackets-curly`, `identification-card`, `list-magnifying-glass`) are
  resolved during implementation against the Lucide icon set.
- Whether to drop `llms-endpoints.json` and `llms-summary-map.json` once
  `public/index.html`, their only in-repo consumer, is deleted.
- Whether to canonicalise the duplicate default-version reference URLs.
