import { mkdirSync, writeFileSync } from 'fs'
import { dirname } from 'path'
import { specUrl, specPath, IS_PRODUCTION } from './versions.mjs'
import { normalizeSpec } from './normalize-openapi.mjs'
import { syncVersions } from './sync-versions.mjs'

const { versions, changed, newVersion, frozenVersion } = await syncVersions()
if (changed) {
  console.log(`fetch-spec: detected new version ${newVersion} -- updated versions.mjs (${frozenVersion} frozen)`)
}

// Fetch and normalize every version's OpenAPI document into docs/<date>/openapi.json.
for (const version of versions) {
  const url = specUrl(version)
  const dest = specPath(version)

  const res = await fetch(url)
  if (!res.ok) {
    console.error(`fetch-spec: ${version.date} -> ${res.status} ${res.statusText} for ${url}`)
    process.exit(1)
  }

  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, await res.text())
  const removed = normalizeSpec(dest, { productionOnly: IS_PRODUCTION })

  const mode = IS_PRODUCTION ? 'production, Prod server only' : 'all servers'
  console.log(`fetch-spec: ${version.date} <- ${url} -> ${dest} (normalized, removed ${removed} servers, ${mode})`)
}
