import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { DEFAULT_VERSION, specPath } from './versions.mjs'
import { isHiddenOperation } from './normalize-openapi.mjs'

// The MCP tool pages. community-management publishes the public tool manifest
// (`php artisan docs:export-to-s3` -> docs/mcp-tools.json), fetch-spec snapshots
// it into MCP_MANIFEST_PATH, and generate-config renders two pages from it:
//
//   MCP_TOOLS_PAGE      for the people who use an assistant day to day, most of
//                       whom are not developers: each tool's plain-language
//                       `summary`, grouped by area, with example requests.
//   MCP_REFERENCE_PAGE  for developers: descriptions, parameters and the REST
//                       operations behind each tool.
//
// Both pages are generated. Tool wording (summary, title, description,
// parameters) is edited on the tool in community-management; the area intros
// and example requests below are the only copy that lives here.

export const MCP_MANIFEST_PATH = 'docs/mcp/tools.json'
export const MCP_TOOLS_PAGE = 'docs/mcp-tools.md'
export const MCP_REFERENCE_PAGE = 'docs/mcp-tool-reference.md'

/**
 * One section per manifest `domain`, in page order. `intro` and `examples` are
 * written for people who are not developers. An unknown domain throws, so a
 * new area cannot publish without its copy.
 */
const DOMAINS = {
  programs: {
    label: 'Programs and registration',
    intro: 'Programs are what your organization offers, such as “Youth Basketball”. Each program has sessions people sign up for, such as “Spring, Tuesdays 6pm”.',
    examples: [
      'Which programs have registration open right now?',
      'How many people signed up for the Tuesday session of Youth Basketball?',
      'Copy last fall’s Youth Basketball program for the spring.',
    ],
  },
  attendance: {
    label: 'Attendance',
    intro: 'Each date a session runs has an attendance sheet, where people are marked present, absent, late or excused.',
    examples: [
      'Mark Sam and Lena present at Thursday’s Competitive Team session.',
      'Who missed last week’s Learn to Swim sessions?',
    ],
  },
  people: {
    label: 'People',
    intro: 'The people in your organization, their profiles, and the extra profile questions you ask, such as “Jersey size”.',
    examples: [
      'Update Jordan Lee’s phone number to 555-0142.',
      'Add Priya Shah, priya@example.com, with jersey size M.',
    ],
  },
  memberships: {
    label: 'Membership',
    intro: 'The memberships you offer, who holds them, and their digital membership cards.',
    examples: [
      'Which memberships expire this month?',
      'Give Alex Chen the Adult Annual membership.',
      'Send Maria Lopez her membership card.',
    ],
  },
  payments: {
    label: 'Payments',
    intro: 'Payments, refunds and other money movements, for reporting.',
    examples: ['How much did we refund last month?'],
  },
  bookings: {
    label: 'Bookings',
    intro: 'Bookings of your facilities, and booking requests that need approval.',
    examples: ['Which booking requests are waiting for approval?'],
  },
  facilities: {
    label: 'Facilities',
    intro: 'The spaces and equipment people can book, such as rooms, courts and fields.',
    examples: ['Which of our facilities can members book online?', 'Change the gym’s capacity to 40.'],
  },
  assistant: {
    label: 'Finding records',
    intro: 'Your assistant uses this behind the scenes when a name could match more than one record.',
    examples: [],
  },
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
  const groups = new Map(Object.keys(DOMAINS).map((domain) => [domain, []]))
  for (const tool of tools) {
    if (!groups.has(tool.domain)) {
      throw new Error(`mcp-tools: no section for domain '${tool.domain}' (tool ${tool.name}); add it to DOMAINS`)
    }
    groups.get(tool.domain).push(tool)
  }
  return [...groups].filter(([, members]) => members.length > 0)
}

