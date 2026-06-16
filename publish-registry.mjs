import { execFileSync } from 'child_process'
import { VERSIONS, DEFAULT_VERSION, specPath, REGISTRY_NAMESPACE, REGISTRY_SLUG } from './versions.mjs'

// Publish every version's normalized spec to ONE registry API
// (@<namespace>/<slug>), each as a distinct registry *version*. Doing this here
// — instead of letting `scalar project publish` upload each version's reference
// document separately — keeps the Scalar registry to a single "API Document"
// with a version selector rather than one entry per version
// (communal-platform-api, communal-platform-api-1, ...).
//
// Run via `npm run publish` (after `fetch-spec`, which normalizes the on-disk
// specs). Requires Scalar CLI auth, same as `scalar project publish`.
//
// Ordering: frozen versions publish with `--no-current`; the default/current
// version publishes LAST without it, so it becomes the registry's current
// version. `--force` overwrites a same-named version (the live spec is mutable),
// making re-publishing idempotent.

function publish(version, { current }) {
  const args = [
    'registry',
    'publish',
    specPath(version),
    '--namespace',
    REGISTRY_NAMESPACE,
    '--slug',
    REGISTRY_SLUG,
    '--version',
    version.date,
    '--force',
    ...(current ? [] : ['--no-current']),
  ]
  console.log(
    `publish-registry: ${version.date} -> @${REGISTRY_NAMESPACE}/${REGISTRY_SLUG}@${version.date}${current ? ' (current)' : ''}`,
  )
  execFileSync('scalar', args, { stdio: 'inherit' })
}

for (const version of VERSIONS.filter((v) => v.id !== DEFAULT_VERSION.id)) {
  publish(version, { current: false })
}
publish(DEFAULT_VERSION, { current: true })

console.log(
  `publish-registry: published ${VERSIONS.length} version(s) to @${REGISTRY_NAMESPACE}/${REGISTRY_SLUG}`,
)
