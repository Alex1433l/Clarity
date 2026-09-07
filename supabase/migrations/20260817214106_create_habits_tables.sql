/*
# Create habits and habit_logs tables (single-tenant, no auth)

1. New Tables

  habits — stores habit definitions
  - id (uuid, primary key)
  - name (text, not null) — habit name
  - description (text, nullable) — optional description
  - frequency (text, not null, default 'daily') — 'daily' or 'weekly'
  - days_of_week (int2[], nullable) — for weekly habits: which days (0=Sun..6=Sat); null means daily
  - color (text, nullable) — optional color label for the habit card
  - created_at (timestamptz, default now())

  habit_logs — stores daily check-in records (one per habit per date)
  - id (uuid, primary key)
  - habit_id (uuid, foreign key → habits.id ON DELETE CASCADE)
  - date (date, not null) — the date the habit was completed
  - created_at (timestamptz, default now())
  - UNIQUE constraint on (habit_id, date) to prevent duplicate check-ins

2. Security
  - Enable RLS on both tables.
  - Single-tenant app with no sign-in: allow anon + authenticated full CRUD.
  - USING (true) is acceptable because the data is intentionally shared/public (no auth).

3. Indexes
  - Index on habit_logs.habit_id for efficient lookups by habit.
  - Index on habit_logs.date for efficient calendar/date-range queries.
  - Composite unique index on (habit_id, date) to enforce one check-in per day.

4. Important Notes
  - habit_logs are deleted automatically when a habit is deleted (CASCADE).
  - The UNIQUE constraint prevents double-checking the same habit on the same day.
*/

CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  frequency text NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly')),
  days_of_week int2[] DEFAULT NULL,
  color text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_habits" ON habits;
CREATE POLICY "anon_select_habits" ON habits FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_habits" ON habits;
CREATE POLICY "anon_insert_habits" ON habits FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_habits" ON habits;
CREATE POLICY "anon_update_habits" ON habits FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_habits" ON habits;
CREATE POLICY "anon_delete_habits" ON habits FOR DELETE
  TO anon, authenticated USING (true);


CREATE TABLE IF NOT EXISTS habit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT habit_logs_habit_date_unique UNIQUE (habit_id, date)
);

ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_habit_logs" ON habit_logs;
CREATE POLICY "anon_select_habit_logs" ON habit_logs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_habit_logs" ON habit_logs;
CREATE POLICY "anon_insert_habit_logs" ON habit_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_habit_logs" ON habit_logs;
CREATE POLICY "anon_update_habit_logs" ON habit_logs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_habit_logs" ON habit_logs;
CREATE POLICY "anon_delete_habit_logs" ON habit_logs FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs (habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs (date);
