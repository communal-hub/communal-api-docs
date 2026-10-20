# What AI assistants can do

Once you [connect Communal to an AI assistant](./mcp-server.md) such as Claude, you can ask it, in your own words, to look things up and make changes in Communal for you. You don’t need to learn anything on this page first: the assistant works out what to do from what you ask.

This page lists everything an assistant can do. When an assistant asks for your approval, it shows the name of the action it wants to take, such as `update_program`. Look that name up here to see what it does.

## Good to know

- **It works as you.** The assistant can only see and change what your own Communal role allows. If you can’t do something in Communal, the assistant can’t either.
- **Looking things up never changes anything.** You can ask as many questions as you like.
- **Changes are real.** They update your organization’s records straight away, and some send emails. Read what the assistant plans to do before you approve it.
- **Many changes show you a preview first.** For actions marked “previews first”, the assistant checks the change and shows you exactly what will happen. Nothing is saved until you say yes.

## Programs and registration

Programs are what your organization offers, such as “Youth Basketball”. Each program has sessions people sign up for, such as “Spring, Tuesdays 6pm”.

Try asking:

- “Which programs have registration open right now?”
- “How many people signed up for the Tuesday session of Youth Basketball?”
- “Copy last fall’s Youth Basketball program for the spring.”

| What it does | Type | Action name |
| --- | --- | --- |
| See the programs your organization runs. | Looks things up | `list_programs` |
| Look at one program's full details and settings. | Looks things up | `get_program` |
| Create a new program. It starts as a draft, so you can finish setting it up before anyone sees it. | Makes changes | `create_program` |
| See the sessions people can sign up for, such as “Spring, Tuesdays 6pm”. | Looks things up | `list_registration_opportunities` |
| Look at one session's dates, spots and prices. | Looks things up | `get_registration_opportunity` |
| Add a session to a program with exact settings. Assistants usually use `add_session` instead. | Makes changes | `create_registration_opportunity` |
| See who has signed up for your programs and sessions. | Looks things up | `list_program_signups` |
| Look at one person's signup. | Looks things up | `get_program_signup` |
| Download signups as a spreadsheet (CSV). Large exports are emailed to you instead. | Doesn’t change records | `export_program_signups` |
| Change a program's details, such as its dates, price, spots or whether it's published. | Makes changes · previews first | `update_program` |
| Copy a program, for example to run last season again. The copy starts as a draft. | Makes changes · previews first | `clone_program` |
| Add a new session to a program, with its schedule, spots and prices. | Makes changes · previews first | `add_session` |
| Change a session's name, spots, dates, schedule, sign-up window or prices. | Makes changes · previews first | `update_session` |

## Attendance

Each date a session runs has an attendance sheet, where people are marked present, absent, late or excused.

Try asking:

- “Mark Sam and Lena present at Thursday’s Competitive Team session.”
- “Who missed last week’s Learn to Swim sessions?”

| What it does | Type | Action name |
| --- | --- | --- |
| See attendance sheets, one for each date a session runs. | Looks things up | `list_attendance_sheets` |
| Look at one attendance sheet. | Looks things up | `get_attendance_sheet` |
| See who was marked present, absent, late or excused. | Looks things up | `list_attendance_records` |
| Look at one person's attendance on one date. | Looks things up | `get_attendance_record` |
| Change one person's attendance mark on a sheet. | Makes changes | `mark_attendance_record` |
| Sign up someone who wasn't registered, such as a walk-in, and mark their attendance in one step. | Makes changes | `register_attendance` |
| Mark one or more people present, absent, late or excused for one session date. | Makes changes · previews first | `mark_attendance` |

## People

The people in your organization, their profiles, and the extra profile questions you ask, such as “Jersey size”.

Try asking:

- “Update Jordan Lee’s phone number to 555-0142.”
- “Add Priya Shah, priya@example.com, with jersey size M.”

