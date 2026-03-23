# Registration opportunities

In the API, **registration opportunities** are the resources under `/programs`. Each represents a registerable instance (often a dated session) tied to a **parent program**. The OpenAPI tag is **Registration Opportunity**.

## Typical flows

- **Public or internal catalog** — List upcoming opportunities with filters such as status, parent program, or text search.
- **Detail page** — Load one opportunity with `include` for prices, signups, parent program, attendance sheets, or metadata as your UI needs.

## Endpoints (API Reference → **Registration Opportunity** tag)

| Operation | Method and path | Summary |
|-----------|-----------------|---------|
| List registration opportunities | `GET /programs` | Paginated `data` / `meta` / `links` list with rich filtering. |
| Get a registration opportunity | `GET /programs/{program}` | Single resource with optional `include` and `append`. |

## Query highlights

Filters (see reference for full list) include:

- `filter[parent_program_id]`, `filter[status]`, `filter[query]`, `filter[upcoming]`, `filter[past]`, `filter[can_register]`, `filter[with_participants]`, and archive/deleted filters.

**`include`** options documented on the operations include relationships such as `signups`, `parentProgram`, `waitlistSignups`, `attendanceSheets`, `prices` (with nested includes), and `metadata`.

**`append`** can add computed fields such as `signup_count` or `audience` where listed.

**`sort`** supports fields such as `id`, registration and event dates, and `created_at` (prefix with `-` for descending).
