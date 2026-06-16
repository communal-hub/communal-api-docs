# Read custom profile fields

Organizations can define **custom profile fields** to capture data beyond the standard identity, contact, and address fields on a user — things like skill level, dietary restrictions, or a t-shirt size. The API exposes these through two read-only endpoints: one for the field *definitions* and one for the stored *values*. This guide shows you how to list the definitions, read a user's values, embed related data, and page through results so you can sync custom data into an external system.

## Before you begin

- [Authentication](../authentication.md) — you need a valid API key.
- [Users & activity overview](./users-overview.md) — understand what user data is available and how permissions work.

## How the two resources relate

There are two resources:

- **Custom profile field** (`/custom_profile_fields`) — the *definition* of a field: its name, whether members can edit it, and whether it appears on the membership card. There is one definition per field, regardless of how many users have filled it in.
- **Custom profile field value** (`/custom_profile_field_values`) — a single *stored answer* for one user. Each value points back to its definition through `custom_profile_field_id` and belongs to a user through `user_id`.

To map a value back to a human-readable label, match its `custom_profile_field_id` to a definition's `id` — or let the API do it for you with the `include` parameter shown below.

## 1. List the field definitions

Start by listing the custom profile fields configured for your organization.

```bash
curl -X GET "https://api.getcommunal.com/api/custom_profile_fields" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

```json
{
  "data": [
    {
      "id": 12,
      "tenant_id": 3,
      "name": "Skill level",
      "display_on_membership_card": false,
      "user_editable": true,
      "locked": false,
      "parent_profile_field_id": null,
      "created_at": "2026-01-15T09:00:00.000000Z",
      "updated_at": "2026-01-15T09:00:00.000000Z",
      "deleted_at": null
    },
    {
      "id": 13,
      "tenant_id": 3,
      "name": "Dietary restrictions",
      "display_on_membership_card": false,
      "user_editable": true,
      "locked": false,
      "parent_profile_field_id": null,
      "created_at": "2026-01-15T09:00:00.000000Z",
      "updated_at": "2026-01-15T09:00:00.000000Z",
      "deleted_at": null
    }
  ],
  "current_page": 1,
  "from": 1,
  "last_page": 1,
  "per_page": 30,
  "to": 2,
  "total": 2
}
```

Key attributes on each definition:

- **`name`** — the field's label as configured in Communal.
- **`user_editable`** — whether members can edit this field themselves.
- **`locked`** — whether the field is locked by an administrator.
- **`display_on_membership_card`** — whether the field's value is shown on the member's card.
- **`parent_profile_field_id`** — the parent field's `id` for nested fields, or `null` for top-level fields.

## 2. Embed each field's values

Pass `include=values` to return every field with its stored values inline. This is the quickest way to pull a full snapshot of fields and answers in a single request.

```bash
curl -X GET "https://api.getcommunal.com/api/custom_profile_fields?include=values" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

```json
{
  "data": [
    {
      "id": 12,
      "name": "Skill level",
      "user_editable": true,
      "locked": false,
      "display_on_membership_card": false,
      "parent_profile_field_id": null,
      "values": [
        {
          "id": 540,
          "value": "Beginner",
          "user_id": 89,
          "custom_profile_field_id": 12
        }
      ]
    }
  ],
  "current_page": 1,
  "from": 1,
  "last_page": 1,
  "per_page": 30,
  "to": 1,
  "total": 1
}
```

## 3. Read a single user's values

When you only need one person's answers — for a profile sync or a detail view — query the values endpoint and filter by `user_id`.

```bash
curl -X GET "https://api.getcommunal.com/api/custom_profile_field_values?filter[user_id]=89" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

```json
{
  "data": [
    {
      "id": 540,
      "tenant_id": 3,
      "value": "Beginner",
      "user_id": 89,
      "custom_profile_field_id": 12,
      "created_at": "2026-02-02T18:24:00.000000Z",
      "updated_at": "2026-02-02T18:24:00.000000Z",
      "deleted_at": null
    },
    {
      "id": 541,
      "tenant_id": 3,
      "value": "No dietary restrictions",
      "user_id": 89,
      "custom_profile_field_id": 13,
      "created_at": "2026-02-02T18:24:00.000000Z",
      "updated_at": "2026-02-02T18:24:00.000000Z",
      "deleted_at": null
    }
  ],
  "current_page": 1,
  "from": 1,
  "last_page": 1,
  "per_page": 30,
  "to": 2,
  "total": 2
}
```

Available filters:

- **`filter[user_id]`** — values belonging to a specific user.
- **`filter[custom_profile_field_id]`** — values for a specific field definition. Combine with `filter[user_id]` to read one user's answer to one field.

## 4. Embed the parent field

Each value carries a `custom_profile_field_id`, but not the field's name. Pass `include=customProfileField` to embed the parent definition alongside each value so you can resolve labels without a second request.

```bash
curl -X GET "https://api.getcommunal.com/api/custom_profile_field_values?filter[user_id]=89&include=customProfileField" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

## 5. Page through results

Both endpoints return a paginated list. The pagination metadata sits at the top level of the response, alongside `data`:

- **`current_page`** — the page you're on.
- **`last_page`** — the final page number.
- **`per_page`** — how many records are returned per page.
- **`total`** — the total number of matching records.
- **`from`** / **`to`** — the range of records on the current page.

Use `last_page` and `total` to decide whether you need to fetch additional pages.

> **Note:** These endpoints are read-only. Custom profile field values are created and edited within the Communal platform; the API exposes them so you can retrieve and sync them into external systems.

## What's next

- [Update user profiles](./update-user-profiles.md) — sync a user's identity, contact, and address fields from an external system
- [Users & activity overview](./users-overview.md) — how user data and permissions work
- See the **Custom Profile Field** and **Custom Profile Field Value** endpoints in the API Reference for the complete list of fields and response shapes
