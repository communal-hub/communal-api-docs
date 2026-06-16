# Authentication

Every request to the Communal Platform API must include a valid API key. The key identifies your integration and **scopes all access to your Communal organization**. The OpenAPI document does not define an extra tenant header or subdomain for production; keep the key secret and rotate it if it is exposed.

## Obtaining an API key

### Issue a key for yourself

Use this path if you do not have Manager-level access or access to the dashboard.

1. Sign in to Communal.
2. Click **My profile** on the left-hand navigation bar.
3. Go to **API keys**.
4. Create a key and copy it immediately. Store it in a secure location (environment variable, secret manager, or similar).

If you cannot find API keys or your role does not allow creating them, contact your Communal administrator or support.

### Issue a key as a Manager (for yourself or another user)

If you have Manager-level access, you can issue an API key for any user from the dashboard.

1. Sign in to Communal.
2. Go to **People → Users**.
3. Click the user you want to issue an API key for (this can be yourself or another user).
4. Click **API keys** in the navigation.
5. Click **Create API Key**, then copy the key immediately and store it in a secure location.

## Rotating an API key

Rotate a key when it may have been exposed, or on a regular schedule as a precaution.

1. Find the key under **My profile → API keys** (for your own key), or under a user's **API keys** in **People → Users** if you are an administrator rotating it on their behalf.
2. Click the three dots (**⋯**) on the API key.
3. Click **Rotate** from the dropdown.
4. Copy the new key immediately and update wherever the old key was stored. The previous key stops working once rotation completes.

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
