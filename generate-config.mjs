import { writeFileSync } from 'fs'
import { VERSIONS, specPath } from './versions.mjs'

// Generates scalar.config.json from a single shared navigation template plus the
// VERSIONS list. Every version reuses the same guides and tabs; only the
// /reference OpenAPI document differs per version. Edit nav here, not in the
// generated JSON.

const INFO = {
  title: 'Communal Platform API',
  description: 'Documentation and API reference for organizations building on Communal.',
}

const SITE_CONFIG = {
  subdomain: 'communal',
  favicon: './public/logo-icon.svg',
  logo: {
    darkMode: './public/logo-dark.svg',
    lightMode: './public/logo-light.svg',
  },
}

const TABS = [
  { title: 'Get Started', path: '/', icon: 'phosphor/regular/rocket-launch' },
  { title: 'API Reference', path: '/reference', icon: 'phosphor/regular/plug' },
]

// Shared documentation tree (identical across versions).
const DOCS_GROUP = {
  type: 'group',
  title: 'Documentation',
  mode: 'flat',
  icon: 'phosphor/regular/book-open',
  children: {
    basics: {
      type: 'group',
      title: 'Basics',
      mode: 'flat',
      icon: 'phosphor/regular/info',
      children: {
        '': { type: 'page', title: 'Overview', filepath: 'docs/overview.md', icon: 'phosphor/regular/house' },
        'getting-started': { type: 'page', title: 'Getting started', filepath: 'docs/getting-started.md', icon: 'phosphor/regular/flag' },
        authentication: { type: 'page', title: 'Authentication', filepath: 'docs/authentication.md', icon: 'phosphor/regular/key' },
        'using-the-api': { type: 'page', title: 'Using the API', filepath: 'docs/using-the-api.md', icon: 'phosphor/regular/code' },
        versioning: { type: 'page', title: 'Versioning', filepath: 'docs/versioning.md', icon: 'phosphor/regular/git-branch' },
      },
    },
    platform: {
      type: 'group',
      title: 'Platform guides',
      mode: 'flat',
      icon: 'phosphor/regular/squares-four',
      children: {
        users: {
          type: 'group',
          title: 'Users',
          mode: 'flat',
          icon: 'phosphor/regular/user',
          children: {
            'users-overview': { type: 'page', title: 'Users', filepath: 'docs/guides/users-overview.md', icon: 'phosphor/regular/book-open-text' },
            'update-user-profiles': { type: 'page', title: 'Update user profiles', filepath: 'docs/guides/update-user-profiles.md', icon: 'phosphor/regular/user-gear' },
          },
        },
        membership: {
          type: 'group',
          title: 'Membership',
          mode: 'flat',
          icon: 'phosphor/regular/identification-card',
          children: {
            'membership-overview': { type: 'page', title: 'Membership', filepath: 'docs/guides/membership-overview.md', icon: 'phosphor/regular/book-open-text' },
            'browse-membership-types': { type: 'page', title: 'Browse membership types', filepath: 'docs/guides/browse-membership-types.md', icon: 'phosphor/regular/list-magnifying-glass' },
            'create-and-archive-membership-types': { type: 'page', title: 'Create and archive membership types', filepath: 'docs/guides/create-and-archive-membership-types.md', icon: 'phosphor/regular/plus-circle' },
            'send-membership-cards': { type: 'page', title: 'Send membership cards', filepath: 'docs/guides/send-membership-cards.md', icon: 'phosphor/regular/envelope' },
          },
        },
        programs: {
          type: 'group',
          title: 'Programs',
          mode: 'flat',
          icon: 'phosphor/regular/folders',
          children: {
            'programs-overview': { type: 'page', title: 'Programs & registration', filepath: 'docs/guides/programs-overview.md', icon: 'phosphor/regular/book-open-text' },
            'fetch-program-information': { type: 'page', title: 'Fetch program information', filepath: 'docs/guides/fetch-program-information.md', icon: 'phosphor/regular/magnifying-glass' },
            'browse-registration-opportunities': { type: 'page', title: 'Browse registration opportunities', filepath: 'docs/guides/browse-registration-opportunities.md', icon: 'phosphor/regular/list-magnifying-glass' },
            'retrieve-program-signups': { type: 'page', title: 'Retrieve program signups', filepath: 'docs/guides/retrieve-program-signups.md', icon: 'phosphor/regular/users-three' },
            'view-attendance': { type: 'page', title: 'View attendance', filepath: 'docs/guides/view-attendance.md', icon: 'phosphor/regular/clipboard-text' },
          },
        },
        activities: {
          type: 'group',
          title: 'Activities',
          mode: 'flat',
          icon: 'phosphor/regular/pulse',
          children: {
            'activities-overview': { type: 'page', title: 'Activities', filepath: 'docs/guides/activities-overview.md', icon: 'phosphor/regular/book-open-text' },
            'track-card-deliveries': { type: 'page', title: 'Track card deliveries', filepath: 'docs/guides/track-card-deliveries.md', icon: 'phosphor/regular/clipboard-text' },
          },
        },
        changelog: { type: 'page', title: 'Changelog', filepath: 'docs/changelog.md', icon: 'phosphor/regular/clock-counter-clockwise' },
      },
    },
  },
}

/** API Reference route for a given version (the only per-version difference). */
function referenceRoute(version) {
  return {
    type: 'openapi',
    title: 'Communal Platform API',
    filepath: specPath(version),
    mode: 'nested',
    icon: 'phosphor/regular/brackets-curly',
  }
}

const versions = {}
for (const version of VERSIONS) {
  versions[version.id] = {
    title: version.date,
    tabs: TABS,
    routes: {
      '/': DOCS_GROUP,
      '/reference': referenceRoute(version),
    },
  }
}

const config = {
  $schema: 'https://registry.scalar.com/@scalar/schemas/config',
  scalar: '2.0.0',
  info: INFO,
  siteConfig: SITE_CONFIG,
  versions,
}

writeFileSync('scalar.config.json', JSON.stringify(config, null, 2) + '\n', 'utf8')
console.log(`generate-config: wrote scalar.config.json with ${VERSIONS.length} version(s): ${VERSIONS.map((v) => v.date).join(', ')}`)
