# Browse registration opportunities

Registration opportunities are the specific sessions, classes, or events that people sign up for within a program. Each has its own schedule, pricing, capacity, and registration window. This guide shows you how to list registration opportunities, filter by program or availability, and load pricing and signup details.

## Before you begin

- [Authentication](../authentication.md) — you need a valid API key.
- [Fetch program information](./fetch-program-information.md) — find the program ID you want to browse sessions for.

## 1. List registration opportunities for a program

To show what sessions are available under a specific program, filter by `parent_program_id`. This is the most common starting point — a user has selected a program and wants to see what they can register for.

```bash
curl -X GET "https://api.getcommunal.com/api/programs?filter[parent_program_id]=42" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

The response includes a paginated list of registration opportunities with scheduling, capacity, and pricing details for each session.

```json
{
  "data": [
    {
      "id": 101,
      "name": "Session A — Morning",
      "parent_program_id": 42,
      "status": "Active",
      "event_start_date": "2025-06-15T00:00:00.000000Z",
      "event_end_date": "2025-06-20T00:00:00.000000Z",
      "readable_event_start_date": "June 15, 2025",
      "readable_event_start_time": "9:00 AM",
      "class_limit": 25,
      "spots_remaining": 8,
      "free": false
    }
  ],
  "meta": { "current_page": 1, "last_page": 1, "per_page": 30, "total": 4 }
}
```

## 2. Filter by availability and status

You can narrow results to only sessions that are currently accepting registration, upcoming, or past. Combine filters to match your UI needs.

To show only sessions a user can still register for:

```bash
curl -X GET "https://api.getcommunal.com/api/programs?filter[parent_program_id]=42&filter[can_register]=true" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

Available filters include `status` (active, upcoming, past, ongoing, archived — comma-separated), `can_register` (currently open for registration), `upcoming` (registration opens in the future), `past` (event has ended), `with_participants` (has signups), and `query` (searches by name). Sort with `sort=event_start_date` or prefix with `-` for descending.

## 3. Get a single registration opportunity

Fetch full details for a specific session when building a detail or checkout page. The show endpoint returns additional computed fields like capacity status and user-specific pricing.

```bash
curl -X GET "https://api.getcommunal.com/api/programs/101" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

The response includes fields like `is_full`, `spots_remaining`, `waitlist_enabled`, and registration window dates — everything you need to decide whether to show a "Register" or "Join waitlist" button.

## 4. Include pricing and related data

Use the `include` parameter to load pricing tiers, the parent program, signups, or attendance sheets in a single request. This avoids extra round trips when building detail views.

```bash
curl -X GET "https://api.getcommunal.com/api/programs/101?include=prices,parentProgram&append=signup_count" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

The `prices` include returns an array of pricing tiers. Add `prices.membership` to see which tiers are membership-specific. The `append=signup_count` parameter adds the current signup count as a computed field.

> **Note:** The show endpoint supports deeper includes than the list endpoint. Includes like `prices.membership`, `prices.plan`, `prices.schedule_config`, and `metadata` are only available when fetching a single registration opportunity.

## What's next

- [Retrieve program signups](./retrieve-program-signups.md) — list and filter signups for a session
- [View attendance](./view-attendance.md) — load attendance sheets and records for sessions
- See the **Registration Opportunity** endpoints in the API Reference for the complete list of fields, filters, and includes
