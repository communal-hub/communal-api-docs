# Retrieve program signups

Program signups are the records that connect participants to registration opportunities. This guide shows you how to list signups for a session, filter by user or status, and include related data like user details, form submissions, and payment information.

## Before you begin

- [Authentication](../authentication.md) — you need a valid API key.
- [Programs & registration](./programs-overview.md) — understand how programs, registration opportunities, and signups relate.

## 1. List signups for a session

The most common starting point is fetching the roster for a specific registration opportunity. Filter by `program_id` to get all signups for that session. You can pass a single ID or comma-separated IDs to pull signups across multiple sessions at once.

```bash
curl -X GET "https://api.getcommunal.com/api/program_signups?filter[program_id]=101" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

The response includes a paginated list of signup records, each with participant contact details, payment information, and foreign keys you can use for further lookups.

```json
{
  "data": [
    {
      "id": 156,
      "program_id": 101,
      "user_id": 89,
      "guest_id": null,
      "additional_member_id": null,
      "associated_name": "John Doe",
      "associated_email": "john.doe@example.com",
      "participant_name": "Johnny Doe",
      "paid": 1,
      "amount_paid": 75,
      "payment_method": "Credit Card",
      "created_at": "2025-05-20T14:30:00.000000Z"
    }
  ],
  "meta": { "current_page": 1, "last_page": 1, "per_page": 30, "total": 12 }
}
```

To get signups across all sessions of a parent program, filter by the parent instead:

```bash
curl -X GET "https://api.getcommunal.com/api/program_signups?filter[program[parent_program_id]]=42" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

## 2. Filter by user, status, and search

You can narrow results to a specific participant, time window, or search term. Combine filters to match your exact needs.

To find all upcoming signups for a specific user:

```bash
curl -X GET "https://api.getcommunal.com/api/program_signups?filter[user_id]=89&filter[timeScope]=upcoming" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

Available filters include:

- **`filter[user_id]`** — signups for a specific user. Non-managers can only query their own user ID.
- **`filter[query]`** — searches across program names, user names, emails, guest names, and additional member names.
- **`filter[timeScope]`** — `upcoming` (includes ongoing and active), `past`, or `all`.
- **`filter[status]`** — comma-separated time-based statuses: `ongoing`, `upcoming`, `past`.
- **`filter[event_start_date]`** — date range filter using `filter[event_start_date][0]=2025-06-01&filter[event_start_date][1]=2025-08-31`.
- **`filter[withTrashed]`** — set to `true` to include cancelled (soft-deleted) signups.

> **Note:** The `filter[status]` and `filter[timeScope]` filters reflect the session's dates, not a signup-level status. A signup is "upcoming" when its session hasn't started yet.

## 3. Get a single signup

When you need full details for a specific registration — for a confirmation page, admin detail view, or to check payment status — fetch it by ID.

```bash
curl -X GET "https://api.getcommunal.com/api/program_signups/156" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

The response includes participant details, payment information, and timestamps. The `associated_name` and `associated_email` fields resolve automatically from whichever participant type is on the signup — a user, guest, or additional family member.

## 4. Include related data

Use the `include` parameter to load related resources in a single request. This is essential for building roster views, confirmation screens, or reporting exports.

```bash
curl -X GET "https://api.getcommunal.com/api/program_signups?filter[program_id]=101&include=user,program,formSubmissions" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

Available includes:

| Include | Description |
|---------|-------------|
| `user` | The registered user's profile |
| `user.family` | The user's family members |
| `user.family.emergency` | Emergency contacts for family members |
| `guest` | Guest details (for non-member signups) |
| `additionalMember` | Family member registered through this signup |
| `additionalMember.emergency` | Emergency contact for the additional member |
| `program` | The registration opportunity this signup belongs to |
| `program.parentProgram` | The parent program of the registration opportunity |
| `transaction` | Payment transaction details |
| `formSubmissions` | Custom form responses submitted during registration |
| `files` | Files uploaded as part of the signup |
| `attendanceRecords` | Attendance records across all dates for this signup |
| `subscriptionSchedule.config.configurable` | Recurring payment schedule configuration |
| `subscriptionSchedule.paymentsReceived` | Payments received on the subscription |

> **Important:** Non-manager API keys can only view signups belonging to the authenticated user. Manager keys can view all signups and use the full set of filters.

## What's next

- [View attendance](./view-attendance.md) — track who showed up for each session
- [Browse registration opportunities](./browse-registration-opportunities.md) — find sessions and check capacity before viewing signups
- See the **Program Signup** endpoints in the API Reference for the complete list of fields and response shapes
