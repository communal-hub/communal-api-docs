import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { DEFAULT_VERSION, specPath } from './versions.mjs'
import { isHiddenOperation } from './normalize-openapi.mjs'

// The MCP tool reference. community-management publishes the public tool
// manifest (`php artisan docs:export-to-s3` -> docs/mcp-tools.json), fetch-spec
// snapshots it into MCP_MANIFEST_PATH, and generate-config renders it into
// MCP_TOOLS_PAGE. The page is generated: edit the tool descriptions in
// community-management, never the Markdown.

export const MCP_MANIFEST_PATH = 'docs/mcp/tools.json'
export const MCP_TOOLS_PAGE = 'docs/mcp-tools.md'

/** Section heading per manifest `domain`, in page order. An unknown domain throws. */
const DOMAIN_LABELS = {
  programs: 'Programs and registration',
  attendance: 'Attendance',
  people: 'People',
  memberships: 'Membership',
  payments: 'Payments',
  bookings: 'Bookings',
  facilities: 'Facilities',
  volunteers: 'Volunteers',
  communications: 'Communications',
  donations: 'Donations',
  assistant: 'Lookup',
}

export function loadManifest(path = MCP_MANIFEST_PATH) {
  if (!existsSync(path)) throw new Error(`mcp-tools: ${path} does not exist; run npm run fetch-spec`)
  const manifest = JSON.parse(readFileSync(path, 'utf8'))
  if (!Array.isArray(manifest.tools) || manifest.tools.length === 0) {
    throw new Error(`mcp-tools: ${path} lists no tools`)
  }
  return manifest
}

/** Same slug rule Zudoku applies to reference tag names and operation summaries. */
const slugify = (str) =>
  str
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/['‘’“”]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')

/** Placeholder names differ between Laravel routes and the spec, so compare paths without them. */
const pathShape = (path) => path.replace(/\{[^}]+\}/g, '{}')

/**
 * "METHOD /shape" -> reference URL for the default API version's published
 * operations. Zudoku anchors an operation on its summary, or on its operationId
 * when it has none. Operations normalizeSpec hides are left out, so the tools
 * page never links to, or names, an endpoint the reference does not publish.
 */
export function referenceLinks(spec) {
  const links = new Map()
  for (const [path, methods] of Object.entries(spec.paths ?? {})) {
    for (const [method, op] of Object.entries(methods)) {
      const tag = op?.tags?.[0]
      const heading = op?.summary ?? op?.operationId
      if (!tag || !heading || isHiddenOperation(method, path, op)) continue
      links.set(`${method.toUpperCase()} ${pathShape(path)}`, `/reference/${slugify(tag)}#${slugify(heading)}`)
    }
  }
  return links
}

/**
 * Markdown and MDX both read the page, so prose from the manifest is escaped for
 * the stricter of the two: braces open MDX expressions and `<` opens JSX. Code
 * spans are literal in both and are left alone. Pipes are escaped everywhere
 * because the prose also lands in table cells.
 */
