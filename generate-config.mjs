import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { VERSIONS, specPath } from './versions.mjs'

// Single source of navigation truth. One declarative tree, three derived
// artifacts: zudoku.config.ts, the legacy version-prefixed guide redirects in
// public/_redirects, and the URL inventory verify-docs.mjs asserts against.
// Edit the tree, never the generated files.

/**
 * Zudoku 0.86.0 names every processed schema `<api-path>-<basename>.js`, so the
 * three versions of `docs/<date>/openapi.json` race to write one file under a
 * single `apis.path` and the build dies on a corrupt bundle. Each version is
 * therefore staged under a unique basename here. `versions.mjs` still owns the
 * canonical on-disk layout.
 */
const SPEC_STAGE_DIR = '.zudoku-specs'
const stagedSpecPath = (version) => `${SPEC_STAGE_DIR}/api-${version.date}.json`

const SITE_TITLE = 'Communal Platform API'
const SITE_DESCRIPTION =
  'Documentation and API reference for organizations building on Communal.'

/**
 * Phosphor icon name to Lucide icon name. The tree below keeps the Phosphor
 * names the Scalar config used, so it diffs against the old DOCS_GROUP; Zudoku
 * ships Lucide, so every name is translated on the way out. Where Lucide has no
 * close equivalent the entry takes the nearest neutral icon.
 */
const PHOSPHOR_TO_LUCIDE = {
  'phosphor/regular/rocket-launch': 'rocket',
  'phosphor/regular/plug': 'plug',
  'phosphor/regular/info': 'info',
  'phosphor/regular/house': 'house',
  'phosphor/regular/flag': 'flag',
  'phosphor/regular/key': 'key',
  'phosphor/regular/code': 'code',
  'phosphor/regular/git-branch': 'git-branch',
  'phosphor/regular/robot': 'bot',
  'phosphor/regular/squares-four': 'layout-grid',
  'phosphor/regular/user': 'user',
  'phosphor/regular/book-open-text': 'book-open-text',
  'phosphor/regular/user-gear': 'user-cog',
  'phosphor/regular/identification-card': 'id-card',
  'phosphor/regular/list-magnifying-glass': 'text-search',
  'phosphor/regular/plus-circle': 'circle-plus',
  'phosphor/regular/envelope': 'mail',
  'phosphor/regular/folders': 'folders',
  'phosphor/regular/magnifying-glass': 'search',
  'phosphor/regular/users-three': 'users',
  'phosphor/regular/clipboard-text': 'clipboard-list',
  'phosphor/regular/pulse': 'activity',
  'phosphor/regular/clock-counter-clockwise': 'history',
}

/**
 * The navigation. `slug` is the full canonical URL path, so no artifact has to
 * reassemble one; the empty slug is the site root. A category's `indexDoc`
 * becomes Zudoku's `category.link`, which is what gives the category itself a
 * page. `previousSlug` is the path a page used to be served at, which 301s to
 * `slug` and is also what the version-prefixed legacy redirects are built from,
 * so a moved page never produces a redirect chain.
 */
