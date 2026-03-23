# Using the API

This page describes patterns that repeat across the Communal Platform API. Always confirm details for a specific path in the **API Reference**, including exact query parameter names and response schemas.

## Base URL and JSON

- Requests use **HTTPS** against your environment’s base URL (production: `https://api.getcommunal.com/api`).
- Unless noted otherwise, send and expect **JSON** with `Content-Type: application/json` where a body is required.
- Authenticate with **Bearer** tokens as described in [Authentication](./authentication.md).

## Pagination and list shapes

List responses are **not identical on every route**. Check the operation’s response schema in the reference.

Common patterns you will see:

1. **Laravel-style pagination** — Example: `GET /parent_programs` returns an object with a `data` array plus fields such as `current_page`, `last_page`, `per_page`, `total`, `from`, and `to`.
2. **`data` + `meta` + `links`** — Example: `GET /programs`, `GET /program_signups`, and some attendance listings use an object with `data`, `meta`, and `links` (similar to JSON:API-style envelopes).
3. **Bare array** — Example: `GET /activities/card-deliveries` is documented as a top-level JSON **array**.

If you build a generic client, branch on the documented schema per endpoint rather than assuming one pagination format everywhere.

## Filtering

Many list endpoints accept **query parameters** named `filter[...]` with bracket syntax. Examples from the spec:

- `filter[parent_program_id]` on registration opportunities.
- `filter[program_id]` and `filter[program[parent_program_id]]` on program signups.
- `filter[attendance_sheet_id]` on attendance records.
- `filter[date_from]` / `filter[date_to]` on card delivery activities.

Read the parameter description on each operation for allowed values, comma-separated lists, and special cases (for example empty string to exclude archived rows).

## Related data: `include` and `append`

Several GET operations support:

- **`include`** — comma-separated list of **relationships** to embed (for example `user,program` on program signups, or `signups,parentProgram` on registration opportunities). Allowed values are listed per operation in the reference.
- **`append`** — comma-separated **computed** attributes to add to resources (for example `signup_count`, `audience`) where documented.

Omit these parameters for minimal payloads; add them when you need to avoid N+1 follow-up requests.

## Sorting

Where sorting is supported, the spec documents a **`sort`** query parameter. Conventions include:

- Sortable field names listed on the operation (for example `id`, `created_at`, `event_start_date`).
- Prefix with **`-`** for descending order (example: `-event_start_date`).

## Errors

The OpenAPI **components → responses** define three reusable error shapes:

| HTTP status | Component | Typical meaning |
|-------------|-----------|-----------------|
| 401 | `AuthenticationException` | Missing or invalid API key. Body: `{ "message": "..." }`. |
| 403 | `AuthorizationException` | Authenticated but not allowed to perform the action. Body: `{ "message": "..." }`. |
| 422 | `ValidationException` | Validation failed. Body: `{ "message": "...", "errors": { "field": ["..."] } }`. |

Some endpoints also document **500** responses with operation-specific bodies (for example membership card send). Treat non-2xx responses as errors and log status, body, and correlation identifiers when the API provides them (such as `request_hash` on card send success and error paths where present).

## Idempotency and rate limits

The published OpenAPI does not describe idempotency keys or global rate limits. If your integration retries writes or bursts traffic, coordinate with Communal support for recommended limits and safe retry behavior.
