import { writeFileSync } from 'fs'

const SPEC_URL = 'http://communal-api.s3.ca-central-1.amazonaws.com/docs/api.json'

const res = await fetch(SPEC_URL)
const spec = await res.json()

// Helper to generate markdown for a single endpoint
function endpointToMarkdown(path, method, op) {
  const lines = []
  lines.push(`# ${method.toUpperCase()} ${path}`)
  lines.push('')
  if (op.summary) lines.push(op.summary)
  if (op.description && op.description !== op.summary) lines.push(op.description)
  lines.push('')

  // Servers
  if (spec.servers?.length) {
    lines.push('## Base URLs')
    lines.push('')
    for (const server of spec.servers) {
      lines.push(`- ${server.description || 'Server'}: \`${server.url}\``)
    }
    lines.push('')
  }

  // Parameters
  if (op.parameters?.length) {
    lines.push('## Parameters')
    lines.push('')
    for (const param of op.parameters) {
      const required = param.required ? ' **(required)**' : ''
      const desc = param.description ? ` - ${param.description}` : ''
      lines.push(`- \`${param.name}\` (${param.in})${required}${desc}`)
    }
    lines.push('')
  }

  // Request body
  if (op.requestBody) {
    lines.push('## Request Body')
    lines.push('')
    const content = op.requestBody.content
    if (content) {
      for (const [mediaType, schema] of Object.entries(content)) {
        lines.push(`Content-Type: \`${mediaType}\``)
        lines.push('')
        if (schema.schema?.properties) {
          for (const [prop, details] of Object.entries(schema.schema.properties)) {
            if (!prop) continue
            const type = details.type || ''
            const desc = details.description ? ` - ${details.description}` : ''
            lines.push(`- \`${prop}\` (${type})${desc}`)
          }
          lines.push('')
        }
      }
    }
  }

  // Responses
  if (op.responses) {
    lines.push('## Responses')
    lines.push('')
    for (const [code, response] of Object.entries(op.responses)) {
      lines.push(`- \`${code}\`: ${response.description || ''}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// Build full llms.txt and per-endpoint map
const fullLines = []
const endpoints = {}

fullLines.push(`# ${spec.info.title}`)
fullLines.push('')
fullLines.push(spec.info.description || '')
fullLines.push('')
fullLines.push(`Version: ${spec.info.version}`)
fullLines.push('')

if (spec.servers?.length) {
  fullLines.push('## Servers')
  fullLines.push('')
  for (const server of spec.servers) {
    fullLines.push(`- **${server.description || 'Server'}**: ${server.url}`)
  }
  fullLines.push('')
}

if (spec.components?.securitySchemes) {
  fullLines.push('## Authentication')
  fullLines.push('')
  for (const [name, scheme] of Object.entries(spec.components.securitySchemes)) {
    fullLines.push(`- **${name}**: ${scheme.type}${scheme.scheme ? ` (${scheme.scheme})` : ''}`)
  }
  fullLines.push('')
}

const tagGroups = {}
for (const [path, methods] of Object.entries(spec.paths || {})) {
  for (const [method, op] of Object.entries(methods)) {
    if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
      const tag = op.tags?.[0] || 'Other'
      if (!tagGroups[tag]) tagGroups[tag] = []
      tagGroups[tag].push({ path, method, op })
    }
  }
}

fullLines.push('## Endpoints')
fullLines.push('')

for (const [tag, eps] of Object.entries(tagGroups)) {
  fullLines.push(`### ${tag}`)
  fullLines.push('')

  for (const { path, method, op } of eps) {
    fullLines.push(`#### ${method.toUpperCase()} ${path}`)
    fullLines.push('')
    if (op.summary) fullLines.push(op.summary)
    if (op.description && op.description !== op.summary) fullLines.push(op.description)
    fullLines.push('')

    if (op.parameters?.length) {
      fullLines.push('**Parameters:**')
      fullLines.push('')
      for (const param of op.parameters) {
        const required = param.required ? ' (required)' : ''
        const desc = param.description ? ` - ${param.description}` : ''
        fullLines.push(`- \`${param.name}\` (${param.in})${required}${desc}`)
      }
      fullLines.push('')
    }

    if (op.requestBody) {
      fullLines.push('**Request Body:**')
      fullLines.push('')
      const content = op.requestBody.content
      if (content) {
        for (const [mediaType, schema] of Object.entries(content)) {
          fullLines.push(`Content-Type: \`${mediaType}\``)
          fullLines.push('')
          if (schema.schema?.properties) {
            for (const [prop, details] of Object.entries(schema.schema.properties)) {
              if (!prop) continue
              const type = details.type || ''
              const desc = details.description ? ` - ${details.description}` : ''
              fullLines.push(`- \`${prop}\` (${type})${desc}`)
            }
            fullLines.push('')
          }
        }
      }
    }

    if (op.responses) {
      fullLines.push('**Responses:**')
      fullLines.push('')
      for (const [code, response] of Object.entries(op.responses)) {
        fullLines.push(`- \`${code}\`: ${response.description || ''}`)
      }
      fullLines.push('')
    }

    // Per-endpoint markdown keyed by "METHOD /path"
    const key = `${method.toUpperCase()} ${path}`
    endpoints[key] = endpointToMarkdown(path, method, op)
  }
}

writeFileSync('public/llms.txt', fullLines.join('\n'))
writeFileSync('public/llms-endpoints.json', JSON.stringify(endpoints))
console.log(`Generated public/llms.txt and public/llms-endpoints.json (${Object.keys(endpoints).length} endpoints)`)
