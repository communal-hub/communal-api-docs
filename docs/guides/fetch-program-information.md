# Fetch program information

Programs are the core offerings in Communal — camps, classes, events, and recurring activities that people can register for. This guide shows you how to list programs, retrieve a single program's details, and include related registration opportunities in a single request.

## Before you begin

- [Authentication](../authentication.md) — you need a valid API key.
- [Programs & registration](./programs-overview.md) — understand how programs, registration opportunities, and signups relate.

## 1. List available programs

Most integrations start by fetching a list of programs to display in a directory, admin dashboard, or member-facing UI. By default the list returns published programs and excludes hidden or draft entries.

```bash
curl -X GET "https://api.getcommunal.com/api/parent_programs" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

The response includes a paginated array of programs with capacity, scheduling, and location data. Each program has an `id` you use to fetch details or filter related resources.

```json
{
  "data": [
    {
      "id": 42,
      "title": "Summer Camp 2025",
      "status": "Active",
      "event_start_date": "2025-06-15T00:00:00.000000Z",
      "event_end_date": "2025-08-15T00:00:00.000000Z",
      "total_spots": 100,
      "available_spots": 37,
      "total_signups": 63,
      "location_name": "Riverside Recreation Center",
      "instructor": "Jane Smith"
    }
  ],
  "current_page": 1,
  "last_page": 3,
  "per_page": 30,
  "total": 85
}
```

## 2. Filter and sort results

You can narrow results by status, search query, date range, and more. Combine filters to match your exact needs.

To find only active programs with "camp" in the title, sorted alphabetically:

```bash
curl -X GET "https://api.getcommunal.com/api/parent_programs?filter[status]=active&filter[query]=camp&sort=alphabetical" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

Available filters include `status` (active, archived, draft — comma-separated), `query` (searches the title), `open` (currently accepting registration), `upcoming` (registration opens in the future), `ongoing`, and `between` (date range on registration dates). Sort options are `recommended` (default), `closest_starting_date`, `alphabetical`, and `created_at`.

> **Note:** Pagination defaults to 30 items per page. Use `page[size]` and `page[number]` to control page size and offset.

## 3. Get a single program

When you need full details for a specific program — for a detail page, configuration screen, or to check capacity — fetch it by ID.

```bash
curl -X GET "https://api.getcommunal.com/api/parent_programs/42" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

This returns the complete program record including scheduling, pricing, location, capacity breakdowns, and configuration flags. The response includes fields like `registration_fee`, `waitlist_enabled`, `registration_start_date`, and `registration_end_date` that are useful for building registration flows.

## 4. Include registration opportunities

Programs group one or more registration opportunities — the specific sessions people actually sign up for, each with its own schedule, pricing, and capacity. Instead of making a separate request, use the `include` parameter to load them inline.

```bash
curl -X GET "https://api.getcommunal.com/api/parent_programs/42?include=programs" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

The response now contains a `registration_opportunities` array nested inside the program. Each registration opportunity includes its own pricing, capacity, and date information. This also works on the list endpoint — add `?include=programs` to embed registration opportunities across all returned programs.

> **Important:** Including registration opportunities on the list endpoint increases response size. Only use it when you need session-level detail alongside the program list.

## What's next

- [Registration opportunities](./registration-opportunities.md) — work with individual sessions and their pricing
- [Retrieve program signups](./retrieve-program-signups.md) — list and filter signups for a session
- See the **Program** endpoints in the API Reference for the complete list of fields, filters, and includes
