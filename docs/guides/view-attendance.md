# View attendance

Attendance in Communal is tracked through two resources: **attendance sheets** (one per session per date) and **attendance records** (one per participant per sheet). This guide shows you how to list attendance sheets for a session, load records for a specific date, and retrieve individual attendance entries with participant details.

## Before you begin

- [Authentication](../authentication.md) — you need a valid API key.
- [Programs & registration](./programs-overview.md) — understand how attendance sheets and records fit into the registration domain.

## 1. List attendance sheets for a session

Start by fetching the attendance sheets for a registration opportunity. Each sheet represents a single date, so a multi-day session will have one sheet per meeting date.

```bash
curl -X GET "https://api.getcommunal.com/api/attendance_sheets?filter[registration_opportunity_id]=101" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

The response includes a paginated list of sheets, each identified by its date and linked to the registration opportunity.

```json
{
  "data": [
    {
      "id": 10,
      "registration_opportunity_id": 101,
      "date": "2025-06-15",
      "created_at": "2025-06-15T10:30:00.000000Z",
      "updated_at": "2025-06-15T10:30:00.000000Z"
    },
    {
      "id": 11,
      "registration_opportunity_id": 101,
      "date": "2025-06-16",
      "created_at": "2025-06-16T09:00:00.000000Z",
      "updated_at": "2025-06-16T09:00:00.000000Z"
    }
  ],
  "meta": { "current_page": 1, "last_page": 1, "per_page": 30, "total": 2 }
}
```

## 2. Filter sheets by date

When you need the attendance sheet for a specific day — for example to show today's roster — add the `filter[date]` parameter.

```bash
curl -X GET "https://api.getcommunal.com/api/attendance_sheets?filter[registration_opportunity_id]=101&filter[date]=2025-06-15" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

This returns at most one sheet matching that session and date. Use this to resolve the correct sheet ID before loading its attendance records.

## 3. Load a sheet with its attendance records

To get a complete attendance view for a single date, fetch the sheet by ID with `include=records`. Each record carries a status and optional notes for one participant.

```bash
curl -X GET "https://api.getcommunal.com/api/attendance_sheets/10?include=records" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

```json
{
  "data": {
    "id": 10,
    "registration_opportunity_id": 101,
    "date": "2025-06-15",
    "records": [
      {
        "id": 501,
        "attendance_sheet_id": 10,
        "program_signup_id": 156,
        "status": "present",
        "notes": null
      },
      {
        "id": 502,
        "attendance_sheet_id": 10,
        "program_signup_id": 157,
        "status": "absent",
        "notes": "Left early due to illness"
      }
    ]
  }
}
```

Attendance statuses are: `present`, `absent`, `late`, `excused`, `excluded`, and `unmarked` (the default when a record is first created).

## 4. List attendance records with participant details

When building a roster view that shows participant names alongside their attendance status, query the records endpoint directly and include the program signup.

```bash
curl -X GET "https://api.getcommunal.com/api/attendance_records?filter[attendance_sheet_id]=10&include=programSignup" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

The `programSignup` include returns the signup record with participant contact details like `associated_name` and `associated_email`, so you can display a complete attendance list without additional requests.

To load the full context for a single attendance record — including both the sheet and the signup — use the show endpoint with both includes:

```bash
curl -X GET "https://api.getcommunal.com/api/attendance_records/501?include=attendanceSheet,programSignup" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

## What's next

- [Retrieve program signups](./retrieve-program-signups.md) — list and filter the signups that attendance records link to
- [Browse registration opportunities](./browse-registration-opportunities.md) — find the session IDs to query attendance for
- See the **Attendance Sheet** and **Attendance Record** endpoints in the API Reference for the complete list of fields and includes
