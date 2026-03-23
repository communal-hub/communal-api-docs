# Activities (card deliveries)

The **Activity** endpoints expose operational logs. The current API surface focuses on **digital membership card delivery** attempts.

## Typical flows

- **Support and auditing** — Filter deliveries by member, date range, status, or request hash to trace a specific API-driven send.
- **Monitoring** — Poll or export failed deliveries using `filter[status]=failed`.

## Endpoints (API Reference → **Activity** tag)

| Operation | Method and path | Summary |
|-----------|-----------------|---------|
| List card delivery activities | `GET /activities/card-deliveries` | Array of activity records with query filters. |

## Query highlights

Documented filters include:

- `filter[member_id]`
- `filter[request_hash]`
- `filter[date_from]` / `filter[date_to]` (ISO 8601 date or datetime)
- `filter[status]` — `success` or `failed`

The response is documented as a JSON **array** (not the same envelope as some other list endpoints). See [Using the API](../using-the-api.md).
