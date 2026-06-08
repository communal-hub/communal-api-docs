import { readFileSync, writeFileSync } from 'fs'

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
 * overrides and apply the Scalar `x-tagGroups` sidebar grouping.
 * Returns the number of `servers` entries removed.
 */
export function normalizeSpec(filePath) {
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

  spec['x-tagGroups'] = TAG_GROUPS

  writeFileSync(filePath, JSON.stringify(spec, null, 4) + '\n', 'utf8')
  return removed
}

// CLI: `node normalize-openapi.mjs [path]` (defaults to the current version's spec).
if (import.meta.url === `file://${process.argv[1]}`) {
  const { specPath, DEFAULT_VERSION } = await import('./versions.mjs')
  const filePath = process.argv[2] ?? specPath(DEFAULT_VERSION)
  const removed = normalizeSpec(filePath)
  console.log(`normalize-openapi: removed ${removed} path/operation servers, set x-tagGroups on ${filePath}`)
}
