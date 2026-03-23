# Membership types and cards

Manage **membership type** catalog data and trigger **digital membership card** delivery. Membership types describe what you sell; the card endpoint performs email delivery and may create or update user data used for the card.

## Membership types

### Typical flows

- **Sync catalog** — List membership types for display or reconciliation; fetch one by ID for detail screens.
- **Lifecycle** — Archive or unarchive a type when your integration mirrors Communal configuration.

### Endpoints (API Reference → **Membership Type** tag)

| Operation | Method and path | Summary |
|-----------|-----------------|---------|
| List membership types | `GET /membership_types` | Paginated collection. |
| Get a membership type | `GET /membership_types/{membership_type}` | Single resource. |
| Archive / unarchive | `POST /membership_types/{id}/archive` | Toggle archived state. |

## Membership cards

### Typical flows

- **Deliver a card** — Call send with the member’s email and optional profile fields; handle success and error payloads in your UI or job processor.

### Endpoints (API Reference → **Membership Card** tag)

| Operation | Method and path | Summary |
|-----------|-----------------|---------|
| Send a membership card | `POST /membership_cards/send` | Sends card email; may create/update user data for card generation. |

The operation documents **200**, **401**, **403** (feature disabled), **422**, and **500** cases. Successful responses include a **`request_hash`** object for tracing. Card delivery history is available via [Activities](./activities.md).