const escapeProse = (text) =>
  text
    .split(/(`[^`]*`)/)
    .map((part, index) => (index % 2 === 1 ? part : part.replace(/[{}<>]/g, (char) => `&#${char.charCodeAt(0)};`)))
    .join('')
    .replace(/\|/g, '\\|')
    .replace(/\n+/g, ' ')

const typeLabel = (property) => {
  if (Array.isArray(property.enum)) return property.enum.map((value) => `\`${value}\``).join(', ')
  const types = [property.type].flat().filter((type) => type && type !== 'null')
  if (types.includes('array')) {
    const itemType = property.items?.type
    return itemType ? `array of ${itemType}s` : 'array'
  }
  return types.join(' or ') || 'any'
}

/** Flatten an input schema into rows, nesting objects as `parent.child` and array items as `parent[].child`. */
function parameterRows(schema, prefix = '', parentRequired = true) {
  const required = new Set(schema.required ?? [])
  return Object.entries(schema.properties ?? {}).flatMap(([name, property]) => {
    const path = `${prefix}${name}`
    const isRequired = parentRequired && required.has(name)
    const row = { path, type: typeLabel(property), required: isRequired, description: property.description ?? '' }
    if (property.type === 'object' && property.properties) {
      return [row, ...parameterRows(property, `${path}.`, isRequired)]
    }
    if (property.type === 'array' && property.items?.properties) {
      return [row, ...parameterRows(property.items, `${path}[].`, isRequired)]
    }
    return [row]
  })
}

const behaviour = (tool) => {
  const { readOnlyHint, destructiveHint } = tool.annotations ?? {}
  if (readOnlyHint) return 'Read-only'
  if (tool.kind === 'task') return 'Changes data · previews first'
  return destructiveHint === false ? 'Changes data · safe to repeat' : 'Changes data'
}

const publishedEndpoints = (tool, links) =>
  tool.endpoints
    .map((endpoint) => ({ ...endpoint, href: links.get(`${endpoint.method} ${pathShape(endpoint.path)}`) }))
    .filter((endpoint) => endpoint.href)

function toolSection(tool, links) {
  const lines = [`### ${tool.name}`, '', `**${escapeProse(tool.title)}** · ${behaviour(tool)}`, '']
  lines.push(escapeProse(tool.description), '')

  const endpoints = publishedEndpoints(tool, links)
  if (endpoints.length > 0) {
    const label = tool.kind === 'task' ? 'Uses' : 'Mirrors'
    const items = endpoints.map(({ method, path, href }) => `[\`${method} ${path}\`](${href})`)
    lines.push(`${label}: ${items.join(', ')}`, '')
  }

  const rows = parameterRows(tool.inputSchema ?? {})
  if (rows.length === 0) {
    lines.push('No parameters.', '')
    return lines
  }
  lines.push('| Parameter | Type | Required | Description |', '| --- | --- | --- | --- |')
  for (const row of rows) {
    lines.push(`| \`${row.path}\` | ${row.type} | ${row.required ? 'Yes' : ''} | ${escapeProse(row.description)} |`)
  }
  lines.push('')
  return lines
}

function groupByDomain(tools) {
  const groups = new Map(Object.keys(DOMAIN_LABELS).map((domain) => [domain, []]))
  for (const tool of tools) {
    if (!groups.has(tool.domain)) {
      throw new Error(`mcp-tools: no section label for domain '${tool.domain}' (tool ${tool.name}); add it to DOMAIN_LABELS`)
    }
    groups.get(tool.domain).push(tool)
  }
  return [...groups].filter(([, members]) => members.length > 0)
}

export function toToolsPage(manifest, spec) {
  const links = referenceLinks(spec)
  const groups = groupByDomain(manifest.tools)
  const lines = [
    '# MCP tools',
    '',
    `The [MCP server](./mcp-server.md) offers ${manifest.tools.length} tools. Your MCP client lists them once you connect, and this page describes each one. A tool only works if your Communal role allows the action, so the list you see may be shorter than this page.`,
    '',
    'There are three kinds of tool:',
    '',
    '- **Endpoint tools** mirror one [REST API](/reference) operation and return the same JSON. List tools take `page: {number, size}`, plus the `filter`, `include` and `sort` options the API documents.',
    '- **Task tools** accept names instead of IDs and change only the fields you send. They run in two steps: called without `mode`, they show exactly what would change and save nothing. Called again with the same inputs and `mode: "apply"`, they save the change. Problems come back as a list of fields, messages and hints.',
    '- **`find_records`** finds a program, session, person, membership type or facility by name and returns its ID.',
    '',
    'Read-only tools are safe to call at any time. Tools that change data act on your organization\'s real records, so review each call before approving it.',
    '',
    '## Contents',
    '',
    ...groups.map(([domain, members]) => `- [${DOMAIN_LABELS[domain]}](#${slugify(DOMAIN_LABELS[domain])}): ${members.map((tool) => `\`${tool.name}\``).join(', ')}`),
    '',
  ]

  for (const [domain, members] of groups) {
    lines.push(`## ${DOMAIN_LABELS[domain]}`, '')
    for (const tool of members) lines.push(...toolSection(tool, links))
  }

  return `${lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()}\n`
}

/** Plain-text section appended to llms.txt. */
export function toLlmsSection(manifest, spec) {
  const links = referenceLinks(spec)
  const lines = ['## MCP tools', '', `MCP server tools (${manifest.tools.length}). Each acts as the connected user inside their organization.`, '']
  for (const tool of manifest.tools) {
    lines.push(`### ${tool.name}`, '', `${tool.title}. ${tool.description}`, '')
    const endpoints = publishedEndpoints(tool, links)
    if (endpoints.length > 0) {
      lines.push(`REST: ${endpoints.map((endpoint) => `${endpoint.method} ${endpoint.path}`).join(', ')}`, '')
    }
    for (const row of parameterRows(tool.inputSchema ?? {})) {
      lines.push(`- \`${row.path}\` (${row.type})${row.required ? ' (required)' : ''}${row.description ? ` - ${row.description}` : ''}`)
    }
    lines.push('')
  }
  return lines.join('\n')
}

export function writeToolsPage() {
  const manifest = loadManifest()
  const spec = JSON.parse(readFileSync(specPath(DEFAULT_VERSION), 'utf8'))
  writeFileSync(MCP_TOOLS_PAGE, toToolsPage(manifest, spec), 'utf8')
  return manifest.tools.length
}
