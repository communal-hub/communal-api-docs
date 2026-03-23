# Update user profiles

The user update endpoint lets your integration push corrected or enriched profile data into Communal from an external system — a CRM, school information system, or membership database. This guide shows you how to update a user's identity, contact, and address fields, and how to set custom profile data.

## Before you begin

- [Authentication](../authentication.md) — you need a valid API key.
- [Users & activity overview](./users-overview.md) — understand what user data is available and how permissions work.

## 1. Update basic profile fields

To sync a user's name and contact information, send a PUT request with the required fields (`first_name`, `last_name`, `email`) and any optional fields you want to update. Fields you omit are left unchanged.

```bash
curl -X PUT "https://api.getcommunal.com/api/users/89" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane.doe@example.com",
    "preferred_name": "Janey",
    "telephone": "416-555-1234"
  }'
```

The response confirms the update was applied. The three required fields must always be present even if you're only changing one optional field — this is a full-record update, not a partial patch.

## 2. Update address information

Address fields follow a structured format with separate fields for each component. Use the ISO 3166-1 alpha-2 country code for `profile_country` (e.g., `CA` for Canada, `US` for United States).

```bash
curl -X PUT "https://api.getcommunal.com/api/users/89" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane.doe@example.com",
    "profile_address": "123 Main Street",
    "profile_address_line_2": "Suite 200",
    "profile_city": "Toronto",
    "profile_state": "ON",
    "profile_zip": "M5V 2T6",
    "profile_country": "CA"
  }'
```

All address fields are nullable — pass `null` to clear a field.

## 3. Set custom profile data

Organizations can define custom profile fields captured through forms. Use the `custom_form` object to update these fields by passing the form template ID and an array of field values.

```bash
curl -X PUT "https://api.getcommunal.com/api/users/89" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane.doe@example.com",
    "custom_form": {
      "id": 5,
      "data": ["Beginner", "No dietary restrictions"]
    }
  }'
```

The `custom_form.id` must reference a valid form template configured in your organization. The `data` array values map to the fields defined in that template, in order.

## 4. Handle errors

The update endpoint returns specific error codes:

- **`401`** — Authentication failed. Check your API key.
- **`403`** — Authorization failed. Your API key doesn't have permission to update this user. Non-manager keys can only update the authenticated user's own record.
- **`422`** — Validation failed. Common causes: missing required fields (`first_name`, `last_name`, `email`), duplicate email address within the organization, or invalid `custom_form.id`.

> **Important:** The `email` field must be unique within your organization. If another user already has that email, the update returns a `422` validation error.

## What's next

- [Track card deliveries](./track-card-deliveries.md) — monitor membership card delivery attempts for users
- [Send membership cards](./send-membership-cards.md) — deliver digital cards (which can also create or update user data)
- See the **User** endpoint in the API Reference for the complete list of writable fields
