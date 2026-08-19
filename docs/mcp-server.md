# MCP server

Communal exposes a [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server for your organization. Connect it to an AI assistant — Claude Code, Claude, Cursor, VS Code — and the assistant can work with your Communal data on your behalf: programs and registration, signups, membership, attendance, and users.

## Server details

| | |
|---|---|
| **URL** | `https://<your-subdomain>.getcommunal.com/mcp` |
| **Transport** | Streamable HTTP |
| **Authentication** | OAuth — you sign in to Communal in a browser; no API key required |

### Finding your server URL

`<your-subdomain>` is your organization's own Communal address — the part before `.getcommunal.com` in the URL you use to sign in. It is not a literal value to copy; every organization has its own.

To find it, sign in to Communal and look at your browser's address bar. Take the address you sign in at and add `/mcp` to the end.

For an organization that signs in at `https://example.getcommunal.com`, the MCP server URL is `https://example.getcommunal.com/mcp`. Your own subdomain goes where `example` is — it is a stand-in, not a working address.

If you are not sure which address to use, ask your Communal administrator.

This is the one place Communal uses your organization's subdomain. The REST API stays at `https://api.getcommunal.com/api` for every organization, where your API key alone determines which organization you reach — see [Authentication](./authentication.md).

## Add the server

Setup is the same everywhere: register your server URL from [above](#finding-your-server-url), then complete the browser sign-in your client prompts for. Replace `<your-subdomain>` in each example with your organization's own — the URLs below will not work as written. There is no key or secret to configure, so these config files are safe to commit.

### Claude Code

```bash
claude mcp add --transport http communal https://<your-subdomain>.getcommunal.com/mcp
```

Run `/mcp` and choose the server to start the sign-in. Add `--scope project` to share it with your team through a committed `.mcp.json` — each person authenticates as themselves. The equivalent JSON:

```json
{
  "mcpServers": {
    "communal": {
      "type": "http",
      "url": "https://<your-subdomain>.getcommunal.com/mcp"
    }
  }
}
```

### Claude (desktop and web)

Open **Settings → Connectors → Add custom connector**, paste the server URL, and complete the sign-in when prompted.

### Cursor

Create `~/.cursor/mcp.json` for every project, or `.cursor/mcp.json` for one:

```json
{
  "mcpServers": {
    "communal": {
      "url": "https://<your-subdomain>.getcommunal.com/mcp"
    }
  }
}
```

Cursor shows the server as needing authentication until you complete the sign-in from its MCP settings.

### VS Code

Create `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "communal": {
      "type": "http",
      "url": "https://<your-subdomain>.getcommunal.com/mcp"
    }
  }
}
```

### Other clients

Any client supporting remote MCP servers over streamable HTTP with OAuth works. Register the URL and, if the client asks for a transport, choose HTTP — there is no command to run and nothing to install. Clients that cannot perform an OAuth browser flow cannot connect.

## Authentication

The server uses OAuth. The first time your client connects, it opens Communal in a browser, you sign in, and you approve access for that client. The client stores the resulting token and refreshes it as needed; you re-authenticate only when access expires or is revoked.

What this means in practice:

- **You act as yourself.** The assistant reaches exactly what your Communal user can reach, and no more. Permissions follow your role.
- **No secrets in config.** Nothing above contains a credential, so `.mcp.json`, `.cursor/mcp.json`, and `.vscode/mcp.json` can all be committed without leaking anything.
- **Each teammate signs in separately.** A shared config gives everyone the server, not each other's access.

API keys are not used for MCP. They remain the way to authenticate direct HTTP calls to the REST API — see [Authentication](./authentication.md).

## What the assistant can do

Once connected, your client lists the tools the server offers — `/mcp` in Claude Code, or the MCP panel in Cursor and VS Code. Check that list to see what is available to you, since it reflects your permissions.

Assume the assistant can **change data**, not just read it — creating and archiving records, or sending membership cards, for example. Review tool calls before approving them, or use a client mode that prompts for each one. What an assistant can do is bounded by your own Communal role, so if you want a narrower blast radius, sign in as a user with narrower access.

## Things to ask for

- "List our parent programs and summarize the ones with open registration."
- "How many people signed up for program 101, and how many attended?"
- "Which membership types are currently active, and how are they ordered?"
- "Show me the attendance records for last week's sessions."

## Troubleshooting

| Symptom | Cause |
|---------|-------|
| The client reports the server needs authentication | The OAuth flow has not been completed, or the token expired. Re-run the sign-in from your client's MCP settings (`/mcp` in Claude Code). |
| `404`, or the client cannot reach the server | The subdomain is wrong. An address that is not a Communal organization returns `404` rather than an authentication prompt, so check it against the one you sign in at — see [Finding your server URL](#finding-your-server-url). |
| An action is refused | Your Communal role does not permit it. Roles are managed in Communal, not in the MCP client. |
| The server connects but exposes no tools | The client registered it as a stdio/command server. Re-add it as a remote HTTP server. |
