# Track card deliveries

Every time a membership card is sent through the API, Communal logs a delivery activity with status, recipient details, and card formats. This guide shows you how to query delivery activities for auditing, support, and monitoring failed sends.

## Before you begin

- [Authentication](../authentication.md) — you need a valid API key with the card delivery permission.
- [Users & activity overview](./users-overview.md) — understand how activities relate to card deliveries.
- [Send membership cards](./send-membership-cards.md) — the send endpoint that generates these activities.

## 1. List recent card deliveries

Start by fetching all card delivery activities. This gives you a chronological view of every card send attempt across your organization.

```bash
curl -X GET "https://api.getcommunal.com/api/activities/card-deliveries" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

The response is a JSON array of activity records, each containing delivery status, recipient details, and card format information.

```json
[
  {
    "id": 301,
    "request_hash": "a1b2c3d4",
    "message": "Digital card delivered",
    "delivered_at": "2025-06-15T14:30:00.000000Z",
    "user_id": 89,
    "member_id": "MEM-12345",
    "obfuscated_emails": ["j***@example.com"],
    "email_count": 1,
    "card_types": {
      "pdf": true,
      "apple_pass": true,
      "google_wallet": false
    },
    "status": "delivered",
    "failure_reason": null,
    "error_message": null
  }
]
```

## 2. Trace a specific send request

When you send a card, the response includes a `request_hash`. Use it to look up the exact delivery activity for that API call — this is the primary way to confirm a send succeeded or diagnose why it failed.

```bash
curl -X GET "https://api.getcommunal.com/api/activities/card-deliveries?filter[request_hash]=a1b2c3d4" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

This returns the single activity matching that request, with full delivery details including which email addresses were attempted and which card formats were generated.

## 3. Find deliveries for a specific member

To pull the delivery history for one member — for a support lookup or member profile view — filter by their member ID.

```bash
curl -X GET "https://api.getcommunal.com/api/activities/card-deliveries?filter[member_id]=MEM-12345" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

This returns all card delivery attempts for that member, ordered by date, so you can see the full history of cards sent to them.

## 4. Monitor failed deliveries

To build a monitoring dashboard or alerting workflow, filter for failed deliveries. Combine with date filters to check a specific time window.

```bash
curl -X GET "https://api.getcommunal.com/api/activities/card-deliveries?filter[status]=failed&filter[date_from]=2025-06-01&filter[date_to]=2025-06-30" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

Failed activities include `failure_reason` and `error_message` fields that explain what went wrong — invalid email, plan type mismatch, or a downstream service error. Use these to decide whether to retry the send or escalate to support.

> **Note:** The `filter[status]` values are `success` and `failed`. The activity's own `status` field uses `delivered` and `failed` — the filter accepts `success` as an alias for `delivered`.

## What's next

- [Send membership cards](./send-membership-cards.md) — trigger card deliveries that generate these activities
- [Update user profiles](./update-user-profiles.md) — correct user data before resending a failed card
- See the **Activity** endpoint in the API Reference for the complete list of filters and response fields
