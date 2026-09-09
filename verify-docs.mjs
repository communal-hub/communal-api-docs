import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { NAVIGATION, toDocs, toLegacyGuideRedirects } from './generate-config.mjs'
import { DEFAULT_VERSION, VERSIONS, specPath } from './versions.mjs'

// Proves a built dist/ against the navigation tree and versions.mjs. Rerun it
// after any build: `npm run build && npm run build:docs && npm run verify-docs`.

const DIST = 'dist'
const FRAGMENT_DIR = `${DIST}/pagefind/fragment`
const FRAGMENT_PREFIX = 'pagefind_dcd'
// A term the OpenAPI documents carry and no guide mentions, so finding it in a
// reference fragment proves search really reaches the reference. The check below
// re-proves that property against the guide sources on every run.
const REFERENCE_ONLY_TERM = 'prompt_for_number_of_guests'

const slugify = (str) =>
  str
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/['‘’“”]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')

const listMissing = (missing, total) =>
  `${missing.length} of ${total} missing: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? ', ...' : ''}`

const results = []
function check(name, run) {
  let problem
  try {
    problem = run()
  } catch (error) {
    problem = error.message
  }
  results.push({ name, problem })
}

function loadFragments() {
  if (!existsSync(FRAGMENT_DIR)) throw new Error(`${FRAGMENT_DIR} does not exist`)
  return readdirSync(FRAGMENT_DIR)
    .filter((file) => file.endsWith('.pf_fragment'))
    .map((file) => {
      const text = gunzipSync(readFileSync(`${FRAGMENT_DIR}/${file}`)).toString('utf8')
      if (!text.startsWith(FRAGMENT_PREFIX)) {
        throw new Error(`${file} is not prefixed with '${FRAGMENT_PREFIX}'`)
      }
      return JSON.parse(text.slice(FRAGMENT_PREFIX.length))
    })
}

const guides = toDocs(NAVIGATION)
const guideSlugs = guides.map((doc) => doc.slug)
const referencePages = VERSIONS.flatMap((version) => {
  const spec = JSON.parse(readFileSync(specPath(version), 'utf8'))
  const tagPages = (spec.tags ?? []).map((tag) => `reference/${version.date}/${slugify(tag.name)}`)
  const versionPages = [`reference/${version.date}`, ...tagPages]
  if (version.id !== DEFAULT_VERSION.id) return versionPages
  return [
    ...versionPages,
    'reference',
    ...(spec.tags ?? []).map((tag) => `reference/${slugify(tag.name)}`),
  ]
})

const fragments = loadFragments()
const guideFragments = fragments.filter((f) => !f.url.startsWith('/reference'))
const referenceFragments = fragments.filter((f) => f.url.startsWith('/reference'))
const redirects = existsSync(`${DIST}/_redirects`)
  ? readFileSync(`${DIST}/_redirects`, 'utf8')
  : ''

check('every canonical guide URL is prerendered', () => {
  const missing = guideSlugs.filter((slug) => !existsSync(`${DIST}/${slug}.html`))
  return missing.length ? listMissing(missing, guideSlugs.length) : null
})

check('the site root is prerendered', () =>
  existsSync(`${DIST}/index.html`) ? null : `${DIST}/index.html is missing`)

check('/basics is a page, not a bare category label', () =>
  existsSync(`${DIST}/basics.html`) ? null : `${DIST}/basics.html is missing`)

check('the reference is prerendered for every version and tag', () => {
  const missing = referencePages.filter((page) => !existsSync(`${DIST}/${page}.html`))
  return missing.length ? listMissing(missing, referencePages.length) : null
})

check('Pagefind indexed the guides', () => {
  const indexed = new Set(guideFragments.map((f) => f.url))
  const missing = guideSlugs.filter((slug) => !indexed.has(`/${slug}`))
  return missing.length ? listMissing(missing, guideSlugs.length) : null
})

check('Pagefind indexed the reference', () => {
  const versions = VERSIONS.filter((v) => v.id !== DEFAULT_VERSION.id)
  const missing = versions
    .map((v) => `/reference/${v.date}/`)
    .filter((prefix) => !referenceFragments.some((f) => f.url.startsWith(prefix)))
  if (referenceFragments.length === 0) return 'no reference fragments in the Pagefind index'
  return missing.length ? `no fragments for ${missing.join(', ')}` : null
})

check(`'${REFERENCE_ONLY_TERM}' is searchable and reaches only the reference`, () => {
  const sources = guides
    .map((doc) => doc.file)
    .filter((file) => readFileSync(file, 'utf8').includes(REFERENCE_ONLY_TERM))
  if (sources.length > 0) {
    return `${sources.join(', ')} now mentions it, so it no longer proves reference coverage; pick another term`
  }
  const inReference = referenceFragments.filter((f) => f.content.includes(REFERENCE_ONLY_TERM))
  const inGuides = guideFragments.filter((f) => f.content.includes(REFERENCE_ONLY_TERM))
  if (inReference.length === 0) {
    return `not found in any of ${referenceFragments.length} reference fragments`
  }
  if (inGuides.length > 0) return `leaked into guide fragments ${inGuides.map((f) => f.url).join(', ')}`
  return null
})

check('the llms artifacts ship at the site root', () => {
  const artifacts = ['llms.txt', 'llms-endpoints.json', 'llms-summary-map.json']
  const missing = artifacts.filter((file) => !existsSync(`${DIST}/${file}`))
  return missing.length ? `missing ${missing.join(', ')}` : null
})

check('_redirects ships the reference splat rules', () => {
  if (!redirects) return `${DIST}/_redirects is missing or empty`
  const required = [
    ['/reference/description/introduction', '/reference'],
    ['/reference/tag/:tag', '/reference/:tag'],
    ['/reference/tag/:tag/*', '/reference/:tag'],
  ]
  const rules = redirects.split('\n').map((line) => line.trim().split(/\s+/))
  const missing = required.filter(
    ([from, to]) => !rules.some((rule) => rule[0] === from && rule[1] === to && rule[2] === '301'),
  )
  return missing.length ? `missing ${missing.map(([from]) => from).join(', ')}` : null
})

check('_redirects ships a 301 for every legacy version-prefixed guide URL', () => {
  const expected = toLegacyGuideRedirects(NAVIGATION)
  const rules = redirects.split('\n').map((line) => line.trim().split(/\s+/))
  const missing = expected.filter(
    ([from, to]) => !rules.some((rule) => rule[0] === from && rule[1] === to && rule[2] === '301'),
  )
  return missing.length ? listMissing(missing.map(([from]) => from), expected.length) : null
})

const failed = results.filter((r) => r.problem)
for (const { name, problem } of results) {
  console.log(problem ? `FAIL  ${name}\n      ${problem}` : `ok    ${name}`)
}
console.log(
  `\n${results.length - failed.length}/${results.length} checks passed ` +
    `(${guideSlugs.length} guides, ${referencePages.length} reference pages, ${fragments.length} Pagefind fragments)`,
)
process.exit(failed.length ? 1 : 0)
