# MCP server

The Communal Platform API is available as a [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server. Connect it to an AI coding assistant or chat client — Claude Code, Claude, Cursor, VS Code — and the assistant can search this API's operations and make real requests on your behalf.

## Server details

| | |
|---|---|
| **Name** | Communal Platform API |
| **URL** | `https://mcp.scalar.com/mcp/1e999a58-2315-4da2-8ede-03506313f73a` |
| **Transport** | Streamable HTTP |
| **Hosted by** | [Scalar](https://scalar.com/), generated from this documentation's OpenAPI document |
| **API version served** | `2026-03-25` (see [Choosing an API version](#choosing-an-api-version)) |
| **Target API** | `https://api.getcommunal.com/api` |

## What the assistant can do

The server exposes three tools:

| Tool | Purpose |
|------|---------|
| `summarize-openapi-specs` | Top-level summary of the API: title, version, servers, and every available path. |
| `search-openapi-operations` | Search operations by plain-language question and return the matching parameters and schemas. |
| `execute-request` | Send a real HTTP request to `https://api.getcommunal.com/api`. |

`execute-request` only accepts a server URL that the OpenAPI document declares, so the assistant cannot point it at another host. It **can** issue writes (`POST`, `PATCH`, `DELETE`) — archiving a membership type or sending membership cards, for example — so review tool calls before approving them, or use a client mode that prompts for each one.

## Add the server

Register the server URL with your client and include your Communal API key as an `Authorization` header. The server forwards that header to the Communal API on each request — see [Authentication](#authentication) below.

### Claude Code

```bash
claude mcp add --transport http communal-platform-api \
  https://mcp.scalar.com/mcp/1e999a58-2315-4da2-8ede-03506313f73a \
  --header "Authorization: Bearer YOUR_API_KEY"
```

Verify the connection with `/mcp`.

The command writes JSON config you can also author by hand. To share the server with your team, add `--scope project` (or create `.mcp.json` yourself) and reference an environment variable so the committed file holds no secret and each developer supplies their own key:

```json
{
  "mcpServers": {
    "communal-platform-api": {
      "type": "http",
      "url": "https://mcp.scalar.com/mcp/1e999a58-2315-4da2-8ede-03506313f73a",
      "headers": {
        "Authorization": "Bearer ${COMMUNAL_API_KEY}"
      }
    }
  }
}
```

### Claude Desktop

Claude Desktop's **Settings → Connectors** UI takes a URL but has no field for custom headers. To send your key, run the server through the [`mcp-remote`](https://github.com/geelen/mcp-remote) proxy in `claude_desktop_config.json` instead:

```json
{
  "mcpServers": {
    "communal-platform-api": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://mcp.scalar.com/mcp/1e999a58-2315-4da2-8ede-03506313f73a",
        "--header",
        "Authorization:${AUTH_HEADER}"
      ],
      "env": {
        "AUTH_HEADER": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

The key goes in `env`, and `--header` uses `Authorization:${AUTH_HEADER}` with **no space after the colon**. This is deliberate: Claude Desktop on Windows and some Cursor versions mangle spaces inside `args`, so the space lives in the environment variable value instead.

### Claude (web)

claude.ai has no local process to proxy through, so add the server under **Settings → Connectors → Add custom connector** and supply your key in conversation — see [Clients that can't send custom headers](#clients-that-cant-send-custom-headers).

### Cursor

Create `~/.cursor/mcp.json` for every project, or `.cursor/mcp.json` for one:

```json
{
  "mcpServers": {
    "communal-platform-api": {
      "url": "https://mcp.scalar.com/mcp/1e999a58-2315-4da2-8ede-03506313f73a",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

A project-level `.cursor/mcp.json` is committed to source control, so put your key in the global `~/.cursor/mcp.json` instead, or leave a placeholder for each developer to fill in.

### VS Code

Create `.vscode/mcp.json` in your workspace. Use an `input` so the key is prompted for and stored by VS Code rather than written into the file:

```json
{
  "inputs": [
    {
      "id": "communal-api-key",
      "type": "promptString",
      "description": "Communal API key",
      "password": true
    }
  ],
  "servers": {
    "communal-platform-api": {
      "type": "http",
      "url": "https://mcp.scalar.com/mcp/1e999a58-2315-4da2-8ede-03506313f73a",
      "headers": {
        "Authorization": "Bearer ${input:communal-api-key}"
      }
    }
  }
}
```

### Other clients

Any client that supports remote MCP servers over streamable HTTP works — register the URL and, if the client asks for a transport, choose HTTP (not stdio; there is no command to run and nothing to install). Set the same `Authorization` header wherever the client allows custom headers.

## Authentication

The Communal API authenticates with a bearer token, exactly as it does for a direct HTTP call — see [Authentication](./authentication.md) for how to issue and rotate a key.

The MCP server uses **passthrough authentication**: it does not store a credential. Whatever `Authorization` header your client sends is forwarded to `https://api.getcommunal.com/api` for that request and nothing else. Practically, that means:

- **Each person uses their own key.** A key inherits the permissions of the Communal user it belongs to, so an assistant can only reach what that person can reach.
- **Scalar never holds your key.** It is relayed per request, not saved on the server.
- **Connecting without a key still works** — the assistant can read the API description and search operations. Only `execute-request` calls fail, with `401`.

Keep the key out of committed files. Every example above either uses a global config outside the repository or a prompted input; an `.mcp.json` or `.cursor/mcp.json` that ships a live key leaks it to everyone with repository access.

### Clients that can't send custom headers

A few clients — claude.ai chief among them — let you add a remote MCP server by URL but offer no place for custom headers and no local proxy to work around it. In that case, give the key to the assistant in conversation instead:

> Use the Communal Platform API MCP server. Send `Authorization: Bearer sk_live_…` on every request.

The assistant then attaches the header to each `execute-request` call. This works, but the key lives in the conversation transcript — use a dedicated key and [rotate it](./authentication.md#rotating-an-api-key) afterwards.

A request with no key, or a bad one, comes back as:

```json
{ "message": "Unauthenticated." }
```

## Choosing an API version

The server describes the current version, `2026-03-25`. To have the assistant target the older supported version, ask it to send the `X-Api-Version` header on requests:

> Send `X-Api-Version: 2026-02-01` on every Communal request.

Ask the assistant rather than setting the header in your MCP client config: passthrough relays only the credential header, so any other header you configure on the connection stops at the MCP server and never reaches the API.

Responses echo `X-Api-Version` and `X-Api-Version-Source` so you can confirm which version handled the call. See [Versioning](./versioning.md) for the full rules, including deprecation and sunset behavior.

## Things to ask for

Once the server is connected and authenticated:

- "List our parent programs and summarize the ones with open registration."
- "Which endpoints return attendance data, and what filters do they accept?"
- "Fetch program signups for program 42 with the user and program included."
- "Show me the schema for a membership type before I create one."

## Troubleshooting

| Symptom | Cause |
|---------|-------|
| Every request returns `401 Unauthenticated` | No `Authorization: Bearer YOUR_API_KEY` header reached the API. Check that your client sends it, or that it supports custom headers at all — see [Authentication](#authentication). |
| `403 Forbidden` on a specific action | The key is valid, but its user lacks permission for that action in Communal. |
| `400 Unsupported API version.` | An `X-Api-Version` value outside `2026-02-01` and `2026-03-25`. The response lists supported versions. |
| The server connects but exposes no tools | The client registered it as a stdio/command server. Re-add it as a remote HTTP server. |
| `422` with an `errors` object | Request validation failed. See [Errors](./using-the-api.md#errors) for the shape. |
