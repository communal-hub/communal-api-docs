# Browse membership types

Membership types are the products your organization sells — annual passes, family memberships, student plans, and add-ons. This guide shows you how to list available membership types, inspect their pricing plans, and retrieve a single type's full configuration.

## Before you begin

- [Authentication](../authentication.md) — you need a valid API key.
- [Membership overview](./membership-overview.md) — understand how membership types, plans, and subscriptions relate.

## 1. List membership types

Start by fetching all membership types to display in a catalog, admin dashboard, or integration sync. The response includes each type's title, description, and nested pricing plans.

```bash
curl -X GET "https://api.getcommunal.com/api/membership_types" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

The response includes a paginated list of membership types. Each type contains a `plans` array with the pricing tiers available for that membership.

```json
{
  "data": [
    {
      "id": "7",
      "title": "Gold Membership",
      "description": "Full access to all facilities and programs.",
      "visibility_requires_base_membership": false,
      "form_id": null,
      "waivers": [],
      "plans": [
        {
          "id": "12",
          "nickname": "Monthly",
          "description": "Pay month-to-month",
          "amount": "2500",
          "status": "active"
        },
        {
          "id": "13",
          "nickname": "Annual",
          "description": "Save with yearly billing",
          "amount": "25000",
          "status": "active"
        }
      ]
    }
  ],
  "current_page": 1,
  "last_page": 1,
  "per_page": 30,
  "total": 4
}
```

> **Note:** Plan amounts are in cents. Divide by 100 for display — `"2500"` is $25.00.

## 2. Get a single membership type

When you need the full configuration for a specific membership — for a detail page, checkout flow, or configuration screen — fetch it by ID.

```bash
curl -X GET "https://api.getcommunal.com/api/membership_types/7" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

The response includes the complete type record with all plans, associated waivers, and the form ID if a signup form is configured. Use the `plans` array to display pricing options and the `visibility_requires_base_membership` field to determine if this is an add-on that should only appear to existing members.

## 3. Identify base and add-on memberships

Membership types are either **base** (standalone) or **add-on** (requires a base membership). When building a storefront, you'll typically want to display base memberships first, then show applicable add-ons after the member has selected or already holds a base membership.

Add-on types have `visibility_requires_base_membership` set to the base membership's identifier. Use this field to filter your display logic — only show add-ons to users who already have the required base membership active.

## What's next

- [Create and archive membership types](./create-and-archive-membership-types.md) — add catalog products or toggle archive state
- [Send membership cards](./send-membership-cards.md) — deliver digital membership cards to members
- [Membership overview](./membership-overview.md) — review how membership types, plans, and cards relate
- See the **Membership Type** endpoints in the API Reference for the complete list of fields
