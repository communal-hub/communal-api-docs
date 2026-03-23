# Programs (parent programs)

**Parent programs** are the long-lived offerings in Communal (for example a recurring camp or class). They group related **registration opportunities** (sessions). See [Core concepts](../core-concepts.md) for how parent programs relate to `/programs`.

## Typical flows

- **Directory or admin UI** — List parent programs, optionally with nested registration opportunities using `include=programs`.
- **Drill-down** — Fetch a single parent program by ID; add `include=programs` when you need session-level detail in one call.

## Endpoints (API Reference → **Program** tag)

| Operation | Method and path | Summary |
|-----------|-----------------|---------|
| List programs | `GET /parent_programs` | Paginated list; registration opportunities excluded by default for performance. |
| Get a program | `GET /parent_programs/{parent_program}` | Full configuration; use `include=programs` for sessions and pricing-related includes documented on the operation. |

## Query highlights

- **`include=programs`** — Adds registration opportunities to parent program payloads when listing or showing.

Exact allowed `include` values and response fields are defined on each operation in the API Reference.
