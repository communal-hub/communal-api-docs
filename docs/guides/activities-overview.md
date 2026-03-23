# Activities

An **activity** (path `/activities/card-deliveries`) is an operational log entry tracking events in the system. The current API surface focuses on **digital membership card deliveries** — each time a card is sent to a member, Communal logs an activity with delivery details.

Each card delivery activity records:

- **Delivery status** — `success` or `failed`
- **Card formats** — which formats were generated (Apple Wallet, Google Wallet, PDF)
- **Recipient details** — the user, their member ID, and the email addresses attempted
- **Traceability** — a `request_hash` linking the activity back to the originating API call
- **Failure details** — reason and error message when delivery fails

Activities are read-only. You query them for auditing, support, and monitoring — not for triggering actions.

## Card delivery tracing

Every card send request generates a `request_hash` in the response. Use this hash to query the activities endpoint and trace the delivery — check whether it succeeded, which email addresses were attempted, and what card formats were generated.

After sending a card via `/membership_cards/send`, query `/activities/card-deliveries` with `filter[request_hash]` to trace the delivery.

## API naming

| Concept | API path | OpenAPI tag |
|---------|----------|-------------|
| Card delivery activity | `/activities/card-deliveries` | **Activity** |

## What's next

- [Track card deliveries](./track-card-deliveries.md) — monitor and audit membership card delivery attempts
- [Send membership cards](./send-membership-cards.md) — trigger card deliveries