/** Plain-language type of a tool, for people who are not developers. */
const friendlyKind = (tool) => {
  if (tool.annotations?.readOnlyHint) return 'Looks things up'
  if (tool.kind === 'task') return 'Makes changes · previews first'
  if (tool.annotations?.destructiveHint === false) return 'Doesn’t change records'
  return 'Makes changes'
}

export function toToolsPage(manifest) {
  const groups = groupByDomain(manifest.tools)
  const lines = [
    '# What AI assistants can do',
    '',
    'Once you [connect Communal to an AI assistant](./mcp-server.md) such as Claude, you can ask it, in your own words, to look things up and make changes in Communal for you. You don’t need to learn anything on this page first: the assistant works out what to do from what you ask.',
    '',
    'This page lists everything an assistant can do. When an assistant asks for your approval, it shows the name of the action it wants to take, such as `update_program`. Look that name up here to see what it does.',
    '',
    '## Good to know',
    '',
    '- **It works as you.** The assistant can only see and change what your own Communal role allows. If you can’t do something in Communal, the assistant can’t either.',
    '- **Looking things up never changes anything.** You can ask as many questions as you like.',
    '- **Changes are real.** They update your organization’s records straight away, and some send emails. Read what the assistant plans to do before you approve it.',
    '- **Many changes show you a preview first.** For actions marked “previews first”, the assistant checks the change and shows you exactly what will happen. Nothing is saved until you say yes.',
    '',
  ]

  for (const [domain, members] of groups) {
    const section = DOMAINS[domain]
    lines.push(`## ${section.label}`, '', section.intro, '')
    if (section.examples.length > 0) {
      lines.push('Try asking:', '', ...section.examples.map((example) => `- “${example}”`), '')
    }
    lines.push('| What it does | Type | Action name |', '| --- | --- | --- |')
    for (const tool of members) {
      lines.push(`| ${escapeProse(tool.summary || tool.title)} | ${friendlyKind(tool)} | \`${tool.name}\` |`)
    }
    lines.push('')
  }

  lines.push(
    '## For developers',
    '',
    'The [MCP tool reference](./mcp-tool-reference.md) lists every action’s parameters and the REST API operation it uses.',
    '',
  )

  return `${lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()}\n`
}

export function toReferencePage(manifest, spec) {
  const links = referenceLinks(spec)
  const groups = groupByDomain(manifest.tools)
  const lines = [
    '# MCP tool reference',
    '',
    `The [MCP server](./mcp-server.md) offers ${manifest.tools.length} tools. Your MCP client lists them once you connect, and this page describes each one for developers. [What AI assistants can do](./mcp-tools.md) covers the same tools in plain language. A tool only works if the connected user's Communal role allows the action.`,
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
    ...groups.map(([domain, members]) => `- [${DOMAINS[domain].label}](#${slugify(DOMAINS[domain].label)}): ${members.map((tool) => `\`${tool.name}\``).join(', ')}`),
    '',
  ]

  for (const [domain, members] of groups) {
    lines.push(`## ${DOMAINS[domain].label}`, '')
    for (const tool of members) lines.push(...toolSection(tool, links))
  }

  return `${lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()}\n`
}

/** Plain-text section appended to llms.txt. */
export function toLlmsSection(manifest, spec) {
  const links = referenceLinks(spec)
  const lines = ['## MCP tools', '', `MCP server tools (${manifest.tools.length}). Each acts as the connected user inside their organization.`, '']
  for (const tool of manifest.tools) {
    lines.push(`### ${tool.name}`, '', `${tool.title}. ${tool.summary ? `${tool.summary} ` : ''}${tool.description}`, '')
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

export function writeToolsPages() {
  const manifest = loadManifest()
  const spec = JSON.parse(readFileSync(specPath(DEFAULT_VERSION), 'utf8'))
  writeFileSync(MCP_TOOLS_PAGE, toToolsPage(manifest), 'utf8')
  writeFileSync(MCP_REFERENCE_PAGE, toReferencePage(manifest, spec), 'utf8')
  return manifest.tools.length
}
