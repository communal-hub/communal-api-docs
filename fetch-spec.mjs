import { mkdirSync, writeFileSync } from 'fs'
import { dirname } from 'path'
import { specUrl, specPath, MCP_MANIFEST_URL } from './versions.mjs'
import { MCP_MANIFEST_PATH } from './mcp-tools.mjs'
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
  const removed = normalizeSpec(dest)

  console.log(`fetch-spec: ${version.date} <- ${url} -> ${dest} (normalized, removed ${removed} servers)`)
}

// Snapshot the MCP tool manifest. Unlike a spec, a missing manifest keeps the
// committed snapshot instead of failing, so the docs still build while the
// manifest has not been published yet.
const manifestRes = await fetch(MCP_MANIFEST_URL)
if (manifestRes.ok) {
  const manifest = await manifestRes.json()
  mkdirSync(dirname(MCP_MANIFEST_PATH), { recursive: true })
  writeFileSync(MCP_MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`fetch-spec: MCP tools <- ${MCP_MANIFEST_URL} -> ${MCP_MANIFEST_PATH} (${manifest.tools.length} tools)`)
} else {
  console.warn(`fetch-spec: MCP tools -> ${manifestRes.status} ${manifestRes.statusText} for ${MCP_MANIFEST_URL}; keeping ${MCP_MANIFEST_PATH}`)
}
