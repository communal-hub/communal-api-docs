# Program signups

A **program signup** links a participant to a **registration opportunity**. Use these endpoints to power rosters, member portals, reporting, or downstream attendance workflows. See [Core concepts](../core-concepts.md).

## Typical flows

- **Roster for a session** — List signups with `filter[program_id]` (comma-separated IDs supported) and `include=user,program` (or broader includes for forms and payments where needed).
- **All signups under a parent offering** — Use `filter[program[parent_program_id]]`.
- **Member self-view** — Filter with `filter[user_id]`; non-managers are restricted to their own user id.
- **Single registration** — `GET /program_signups/{program_signup}` with the appropriate `include` set.

## Endpoints (API Reference → **Program Signup** tag)

| Operation | Method and path | Summary |
|-----------|-----------------|---------|
| List program signups | `GET /program_signups` | Filterable list with extensive `include` options. |
| Get a program signup | `GET /program_signups/{program_signup}` | Single signup with optional related data. |

## Query highlights

Notable filters include `filter[query]` (search across names and emails), time scopes (`filter[timeScope]`, `filter[upcoming]`, `filter[past]`, `filter[ongoing]`, `filter[event_start_date]`), `filter[status]` (ongoing / upcoming / past), and soft-delete behavior (`filter[withTrashed]`).

**`include`** supports many relationships — for example `user`, `program`, `program.parentProgram`, `guest`, `additionalMember`, `formSubmissions`, `attendanceRecords`, and subscription-related paths. Use the API Reference for the full comma-separated list per operation.
