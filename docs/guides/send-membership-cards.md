# Send membership cards

Membership cards are digital cards delivered to members via email in Apple Wallet, Google Wallet, or PDF format. This guide shows you how to send a card to a member, pass user data for card generation, and track delivery through activities.

## Before you begin

- [Authentication](../authentication.md) — you need a valid API key.
- [Membership overview](./membership-overview.md) — understand how membership cards relate to membership types.
- The membership card feature must be enabled for your organization. Requests return a `403` if the feature is not active.

## 1. Send a card with a user identifier

The card send endpoint looks up a user by a unique identifier field and delivers their membership card. At minimum, you need to provide the identifier key and a data array containing that key's value.

```bash
curl -X POST "https://api.getcommunal.com/api/membership_cards/send" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "unique_identifier_key": "MemberID",
      "data": {
        "MemberID": "12345"
      }
    }
  }'
```

Communal looks up the user by the identifier, generates cards from the configured template, and emails them. If no user is found with that identifier, a new user is created with the data you provide.

```json
{
  "status": true,
  "message": "Membership card sent successfully.",
  "request_hash": {}
}
```

The `request_hash` in the response lets you trace this delivery attempt through the system.

## 2. Include user profile data

You can pass additional profile fields in the `data` object. These fields are stored on the user profile and used to generate the card — things like name, email, expiration date, and membership type. If you omit a field, the value already on the user's profile is used.

```bash
curl -X POST "https://api.getcommunal.com/api/membership_cards/send" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "unique_identifier_key": "MemberID",
      "data": {
        "MemberID": "12345",
        "FirstName": "Jane",
        "LastName": "Doe",
        "PreferredEmail": "jane.doe@example.com",
        "MemberType": "Gold Membership",
        "ExpiryDate": "2026-12-31",
        "Active": true
      }
    }
  }'
```

> **Note:** Data field names use CapitalCase (e.g., `FirstName`, `MemberID`, `ExpiryDate`). These keys map to the fields configured on the card template.

## 3. Specify card formats

By default, cards are generated in all three formats: Apple Wallet, Google Wallet, and PDF. To limit delivery to specific formats, pass the `card_types` array.

```bash
curl -X POST "https://api.getcommunal.com/api/membership_cards/send" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "card_types": ["apple", "google"],
    "user": {
      "unique_identifier_key": "MemberID",
      "data": {
        "MemberID": "12345"
      }
    }
  }'
```

Available card types are `apple` (Apple Wallet pass), `google` (Google Wallet pass), and `pdf` (downloadable PDF).

## 4. Handle errors

The send endpoint returns specific error codes you should handle:

- **`403`** — The membership card feature is not enabled for your organization.
- **`422`** — Validation failed. Check that `user` and `unique_identifier_key` are provided and that `card_types` contains only valid values.
- **`500`** — The plan type could not be determined from the given membership type, or a generic server error.

## 5. Track delivery through activities

Card deliveries are logged as activities. After sending a card, you can query the Activities endpoints to check delivery status, find failed deliveries, or build an audit trail. Filter activities by member, date range, or delivery status to find specific card sends.

See the [Track card deliveries](./track-card-deliveries.md) guide for details on querying delivery history.

## What's next

- [Browse membership types](./browse-membership-types.md) — list membership products and their pricing plans
- [Membership overview](./membership-overview.md) — review how cards, types, and plans relate
- See the **Membership Card** endpoint in the API Reference for the complete request and response schemas
