import { writeFileSync } from 'fs'

const SPEC_URL = 'http://communal-api.s3.ca-central-1.amazonaws.com/docs/api.json'

const res = await fetch(SPEC_URL)
const spec = await res.json()

const lines = []

lines.push(`# ${spec.info.title}`)
lines.push('')
lines.push(spec.info.description || '')
lines.push('')
lines.push(`Version: ${spec.info.version}`)
lines.push('')

// Servers
if (spec.servers?.length) {
  lines.push('## Servers')
  lines.push('')
  for (const server of spec.servers) {
    lines.push(`- **${server.description || 'Server'}**: ${server.url}`)
  }
  lines.push('')
}

// Authentication
if (spec.components?.securitySchemes) {
  lines.push('## Authentication')
  lines.push('')
  for (const [name, scheme] of Object.entries(spec.components.securitySchemes)) {
    lines.push(`- **${name}**: ${scheme.type}${scheme.scheme ? ` (${scheme.scheme})` : ''}`)
  }
  lines.push('')
}

// Group endpoints by tag
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

lines.push('## Endpoints')
lines.push('')

for (const [tag, endpoints] of Object.entries(tagGroups)) {
  lines.push(`### ${tag}`)
  lines.push('')

  for (const { path, method, op } of endpoints) {
    lines.push(`#### ${method.toUpperCase()} ${path}`)
    lines.push('')
    if (op.summary) lines.push(op.summary)
    if (op.description && op.description !== op.summary) lines.push(op.description)
    lines.push('')

    // Parameters
    if (op.parameters?.length) {
      lines.push('**Parameters:**')
      lines.push('')
      for (const param of op.parameters) {
        const required = param.required ? ' (required)' : ''
        const desc = param.description ? ` - ${param.description}` : ''
        lines.push(`- \`${param.name}\` (${param.in})${required}${desc}`)
      }
      lines.push('')
    }

    // Request body
    if (op.requestBody) {
      lines.push('**Request Body:**')
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
      lines.push('**Responses:**')
      lines.push('')
      for (const [code, response] of Object.entries(op.responses)) {
        lines.push(`- \`${code}\`: ${response.description || ''}`)
      }
      lines.push('')
    }
  }
}

writeFileSync('public/llms.txt', lines.join('\n'))
console.log('Generated public/llms.txt')
