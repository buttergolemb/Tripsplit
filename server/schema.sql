-- ─── TripSplit MVP Schema ────────────────────────────────────────────────────
-- SQLite flavor. Money is stored as integer cents to avoid float drift.
-- Deletes cascade so wiping a trip wipes its members, expenses, timeline, etc.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS trips (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  emoji         TEXT,
  destination   TEXT,
  -- Human-readable dates string ("Mar 15–18, 2026"). Kept denormalized
  -- because the current UI already expects this shape.
  dates         TEXT,
  start_date    TEXT,          -- ISO date, optional
  end_date      TEXT,          -- ISO date, optional
  phase         TEXT NOT NULL DEFAULT 'planning',
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS members (
  id            TEXT PRIMARY KEY,
  trip_id       TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  avatar        TEXT,
  role          TEXT,
  rsvp          TEXT NOT NULL DEFAULT 'interested',
  deposit_paid  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_members_trip ON members(trip_id);

CREATE TABLE IF NOT EXISTS expenses (
  id            TEXT PRIMARY KEY,
  trip_id       TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  description   TEXT NOT NULL,
  category      TEXT,
  emoji         TEXT,
  amount_cents  INTEGER NOT NULL,
  paid_by       TEXT NOT NULL REFERENCES members(id),
  -- Human-readable date label ("Mar 15") to keep UI behavior stable.
  date_label    TEXT,
  location      TEXT,
  confirmed     INTEGER NOT NULL DEFAULT 0,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_expenses_trip ON expenses(trip_id);

CREATE TABLE IF NOT EXISTS expense_splits (
  expense_id    TEXT NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  member_id     TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  share_cents   INTEGER NOT NULL,
  paid          INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (expense_id, member_id)
);

CREATE TABLE IF NOT EXISTS timeline_days (
  id             TEXT PRIMARY KEY,
  trip_id        TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_number     INTEGER NOT NULL,
  date_label     TEXT,          -- "Mar 15"
  label          TEXT,          -- "Arrival"
  day_start_time TEXT,
  day_end_time   TEXT,
  UNIQUE(trip_id, day_number)
);
CREATE INDEX IF NOT EXISTS idx_days_trip ON timeline_days(trip_id);

CREATE TABLE IF NOT EXISTS timeline_events (
  id             TEXT PRIMARY KEY,
  day_id         TEXT NOT NULL REFERENCES timeline_days(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  time           TEXT,          -- "7:00 PM"
  end_time       TEXT,
  location       TEXT,
  emoji          TEXT,
  state          TEXT NOT NULL DEFAULT 'proposed',  -- proposed|voting|confirmed|freetime
  votes_for      INTEGER NOT NULL DEFAULT 0,
  votes_against  INTEGER NOT NULL DEFAULT 0,
  voting_closes  TEXT,
  sort_order     INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_events_day ON timeline_events(day_id);

-- Event attendance per member. "status" matches the UI enum:
-- going | maybe | declined. Absence = not attending.
CREATE TABLE IF NOT EXISTS event_attendees (
  event_id   TEXT NOT NULL REFERENCES timeline_events(id) ON DELETE CASCADE,
  member_id  TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'going',
  PRIMARY KEY (event_id, member_id)
);

CREATE TABLE IF NOT EXISTS suggestions (
  id             TEXT PRIMARY KEY,
  day_id         TEXT NOT NULL REFERENCES timeline_days(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  category       TEXT,
  reason         TEXT,
  emoji          TEXT,
  distance       TEXT,
  location       TEXT,
  suggested_time TEXT
);
CREATE INDEX IF NOT EXISTS idx_suggestions_day ON suggestions(day_id);

-- Estimated vs actual per-category budget planning. Estimate is what the
-- group expects to spend; actual is a manual tally (we keep a separate row
-- rather than trying to auto-derive from expenses so users can freely group
-- categories differently than the expense list).
CREATE TABLE IF NOT EXISTS budget_categories (
  id             TEXT PRIMARY KEY,
  trip_id        TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  estimate_cents INTEGER NOT NULL DEFAULT 0,
  actual_cents   INTEGER NOT NULL DEFAULT 0,
  type           TEXT NOT NULL DEFAULT 'shared',   -- shared | optional
  icon           TEXT NOT NULL DEFAULT '💸'
);
CREATE INDEX IF NOT EXISTS idx_budget_categories_trip ON budget_categories(trip_id);

-- Group-set rules (e.g. "Round up tips"). items_json is a JSON-encoded
-- string[]; votes / total_voters track how much of the group has signed off.
CREATE TABLE IF NOT EXISTS rules (
  id             TEXT PRIMARY KEY,
  trip_id        TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  items_json     TEXT NOT NULL DEFAULT '[]',
  proposed_by    TEXT,
  votes          INTEGER NOT NULL DEFAULT 0,
  total_voters   INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_rules_trip ON rules(trip_id);

-- One deposit policy per trip. trip_id is the PRIMARY KEY so upserts are
-- simple and we can't accidentally create two overlapping policies.
CREATE TABLE IF NOT EXISTS deposit_policies (
  trip_id       TEXT PRIMARY KEY REFERENCES trips(id) ON DELETE CASCADE,
  amount_cents  INTEGER NOT NULL,
  due_date      TEXT,
  covers_json   TEXT NOT NULL DEFAULT '[]',
  dropout_rule  TEXT,
  set_by        TEXT
);