| What it does | Type | Action name |
| --- | --- | --- |
| Look up a person's profile, memberships and family members. | Looks things up | `get_user` |
| Update a person's profile with exact values. Assistants usually use `update_member` instead. | Makes changes | `update_user` |
| Add a person with exact settings. Assistants usually use `add_member` instead. | Makes changes | `create_user` |
| See the extra profile questions your organization asks, such as “Jersey size”. | Looks things up | `list_custom_profile_fields` |
| Add a new profile question. | Makes changes | `create_custom_profile_field` |
| Rename a profile question or change its settings. | Makes changes | `update_custom_profile_field` |
| See people's answers to your profile questions. | Looks things up | `list_custom_profile_field_values` |
| Save someone's answer to a profile question. | Makes changes | `create_custom_profile_field_value` |
| Change or clear someone's answer to a profile question. | Makes changes | `update_custom_profile_field_value` |
| Change a person's name, email, phone, date of birth, address or profile answers. | Makes changes · previews first | `update_member` |
| Add a new person to your organization. They get a welcome email right away. | Makes changes · previews first | `add_member` |

## Membership

The memberships you offer, who holds them, and their digital membership cards.

Try asking:

- “Which memberships expire this month?”
- “Give Alex Chen the Adult Annual membership.”
- “Send Maria Lopez her membership card.”

| What it does | Type | Action name |
| --- | --- | --- |
| See the memberships you offer and their prices. | Looks things up | `list_membership_types` |
| Look at one membership type and its prices. | Looks things up | `get_membership_type` |
| Stop selling a membership type. People who already have it keep it. | Makes changes | `archive_membership_type` |
| Start selling an archived membership type again. | Makes changes | `unarchive_membership_type` |
| See who holds which membership, when it expires and whether it renews. | Looks things up | `list_user_memberships` |
| Give someone a membership with exact settings. Assistants usually use `assign_membership` instead. | Makes changes | `create_user_membership` |
| Look at one person's membership. | Looks things up | `get_user_membership` |
| Send a card using a member ID. It can also add the person and replace their current memberships, so to only send a card, `send_member_card` is safer. | Makes changes | `send_membership_card` |
| See when membership cards were sent and whether they arrived. | Looks things up | `list_membership_card_deliveries` |
| Change a membership type's name, description, visibility or reminder emails. | Makes changes · previews first | `update_membership_type` |
| Create a new membership type. Add a price in Communal before people can buy it. | Makes changes · previews first | `create_membership_type` |
| Email someone their digital membership card: a PDF plus Apple Wallet and Google Wallet versions. | Makes changes · previews first | `send_member_card` |
| Give someone a membership. Nothing is charged, and their other memberships stay as they are. | Makes changes · previews first | `assign_membership` |

## Payments

Payments, refunds and other money movements, for reporting.

Try asking:

- “How much did we refund last month?”

| What it does | Type | Action name |
| --- | --- | --- |
| See payments, refunds and other money movements for reporting. | Looks things up | `list_transactions` |
| Look at one payment or refund. | Looks things up | `get_transaction` |

## Bookings

Bookings of your facilities, and booking requests that need approval.

Try asking:

- “Which booking requests are waiting for approval?”

| What it does | Type | Action name |
| --- | --- | --- |
| See facility bookings. | Looks things up | `list_bookings` |
| Look at one booking. | Looks things up | `get_booking` |
| See booking requests that need approval, and ones already decided. | Looks things up | `list_booking_requests` |
| Look at one booking request. | Looks things up | `get_booking_request` |

## Facilities

The spaces and equipment people can book, such as rooms, courts and fields.

Try asking:

- “Which of our facilities can members book online?”
- “Change the gym’s capacity to 40.”

| What it does | Type | Action name |
| --- | --- | --- |
| See the spaces and equipment people can book, such as rooms, courts and fields. | Looks things up | `list_facilities` |
| Look at one facility's booking rules and capacity. | Looks things up | `get_facility` |
| Add a new facility. It starts hidden, and only managers can book it until you change its settings. | Makes changes | `create_facility` |
| Change a facility's name, description, capacity or booking rules. | Makes changes · previews first | `update_facility` |

## Finding records

Your assistant uses this behind the scenes when a name could match more than one record.

| What it does | Type | Action name |
| --- | --- | --- |
| Find a program, session, person, membership type or facility by name. | Looks things up | `find_records` |

## For developers

The [MCP tool reference](./mcp-tool-reference.md) lists every action’s parameters and the REST API operation it uses.
