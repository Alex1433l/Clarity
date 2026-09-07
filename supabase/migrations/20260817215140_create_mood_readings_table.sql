/*
# Create mood_readings table (single-tenant, no auth)

1. New Tables
- mood_readings
  - id (uuid, primary key)
  - date (date, not null, unique) — one reading per day
  - anxiety (int, 1-5, not null)
  - energy (int, 1-5, not null)
  - mood (int, 1-5, not null)
  - created_at (timestamptz, default now())

2. Security
- Enable RLS. Single-tenant no-auth: anon + authenticated full CRUD.
*/

CREATE TABLE IF NOT EXISTS mood_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  anxiety int NOT NULL DEFAULT 3 CHECK (anxiety BETWEEN 1 AND 5),
  energy int NOT NULL DEFAULT 3 CHECK (energy BETWEEN 1 AND 5),
  mood int NOT NULL DEFAULT 3 CHECK (mood BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE mood_readings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_mood" ON mood_readings;
CREATE POLICY "anon_select_mood" ON mood_readings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_mood" ON mood_readings;
CREATE POLICY "anon_insert_mood" ON mood_readings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_mood" ON mood_readings;
CREATE POLICY "anon_update_mood" ON mood_readings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_mood" ON mood_readings;
CREATE POLICY "anon_delete_mood" ON mood_readings FOR DELETE
  TO anon, authenticated USING (true);
