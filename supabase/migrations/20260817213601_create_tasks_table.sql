/*
# Create tasks table (single-tenant, no auth)

1. New Tables
- `tasks`
  - `id` (uuid, primary key, auto-generated)
  - `title` (text, not null) — the task name
  - `done` (boolean, default false) — whether the task is completed
  - `priority` (text, default 'medium') — 'low', 'medium', or 'high'
  - `date` (date, not null) — the date the task is scheduled for (ISO format YYYY-MM-DD)
  - `category` (text, nullable) — optional category label
  - `created_at` (timestamptz, default now()) — record creation timestamp

2. Security
- Enable RLS on `tasks`.
- Single-tenant app with no sign-in: allow anon + authenticated full CRUD.
- `USING (true)` is acceptable because the data is intentionally shared/public (no auth).

3. Indexes
- Index on `date` for efficient date-based queries (the app filters by today's date frequently).
- Index on `done` for filtering pending vs completed tasks.
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  done boolean NOT NULL DEFAULT false,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  date date NOT NULL DEFAULT CURRENT_DATE,
  category text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_tasks" ON tasks;
CREATE POLICY "anon_select_tasks" ON tasks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_tasks" ON tasks;
CREATE POLICY "anon_insert_tasks" ON tasks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_tasks" ON tasks;
CREATE POLICY "anon_update_tasks" ON tasks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_tasks" ON tasks;
CREATE POLICY "anon_delete_tasks" ON tasks FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks (date);
CREATE INDEX IF NOT EXISTS idx_tasks_done ON tasks (done);
