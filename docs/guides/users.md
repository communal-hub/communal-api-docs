# Users

The **User** endpoints let your integration update an existing user when permitted. This is not a full user directory API; it covers the update operation defined in the OpenAPI spec.

## Typical flows

- **Profile sync** — Push corrected name, contact, or related fields from another system into Communal for a known user id.
- **Workflow after card send** — Combine with [Send membership cards](./send-membership-cards.md) if you create or enrich users through card delivery.

## Endpoints (API Reference → **User** tag)

| Operation | Method and path | Summary |
|-----------|-----------------|---------|
| Update a user | `PUT /users/{user}` | Updates allowed fields per `UpdateUserRequest`. |

## Responses and errors

The operation documents **200** success, **401**, **403** (authorization), and **422** (validation). Check the **User** operation and `UpdateUserRequest` schema in the API Reference for writable fields and required properties.
