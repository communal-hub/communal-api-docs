# Authentication

Every request to the Communal Platform API must include a valid API key. The key identifies your integration and **scopes all access to your Communal organization**. The OpenAPI document does not define an extra tenant header or subdomain for production; keep the key secret and rotate it if it is exposed.

## Obtaining an API key

1. Sign in to Communal.
2. Open **My profile**.
3. Go to **API keys**.
4. Create a key and copy it immediately. Store it in a secure location (environment variable, secret manager, or similar).

If you cannot find API keys or your role does not allow creating them, contact your Communal administrator or support.

## Sending your API key

Use [HTTP Bearer authentication](https://datatracker.ietf.org/doc/html/rfc6750): send the raw key in the `Authorization` header.

```http
Authorization: Bearer YOUR_API_KEY
```

Example with `curl`:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.getcommunal.com/api/parent_programs
```

## Error responses

| Situation | Typical response |
|-----------|------------------|
| Missing or invalid key | **401 Unauthorized** — body includes a `message` field (see `AuthenticationException` in the API Reference components). |
| Valid key but action not allowed for the user or org | **403 Forbidden** — `message` only (`AuthorizationException`). |
| Request body or parameters fail validation | **422 Unprocessable Entity** — `message` plus `errors` object with field-level messages (`ValidationException`). |

Treat error payloads as JSON; field names and structures match the referenced response schemas in the OpenAPI **components**.

## Best practices

- Never commit API keys to source control or expose them in client-side code.
- Use different keys for staging and production when both are available.
- Revoke and replace a key if you suspect it has leaked.
