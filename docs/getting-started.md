# Getting started

This guide walks you through your first successful call to the Communal Platform API.

## Prerequisites

1. A Communal account for your organization.
2. An API key from **My profile → API keys** in Communal. See [Authentication](./authentication.md) for details.

## Base URL

All examples below use production:

```
https://api.getcommunal.com/api
```

Path segments in the reference are relative to that base (for example, `GET /parent_programs` becomes `GET https://api.getcommunal.com/api/parent_programs`).

## Make your first request

List parent programs for your organization:

```bash
curl -sS -H "Authorization: Bearer YOUR_API_KEY" \
  "https://api.getcommunal.com/api/parent_programs"
```

Replace `YOUR_API_KEY` with the secret from **My profile → API keys**.

## How to explore further

- [Using the API](./using-the-api.md) — pagination, filters, `include` / `sort`, and common errors.
- **API Reference** — try requests and inspect schemas for every path.
