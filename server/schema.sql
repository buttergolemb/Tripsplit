-- ─── TripSplit MVP Schema ────────────────────────────────────────────────────
-- PostgreSQL. Money as INTEGER cents. Cascading deletes from trips.

CREATE TABLE IF NOT EXISTS trips (
  id           TEXT        PRIMARY KEY,
  name         TEXT        NOT NULL,
  emoji        TEXT,
  destination  TEXT,
  dates        TEXT,
  phase        TEXT        NOT NULL DEFAULT 'planning',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS members (
  id           TEXT        PRIMARY KEY,
  trip_id      TEXT        NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  avatar       TEXT,
  role         TEXT        NOT NULL DEFAULT 'member',
  rsvp         TEXT        NOT NULL DEFAULT 'pending',
  deposit_paid BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_members_trip ON members(trip_id);

CREATE TABLE IF NOT EXISTS expenses (
  id            TEXT        PRIMARY KEY,
  trip_id       TEXT        NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  description   TEXT        NOT NULL,
  category      TEXT,
  emoji         TEXT,
  amount_cents  INTEGER     NOT NULL,
  paid_by       TEXT        NOT NULL REFERENCES members(id),
  date_label    TEXT,
  location      TEXT,
  confirmed     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_expenses_trip ON expenses(trip_id);

CREATE TABLE IF NOT EXISTS expense_splits (
  expense_id   TEXT    NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  member_id    TEXT    NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  share_cents  INTEGER NOT NULL,
  paid         BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (expense_id, member_id)
);

CREATE TABLE IF NOT EXISTS timeline_days (
  id             TEXT    PRIMARY KEY,
  trip_id        TEXT    NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_number     INTEGER NOT NULL,
  date_label     TEXT,
  label          TEXT,
  day_start_time TEXT,
  day_end_time   TEXT
);
CREATE INDEX IF NOT EXISTS idx_days_trip ON timeline_days(trip_id);

CREATE TABLE IF NOT EXISTS timeline_events (
  id              TEXT        PRIMARY KEY,
  day_id          TEXT        NOT NULL REFERENCES timeline_days(id) ON DELETE CASCADE,
  trip_id         TEXT        NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  title           TEXT        NOT NULL,
  time            TEXT,
  end_time        TEXT,
  location        TEXT,
  emoji           TEXT,
  state           TEXT        NOT NULL DEFAULT 'confirmed',
  votes_for       INTEGER     NOT NULL DEFAULT 0,
  votes_against   INTEGER     NOT NULL DEFAULT 0,
  voting_closes   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_events_day ON timeline_events(day_id);
CREATE INDEX IF NOT EXISTS idx_events_trip ON timeline_events(trip_id);

CREATE TABLE IF NOT EXISTS event_discussion_posts (
  id         TEXT        PRIMARY KEY,
  event_id   TEXT        NOT NULL REFERENCES timeline_events(id) ON DELETE CASCADE,
  trip_id    TEXT        NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  member_id  TEXT        NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  body       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_discussion_event ON event_discussion_posts(event_id);
CREATE INDEX IF NOT EXISTS idx_discussion_trip ON event_discussion_posts(trip_id);

CREATE TABLE IF NOT EXISTS event_attendees (
  event_id   TEXT NOT NULL REFERENCES timeline_events(id) ON DELETE CASCADE,
  member_id  TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'going',
  PRIMARY KEY (event_id, member_id)
);

CREATE TABLE IF NOT EXISTS suggestions (
  id             TEXT PRIMARY KEY,
  trip_id        TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_id         TEXT REFERENCES timeline_days(id) ON DELETE SET NULL,
  title          TEXT NOT NULL,
  category       TEXT,
  reason         TEXT,
  emoji          TEXT,
  distance       TEXT,
  location       TEXT,
  suggested_time TEXT
);
CREATE INDEX IF NOT EXISTS idx_suggestions_trip_day ON suggestions(trip_id, day_id);

CREATE TABLE IF NOT EXISTS budget_categories (
  id             TEXT PRIMARY KEY,
  trip_id        TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  estimate_cents INTEGER NOT NULL DEFAULT 0,
  actual_cents   INTEGER NOT NULL DEFAULT 0,
  type           TEXT NOT NULL DEFAULT 'shared',
  icon           TEXT NOT NULL DEFAULT '💸',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_budget_categories_trip ON budget_categories(trip_id);

CREATE TABLE IF NOT EXISTS rules (
  id             TEXT PRIMARY KEY,
  trip_id        TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  items_json     TEXT NOT NULL DEFAULT '[]',
  proposed_by    TEXT,
  votes          INTEGER NOT NULL DEFAULT 0,
  total_voters   INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rules_trip ON rules(trip_id);

CREATE TABLE IF NOT EXISTS deposit_policies (
  trip_id       TEXT PRIMARY KEY REFERENCES trips(id) ON DELETE CASCADE,
  amount_cents  INTEGER NOT NULL,
  due_date      TEXT,
  covers_json   TEXT NOT NULL DEFAULT '[]',
  dropout_rule  TEXT,
  set_by        TEXT
);
