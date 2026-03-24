# Create and archive membership types

Use this workflow when you need to add a new sellable membership product to your tenant catalog, or retire one without canceling existing subscribers. When you finish, you have a membership type backed by a Stripe product, and you know how to toggle its availability for new purchases.

## Before you begin

- [Authentication](../authentication.md) — obtain a Bearer token for an API-enabled user.
- [Membership overview](./membership-overview.md) — how membership types relate to plans and subscriptions.

Creating or updating membership types requires a **manager** account (the same role that can configure membership catalog in the dashboard).

## Create a membership type

Send a `POST` request with a JSON body that describes the product. Required fields are `title`, `description`, and `type` (`base` for a standalone membership, `addon` for an add-on that requires an existing base membership). Set `renewalType` to `rolling` for ongoing renewals, or `date` for a fixed membership period — when using `date`, include `end_date` (within two years of today, `YYYY-MM-DD`).

Communal creates a Stripe product for the new type and returns the saved membership type record, including `id` and `product_id`. Add-on types must reference the base membership's Stripe product id in `base`.

```bash
curl -X POST "https://api.getcommunal.com/api/membership_types" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Community Plus 2025",
    "description": "Full access to facilities, programs, and events.",
    "type": "base",
    "renewalType": "rolling",
    "base": null,
    "end_date": null
  }'
```

```json
{
  "id": 42,
  "title": "Community Plus 2025",
  "description": "Full access to facilities, programs, and events.",
  "type": "base",
  "status": "active",
  "product_id": "prod_SampleId123"
}
```

After creation, you add pricing by creating **plans** for this membership type (see the **Plan** endpoints in the API Reference). Optional fields on create include `waivers` (array of waiver ids), `form_id`, `exclude_from_tax`, renewal notification settings, and `hidden` to suppress display until you are ready.

> **Note:** The field `exclude_from_parent_tenant_fee` is only honored when set by a Communal platform admin; other callers should omit it.

## Archive or restore a membership type

Archiving hides the type from new purchases and sets the linked Stripe product to inactive. Existing subscriptions keep billing and access until they end. Call the same endpoint again to restore the type to active.

The API stores archive state as `status` `inactive` (filters on list endpoints also accept `Archived` as a synonym). The response uses `MembershipTypeResource` — same shape as `GET /membership_types/{id}`.

```bash
curl -X POST "https://api.getcommunal.com/api/membership_types/42/archive" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

```json
{
  "id": "42",
  "title": "Community Plus 2025",
  "description": "Full access to facilities, programs, and events.",
  "status": "inactive"
}
```

A second `POST` to the same URL toggles back to `active` and reactivates the Stripe product.

> **Important:** Archiving does not cancel or refund existing members. It only affects whether new customers can purchase this membership type.

## What's next

- [Browse membership types](./browse-membership-types.md) — list types, filter by status, and load plans
- [Membership overview](./membership-overview.md) — base vs add-on, renewal types, and how archiving fits in
- See the **Membership Type** tag in the API Reference for `GET` list/show parameters and related operations
