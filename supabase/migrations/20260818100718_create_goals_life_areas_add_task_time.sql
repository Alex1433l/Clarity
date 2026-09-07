/*
# Create goals + life_areas tables, add time column to tasks

1. New Tables
- life_areas: user-created life areas (Saúde, Trabalho, Estudos, etc.)
- goals: goals with life_area reference, deadline, progress, time

2. Alter existing
- tasks: add optional time column (HH:MM format)
*/

CREATE TABLE IF NOT EXISTS life_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text DEFAULT 'brand',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE life_areas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_life_areas" ON life_areas;
CREATE POLICY "anon_select_life_areas" ON life_areas FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_life_areas" ON life_areas;
CREATE POLICY "anon_insert_life_areas" ON life_areas FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_life_areas" ON life_areas;
CREATE POLICY "anon_update_life_areas" ON life_areas FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_life_areas" ON life_areas;
CREATE POLICY "anon_delete_life_areas" ON life_areas FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  life_area_id uuid REFERENCES life_areas(id) ON DELETE SET NULL,
  deadline date NOT NULL,
  progress int NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_goals" ON goals;
CREATE POLICY "anon_select_goals" ON goals FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_goals" ON goals;
CREATE POLICY "anon_insert_goals" ON goals FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_goals" ON goals;
CREATE POLICY "anon_update_goals" ON goals FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_goals" ON goals;
CREATE POLICY "anon_delete_goals" ON goals FOR DELETE
  TO anon, authenticated USING (true);

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS time text;
