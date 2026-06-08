import { mkdirSync, writeFileSync } from 'fs'
import { dirname } from 'path'
import { VERSIONS, specUrl, specPath } from './versions.mjs'
import { normalizeSpec } from './normalize-openapi.mjs'

// Fetch and normalize every version's OpenAPI document into docs/<date>/openapi.json.
for (const version of VERSIONS) {
  const url = specUrl(version)
  const dest = specPath(version)

  const res = await fetch(url)
  if (!res.ok) {
    console.error(`fetch-spec: ${version.date} -> ${res.status} ${res.statusText} for ${url}`)
    process.exit(1)
  }

  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, await res.text())
  const removed = normalizeSpec(dest)

  console.log(`fetch-spec: ${version.date} <- ${url} -> ${dest} (normalized, removed ${removed} servers)`)
}
