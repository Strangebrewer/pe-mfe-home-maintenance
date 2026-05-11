# pe-mfe-home-maintenance — Claude Context

## What This Is

GraphQL MFE for home and vehicle maintenance tracking. Full implementation complete and deployed to dev (`pe-mfe-home-maintenance-dev.web.app`).

Port: 3004. Accessed via the shell at `/home-maintenance/*`.

---

## Domain Model

All types defined in `src/types/homeMaintenance.ts`.

**Vehicle**: `id`, `userId`, `year`, `make`, `model`, `mileage`, `color?`, `trim?`, `plate?`, `vin?`, `insuranceId?`

**ServiceRecord**: `id`, `vehicleId`, `type` (enum), `date`, `mileage`, `cost?`, `name?`, `description?`
- `ServiceRecordType`: `OIL_CHANGE` | `TIRE_ROTATION` | `SERVICE_ITEM`
- `type` is immutable after creation — not included in update args

**Home**: `id`, `userId`, `address`, `isPrimary: boolean`, `customData?: string`, `yearBuilt?`, `sqFootage?`, `lotSize?`, `purchasePrice?`, `purchaseDate?`, `notes?`
- `isPrimary` — auto-set `true` for first home; toggled via `setPrimaryHome` mutation
- `customData` — JSON string stored in GQL schema, parsed/serialized at the frontend boundary; used for arbitrary key-value metadata (property tax, insurance company, etc.)

**HomeTask**: `id`, `homeId`, `name`, `frequency` (enum), `description?`, `lastCompletionDate?: string`
- `HomeTaskFrequency`: `MONTHLY` | `SEASONAL` | `BI_ANNUAL` | `ANNUAL` | `AS_NEEDED`
- `lastCompletionDate` — denormalized from completions, kept in sync by the backend on create/delete of completions

**HomeCompletion**: `id`, `homeId`, `taskId`, `date`, `cost?`, `notes?`

---

## Routes

- `/` → `MainPage` — primary home header + upcoming tasks sorted by urgency + vehicle cards
- `/homes/:id` → `HomeDetailPage` — home details + all tasks
- `/vehicles/:id` → `VehicleDetailPage` — vehicle details + service records

---

## Interaction Patterns

- **Create**: modal forms (AddHomeModal, AddVehicleModal, AddTaskModal, AddServiceRecordModal, LogCompletionModal)
- **Update**: inline editable fields (`InlineField` component) — click to edit, Save/Cancel, Enter/Escape
- **Delete**: inline confirm (show Yes/No inline, no modal)

---

## Key Implementation Details

### Enum inlining
Apollo Router rejects enum values passed as JSON strings — both as top-level variables AND as fields within an InputType variable. Mutations with enum fields use builder functions that inline the enum value directly into the query string as a GraphQL literal, inside the input object:

```typescript
export const buildCreateHomeTask = (frequency: HomeTaskFrequency) => `
  mutation CreateHomeTask($homeId: String!, $name: String!, $description: String) {
    createHomeTask(input: { homeId: $homeId, name: $name, frequency: ${frequency.toUpperCase()}, description: $description }) {
      ...
    }
  }
`;
```

Non-enum fields remain as variables. The hook extracts the enum value, calls the builder, and passes the rest as variables. Same pattern for `ServiceRecordType` and for optional enums (builder omits the field entirely when not provided).

### customData editing
`HomeDetailPage` parses `home.customData` with `JSON.parse` to display key-value pairs. A `CustomDataModal` allows adding/removing/editing rows; on save it serializes back with `JSON.stringify` and calls `updateHome`.

### Task urgency sorting (`src/utils/taskUtils.ts`)
`sortTasksByUrgency` order:
1. Non-AS_NEEDED tasks with no `lastCompletionDate` (never done)
2. Overdue tasks (most overdue first)
3. Upcoming tasks (soonest first)
4. AS_NEEDED tasks last

`getNextDueDate` / `getDaysUntilDue` use `FREQUENCY_DAYS` map (MONTHLY=30, SEASONAL=90, BI_ANNUAL=180, ANNUAL=365, AS_NEEDED=null).

Task status color coding: never-done or overdue → `tw:text-red`; due within 7 days → `tw:text-blue`; as-needed or not due soon → `tw:text-muted`.

### Hook patterns
- `useUpdateHomeTask` strips `homeId` from mutation variables (not a valid update arg), uses it only for `makeUpdateHomeTask` cache key
- `useCreateHomeCompletion` — `homeId` is not in the input type; invalidates `['get-home-tasks', data.homeId]` using the value returned from the server
- `useUpdateServiceRecord` strips `vehicleId` before sending
- `useDeleteServiceRecord(vehicleId)` — vehicleId passed at hook initialization for cache invalidation

---

## File Structure

```
src/
  utils/
    authClient.ts       ← axiosPublic (AUTH_URL) + axiosAuth (GQL_URL); createAuthClient()
    graphqlClient.ts    ← gqlRequest<T>(query, variables?) — POSTs to GQL_URL via axiosAuth
    taskUtils.ts        ← FREQUENCY_DAYS, FREQUENCY_LABELS, getNextDueDate, getDaysUntilDue,
                          sortTasksByUrgency, formatDate, todayISO
  gql/
    queries/            ← homes.ts, vehicles.ts, homeTasks.ts, homeCompletions.ts, serviceRecords.ts
    hooks/              ← homeHooks.ts, vehicleHooks.ts, homeTaskHooks.ts,
                          homeCompletionHooks.ts, serviceRecordHooks.ts
  types/
    homeMaintenance.ts  ← all domain types and enums
  components/
    InlineField.tsx     ← click-to-edit field; supports text/number types
    Modal.tsx           ← reusable overlay modal (fixed inset, scrollable body)
  pages/
    MainPage.tsx
    HomeDetailPage.tsx
    VehicleDetailPage.tsx
  App.tsx
```

---

## env vars

- `AUTH_URL` → go-auth base URL for token refresh (default: `http://localhost:8080`)
- `GQL_URL` → Apollo Router URL (default: `http://localhost:4000`)

---

## Tailwind
Uses `tw:` prefix (`tw:flex`, `tw:text-sm`, etc.) — required by the MFE Tailwind config.

## pe-mfe-utils
`@bka-stuff/pe-mfe-utils` is installed via `github:` URL (public tarball). Never use `pnpm link` or workspace overrides — breaks CI.

## Deploy dependency
`gql-home-maintenance` schema changes (`isPrimary`, `customData`, `lastCompletionDate`) must be deployed and the supergraph recomposed via rover (in CI) before this MFE will work correctly against the live router.
