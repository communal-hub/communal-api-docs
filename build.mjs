import { createMarkdownFromOpenApi } from '@scalar/openapi-to-markdown'
import { writeFileSync } from 'fs'

const SPEC_URL = 'http://communal-api.s3.ca-central-1.amazonaws.com/docs/api.json'

const res = await fetch(SPEC_URL)
const spec = await res.text()
const markdown = await createMarkdownFromOpenApi(spec)

writeFileSync('public/llms.txt', markdown)
console.log('Generated public/llms.txt')
