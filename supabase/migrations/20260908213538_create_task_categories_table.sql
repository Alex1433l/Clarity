/*
# Create task_categories table (single-tenant, no auth)

1. New Tables
- `task_categories`: permanent categories for tasks
  - `id` (uuid, primary key)
  - `name` (text, not null, unique)
  - `color` (text, nullable, for badge color)
  - `sort_order` (int, default 0)
  - `created_at` (timestamp)

2. Security
- Enable RLS on `task_categories`.
- Allow anon + authenticated CRUD (single-tenant, no sign-in).
*/

CREATE TABLE IF NOT EXISTS task_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  color text,
  sort_order int4 NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE task_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_task_categories" ON task_categories;
CREATE POLICY "anon_select_task_categories" ON task_categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_task_categories" ON task_categories;
CREATE POLICY "anon_insert_task_categories" ON task_categories FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_task_categories" ON task_categories;
CREATE POLICY "anon_update_task_categories" ON task_categories FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_task_categories" ON task_categories;
CREATE POLICY "anon_delete_task_categories" ON task_categories FOR DELETE
  TO anon, authenticated USING (true);
