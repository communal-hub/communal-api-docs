# MCP tool reference

The [MCP server](./mcp-server.md) offers 55 tools. Your MCP client lists them once you connect, and this page describes each one for developers. [What AI assistants can do](./mcp-tools.md) covers the same tools in plain language. A tool only works if the connected user's Communal role allows the action.

There are three kinds of tool:

- **Endpoint tools** mirror one [REST API](/reference) operation and return the same JSON. List tools take `page: {number, size}`, plus the `filter`, `include` and `sort` options the API documents.
- **Task tools** accept names instead of IDs and change only the fields you send. They run in two steps: called without `mode`, they show exactly what would change and save nothing. Called again with the same inputs and `mode: "apply"`, they save the change. Problems come back as a list of fields, messages and hints.
- **`find_records`** finds a program, session, person, membership type or facility by name and returns its ID.

Read-only tools are safe to call at any time. Tools that change data act on your organization's real records, so review each call before approving it.

## Contents

- [Programs and registration](#programs-and-registration): `list_programs`, `get_program`, `create_program`, `list_registration_opportunities`, `get_registration_opportunity`, `create_registration_opportunity`, `list_program_signups`, `get_program_signup`, `export_program_signups`, `update_program`, `clone_program`, `add_session`, `update_session`
- [Attendance](#attendance): `list_attendance_sheets`, `get_attendance_sheet`, `list_attendance_records`, `get_attendance_record`, `mark_attendance_record`, `register_attendance`, `mark_attendance`
- [People](#people): `get_user`, `update_user`, `create_user`, `list_custom_profile_fields`, `create_custom_profile_field`, `update_custom_profile_field`, `list_custom_profile_field_values`, `create_custom_profile_field_value`, `update_custom_profile_field_value`, `update_member`, `add_member`
- [Membership](#membership): `list_membership_types`, `get_membership_type`, `archive_membership_type`, `unarchive_membership_type`, `list_user_memberships`, `create_user_membership`, `get_user_membership`, `send_membership_card`, `list_membership_card_deliveries`, `update_membership_type`, `create_membership_type`, `send_member_card`, `assign_membership`
- [Payments](#payments): `list_transactions`, `get_transaction`
- [Bookings](#bookings): `list_bookings`, `get_booking`, `list_booking_requests`, `get_booking_request`
- [Facilities](#facilities): `list_facilities`, `get_facility`, `create_facility`, `update_facility`
- [Finding records](#finding-records): `find_records`

## Programs and registration

### list_programs

**List programs** · Read-only

List the organization's programs (the top-level offerings members register for; each program has one or more registration opportunities / sessions beneath it). Returns a paginated list. Registration opportunities are excluded by default — pass include="programs" to embed them.

Mirrors: [`GET /parent_programs`](/reference/program#list-programs)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `include` | string |  | Include related resources (comma-separated). Options: programs. |
| `page` | object |  | Pagination. Results are returned as &#123;"data": [...]&#125; with flat pagination keys (current_page, per_page, total, last_page). |
| `page.number` | integer |  | Page number, starting at 1. |
| `page.size` | integer |  | Results per page (default 30). |

### get_program

**Get program** · Read-only

Get one program by id, including all of its configuration fields. Pass include="programs" to embed its registration opportunities (sessions) with pricing.

Mirrors: [`GET /parent_programs/{parent_program}`](/reference/program#get-a-program)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `parent_program` | integer | Yes | The program id. |
| `include` | string |  | Include related resources (comma-separated). Options: programs. |

### create_program

**Create program** · Changes data

Create a top-level program with optional details and registration settings. Defaults to draft. Requires a Program Manager or Super Admin role. Returns the created program. Does not create registration opportunities, schedules, or prices.

Mirrors: [`POST /parent_programs`](/reference/program#create-program)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `title` | string |  | Program name. Defaults to New Program when omitted. |
| `description` | string |  | Program description. |
| `ongoing` | boolean |  | Whether the program is ongoing. Clears event dates when true. |
| `event_start_date` | string |  | Event start date and time, including timezone offset. |
| `event_end_date` | string |  | Event end date and time, including timezone offset. |
| `profile_image` | string |  | Program image URL or public storage path. |
| `location_name` | string |  | Location name. |
| `location_address` | string |  | Location address. |
| `location_latitude` | number |  | Location latitude. |
| `location_longitude` | number |  | Location longitude. |
| `pay_by_cash` | boolean |  | Allow payment by cash. |
| `collection_additional_information` | boolean |  | Collect participant information. Defaults to true. |
| `require_emergency_contact_information` | boolean |  | Require emergency contact information. |
| `waitlist_enabled` | boolean |  | Enable the waitlist. |
| `prompt_for_registrant` | boolean |  | Prompt for registrant information. |
| `unsplash_author_name` | string |  | Unsplash image photographer name. |
| `unsplash_author_link` | string |  | Unsplash image photographer link. |
| `demographic` | string |  | Intended participant demographic. |
| `instructor` | string |  | Instructor display name. |
| `force_participant_selection` | boolean |  | Require participant selection. Disabled when participant information collection is false. |
| `display_only` | boolean |  | Display the program without registration. |
| `draft` | boolean |  | Whether the program is a draft. Defaults to true. |
| `registration_fee` | number |  | Registration fee in major currency units, for example 12.50. |
| `cap_registration_fee` | boolean |  | Cap the registration fee. |
| `is_event` | boolean |  | Treat the program as an event. |
| `multiple_signups` | boolean |  | Allow multiple signups. |
| `is_hidden` | boolean |  | Hide the program from public listings. |
| `show_participant_list` | boolean |  | Show the participant list. |
| `hide_participant_details` | boolean |  | Hide participant details. |
| `total_spots` | integer |  | Total program capacity. |
| `allow_file_uploads` | boolean |  | Allow registration file uploads. |
| `file_uploads_required` | boolean |  | Require registration file uploads. |
| `file_uploads_max` | integer |  | Maximum number of uploaded files. |
| `auto_archive` | boolean |  | Automatically archive the program. |
| `auto_archive_days` | integer |  | Days before automatic archival. |
| `participant_must_hold_membership` | boolean |  | Require participants to hold a membership. |
| `gl_code` | string |  | General ledger code. |

### list_registration_opportunities

**List registration opportunities** · Read-only

List registration opportunities (the individual sessions/occurrences of a program that members sign up for). Paginated; supports filtering, sorting and includes.

Mirrors: [`GET /programs`](/reference/registration-opportunity#list-registration-opportunities)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `filter` | object |  | Filters, all optional. |
| `filter.parent_program_id` | integer |  | Only opportunities under this program id. |
| `filter.status` | string |  | Comma-separated statuses. Options: active, upcoming, past, ongoing, archived. |
| `filter.query` | string |  | Search by name (partial match). |
| `filter.with_participants` | boolean |  | Only opportunities that have participants. |
| `filter.can_register` | boolean |  | Only opportunities the connected user can register for. |
| `filter.upcoming` | boolean |  | Only upcoming opportunities. |
| `filter.past` | boolean |  | Only past opportunities. |
| `filter.archived_at` | string |  | Filter by archived status; pass an empty string to exclude archived opportunities. |
| `filter.deleted_at` | string |  | Filter by deleted status; pass an empty string to exclude deleted opportunities. |
| `include` | string |  | Include related resources (comma-separated). Options: signups, parentProgram, waitlistSignups, attendanceSheets, occurrences. |
| `append` | string |  | Append computed attributes (comma-separated). Options: audience, signup_count. |
| `sort` | string |  | Sort field, prefix with - for descending. Options: id, registration_start_date, registration_end_date, event_start_date, event_end_date, created_at. |
| `page` | object |  | Pagination. Results are returned as &#123;"data": [...]&#125; with flat pagination keys (current_page, per_page, total, last_page). |
| `page.number` | integer |  | Page number, starting at 1. |
| `page.size` | integer |  | Results per page (default 30). |

### get_registration_opportunity

**Get registration opportunity** · Read-only

Get one registration opportunity (program session) by id.

Mirrors: [`GET /programs/{program}`](/reference/registration-opportunity#get-a-registration-opportunity)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `program` | integer | Yes | The registration opportunity id. |
| `include` | string |  | Include related resources (comma-separated). Options: metadata, prices, prices.membership, prices.plan, prices.schedule_config, signups, parentProgram, waitlistSignups, attendanceSheets, occurrences. |
| `append` | string |  | Append computed attributes (comma-separated). Options: signup_count. |

### create_registration_opportunity

**Create registration opportunity** · Changes data

Create a registration opportunity under an existing program. Requires a manager role or an instructor assigned to that program. Dates and times use the organization timezone. Returns the created registration opportunity.

Mirrors: [`POST /programs`](/reference/registration-opportunity#create-registration-opportunity)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `parent_program_id` | integer | Yes | The existing parent program id. |
| `name` | string | Yes | Registration opportunity name. |
| `description` | string |  | Registration opportunity description (plain text or simple HTML). |
| `class_limit` | integer |  | Maximum number of registrations. |
| `ongoing` | boolean |  | An ongoing opportunity has no scheduled event dates. |
| `event_start_date` | string |  | Event start date and time; omit when supplying occurrences. |
| `event_end_date` | string |  | Event end date and time; omit when supplying occurrences. |
| `registration_start_date` | string |  | Registration opening date and time. |
| `registration_end_date` | string |  | Registration closing date and time. |
| `registration_open_until_event_start` | boolean |  | Keep registration open until the event starts, ignoring registration_end_date. |
| `occurrences` | array of objects |  | Scheduled occurrences; omit for ongoing opportunities. |
| `occurrences[].starts_at` | string |  | Occurrence start date and time. |
| `occurrences[].ends_at` | string |  | Occurrence end date and time. |
| `prices` | array of objects |  | Prices by audience. Omit for a free opportunity open to everyone. |
| `prices[].price` | integer |  | Price in cents. |
| `prices[].free` | boolean |  | true when this audience registers at no charge. |
| `prices[].guest_price` | boolean |  | true for the price that applies to people without a qualifying membership. |
| `prices[].volunteer_price` | boolean |  | true for the price that applies to people signed up to volunteer for this program. |
| `prices[].membership_id` | string |  | Limit this price to holders of a membership type, by its product_id. |
| `prices[].plan_id` | string |  | Limit this price to holders of one membership plan, by the plan ID listed in the membership type's plans. |
| `prices[].maximum_number_of_purchases` | integer |  | Maximum registrations one person can buy at this price. |
| `prices[].recurring` | boolean |  | Split the price into scheduled payments instead of one payment at checkout. |
| `waitlist_enabled` | boolean |  | Let people join a waitlist when all spots are taken. |
| `display_to_all_users` | boolean |  | Legacy visibility flag; no longer affects what members see. |
| `hide_from_non_buyers` | boolean |  | Hide this opportunity from people who have no price that applies to them. |
| `exclude_from_reminder_emails` | boolean |  | Do not send reminder emails to registrants. |
| `dob_validation` | boolean |  | Require participants to be born between min_date_of_birth and max_date_of_birth. |
| `min_date_of_birth` | string |  | Oldest allowed participant date of birth, YYYY-MM-DD. |
| `max_date_of_birth` | string |  | Youngest allowed participant date of birth, YYYY-MM-DD. |
| `allow_file_uploads` | boolean |  | Collect files from registrants at signup. |
| `file_uploads_required` | boolean |  | Make the file upload mandatory at signup. |
| `file_uploads_max` | integer |  | Maximum number of files per signup. |

### list_program_signups

**List program signups** · Read-only

List program signups (registrations of members/guests to registration opportunities). Paginated. Non-managers only see their own signups.

Mirrors: [`GET /program_signups`](/reference/program-signup#list-program-signups)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `filter` | object |  | Filters, all optional. |
| `filter.program_id` | string |  | Registration opportunity id(s), comma-separated. |
| `filter.user_id` | integer |  | Only signups for this user id (non-managers may only use their own id). |
| `filter.query` | string |  | Search by opportunity name, user name/email, guest name/email or additional member name. |
| `filter.status` | string |  | Opportunity time status, comma-separated. Options: ongoing, upcoming, past. |
| `filter.signup_status` | string |  | Manager-only lifecycle filter. Options: active, cancelled, cancelled:member, cancelled:admin. Defaults to active. |
| `filter.timeScope` | `upcoming`, `past`, `all` |  | Simple time scope; upcoming includes ongoing. |
| `filter.upcoming` | boolean |  | Only signups for upcoming opportunities. |
| `filter.past` | boolean |  | Only signups for past opportunities. |
| `filter.ongoing` | boolean |  | Only signups for ongoing opportunities. |
| `filter.withTrashed` | boolean |  | Include soft-deleted signups. |
| `include` | string |  | Include related resources (comma-separated). Options: additionalMember, files, guest, program, program.parentProgram, transaction, user, user.family, formSubmissions. |
| `page` | object |  | Pagination. Results are returned as &#123;"data": [...]&#125; with flat pagination keys (current_page, per_page, total, last_page). |
| `page.number` | integer |  | Page number, starting at 1. |
| `page.size` | integer |  | Results per page (default 30). |

### get_program_signup

**Get program signup** · Read-only

Get one program signup by id.

Mirrors: [`GET /program_signups/{program_signup}`](/reference/program-signup#program-signups-show)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `program_signup` | integer | Yes | The program signup id. |
| `include` | string |  | Include related resources (comma-separated). Options: additionalMember, files, guest, program, program.parentProgram, transaction, user, user.family, formSubmissions. |

### export_program_signups

**Export program signups as CSV** · Changes data · safe to repeat

Export program signups to a CSV file. Accepts the same filters as list_program_signups. Small exports return a temporary download_url (valid ~10 minutes) plus record_count; larger exports are prepared in the background and emailed to the caller, in which case immediate is false and there is no download_url. Requires a manager role; instructors always receive their program-scoped export by email. Share the download_url with the user — do not try to fetch the CSV yourself.

Mirrors: [`GET /program_signups/export`](/reference/program-signup#program-signups-export)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `filter` | object |  | Filters, all optional — same semantics as list_program_signups. |
| `filter.program_id` | string |  | Registration opportunity id(s), comma-separated. |
| `filter.program.parent_program_id` | integer |  | Program id — exports signups across all of its registration opportunities. |
| `filter.signup_status` | string |  | Lifecycle filter. Options: active, cancelled, cancelled:member, cancelled:admin. Defaults to active. |
| `filter.timeScope` | `upcoming`, `past`, `all` |  | Simple time scope; upcoming includes ongoing. |
| `filter.withTrashed` | boolean |  | Include soft-deleted signups. |

### update_program

**Update a program** · Changes data · previews first

Change a program's details — title, description, dates, location, price, spots, tags, or whether it's published, hidden or has a waitlist. Only send what you want to change; everything else stays exactly as it is. Refer to the program by name or ID. Runs as a preview first; call again with mode "apply" to save.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `program` | string | Yes | The program to change: its name (e.g. "Youth Basketball") or ID. |
| `title` | string |  | New title. |
| `description` | string |  | New description (plain text or simple HTML). |
| `starts_on` | string |  | First day of the program, YYYY-MM-DD, in the organization’s timezone. |
| `ends_on` | string |  | Last day of the program, YYYY-MM-DD. |
| `ongoing` | boolean |  | true if the program runs with no fixed dates. Setting this clears the start and end dates. |
| `location_name` | string |  | Where it happens, e.g. "Main Gym". |
| `location_address` | string |  | Street address of the location. |
| `registration_fee` | string |  | One-time registration fee in dollars, e.g. "25.00". Use "0" for no fee. |
| `total_spots` | integer |  | Maximum people across all sessions. Send 0 to remove the limit. |
| `published` | boolean |  | true to publish the program so members can see it; false to move it back to draft. |
| `hidden` | boolean |  | true to hide the program from member-facing lists (still reachable by direct link). |
| `waitlist` | boolean |  | true to let people join a waitlist when the program is full. |
| `tags` | array of strings |  | The complete list of tags the program should have (replaces the current tags). |
| `mode` | `preview`, `apply` |  | "preview" (default) checks the change and shows exactly what would happen without saving anything. "apply" makes the change. |

### clone_program

**Copy a program** · Changes data · previews first

Make a copy of a program — for example to run last season's program again. The copy starts as a draft called "&#60;title&#62; (Copy)", keeps the waivers, facilities and tax settings, and by default copies every session and its prices too. Optionally move all dates forward one year. Refer to the program by name or ID. Runs as a preview first; call again with mode "apply" to create the copy, then use update_program to rename or publish it.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `program` | string | Yes | The program to copy: its name or ID. |
| `include_sessions` | boolean |  | Copy the program’s sessions and their prices too (default true). |
| `move_dates_forward_one_year` | boolean |  | Shift the program and session dates forward by exactly one year (default false). |
| `mode` | `preview`, `apply` |  | "preview" (default) checks the change and shows exactly what would happen without saving anything. "apply" makes the change. |

### add_session

**Add a session** · Changes data · previews first

Add a session (registration opportunity) to an existing program — for example "Spring 2027, Tuesdays 6–7pm, 12 spots, $40". Give a single date (starts_at/ends_at), a weekly schedule, or ongoing; spots; when sign-up opens and closes (or keep it open until the session starts, the default); and what non-members and specific membership types pay. Refer to the program by name or ID. Runs as a preview first; call again with mode "apply" to create it.

Uses: [`POST /programs`](/reference/registration-opportunity#create-registration-opportunity)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `program` | string | Yes | The program to add the session to: its name or ID. |
| `name` | string | Yes | Name of the new session, e.g. "Spring 2027 — Tuesdays". |
| `description` | string |  | Description (plain text or simple HTML). |
| `spots` | integer |  | How many people can sign up for this session. |
| `no_spot_limit` | boolean |  | true to remove this session’s own limit (the program’s overall limit, if any, still applies). |
| `ongoing` | boolean |  | true if the session runs with no fixed dates. Clears any dates. |
| `starts_at` | string |  | For a single date: when it starts, "YYYY-MM-DD HH:MM" in the organization’s timezone. |
| `ends_at` | string |  | For a single date: when it ends, "YYYY-MM-DD HH:MM". |
| `weekly` | object |  | A repeating weekly schedule. Replaces any existing dates. |
| `weekly.days` | array of strings |  | Days of the week, e.g. ["tuesday", "thursday"]. |
| `weekly.start_time` | string |  | Start time each day, "HH:MM" (24-hour). |
| `weekly.end_time` | string |  | End time each day, "HH:MM" (24-hour). |
| `weekly.first_date` | string |  | First date the schedule can start, "YYYY-MM-DD". |
| `weekly.last_date` | string |  | Last date, "YYYY-MM-DD". Give this or number_of_dates. |
| `weekly.number_of_dates` | integer |  | How many weeks’ worth of dates to generate. Give this or last_date. Skipped dates are taken out of this total. |
| `weekly.skip_dates` | array of strings |  | Dates to skip, "YYYY-MM-DD" (holidays etc.). |
| `registration_opens` | string |  | When sign-up opens, "YYYY-MM-DD HH:MM". |
| `registration_closes` | string |  | When sign-up closes, "YYYY-MM-DD HH:MM". |
| `registration_open_until_start` | boolean |  | true to keep sign-up open right up until the session starts, instead of fixed opening and closing dates. |
| `waitlist` | boolean |  | true to let people join a waitlist when the session is full. |
| `non_member_price` | string |  | What people without a membership pay, in dollars, e.g. "40.00". Use "0" for free, or "none" to stop non-members signing up. |
| `member_prices` | array of objects |  | Prices for specific membership types. Only the types listed change. |
| `member_prices[].membership_type` | string |  | Membership type name or ID. |
| `member_prices[].price` | string |  | Dollars, "0" for free, or "none" to stop this membership signing up. |
| `mode` | `preview`, `apply` |  | "preview" (default) checks the change and shows exactly what would happen without saving anything. "apply" makes the change. |

### update_session

**Update a session** · Changes data · previews first

Change one session (registration opportunity) of a program — its name, spots, dates or weekly schedule, sign-up window, waitlist, or prices for non-members and specific membership types. Only send what you want to change; prices, dates and everything else stay exactly as they are. Refer to the session by name or ID, and pass the program too when the session name is used by more than one program. Runs as a preview first; call again with mode "apply" to save.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `session` | string | Yes | The session to change: its name (e.g. "Spring 2027 — Tuesdays") or ID. |
| `program` | string |  | The program the session belongs to (name or ID), to tell apart sessions with the same name. |
| `name` | string |  | Name of the session, e.g. "Spring 2027 — Tuesdays". |
| `description` | string |  | Description (plain text or simple HTML). |
| `spots` | integer |  | How many people can sign up for this session. |
| `no_spot_limit` | boolean |  | true to remove this session’s own limit (the program’s overall limit, if any, still applies). |
| `ongoing` | boolean |  | true if the session runs with no fixed dates. Clears any dates. |
| `starts_at` | string |  | For a single date: when it starts, "YYYY-MM-DD HH:MM" in the organization’s timezone. |
| `ends_at` | string |  | For a single date: when it ends, "YYYY-MM-DD HH:MM". |
| `weekly` | object |  | A repeating weekly schedule. Replaces any existing dates. |
| `weekly.days` | array of strings |  | Days of the week, e.g. ["tuesday", "thursday"]. |
| `weekly.start_time` | string |  | Start time each day, "HH:MM" (24-hour). |
| `weekly.end_time` | string |  | End time each day, "HH:MM" (24-hour). |
| `weekly.first_date` | string |  | First date the schedule can start, "YYYY-MM-DD". |
| `weekly.last_date` | string |  | Last date, "YYYY-MM-DD". Give this or number_of_dates. |
| `weekly.number_of_dates` | integer |  | How many weeks’ worth of dates to generate. Give this or last_date. Skipped dates are taken out of this total. |
| `weekly.skip_dates` | array of strings |  | Dates to skip, "YYYY-MM-DD" (holidays etc.). |
| `registration_opens` | string |  | When sign-up opens, "YYYY-MM-DD HH:MM". |
| `registration_closes` | string |  | When sign-up closes, "YYYY-MM-DD HH:MM". |
| `registration_open_until_start` | boolean |  | true to keep sign-up open right up until the session starts, instead of fixed opening and closing dates. |
| `waitlist` | boolean |  | true to let people join a waitlist when the session is full. |
| `non_member_price` | string |  | What people without a membership pay, in dollars, e.g. "40.00". Use "0" for free, or "none" to stop non-members signing up. |
| `member_prices` | array of objects |  | Prices for specific membership types. Only the types listed change. |
| `member_prices[].membership_type` | string |  | Membership type name or ID. |
| `member_prices[].price` | string |  | Dollars, "0" for free, or "none" to stop this membership signing up. |
| `mode` | `preview`, `apply` |  | "preview" (default) checks the change and shows exactly what would happen without saving anything. "apply" makes the change. |

## Attendance

### list_attendance_sheets

**List attendance sheets** · Read-only

List attendance sheets (one per registration opportunity occurrence/date). Requires a manager role. Paginated.

Mirrors: [`GET /attendance_sheets`](/reference/attendance-sheet#list-attendance-sheets)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `filter` | object |  | Filters, all optional. |
| `filter.registration_opportunity_id` | integer |  | Only sheets for this registration opportunity id. |
| `filter.parent_program_id` | integer |  | Only sheets under this program id. |
| `filter.date` | string |  | Only sheets on this date (YYYY-MM-DD). |
| `include` | string |  | Include related resources (comma-separated). Options: registrationOpportunities, records, records.programSignup. |
| `page` | object |  | Pagination. Results are returned as &#123;"data": [...]&#125; with flat pagination keys (current_page, per_page, total, last_page). |
| `page.number` | integer |  | Page number, starting at 1. |
| `page.size` | integer |  | Results per page (default 30). |

### get_attendance_sheet

**Get attendance sheet** · Read-only

Get one attendance sheet by id. Requires a manager role.

Mirrors: [`GET /attendance_sheets/{attendance_sheet}`](/reference/attendance-sheet#get-an-attendance-sheet)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `attendance_sheet` | integer | Yes | The attendance sheet id. |
| `include` | string |  | Include related resources (comma-separated). Options: registrationOpportunities, records, records.programSignup. |

### list_attendance_records

**List attendance records** · Read-only

List attendance records (a person's attendance status on an attendance sheet). Requires a manager role. Paginated.

Mirrors: [`GET /attendance_records`](/reference/attendance-record#list-attendance-records)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `filter` | object |  | Filters, all optional. |
| `filter.attendance_sheet_id` | integer |  | Only records on this attendance sheet id. |
| `include` | string |  | Include related resources (comma-separated). Options: attendanceSheet, programSignup, programSignup.program. |
| `page` | object |  | Pagination. Results are returned as &#123;"data": [...]&#125; with flat pagination keys (current_page, per_page, total, last_page). |
| `page.number` | integer |  | Page number, starting at 1. |
| `page.size` | integer |  | Results per page (default 30). |

### get_attendance_record

**Get attendance record** · Read-only

Get one attendance record by id. Requires a manager role.

Mirrors: [`GET /attendance_records/{attendance_record}`](/reference/attendance-record#get-an-attendance-record)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `attendance_record` | integer | Yes | The attendance record id. |
| `include` | string |  | Include related resources (comma-separated). Options: attendanceSheet, programSignup, programSignup.program. |

### mark_attendance_record

**Mark attendance** · Changes data

Update an existing attendance record for a program signup on a specific sheet. Accepts status, notes, marked_at (timestamp with timezone), and marked_by (user ID). Timestamp and marker default to now and the credential owner. Requires the owning staff user to be a manager or an instructor assigned to the signup program.

Mirrors: [`PUT /attendance_records/{attendance_record}/mark`](/reference/attendance-record#markattendance-update)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `attendance_record` | integer | Yes | The attendance record ID; records are specific to a sheet and signup. |
| `status` | `absent`, `excused`, `excluded`, `late`, `present`, `unmarked` | Yes | Attendance status to record. |
| `notes` | string |  | Free-text note about this attendance mark. |
| `marked_at` | string |  | When attendance was marked, with timezone, e.g. 2026-09-09T15:00:00Z. Defaults to now. |
| `marked_by` | integer |  | ID of the user who marked attendance, within this tenant. Defaults to the credential owner. |

### register_attendance

**Register and mark attendance** · Changes data

Create a program signup and mark attendance for a person not previously registered. Use existing_user with user_id for a member, or walk_in with name for a guest. program_id must be a registration opportunity on the attendance sheet. Creates a new signup on each call. Requires the owning staff user to have the existing attendance registration permission: program manager, super admin, or assigned instructor. Returns the attendance record. Timestamp and marker default to now and the credential owner.

Mirrors: [`POST /attendance_sheets/{attendance_sheet}/mark`](/reference/attendance-record#markattendance-store)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `attendance_sheet` | integer | Yes | The attendance sheet ID. |
| `program_id` | integer | Yes | A registration opportunity ID included on the sheet. |
| `participant_type` | `existing_user`, `walk_in` | Yes | existing_user for a member of the organization, walk_in for a guest. |
| `user_id` | integer |  | Required for existing_user. |
| `additional_member_id` | integer |  | An existing family member belonging to user_id. |
| `name` | string |  | Required for walk_in. |
| `email` | string |  | Walk-in guest email. |
| `telephone` | string |  | Walk-in guest phone number. |
| `date_of_birth` | string |  | Walk-in guest date of birth, YYYY-MM-DD. |
| `amount_paid` | number |  | Amount collected, in the organization's currency (e.g. 25.00). |
| `payment_method` | string |  | How the amount was paid, e.g. cash. |
| `trigger_assign_email` | boolean |  | Send the assignment email; defaults to false. |
| `attach_invoice` | boolean |  | Attach an invoice to the assignment email; defaults to false. |
| `additional_member` | object |  | Optional family member to create for a walk-in guest. |
| `additional_member.name` | string |  | Family member name. |
| `additional_member.email` | string |  | Family member email. |
| `additional_member.date_of_birth` | string |  | Family member date of birth, YYYY-MM-DD. |
| `additional_member.emergency_contact_name` | string |  | Emergency contact name. |
| `additional_member.emergency_contact_phone` | string |  | Emergency contact phone number. |
| `additional_member.gender` | string |  | Family member gender. |
| `additional_member.medical` | string |  | Medical notes for the family member. |
| `status` | `absent`, `excused`, `excluded`, `late`, `present`, `unmarked` | Yes | Attendance status to record. |
| `notes` | string |  | Free-text note about this attendance mark. |
| `marked_at` | string |  | When attendance was marked, with timezone, e.g. 2026-09-09T15:00:00Z. Defaults to now. |
| `marked_by` | integer |  | ID of the user who marked attendance, within this tenant. Defaults to the credential owner. |

### mark_attendance

**Mark attendance** · Changes data · previews first

Mark one or more people present, absent, late, excused or excluded for one date of a session — for example "mark Sam Broadbent and Lena Kowalczyk present at the Competitive Team session on 2026-09-24". Refer to the session and the people by name or ID; no lookups needed. The people must already be on that date's attendance sheet. Runs as a preview first and shows each person's current and new mark; call again with mode "apply" to save.

Uses: [`PUT /attendance_records/{attendance_record}/mark`](/reference/attendance-record#markattendance-update)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `session` | string | Yes | The session people signed up for: its name (e.g. "Competitive Team") or ID. |
| `program` | string |  | The program the session belongs to, by name or ID. Only needed when more than one session has the same name. |
| `date` | string | Yes | The day of the session, YYYY-MM-DD, in the organization’s timezone (e.g. "2026-09-24"). |
| `people` | array of strings | Yes | Who to mark: each entry is a full name, an email address or a person’s ID, e.g. ["Sam Broadbent", "Lena Kowalczyk"]. |
| `status` | `present`, `late`, `absent`, `excused`, `excluded`, `unmarked` | Yes | "present" = came; "late" = came but arrived late; "absent" = didn’t come; "excused" = missed it for an accepted reason; "excluded" = not expected that day, so it doesn’t count either way; "unmarked" = clear the mark. |
| `notes` | string |  | Optional note saved on each person’s mark, e.g. "Called ahead". Leave out to keep existing notes. |
| `mode` | `preview`, `apply` |  | "preview" (default) checks the change and shows exactly what would happen without saving anything. "apply" makes the change. |

## People

### get_user

**Get user** · Read-only

Get one user (member) by id: name, email, telephone, date of birth, subscriptions and family. Non-managers can only read themselves and their family.

Mirrors: [`GET /users/{user}`](/reference/user#show-a-user)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `user` | integer | Yes | The user id. |
| `include` | string |  | Include related resources (comma-separated). Options: card, family, roles, permissions, files. |

### update_user

**Update user** · Changes data

Update a user's (member's) profile. This is a full update like the REST API's PUT: first_name, last_name and email are always required — read the user first (get_user) and resend the current values for anything you are not changing. Returns the updated user. Non-managers can only update themselves and their family.

Mirrors: [`PUT /users/{user}`](/reference/user#update-a-user)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `user` | integer | Yes | The user id. |
| `first_name` | string | Yes | First name. |
| `last_name` | string | Yes | Last name. |
| `email` | string | Yes | Email address (must be unique within the organization). |
| `middle_name` | string |  | Middle name. |
| `preferred_name` | string |  | Preferred name. |
| `name` | string |  | Full display name. |
| `date_of_birth` | string |  | Date of birth (YYYY-MM-DD). |
| `telephone` | string |  | Phone number. |
| `profile_address` | string |  | Street address. |
| `profile_address_line_2` | string |  | Address line 2. |
| `profile_city` | string |  | City. |
| `profile_state` | string |  | Province or state. |
| `profile_zip` | string |  | Postal or ZIP code. |
| `profile_country` | string |  | ISO 3166-1 alpha-2 country code. |

### create_user

**Create user** · Changes data

Create a member in this organization. Requires a manager role. Returns the created user and auto_login flag. A password is generated when omitted, and the existing welcome or profile-completion notification is sent.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `first_name` | string | Yes | First name. |
| `last_name` | string | Yes | Last name. |
| `email` | string | Yes | Email address, unique within this organization. |
| `middle_name` | string |  | Middle name. |
| `preferred_name` | string |  | Preferred name. |
| `telephone` | string |  | Phone number. |
| `address` | string |  | Street address. |
| `addressTwo` | string |  | Address line 2. |
| `city` | string |  | City. |
| `state` | string |  | Province or state. |
| `zip` | string |  | Postal or ZIP code. |
| `country` | string |  | Country. |

### list_custom_profile_fields

**List custom profile fields** · Read-only

List the organization's custom profile fields (extra per-member attributes). Paginated. Pass include="values" to embed each field's stored values.

Mirrors: [`GET /custom_profile_fields`](/reference/custom-profile-field#list-custom-profile-fields)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `filter` | object |  | Filters, all optional. |
| `filter.applies_to_users` | boolean |  | Only fields that apply to user profiles. |
| `filter.applies_to_family_members` | boolean |  | Only fields that apply to family members. |
| `include` | string |  | Include related resources (comma-separated). Options: values. |
| `page` | object |  | Pagination. Results are returned as &#123;"data": [...]&#125; with flat pagination keys (current_page, per_page, total, last_page). |
| `page.number` | integer |  | Page number, starting at 1. |
| `page.size` | integer |  | Results per page (default 30). |

### create_custom_profile_field

**Create custom profile field** · Changes data

Create a custom profile field. Requires a manager role.

Mirrors: [`POST /custom_profile_fields`](/reference/custom-profile-field#create-custom-profile-field)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string | Yes | Field label shown on member profiles. |
| `display_on_membership_card` | boolean |  | Print this field on digital membership cards. |
| `for_child_tenants` | boolean |  | Also create/propagate the field to child organizations (parent organizations only). |
| `user_editable` | boolean |  | Whether members may edit the value themselves. |
| `applies_to_users` | boolean |  | Whether this field applies to user profiles. Defaults to true. At least one of applies_to_users or applies_to_family_members must be true. |
| `applies_to_family_members` | boolean |  | Whether this field applies to family members. Defaults to false. At least one of applies_to_users or applies_to_family_members must be true. |

### update_custom_profile_field

**Update custom profile field** · Changes data

Update a custom profile field's label or flags. Requires a manager role.

Mirrors: [`PUT /custom_profile_fields/{id}`](/reference/custom-profile-field#update-custom-profile-field)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer | Yes | The custom profile field id. |
| `name` | string | Yes | Field label shown on member profiles. |
| `display_on_membership_card` | boolean |  | Print this field on digital membership cards. |
| `for_child_tenants` | boolean |  | Also create/propagate the field to child organizations (parent organizations only). |
| `user_editable` | boolean |  | Whether members may edit the value themselves. |
| `applies_to_users` | boolean |  | Whether this field applies to user profiles. At least one of applies_to_users or applies_to_family_members must be true. |
| `applies_to_family_members` | boolean |  | Whether this field applies to family members. At least one of applies_to_users or applies_to_family_members must be true. |

### list_custom_profile_field_values

**List custom profile field values** · Read-only

List stored custom profile field values. Filter by user, family member, or field. Paginated. Pass include="customProfileField" to embed the field.

Mirrors: [`GET /custom_profile_field_values`](/reference/custom-profile-field-value#list-custom-profile-field-values)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `filter` | object |  | Filters, all optional. |
| `filter.user_id` | integer |  | Only values for this user id. |
| `filter.family_id` | integer |  | Only values for this family member id. |
| `filter.custom_profile_field_id` | integer |  | Only values for this custom profile field id. |
| `include` | string |  | Include related resources (comma-separated). Options: customProfileField. |
| `page` | object |  | Pagination. Results are returned as &#123;"data": [...]&#125; with flat pagination keys (current_page, per_page, total, last_page). |
| `page.number` | integer |  | Page number, starting at 1. |
| `page.size` | integer |  | Results per page (default 30). |

### create_custom_profile_field_value

**Create custom profile field value** · Changes data

Store a custom profile field value for a user or family member. Provide exactly one of user_id or family_id. Values cannot be modified from a parent organization.

Mirrors: [`POST /custom_profile_field_values`](/reference/custom-profile-field-value#create-custom-profile-field-value)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `user_id` | integer |  | The user the value belongs to. Required when family_id is omitted. |
| `family_id` | integer |  | The family member the value belongs to. Required when user_id is omitted. |
| `custom_profile_field_id` | integer | Yes | The custom profile field. |
| `value` | string |  | The value to store. Empty values are ignored. |

### update_custom_profile_field_value

**Update custom profile field value** · Changes data

Change a stored custom profile field value. Only `value` is used; sending an empty value deletes the stored value.

Mirrors: [`PUT /custom_profile_field_values/{id}`](/reference/custom-profile-field-value#update-custom-profile-field-value)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer | Yes | The custom profile field value id. |
| `value` | string |  | The new value. An empty value deletes the stored value. |

### update_member

**Update a person** · Changes data · previews first

Change a person's details — name, email, phone, date of birth, address, or custom profile fields such as "Jersey Size". Only send what you want to change; everything else stays exactly as it is. Refer to the person by name, email or ID, and to profile fields by their name. Runs as a preview first; call again with mode "apply" to save.

Uses: [`PUT /users/{user}`](/reference/user#update-a-user), [`POST /custom_profile_field_values`](/reference/custom-profile-field-value#create-custom-profile-field-value), [`PUT /custom_profile_field_values/{id}`](/reference/custom-profile-field-value#update-custom-profile-field-value)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `person` | string | Yes | The person to change: their full name (e.g. "Maya Chen"), email or ID. |
| `first_name` | string |  | New first name. |
| `last_name` | string |  | New last name. |
| `email` | string |  | New email address. It must not belong to anyone else in the organization. |
| `date_of_birth` | string |  | Date of birth, YYYY-MM-DD. Send an empty string to clear it. |
| `preferred_name` | string |  | The name they like to go by, if different from their first name. |
| `phone` | string |  | Phone number, e.g. "403-555-0100". |
| `address` | string |  | Street address. |
| `address_line_2` | string |  | Apartment, suite or unit. |
| `city` | string |  | City. |
| `state` | string |  | Province or state. |
| `postal_code` | string |  | Postal or ZIP code. |
| `country` | string |  | Two-letter country code, e.g. "CA" or "US". |
| `profile_fields` | object |  | Custom profile fields by their name, e.g. &#123;"Jersey Size": "M"&#125;. Send an empty string to clear a field. |
| `mode` | `preview`, `apply` |  | "preview" (default) checks the change and shows exactly what would happen without saving anything. "apply" makes the change. |

### add_member

**Add a person** · Changes data · previews first

Add a new person to the organization with their name and email, plus optional phone, address and custom profile fields such as "Jersey Size" (by field name). They get a welcome email as soon as they are added. Warns when someone with the same email or name already exists. Runs as a preview first; call again with mode "apply" to add them. To set a date of birth, use update_member afterwards.

Uses: [`POST /custom_profile_field_values`](/reference/custom-profile-field-value#create-custom-profile-field-value)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `first_name` | string | Yes | First name. |
| `last_name` | string | Yes | Last name. |
| `email` | string | Yes | Email address. Each person in the organization needs their own. |
| `preferred_name` | string |  | The name they like to go by, if different from their first name. |
| `phone` | string |  | Phone number, e.g. "403-555-0100". |
| `address` | string |  | Street address. |
| `address_line_2` | string |  | Apartment, suite or unit. |
| `city` | string |  | City. |
| `state` | string |  | Province or state. |
| `postal_code` | string |  | Postal or ZIP code. |
| `country` | string |  | Two-letter country code, e.g. "CA" or "US". |
| `profile_fields` | object |  | Custom profile fields by their name, e.g. &#123;"Jersey Size": "M"&#125;. Send an empty string to clear a field. |
| `mode` | `preview`, `apply` |  | "preview" (default) checks the change and shows exactly what would happen without saving anything. "apply" makes the change. |

## Membership

### list_membership_types

**List membership types** · Read-only

List all membership types the organization offers, with their plans (prices/billing intervals), status and configuration.

Mirrors: [`GET /membership_types`](/reference/membership-type#list-all-membership-types-in-the-system)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `page` | object |  | Pagination. Results are returned as &#123;"data": [...]&#125; with flat pagination keys (current_page, per_page, total, last_page). |
| `page.number` | integer |  | Page number, starting at 1. |
| `page.size` | integer |  | Results per page (default 30). |

### get_membership_type

**Get membership type** · Read-only

Get one membership type by id, including its plans.

Mirrors: [`GET /membership_types/{membership_type}`](/reference/membership-type#retrieve-a-membership-type)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `membership_type` | integer | Yes | The membership type id. |

### archive_membership_type

**Archive membership type** · Changes data

Archive a membership type so it can no longer be purchased. Existing memberships are unaffected. Requires a membership manager role.

Mirrors: [`POST /membership_types/{id}/archive`](/reference/membership-type#archive-a-membership-type)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer | Yes | The membership type id. |

### unarchive_membership_type

**Unarchive membership type** · Changes data

Restore a previously archived membership type. Requires a membership manager role.

Mirrors: [`POST /membership_types/{id}/unarchive`](/reference/membership-type#unarchive-a-membership-type)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | integer | Yes | The membership type id. |

### list_user_memberships

**List user memberships** · Read-only

List the memberships members hold — which membership type and plan each member is on, its status (active/expired/retrying), expiry date and auto-renewal state. Paginated.

Mirrors: [`GET /user_memberships`](/reference/user-membership#list-user-memberships)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `filter` | object |  | Filters, all optional. |
| `filter.user_id` | integer |  | Only memberships held by the user with this id. |
| `filter.active` | boolean |  | Only memberships that have not expired. |
| `filter.expired` | boolean |  | Only memberships that have expired. |
| `filter.expires_starting_at` | string |  | Only memberships ending on or after this ISO 8601 date/datetime. |
| `filter.expires_ending_at` | string |  | Only memberships ending on or before this ISO 8601 date/datetime. |
| `page` | object |  | Pagination. Results are returned as &#123;"data": [...]&#125; with flat pagination keys (current_page, per_page, total, last_page). |
| `page.number` | integer |  | Page number, starting at 1. |
| `page.size` | integer |  | Results per page (default 30). |

### create_user_membership

**Assign a membership** · Changes data

Give an existing member a membership of the given type at no charge. Requires a membership-manager role. When the type has more than one active plan, plan_id is required. A payment the member already made outside Communal is recorded only when payment_method and amount_paid are supplied. Nothing is emailed unless send_email is true; then the member gets a "Membership Assigned" email and, about a minute later, their membership card (or the type's membership form PDF when cards are off or the type has no card).

Mirrors: [`POST /user_memberships`](/reference/user-membership#assign-a-membership-to-a-member)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `user_id` | integer | Yes | The member's user id. |
| `membership_type_id` | integer | Yes | The membership type to assign. |
| `plan_id` | integer |  | Which of the membership type's active plans (prices) to use. Required when the type has more than one. |
| `payment_method` | string |  | How the member already paid outside Communal, e.g. "cash", "cheque" or "e-transfer". Leave out when they didn't pay. |
| `amount_paid` | number |  | How much the member already paid outside Communal, e.g. 120.00. |
| `purchase_date` | string |  | The date the payment is recorded on, YYYY-MM-DD. Defaults to today. |
| `send_email` | boolean |  | true to send the "Membership Assigned" email followed by their membership card (or membership form PDF). Defaults to false, which sends nothing. |

### get_user_membership

**Get user membership** · Read-only

Get one held membership by id, including its membership type and plan.

Mirrors: [`GET /user_memberships/{user_membership}`](/reference/user-membership#get-a-user-membership)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `user_membership` | integer | Yes | The user membership id. |

### send_membership_card

**Send membership card** · Changes data

Send a digital membership card (Apple Wallet, Google Wallet and/or PDF) to a member by email. This does more than send a card: it looks the member up by their member ID (the value of `data[unique_identifier_key]`), creates a new member if none matches, CANCELS every active membership they hold, and gives them the membership type named in `data.MemberType` (which must match a membership type title exactly). It also sends real email. Confirm all of this with the user before calling.

Mirrors: [`POST /membership_cards/send`](/reference/membership-card#send-a-membership-card-for-a-user)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `user` | object | Yes | The member the card is for, plus the data printed on the card. |
| `user.unique_identifier_key` | string | Yes | Which key in `data` holds the member ID, usually "MemberID". Its value is matched against members’ member IDs. |
| `user.data` | object | Yes | Card data keyed in CapitalCase. Every value must be a string. FirstName, LastName, PreferredEmail and MemberType are required; MemberType must exactly match a membership type title. Example: &#123;"MemberID": "123456", "FirstName": "John", "LastName": "Smith", "PreferredEmail": "john@smith.com", "ExpiryDate": "12/31/2025", "MemberType": "Adult Annual"&#125;. |
| `card_types` | array of strings |  | Card formats to send. Defaults to all of apple, google and pdf. |

### list_membership_card_deliveries

**List membership card deliveries** · Read-only

List digital membership card delivery activities (when cards were sent, to whom, and whether delivery succeeded). Paginated.

Mirrors: [`GET /activities/card-deliveries`](/reference/activity#list-all-digital-member-card-delivery-activities)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `filter` | object |  | Filters, all optional. |
| `filter.member_id` | string |  | Only deliveries for the user with this member id. |
| `filter.request_hash` | string |  | Only deliveries from the API request with this hash. |
| `filter.date_from` | string |  | Created on or after this ISO 8601 date/datetime. |
| `filter.date_to` | string |  | Created on or before this ISO 8601 date/datetime. |
| `filter.status` | `success`, `failed` |  | Delivery status. |
| `page` | object |  | Pagination. Results are returned as &#123;"data": [...]&#125; with flat pagination keys (current_page, per_page, total, last_page). |
| `page.number` | integer |  | Page number, starting at 1. |
| `page.size` | integer |  | Results per page (default 30). |

### update_membership_type

**Update a membership type** · Changes data · previews first

Change a membership type's details — its name, description, whether members can see it, and its expiry reminder emails. Only send what you want to change; everything else stays exactly as it is. Prices, renewal dates, auto-renewal, tax, waivers and forms can't be changed here — do that in Manage → Memberships. Refer to the membership type by name or ID. Runs as a preview first; call again with mode "apply" to save.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `membership_type` | string | Yes | The membership type to change: its name (e.g. "Adult Annual") or ID. |
| `title` | string |  | New name. |
| `description` | string |  | New description (plain text or simple HTML). |
| `hidden` | boolean |  | true to hide the membership type from the list members can buy from (it can still be assigned by staff). |
| `hide_starting_price` | boolean |  | true to hide the “starting at” price shown to members. |
| `email_before_expiry` | boolean |  | Email members before their membership expires. |
| `email_before_expiry_days` | integer |  | How many days before expiry that reminder goes out. |
| `email_on_expiry` | boolean |  | Email members on the day their membership expires. |
| `email_after_expiry` | boolean |  | Email members after their membership has expired. |
| `email_after_expiry_days` | integer |  | How many days after expiry that reminder goes out. |
| `renewal_window_days` | integer |  | How many days before expiry members may renew early. 0 means they can’t renew early. |
| `mode` | `preview`, `apply` |  | "preview" (default) checks the change and shows exactly what would happen without saving anything. "apply" makes the change. |

### create_membership_type

**Create a membership type** · Changes data · previews first

Create a new membership type (for example "Adult Annual" or a "Locker Add-on") with its name, description, how it expires, and its reminder emails. This does not set up any prices: members can't buy the new type until a price is added in Manage → Memberships. Runs as a preview first; call again with mode "apply" to create it.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `title` | string | Yes | Name of the membership type, e.g. "Adult Annual". |
| `description` | string | Yes | What the membership includes (plain text or simple HTML). |
| `expires` | `after_plan_length`, `on_a_date` |  | "after_plan_length" (default): each membership lasts the length of the price it was bought with, counted from the day it starts. "on_a_date": every membership of this type ends on the same date (give end_date). |
| `end_date` | string |  | Only with expires "on_a_date": the day every membership ends, YYYY-MM-DD, within the next two years. |
| `add_on_to` | string |  | Make this an add-on to an existing membership type (name or ID). Members need that membership to buy the add-on. Leave out for a normal membership type. |
| `hidden` | boolean |  | true to hide the membership type from the list members can buy from (it can still be assigned by staff). |
| `hide_starting_price` | boolean |  | true to hide the “starting at” price shown to members. |
| `email_before_expiry` | boolean |  | Email members before their membership expires. |
| `email_before_expiry_days` | integer |  | How many days before expiry that reminder goes out. |
| `email_on_expiry` | boolean |  | Email members on the day their membership expires. |
| `email_after_expiry` | boolean |  | Email members after their membership has expired. |
| `email_after_expiry_days` | integer |  | How many days after expiry that reminder goes out. |
| `renewal_window_days` | integer |  | How many days before expiry members may renew early. 0 means they can’t renew early. |
| `mode` | `preview`, `apply` |  | "preview" (default) checks the change and shows exactly what would happen without saving anything. "apply" makes the change. |

### send_member_card

**Send a member their membership card** · Changes data · previews first

Email an existing member their digital membership card for the membership they already have. The email includes the PDF card plus Apple Wallet and Google Wallet versions. It only sends the card: it never creates a person and never changes, cancels or assigns any membership. Refer to the person by name, email or ID. By default the card goes to the email on their profile; pass send_to to use other addresses. Runs as a preview first; call again with mode "apply" to send. Prefer this over send_membership_card.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `person` | string | Yes | The member: their name, email or ID. They must already exist. |
| `send_to` | array of strings |  | Up to 5 email addresses to send the card to. Defaults to the email on their profile. |
| `card_types` | array of strings |  | Card formats. Every card email includes all of pdf, apple and google, so leave this out or list all three. |
| `mode` | `preview`, `apply` |  | "preview" (default) checks the change and shows exactly what would happen without saving anything. "apply" makes the change. |

### assign_membership

**Assign a membership** · Changes data · previews first

Give an existing person a membership: pick the membership type and, when it has more than one, which of its prices (plans). It never cancels their other memberships. Nothing is ever charged: Communal sets the membership up in Stripe with no charge, and can record money the person already paid outside Communal (payment_method plus amount_paid, e.g. "cash" and "120.00"). Nothing is emailed unless send_email is true, so only turn it on when asked; then they get a "Membership Assigned" email and, about a minute later, their membership card (or the type's membership form PDF when cards are off or the type has no card). To send only a card, use send_member_card instead. Refer to the person and the membership type by name or ID. Runs as a preview first; call again with mode "apply" to assign it. To add someone who isn't in Communal yet with a membership, use add_member_with_membership.

Uses: [`POST /user_memberships`](/reference/user-membership#assign-a-membership-to-a-member)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `person` | string | Yes | Who gets the membership: their full name, email or ID. They must already be in Communal. |
| `membership_type` | string | Yes | The membership type to assign, by name or ID, e.g. "Annual Family". |
| `price` | string |  | Which of that membership type’s prices (plans) to use, by name or ID, e.g. "Family Plan". Leave it out when the type has only one price. |
| `payment_method` | `credit_card`, `cheque`, `cash`, `debit`, `paypal`, `e-transfer`, `pad`, `promo`, `free` |  | How they already paid, outside Communal, e.g. "cash", "cheque" or "e-transfer". Leave it out, or use "free", when they didn’t pay. Communal never charges anyone here. |
| `amount_paid` | string |  | How much they already paid outside Communal, like "120.00". Defaults to 0. |
| `purchase_date` | string |  | The date the payment is recorded on, YYYY-MM-DD. Defaults to today. The membership itself starts as soon as it is assigned. |
| `send_email` | boolean |  | true to send the "Membership Assigned" email followed by their membership card (or membership form PDF). Defaults to false, which sends nothing. |
| `mode` | `preview`, `apply` |  | "preview" (default) checks the change and shows exactly what would happen without saving anything. "apply" makes the change. |

## Payments

### list_transactions

**List transactions** · Read-only

List financial transactions (charges, refunds, disputes, transfers, adjustments) for reporting. Paginated. Requires a manager-role user. Amounts are signed integer cents; negative amounts are refunds.

Mirrors: [`GET /transactions`](/reference/transaction#list-transactions)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `filter` | object |  | Filters, all optional. |
| `filter.range` | string |  | Filter to transactions whose effective date falls between two dates. Comma-separated start,end, e.g. 2025-01-01,2025-01-31. |
| `filter.starting_at` | string |  | Filter to transactions with an effective date on or after this date. |
| `filter.ending_at` | string |  | Filter to transactions with an effective date on or before this date (end of day). |
| `filter.type` | array of strings |  | Filter by transaction type(s). Each option (other than refund) matches both the charge and its refund type. |
| `filter.query` | string |  | Search transactions by related user/guest/account name or email, or by program signup id (subscription schedule lookup). |
| `filter.membership_type_id` | integer |  | Filter to transactions for the given membership type (plan product) id. |
| `filter.amount` | string |  | Filter by amount in dollars. Pass a bare value for an exact match, or prefix with lte: / gte: for a range bound. |
| `filter.id` | string |  | Filter by exact transaction id(s), comma-separated. |
| `filter.payout_id` | string |  | Filter by exact payout id. |
| `filter.subscription_schedule_id` | integer |  | Filter by the local subscription schedule id (not the Stripe sub_sched_... id). |
| `filter.user_id` | integer |  | Filter by exact owning user id. |
| `filter.promotion_code_id` | integer |  | Filter by exact promotion code id. |
| `filter.tags` | string |  | Filter by tag name(s), comma-separated. |
| `filter.with_product` | integer |  | Filter to transactions associated with the given product (membership/plan) id. Takes a product id, not a boolean. |
| `filter.with_parent_program` | string |  | Filter to transactions associated with the given parent program id(s), including refunds of those charges. Takes parent program id(s), not a boolean. Comma-separated for multiple. |
| `include` | string |  | Include related resources (comma-separated). Options: tags (adds the `tags` field), invoice.bookings.bookableEntity (populates `bookable_entity` inside `invoice.bookings`). Every other loadable relation is already eager-loaded and always present in the response. |
| `page` | object |  | Pagination. Results are returned as &#123;"data": [...]&#125; with flat pagination keys (current_page, per_page, total, last_page). |
| `page.number` | integer |  | Page number, starting at 1. |
| `page.size` | integer |  | Results per page (default 30). |

### get_transaction

**Get transaction** · Read-only

Get one financial transaction by id. Requires a manager-role user. Amounts are signed integer cents; negative amounts are refunds.

Mirrors: [`GET /transactions/{transaction}`](/reference/transaction#get-a-transaction)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `transaction` | integer | Yes | The transaction id. |

## Bookings

### list_bookings

**List bookings** · Read-only

List facility bookings for this organization. Paginated. Members see their own bookings; managers see all bookings. Times are UTC ISO 8601; use include/append for owner, facility, and computed fields.

Mirrors: [`GET /bookings`](/reference/booking#list-bookings)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `filter` | object |  | Filters, all optional. |
| `filter.user_id` | integer |  | Filter by owning user id. Members are limited to their own bookings regardless of this value. |
| `filter.bookable_entity` | string |  | Filter by facility (bookable entity) id(s), including child facilities of a parent. Comma-separated for multiple. |
| `filter.id` | string |  | Filter by exact booking id(s), comma-separated. |
| `filter.recurring_id` | integer |  | Filter by the recurring series id. |
| `filter.uuid` | string |  | Filter by exact booking uuid. |
| `filter.starting_at` | string |  | Filter to bookings that start on or after this date/time. |
| `filter.ending_at` | string |  | Filter to bookings that end on or before this date/time. |
| `filter.query` | string |  | Search bookings by owner name or email, facility name, or booking id. |
| `filter.associated_booking_id` | integer |  | Filter by the parent booking id for linked/child bookings. |
| `filter.only_recurring` | boolean |  | When true, only bookings that belong to a recurring series. |
| `filter.tags` | string |  | Filter by tag name(s), comma-separated. |
| `filter.with_product` | integer |  | Filter to bookings associated with the given product id. |
| `include` | string |  | Include related resources (comma-separated). Options: user, guest, bookableEntity, bookableEntity.parent, associatedBooking, organization, bookingItems, tags, formSubmissions, recurringBooking, facilities, bookingContactDetails, products. |
| `append` | string |  | Append computed attributes (comma-separated). Options include readable_start_time, readable_end_time, owner_name, owner_email, owner_telephone, invoices_paid, total_amount_of_invoices, participants. |
| `sort` | string |  | Sort field. Options: id, starting_at, ending_at. Prefix with - for descending. |
| `page` | object |  | Pagination. Results are returned as &#123;"data": [...]&#125; with flat pagination keys (current_page, per_page, total, last_page). |
| `page.number` | integer |  | Page number, starting at 1. |
| `page.size` | integer |  | Results per page (default 30). |

### get_booking

**Get booking** · Read-only

Get one facility booking by id. Members may only fetch their own bookings; managers may fetch any booking in the organization.

Mirrors: [`GET /bookings/{booking}`](/reference/booking#get-a-booking)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `booking` | integer | Yes | The booking id. |
| `include` | string |  | Include related resources (comma-separated). Options: bookableEntity, bookableEntity.parent, bookableEntity.parent.form, bookableEntity.form, notes, organization, tags, user, guest, formSubmissions, facilities, bookingItems, bookingContactDetails, recurringBooking, products, invoices.transactions. |
| `append` | string |  | Append computed attributes (comma-separated). Options include combined_notes, owner_name, owner_email, owner_telephone, participants, facilities_with_cost, created_by. |

### list_booking_requests

**List booking requests** · Read-only

List facility booking requests (reservations that go through an approval workflow). Paginated. Members only see their own requests; facility managers and super admins see the full organization. The default row is a curated payload (schedule, cost, owner, facility, state).

Mirrors: [`GET /booking_requests`](/reference/booking-request#list-booking-requests)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `filter` | object |  | Filters, all optional. |
| `filter.query` | string |  | Search by owner name, facility name, or organization name. |
| `filter.bookable_entity_id` | string |  | Bookable entity id(s), comma-separated. Also matches child facilities of a parent entity. |
| `filter.booking_state_id` | string |  | Booking state id(s), comma-separated. |
| `filter.user_id` | integer |  | Only requests owned by this member id. Non-managers may only use their own id. |
| `filter.starting_at` | string |  | Only requests that start on or after this datetime. |
| `filter.ending_at` | string |  | Only requests that end on or before this datetime. |
| `filter.uuid` | string |  | Look up a single request by its public uuid. |
| `filter.recurring_id` | integer |  | Only requests in this recurring series. |
| `filter.tags` | string |  | Filter by tag name(s), comma-separated. |
| `include` | string |  | Include related resources (comma-separated). Options: bookableEntity, bookableEntity.parent, bookableEntity.form, guest, user, bookingState, transaction, organization, bookingItems, tags, bookingContactDetails, recurringBooking, formSubmissions, files, notes, facilities. |
| `append` | string |  | Append computed attributes (comma-separated). Options: owner_name, owner_email, owner_telephone, invoices_paid, total_amount_of_invoices, combined_notes, associated_recurring_ids, flat_total_for_user_and_availability, participant_name (facility managers and super admins only). |
| `sort` | string |  | Sort by id, starting_at, or ending_at. Prefix with - for descending. |
| `page` | object |  | Pagination. Results are returned as &#123;"data": [...]&#125; with flat pagination keys (current_page, per_page, total, last_page). |
| `page.number` | integer |  | Page number, starting at 1. |
| `page.size` | integer |  | Results per page (default 30). |

### get_booking_request

**Get booking request** · Read-only

Get one facility booking request by id. Members may only view their own; facility managers and super admins may view any request in the organization.

Mirrors: [`GET /booking_requests/{booking_request}`](/reference/booking-request#get-a-booking-request)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `booking_request` | integer | Yes | The booking request id. |
| `include` | string |  | Include related resources (comma-separated). Options: bookableEntity, bookableEntity.parent, bookableEntity.form, guest, user, bookingState, transaction, files, notes, organization, recurringBooking, tags, formSubmissions, formSubmissions.form, bookingContactDetails, bookingItems, facilities. |
| `append` | string |  | Append computed attributes (comma-separated). Options: remaining_recurring_bookings, combined_notes, owner_name, owner_email, owner_telephone, created_by, facilities_with_cost, participant_name (facility managers and super admins only). |

## Facilities

### list_facilities

**List facilities** · Read-only

List the bookable spaces and resources the organization offers — rooms, courts, fields, equipment — with their booking rules, capacity and membership requirements. Paginated.

Mirrors: [`GET /facilities`](/reference/facility#list-facilities)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `filter` | object |  | Filters, all optional. |
| `filter.type` | string |  | Only facilities of this booking type: instant or request. |
| `filter.parent_id` | integer |  | Only sub-facilities of the facility with this id. |
| `filter.status` | string |  | active (default) or archived. |
| `filter.query` | string |  | Free-text search across facility names. |
| `include` | string |  | Include related resources (comma-separated). Options: parent, children. |
| `page` | object |  | Pagination. Results are returned as &#123;"data": [...]&#125; with flat pagination keys (current_page, per_page, total, last_page). |
| `page.number` | integer |  | Page number, starting at 1. |
| `page.size` | integer |  | Results per page (default 30). |

### get_facility

**Get facility** · Read-only

Get one bookable space or resource by id, including its booking rules, capacity and membership requirements.

Mirrors: [`GET /facilities/{facility}`](/reference/facility#get-a-facility)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `facility` | integer | Yes | The facility id. |
| `include` | string |  | Include related resources (comma-separated). Options: parent, children. |

### create_facility

**Create facility** · Changes data

Create a facility configuration record. Requires the facilities:write OAuth scope, independently of user roles. Accepts name, description, and optional booking type, capacity, scheduling settings, visibility, and booking-form options; other fields are ignored. Defaults to hidden from the public with public booking disabled and manager-only booking.

Mirrors: [`POST /facilities`](/reference/facility#create-a-facility)

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `publicly_exposed` | boolean |  | Show the facility publicly. Defaults to false. |
| `publicly_exposed_allow_bookings` | boolean |  | Allow public bookings. Defaults to false. |
| `manager_only` | boolean |  | Restrict bookings to managers. Defaults to true. |
| `type` | `instant`, `request` |  | Booking type: instant confirmation or manager-approved request. |
| `capacity` | integer |  | Maximum number of people. Null means no capacity limit. |
| `booking_interval` | `5`, `10`, `15`, `30`, `60` |  | Booking slot interval in minutes. |
| `buffer_minutes` | integer |  | Held minutes after each booking, 0 to 480. Zero or omit is Off. A child with no value uses the parent. |
| `future_days` | integer |  | Number of days ahead members may book. |
| `basis_time` | string |  | Local time from which booking slots align, in HH:MM:SS format. |
| `booking_request_deadline` | integer |  | Hours before a booking starts that requests must be submitted. Null means no deadline. |
| `publicly_exposed_hide_user_names` | boolean |  | Hide booking owner names on the public schedule. |
| `prompt_for_booking_owner` | boolean |  | Ask who the booking is for. |
| `prompt_for_adding_more_users` | boolean |  | Ask for additional members to include. |
| `prompt_for_number_of_guests` | boolean |  | Ask how many guests are attending. |
| `user_recurring_bookings` | boolean |  | Allow members to create recurring bookings. |
| `user_specified_reason` | boolean |  | Require members to give a booking reason. |
| `name` | string | Yes | Facility name. |
| `description` | string | Yes | Facility description. |

### update_facility

**Update a facility** · Changes data · previews first

Change a facility's own settings — its name, description, booking type, capacity, booking instructions and prompts, booking lengths and interval, buffer, how far ahead and how late it can be booked, public visibility, manager-only booking, recurring bookings, reminder emails and calendar view. Only send what you want to change; everything else stays exactly as it is. Parent and sub-facilities, associated facilities, products, membership requirements, booking checklists, tax, availability and existing bookings can't be changed here — do that in Manage → Facilities. Refer to the facility by name or ID. Runs as a preview first; call again with mode "apply" to save.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `facility` | string | Yes | The facility to change: its name (e.g. "Court 1") or ID. |
| `name` | string |  | New name. |
| `description` | string |  | New description (plain text or simple HTML). |
| `type` | `instant`, `request` |  | "instant" books straight away; "request" needs a manager to approve each booking. |
| `capacity` | integer |  | Most people allowed at once. |
| `booking_instructions` | string |  | Instructions shown to people when they book. |
| `prompt_for_booking_owner` | boolean |  | Ask who the booking is for. |
| `prompt_for_adding_more_users` | boolean |  | Let people add others to their booking. |
| `prompt_for_number_of_guests` | boolean |  | Ask how many guests are coming. |
| `user_specified_reason` | boolean |  | Ask people for a reason when they book. |
| `minimum_length` | string |  | Shortest booking, in hours (e.g. 0.5 or 1). |
| `maximum_length` | string |  | Longest booking, in hours (e.g. 2). |
| `booking_interval` | `5`, `10`, `15`, `30`, `60` |  | Booking start times step by this many minutes. |
| `basis_time` | string |  | Time of day booking slots line up with, as HH:MM (e.g. 08:00). |
| `buffer_minutes` | integer |  | Minutes kept free between bookings (0 for none). |
| `future_days` | integer |  | How many days ahead people can book. |
| `booking_request_deadline` | integer |  | How many hours before the start a booking must be made. |
| `publicly_exposed` | boolean |  | Show the facility on the public calendar. |
| `publicly_exposed_allow_bookings` | boolean |  | Let people book from the public calendar. |
| `publicly_exposed_hide_user_names` | boolean |  | Hide who booked on the public calendar. |
| `manager_only` | boolean |  | Only managers can make bookings. |
| `user_recurring_bookings` | boolean |  | Let members make recurring bookings. |
| `send_reminder_emails` | boolean |  | Email people before their booking. |
| `remind_hours_before` | integer |  | How many hours before the booking the reminder goes out. |
| `reminder_email_subject` | string |  | Subject of the reminder email. |
| `reminder_email_body` | string |  | Body of the reminder email. |
| `view_type` | `list`, `calendar` |  | How members see the booking times. |
| `mode` | `preview`, `apply` |  | "preview" (default) checks the change and shows exactly what would happen without saving anything. "apply" makes the change. |

## Finding records

### find_records

**Find records by name** · Read-only

Look up programs, sessions, people, membership types or facilities by name and get their IDs. Most task tools also accept a plain name wherever they ask for a record, so you only need this when a name is ambiguous or you want to browse. Leave query empty to list the most relevant records of that kind.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `kind` | `booking`, `booking_request`, `booking_state`, `facility`, `invoice`, `membership_price`, `membership_type`, `notification`, `organization`, `person`, `product`, `program`, `session`, `subscription`, `tag`, `transaction`, `volunteer_hour_submission`, `volunteer_shift` | Yes | What to look for. A "program" is a top-level offering (e.g. "Youth Basketball"); a "session" is one of its sign-up options (e.g. "Spring 2026, Tuesdays"). |
| `query` | string |  | Part of the name (or email, for people). Leave empty to browse. |
| `program` | string |  | Only for sessions: the program name or ID to search within. |
| `limit` | integer |  | How many matches to return (default 10). |
