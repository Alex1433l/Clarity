/*
# Create gratitude_entries table (single-tenant, no auth)

1. New Tables
- `gratitude_entries`
  - `id` (uuid, primary key)
  - `text` (text, not null) — the gratitude message written by the user
  - `created_at` (timestamptz, default now()) — used to filter by current month
2. Security
- Enable RLS on `gratitude_entries`.
- Allow anon + authenticated full CRUD because the data is intentionally shared/public (no sign-in app).
3. Notes
- Entries are displayed until the end of the current month, then naturally filtered out by date in the frontend.
- Users can create and delete entries.
*/

CREATE TABLE IF NOT EXISTS gratitude_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gratitude_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_gratitude" ON gratitude_entries;
CREATE POLICY "anon_select_gratitude" ON gratitude_entries FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_gratitude" ON gratitude_entries;
CREATE POLICY "anon_insert_gratitude" ON gratitude_entries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_gratitude" ON gratitude_entries;
CREATE POLICY "anon_delete_gratitude" ON gratitude_entries FOR DELETE
  TO anon, authenticated USING (true);
