// Single source of truth for API documentation versions.
//
// The docs use Stripe-style date-based versioning (X-Api-Version: YYYY-MM-DD).
// Each entry becomes one item in the Scalar version selector and one OpenAPI
// document under docs/<date>/openapi.json.
//
// Adding a version is automatic: `fetch-spec` calls `syncVersions()` (see
// sync-versions.mjs), which reads `info.version` from the live `api.json` and,
// when it no longer matches the `default` entry below, demotes that entry to a
// frozen `api-<date>.json` and prepends the new current version — rewriting the
// VERSIONS array in this file in place. It only does so once the outgoing
// default's frozen snapshot actually exists in S3; otherwise it warns and
// leaves the list alone. Removing a sunset version is still a manual edit.
//
// Rules:
//   - Exactly one entry MUST have `id: 'default'` (Scalar requires it; shown first).
//   - `date` is the display title and the local directory name.
//   - `spec` is the S3 object filename. The current/live version tracks the
//     always-latest `api.json`; frozen versions use `api-<date>.json`.
//   - Array order = version-selector order.

const S3_BASE = 'https://communal-api.s3.ca-central-1.amazonaws.com/docs'

// Scalar Registry coordinates. Every version publishes to this ONE registry API
// (@<namespace>/<slug>) as a distinct registry *version*, so the Scalar dashboard
// shows a single "API Document" with a version selector instead of one entry per
// version (which is what produced communal-platform-api + communal-platform-api-1).
// `publish-registry.mjs` uploads the specs; the production docs reference routes
// point at `registryUrl(version)` (see generate-config.mjs).
export const REGISTRY_NAMESPACE = 'getcommunal'
export const REGISTRY_SLUG = 'communal-platform-api'

// The only API server exposed in production builds. Specs ship with Local,
// Staging, and Prod entries; `npm run publish` filters the global `servers`
// array down to this one so the published "Server" selector offers Prod alone.
export const PRODUCTION_SERVER_URL = 'https://api.getcommunal.com/api'

// True when this process is a production docs build (set by `npm run publish`).
// Preview and plain `fetch-spec` leave it unset, keeping all servers selectable.
export const IS_PRODUCTION = process.env.SCALAR_ENV === 'production'

export const VERSIONS = [
  { id: 'default', date: '2026-08-25', spec: 'api.json' }, // current/live spec
  { id: '2026-03-25', date: '2026-03-25', spec: 'api-2026-03-25.json' }, // frozen
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

/**
 * Scalar Registry document URL for a version. All versions share one slug; the
 * trailing path segment selects the registry version. Used by the production
 * docs reference route so the published reference reads from the single
 * versioned registry API rather than a separate uploaded document.
 */
export function registryUrl(version) {
  return `https://registry.scalar.com/@${REGISTRY_NAMESPACE}/apis/${REGISTRY_SLUG}/${version.date}?format=json`
}