export const NAVIGATION = [
  {
    kind: 'category',
    slug: 'basics',
    label: 'Basics',
    icon: 'phosphor/regular/info',
    indexDoc: { kind: 'doc', slug: '', previousSlug: 'basics', file: 'docs/overview.md', label: 'Overview' },
    children: [
      { kind: 'doc', slug: 'basics/getting-started', file: 'docs/getting-started.md', label: 'Getting started', icon: 'phosphor/regular/flag' },
      { kind: 'doc', slug: 'basics/authentication', file: 'docs/authentication.md', label: 'Authentication', icon: 'phosphor/regular/key' },
      { kind: 'doc', slug: 'basics/using-the-api', file: 'docs/using-the-api.md', label: 'Using the API', icon: 'phosphor/regular/code' },
      { kind: 'doc', slug: 'basics/versioning', file: 'docs/versioning.md', label: 'Versioning', icon: 'phosphor/regular/git-branch' },
      { kind: 'doc', slug: 'basics/mcp-server', file: 'docs/mcp-server.md', label: 'MCP server', icon: 'phosphor/regular/robot' },
    ],
  },
  {
    kind: 'category',
    slug: 'platform',
    label: 'Platform guides',
    icon: 'phosphor/regular/squares-four',
    children: [
      {
        kind: 'category',
        slug: 'platform/users',
        label: 'Users',
        icon: 'phosphor/regular/user',
        children: [
          { kind: 'doc', slug: 'platform/users/users-overview', file: 'docs/guides/users-overview.md', label: 'Users', icon: 'phosphor/regular/book-open-text' },
          { kind: 'doc', slug: 'platform/users/update-user-profiles', file: 'docs/guides/update-user-profiles.md', label: 'Update user profiles', icon: 'phosphor/regular/user-gear' },
        ],
      },
      {
        kind: 'category',
        slug: 'platform/membership',
        label: 'Membership',
        icon: 'phosphor/regular/identification-card',
        children: [
          { kind: 'doc', slug: 'platform/membership/membership-overview', file: 'docs/guides/membership-overview.md', label: 'Membership', icon: 'phosphor/regular/book-open-text' },
          { kind: 'doc', slug: 'platform/membership/browse-membership-types', file: 'docs/guides/browse-membership-types.md', label: 'Browse membership types', icon: 'phosphor/regular/list-magnifying-glass' },
          { kind: 'doc', slug: 'platform/membership/create-and-archive-membership-types', file: 'docs/guides/create-and-archive-membership-types.md', label: 'Create and archive membership types', icon: 'phosphor/regular/plus-circle' },
          { kind: 'doc', slug: 'platform/membership/send-membership-cards', file: 'docs/guides/send-membership-cards.md', label: 'Send membership cards', icon: 'phosphor/regular/envelope' },
        ],
      },
      {
        kind: 'category',
        slug: 'platform/programs',
        label: 'Programs',
        icon: 'phosphor/regular/folders',
        children: [
          { kind: 'doc', slug: 'platform/programs/programs-overview', file: 'docs/guides/programs-overview.md', label: 'Programs & registration', icon: 'phosphor/regular/book-open-text' },
          { kind: 'doc', slug: 'platform/programs/fetch-program-information', file: 'docs/guides/fetch-program-information.md', label: 'Fetch program information', icon: 'phosphor/regular/magnifying-glass' },
          { kind: 'doc', slug: 'platform/programs/browse-registration-opportunities', file: 'docs/guides/browse-registration-opportunities.md', label: 'Browse registration opportunities', icon: 'phosphor/regular/list-magnifying-glass' },
          { kind: 'doc', slug: 'platform/programs/retrieve-program-signups', file: 'docs/guides/retrieve-program-signups.md', label: 'Retrieve program signups', icon: 'phosphor/regular/users-three' },
          { kind: 'doc', slug: 'platform/programs/view-attendance', file: 'docs/guides/view-attendance.md', label: 'View attendance', icon: 'phosphor/regular/clipboard-text' },
        ],
      },
      {
        kind: 'category',
        slug: 'platform/activities',
        label: 'Activities',
        icon: 'phosphor/regular/pulse',
        children: [
          { kind: 'doc', slug: 'platform/activities/activities-overview', file: 'docs/guides/activities-overview.md', label: 'Activities', icon: 'phosphor/regular/book-open-text' },
          { kind: 'doc', slug: 'platform/activities/track-card-deliveries', file: 'docs/guides/track-card-deliveries.md', label: 'Track card deliveries', icon: 'phosphor/regular/clipboard-text' },
        ],
      },
      { kind: 'doc', slug: 'platform/changelog', file: 'docs/changelog.md', label: 'Changelog', icon: 'phosphor/regular/clock-counter-clockwise' },
    ],
  },
]

/** Reference deep links Zudoku cannot reproduce one-to-one, degraded to their tag page. */
const REFERENCE_REDIRECTS = [
  ['/reference/description/introduction', '/reference'],
  ['/reference/tag/:tag', '/reference/:tag'],
  ['/reference/tag/:tag/*', '/reference/:tag'],
]

const lucideIcon = (phosphor) => {
  const icon = PHOSPHOR_TO_LUCIDE[phosphor]
  if (!icon) throw new Error(`generate-config: no Lucide icon mapped for '${phosphor}'`)
  return icon
}

