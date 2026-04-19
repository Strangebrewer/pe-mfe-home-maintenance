# pe-mfe-home-maintenance — Claude Context

## What This Is

GraphQL MFE for home and vehicle maintenance tracking. Basic functionality deployed; needs significant work.

Port: 3004. Accessed via the shell at `/home-maintenance/*`.

---

## Domain Model

All types defined in `src/types/homeMaintenance.ts`.

**Vehicle**: `id`, `year`, `make`, `model`, `mileage`, `color?`, `trim?`, `plate?`, `vin?`, `insuranceId?`

**ServiceRecord**: `id`, `vehicleId`, `type` (enum), `date`, `mileage`, `cost?`, `name?`, `description?`
- `ServiceRecordType`: `OIL_CHANGE` | `TIRE_ROTATION` | `SERVICE_ITEM`

**Home**: `id`, `address`, `yearBuilt?`, `sqFootage?`, `notes?`

**HomeTask**: `id`, `homeId`, `name`, `frequency` (enum), `description?`
- `HomeTaskFrequency`: `MONTHLY` | `SEASONAL` | `BI_ANNUAL` | `ANNUAL` | `AS_NEEDED`

**HomeCompletion**: `id`, `homeId`, `taskId`, `date`, `cost?`, `notes?`

---

## What's Implemented

- `GET_HOMES` — `getHomes` query; fetches all Home fields
- `GET_VEHICLES` — `getVehicles` query; fetches all Vehicle fields
- Index page displaying both lists

---

## What's Not Here Yet

- ServiceRecord queries and mutations
- HomeTask queries and mutations
- HomeCompletion queries and mutations
- Create/update/delete for vehicles and homes
- Detail pages, forms, navigation between domains

---

## GraphQL Pattern

Follows the pe-mfe-recipes canonical pattern:

```
src/
  utils/
    authClient.ts     ← axiosPublic (AUTH_URL) and axiosAuth (GQL_URL); calls createAuthClient()
    graphqlClient.ts  ← gqlRequest<T>(query, variables?) — POSTs to GQL_URL via axiosAuth
  gql/
    queries/          ← plain GraphQL strings (no gql tag)
    hooks/            ← TanStack Query hooks; mutations invalidate relevant query keys on success
  types/              ← TypeScript types
```

No intermediate API layer — hooks call `gqlRequest` directly.

---

## env vars

- `AUTH_URL` → go-auth base URL for token refresh (default: `http://localhost:8080`)
- `GQL_URL` → Apollo Router URL (default: `http://localhost:4000`)

---

## Tailwind
Uses `tw:` prefix (`tw:flex`, `tw:text-sm`, etc.) — required by the MFE Tailwind config.

## pe-mfe-utils
`@bka-stuff/pe-mfe-utils` is installed via `github:` URL (public tarball). Never use `pnpm link` or workspace overrides — breaks CI.
