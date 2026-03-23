# Versioning

The API uses **date-based versioning** through request headers. The version format is `YYYY-MM-DD`. The current version is `2026-02-01`.

## Sending a version

Pass the version in the `X-Api-Version` header:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  -H "X-Api-Version: 2026-02-01" \
  https://api.getcommunal.com/api/parent_programs
```

If you omit the header, the current default version is used automatically.

## Response headers

Every response includes version information:

```http
X-Api-Version: 2026-02-01
X-Api-Version-Source: header
```

`X-Api-Version-Source` is `header` when you sent the version explicitly, or `default` when the server applied it.

## Deprecation and sunset

When a version is deprecated, responses include warning headers:

```http
X-Api-Version-Warning: Requested API version is deprecated. Sunset date: 2027-02-01
Sunset: 2027-02-01
```

After the sunset date, the version is removed and requests using it return **400 Bad Request** with a list of supported versions.

## Invalid versions

Requesting an unsupported version returns a `400` error before any authentication or processing occurs:

```json
{
  "message": "Unsupported API version.",
  "supported_versions": ["2026-02-01"]
}
```

## Pinning a version

Pin your integration to a specific version so your code is not affected by future changes. When a new version introduces breaking changes, you can migrate on your own schedule before the old version's sunset date.

See the [Changelog](./changelog.md) for a history of API changes across versions.
