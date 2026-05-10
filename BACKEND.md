# TripSplit — Backend + Data Layer

This document describes the MVP backend that was added on top of the original
frontend-only prototype. Scope is explicitly an MVP foundation, not a
production-grade service.

## Stack

| Layer       | Choice                                   | Why                                              |
|-------------|------------------------------------------|--------------------------------------------------|
| Runtime     | Node.js + **Express 4**                  | Tiny, universally understood, no magic           |
| Database    | **SQLite** via `better-sqlite3`          | Single file, synchronous, Windows prebuilds      |
| Validation  | **Zod**                                  | Runtime body validation + shared TypeScript types|
| Client fetch| **TanStack Query**                       | Caching, invalidation, retries, loading state    |
| Dev orchestration | `concurrently`, Vite `/api` proxy   | `npm run dev` runs API + UI together             |

No cloud setup required. When it's time to ship, the schema is plain SQL and
ports cleanly to Postgres (Supabase, Neon, Railway, etc.) — swap the
`better-sqlite3` calls for `pg` and keep everything else.

## Running it

```powershell
# Install deps (first time only)
npm install

# Populate SQLite with prototype data (Austin + Beach trips)
npm run seed

# Start API (port 4000) + Vite (port 5173) together
npm run dev
```

Other scripts:

- `npm run server` — API only (auto-restarts on change via `tsx watch`)
- `npm run dev:web` — Vite only
- `npm run build` — production build

The SQLite file lives at `data.sqlite` in the project root. Delete it +
`npm run seed` to reset state.

## Project layout

```
server/
  schema.sql          DDL executed on every boot (idempotent)
  db.ts               Opens the DB, applies schema, exports the connection
  types.ts            DTOs shared with the frontend
  util.ts             Small helpers (cents <-> dollars, id gen)
  repo.ts             All SQL queries + computed balances
  index.ts            Express app, routes, Zod validation, error handler
  seed.ts             Nukes + re-inserts Austin/Beach from the prototype

src/lib/
  api.ts              Typed fetch client mirroring every route
  queryKeys.ts        Centralized TanStack Query cache keys

src/app/components/
  TripDataContext.tsx API-backed provider; same hook contract as before
  TripList.tsx        GET /api/trips + POST on create
  MoneyScreen.tsx     Uses context + GET /api/trips/:id/balances
  …                   Everything else uses `useTripData()` unchanged
```

## Database schema

```
trips (id, name, emoji, destination, dates, start_date, end_date, phase, timestamps)
  └── members        (id, name, avatar, role, rsvp, deposit_paid)
  └── expenses       (id, description, category, emoji, amount_cents,
                      paid_by→members, date_label, location, confirmed)
        └── expense_splits (expense_id, member_id, share_cents, paid)
  └── timeline_days  (id, day_number, date_label, label, day_start/end_time)
        └── timeline_events (id, title, time, end_time, location, emoji,
                              state, votes_for, votes_against, voting_closes)
              └── event_attendees (event_id, member_id, status)
        └── suggestions (id, title, category, reason, emoji, distance,
                          location, suggested_time)
```

Money is stored as integer **cents** to avoid float drift and converted to
dollars at the API boundary.

## API surface

All paths are rooted at `/api`. Bodies are JSON. Validation errors return
`400` with `{ error, issues }`.

### Trips
- `GET    /trips`                             → summary list (counts + totals)
- `GET    /trips/:id`                         → full trip (members, timeline, expenses)
- `POST   /trips`                             → create
- `PATCH  /trips/:id`                         → rename / phase / emoji / dates

### Members
- `POST   /trips/:id/members`
- `PATCH  /trips/:id/members/:memberId`       → rsvp, deposit_paid, role
- `DELETE /trips/:id/members/:memberId`

### Expenses
- `GET    /trips/:id/expenses`
- `POST   /trips/:id/expenses`                → creates expense + splits in one transaction
- `DELETE /trips/:id/expenses/:expenseId`
- `PATCH  /trips/:id/expenses/:expenseId/splits/:memberId` `{ paid: boolean }`

### Balances (computed)
- `GET    /trips/:id/balances` → `{ balances: [{memberId,name,paid,owed,net}], settlements: [{fromName→toName, amount}] }`
  - `balances[].net = paid − owed`
  - `settlements[]` is a greedy "simplified debts" pass: match the biggest creditor to the biggest debtor until everyone is ≈0.

### Timeline
- `GET    /trips/:id/timeline`
- `POST   /trips/:id/days`
- `POST   /trips/:id/events`                  → `{ dayId, title, time, attendees, ... }`
- `PATCH  /trips/:id/events/:eventId`
- `DELETE /trips/:id/events/:eventId`
- `POST   /trips/:id/events/:eventId/vote`    → `{ type: "for" | "against" }`
- `PUT    /trips/:id/events/:eventId/attendees/:memberId` → `{ status: "going" | "maybe" | "declined" }`

## What's wired end-to-end

- **Trip list** — `TripList` reads `GET /trips` and creates via `POST /trips`.
- **Trip details / dashboard / planning / settings** — `TripDataProvider`
  reads `GET /trips/:id`. All mutations (`addParticipant`, `updateRSVP`,
  `markDepositPaid`, `updateTrip`, `setPhase`) hit the API.
- **Money screen** — expenses, "Pay" toggles per split, total spend, and
  "You owe" are all driven by the API. The **Suggested Settlements** block
  is new and consumes the greedy settlement algorithm from the balances
  endpoint.
- **Add expense** — new expenses POST and refresh the trip + balances
  queries via React Query invalidation. Data survives refresh.
- **Timeline** — event creation, updates, removal, voting all go through
  the API. Attendees are matched by member name → id in the provider.
- **Suggestions** — seeded read-only today; accepting one already goes
  through the normal "add event" path, so it persists.

## Still prototype-only (local state)

These three areas intentionally stayed as React state on the client because
they're not yet critical to the "money + timeline" MVP loop. Each is a
straight-forward single-table extension when we want to persist it:

| Feature          | Current | To persist, add                                                                            |
|------------------|---------|--------------------------------------------------------------------------------------------|
| Budget categories| Local   | `budget_categories (id, trip_id, name, estimate_cents, actual_cents, type, icon)`          |
| Rules            | Local   | `rules (id, trip_id, title, items_json, proposed_by, votes, total_voters)`                 |
| Deposit policy   | Local   | `deposit_policies (trip_id PK, amount_cents, due_date, covers_json, dropout_rule, set_by)` |

The provider already exposes the exact same mutator methods — only the
implementations inside `TripDataProvider` (currently `setLocalOverlay(...)`)
need to swap to API calls when those tables land.

## Notes / caveats

- **No auth** yet. The app assumes the "current user" is `Sarah` (via the
  `YOU` constant in `AddExpenseSheet.tsx`). This is the first thing to
  replace when we add sign-in.
- **No realtime**. If you open two tabs, changes don't push — but they DO
  show up on the next refocus / action because React Query invalidates on
  mutation. Moving to Supabase/Firebase would get us realtime for free.
- **Single-writer** model. SQLite's WAL mode handles concurrent reads fine
  but heavy write concurrency would want Postgres.
- **Money math**. All cents, rounded on conversion. Splits can leave a 1¢
  residual when an amount doesn't divide evenly — that's acceptable for MVP
  and shows up only in totals, not in any "who owes who" flag.
