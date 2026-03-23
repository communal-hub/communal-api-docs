import { readFileSync, writeFileSync } from 'fs'

const filePath = 'docs/openapi.json'

/** Scalar sidebar groups for the API Reference tab (re-applied after each fetch-spec). */
const TAG_GROUPS = [
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

const spec = JSON.parse(readFileSync(filePath, 'utf8'))
const methods = new Set(['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'])

let removed = 0
for (const pathItem of Object.values(spec.paths ?? {})) {
  if (!pathItem || typeof pathItem !== 'object') continue

  if ('servers' in pathItem) {
    delete pathItem.servers
    removed++
  }

  for (const [key, op] of Object.entries(pathItem)) {
    if (!methods.has(key) || !op || typeof op !== 'object') continue
    if ('servers' in op) {
      delete op.servers
      removed++
    }
  }
}

spec['x-tagGroups'] = TAG_GROUPS

writeFileSync(filePath, JSON.stringify(spec, null, 4) + '\n', 'utf8')
console.log(`normalize-openapi: removed ${removed} path/operation servers, set x-tagGroups on ${filePath}`)
