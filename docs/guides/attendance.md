# Attendance

**Attendance sheets** belong to a **registration opportunity** and a **date**. **Attendance records** tie a sheet to a **program signup** and record presence (and optional notes). See [Core concepts](../core-concepts.md).

## Typical flows

- **Find or create context** — Resolve the registration opportunity and date, then list sheets for that scope or fetch a specific sheet.
- **Take attendance** — List or show **attendance records** filtered by sheet; include `programSignup` (and related) when you need member details in one response.

## Endpoints (API Reference → **Attendance Sheet** and **Attendance Record** tags)

### Attendance sheets

| Operation | Method and path | Summary |
|-----------|-----------------|---------|
| List attendance sheets | `GET /attendance_sheets` | Filter by `filter[registration_opportunity_id]`; optional `include`. |
| Get an attendance sheet | `GET /attendance_sheets/{attendance_sheet}` | Single sheet; optional `include` (for example `records`). |

### Attendance records

| Operation | Method and path | Summary |
|-----------|-----------------|---------|
| List attendance records | `GET /attendance_records` | Filter by `filter[attendance_sheet_id]`; optional `include`. |
| Get an attendance record | `GET /attendance_records/{attendance_record}` | Single record with optional related resources. |

## Query highlights

- **Attendance records** support `include=attendanceSheet,programSignup` on list/show where documented.
- **Attendance sheets** support `include` for nested `records` and the registration opportunity per the reference.
