import { readFileSync, writeFileSync } from 'fs'
import { VERSIONS, DEFAULT_VERSION, specUrl } from './versions.mjs'

const VERSIONS_FILE = new URL('./versions.mjs', import.meta.url)

/**
 * Checks the live default spec for a version bump. If the outgoing default's
 * frozen snapshot already exists in S3, rewrites versions.mjs (demoting the
 * old default, adding the new one at the top) and returns the updated list.
 * Otherwise returns the existing list unchanged.
 */
export async function syncVersions() {
  const res = await fetch(specUrl(DEFAULT_VERSION))
  if (!res.ok) {
    throw new Error(`sync-versions: ${res.status} ${res.statusText} fetching ${specUrl(DEFAULT_VERSION)}`)
  }
  const liveVersion = (await res.json()).info?.version

  if (!liveVersion || liveVersion === DEFAULT_VERSION.date) {
    return { versions: VERSIONS, changed: false }
  }

  const oldDefault = DEFAULT_VERSION
  const frozenSpec = `api-${oldDefault.date}.json`
  const frozenUrl = specUrl({ date: oldDefault.date, spec: frozenSpec })
  const head = await fetch(frozenUrl, { method: 'HEAD' })
  if (!head.ok) {
    console.warn(
      `sync-versions: live spec is now ${liveVersion}, but ${frozenSpec} isn't published yet (${head.status}) -- skipping versions.mjs update`
    )
    return { versions: VERSIONS, changed: false }
  }

  const versions = [
    { id: 'default', date: liveVersion, spec: 'api.json' },
    { id: oldDefault.date, date: oldDefault.date, spec: frozenSpec },
    ...VERSIONS.filter((v) => v.id !== 'default'),
  ]

  writeVersionsFile(versions)

  return { versions, changed: true, newVersion: liveVersion, frozenVersion: oldDefault.date }
}

function writeVersionsFile(versions) {
  const source = readFileSync(VERSIONS_FILE, 'utf8')
  const arrayText = versions
    .map((v) => {
      const comment = v.id === 'default' ? 'current/live spec' : 'frozen'
      return `  { id: '${v.id}', date: '${v.date}', spec: '${v.spec}' }, // ${comment}`
    })
    .join('\n')
  const updated = source.replace(
    /export const VERSIONS = \[[\s\S]*?\n\]/,
    `export const VERSIONS = [\n${arrayText}\n]`
  )
  writeFileSync(VERSIONS_FILE, updated)
}
