// Single source of truth for API documentation versions.
//
// The docs use Stripe-style date-based versioning (X-Api-Version: YYYY-MM-DD).
// Each entry becomes one item in the Scalar version selector and one OpenAPI
// document under docs/<date>/openapi.json.
//
// Adding a version:
//   1. Publish the frozen spec to S3 as `api-<date>.json`.
//   2. Demote the current entry from `id: 'default'` to `id: '<its date>'`
//      and set its `spec` to `api-<date>.json`.
//   3. Add the new current version at the TOP with `id: 'default'`.
//
// Rules:
//   - Exactly one entry MUST have `id: 'default'` (Scalar requires it; shown first).
//   - `date` is the display title and the local directory name.
//   - `spec` is the S3 object filename. The current/live version tracks the
//     always-latest `api.json`; frozen versions use `api-<date>.json`.
//   - Array order = version-selector order.

const S3_BASE = 'https://communal-api.s3.ca-central-1.amazonaws.com/docs'

// The only API server exposed in production builds. Specs ship with Local,
// Staging, and Prod entries; `npm run publish` filters the global `servers`
// array down to this one so the published "Server" selector offers Prod alone.
export const PRODUCTION_SERVER_URL = 'https://api.getcommunal.com/api'

// True when this process is a production docs build (set by `npm run publish`).
// Preview and plain `fetch-spec` leave it unset, keeping all servers selectable.
export const IS_PRODUCTION = process.env.SCALAR_ENV === 'production'

export const VERSIONS = [
  { id: 'default', date: '2026-03-25', spec: 'api.json' }, // current/live spec
  { id: '2026-02-01', date: '2026-02-01', spec: 'api-2026-02-01.json' }, // frozen
]

export const DEFAULT_VERSION = VERSIONS.find((v) => v.id === 'default') ?? VERSIONS[0]

/** S3 object filename for a version (defaults to the dated convention). */
export function specFilename(version) {
  return version.spec ?? `api-${version.date}.json`
}

/** Source URL the spec is fetched from. */
export function specUrl(version) {
  return `${S3_BASE}/${specFilename(version)}`
}

/** Local path the spec is written to (one directory per version). */
export function specPath(version) {
  return `docs/${version.date}/openapi.json`
}
