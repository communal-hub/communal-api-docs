import { readFileSync, writeFileSync } from 'fs'
import { PRODUCTION_SERVER_URL } from './versions.mjs'

/** Scalar sidebar groups for the API Reference tab (re-applied after each fetch-spec). */
export const TAG_GROUPS = [
  {
    name: 'Programs',
    tags: ['Program', 'Attendance Sheet', 'Attendance Record'],
  },
  {
    name: 'Registration opportunities',
    tags: ['Registration Opportunity'],
  },
  {
    name: 'Program signups',
    tags: ['Program Signup'],
  },
  {
    name: 'Membership',
    tags: ['Membership Type', 'Membership Card'],
  },
  {
    name: 'Activity & users',
    tags: ['Activity', 'User'],
  },
]

const METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'])

/**
 * Normalize an OpenAPI document in place: strip per-path/operation `servers`
 * overrides and apply the Scalar `x-tagGroups` sidebar grouping. When
 * `productionOnly` is set, the global `servers` array is also reduced to just
 * the production host so the published "Server" selector offers Prod alone.
 * Returns the number of `servers` entries removed.
 */
export function normalizeSpec(filePath, { productionOnly = false } = {}) {
  const spec = JSON.parse(readFileSync(filePath, 'utf8'))

  let removed = 0
  for (const pathItem of Object.values(spec.paths ?? {})) {
    if (!pathItem || typeof pathItem !== 'object') continue

    if ('servers' in pathItem) {
      delete pathItem.servers
      removed++
    }

    for (const [key, op] of Object.entries(pathItem)) {
      if (!METHODS.has(key) || !op || typeof op !== 'object') continue
      if ('servers' in op) {
        delete op.servers
        removed++
      }
    }
  }

  if (productionOnly && Array.isArray(spec.servers)) {
    const prod = spec.servers.find((s) => s?.url === PRODUCTION_SERVER_URL)
    if (!prod) {
      const found = spec.servers.map((s) => s?.url).join(', ') || '(none)'
      throw new Error(
        `normalize-openapi: production build expected a server with url ${PRODUCTION_SERVER_URL} in ${filePath}, found: ${found}`,
      )
    }
    removed += spec.servers.length - 1
    spec.servers = [prod]
  }

  spec['x-tagGroups'] = TAG_GROUPS

  writeFileSync(filePath, JSON.stringify(spec, null, 4) + '\n', 'utf8')
  return removed
}

// CLI: `node normalize-openapi.mjs [path]` (defaults to the current version's spec).
// Set SCALAR_ENV=production to also reduce global servers to the production host.
if (import.meta.url === `file://${process.argv[1]}`) {
  const { specPath, DEFAULT_VERSION, IS_PRODUCTION } = await import('./versions.mjs')
  const filePath = process.argv[2] ?? specPath(DEFAULT_VERSION)
  const removed = normalizeSpec(filePath, { productionOnly: IS_PRODUCTION })
  console.log(`normalize-openapi: removed ${removed} servers, set x-tagGroups on ${filePath}`)
}