const navigationItem = (node) => {
  if (node.kind === 'doc') {
    return { type: 'doc', file: node.file, path: node.slug, label: node.label, icon: lucideIcon(node.icon) }
  }
  return {
    type: 'category',
    label: node.label,
    icon: lucideIcon(node.icon),
    ...(node.indexDoc
      ? { link: { type: 'doc', file: node.indexDoc.file, path: node.indexDoc.slug, label: node.indexDoc.label } }
      : {}),
    items: node.children.map(navigationItem),
  }
}

/** Zudoku's `navigation` array. */
export const toNavigation = (tree) => tree.map(navigationItem)

/** Every guide the tree publishes, in navigation order. A category contributes its indexDoc. */
export function toDocs(tree) {
  const docs = []
  const visit = (node) => {
    if (node.kind === 'doc') {
      docs.push(node)
      return
    }
    if (node.indexDoc) docs.push(node.indexDoc)
    node.children.forEach(visit)
  }
  tree.forEach(visit)
  return docs
}

/**
 * Every guide URL that is not canonical, 301ing to the one that is. Scalar
 * published each guide under every non-default version prefix as well as at its
 * own path, and a page that has since moved leaves its old path behind. Both
 * kinds target the canonical slug directly, never another redirect.
 */
export function toGuideRedirects(tree) {
  const prefixes = VERSIONS.filter((v) => v.id !== 'default').map((v) => v.date)
  return toDocs(tree).flatMap((doc) => {
    const published = doc.previousSlug ?? doc.slug
    return [
      ...(doc.previousSlug ? [[`/${doc.previousSlug}`, `/${doc.slug}`]] : []),
      ...prefixes.map((prefix) => [`/${prefix}/${published}`, `/${doc.slug}`]),
    ]
  })
}

export function toRedirectsFile(tree) {
  const rules = [
    ...REFERENCE_REDIRECTS.map(([from, to]) => [from, to]),
    ...toGuideRedirects(tree),
  ]
  const fromWidth = Math.max(...rules.map(([from]) => from.length))
  const toWidth = Math.max(...rules.map(([, to]) => to.length))
  const lines = rules.map(([from, to]) => `${from.padEnd(fromWidth)}  ${to.padEnd(toWidth)}  301`)
  return `${lines.join('\n')}\n`
}

export function toZudokuConfig(tree) {
  return {
    site: {
      title: SITE_TITLE,
      logo: {
        src: { light: '/logo-light.svg', dark: '/logo-dark.svg' },
        alt: SITE_TITLE,
        href: '/',
      },
    },
    metadata: {
      title: `%s | ${SITE_TITLE}`,
      defaultTitle: SITE_TITLE,
      description: SITE_DESCRIPTION,
      favicon: '/logo-icon.svg',
    },
    docs: { files: ['/{docs,docs/guides}/*.md'] },
    search: { type: 'pagefind' },
    header: {
      navigation: [
        { label: 'Get Started', to: '/basics', icon: lucideIcon('phosphor/regular/rocket-launch') },
        { label: 'API Reference', to: '/reference', icon: lucideIcon('phosphor/regular/plug') },
      ],
    },
    navigation: toNavigation(tree),
    apis: {
      type: 'file',
      input: VERSIONS.map((version) => ({
        path: version.date,
        label: version.date,
        input: stagedSpecPath(version),
      })),
      path: '/reference',
      options: { showVersionSelect: 'always', disablePlayground: true },
    },
  }
}

function toConfigFile(tree) {
  return [
    '// Generated by generate-config.mjs from the NAVIGATION tree. Do not edit.',
    'import type { ZudokuConfig } from "zudoku";',
    '',
    `const config: ZudokuConfig = ${JSON.stringify(toZudokuConfig(tree), null, 2)};`,
    '',
    'export default config;',
    '',
  ].join('\n')
}

if (import.meta.main) {
  mkdirSync(SPEC_STAGE_DIR, { recursive: true })
  for (const version of VERSIONS) copyFileSync(specPath(version), stagedSpecPath(version))

  writeFileSync('zudoku.config.ts', toConfigFile(NAVIGATION), 'utf8')
  writeFileSync('public/_redirects', toRedirectsFile(NAVIGATION), 'utf8')
  const docs = toDocs(NAVIGATION).length
  const redirects = toGuideRedirects(NAVIGATION).length + REFERENCE_REDIRECTS.length
  console.log(
    `generate-config: wrote zudoku.config.ts (${docs} guides, ${VERSIONS.length} API versions) and public/_redirects (${redirects} rules)`,
  )
}
