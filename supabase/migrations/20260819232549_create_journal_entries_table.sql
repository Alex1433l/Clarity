/*
# Create journal_entries table (single-tenant, no auth)

1. New Tables
- `journal_entries`
  - `id` (uuid, primary key)
  - `text` (text, not null) — the journal entry content
  - `mood` (text, nullable) — optional mood label for the entry
  - `date` (date, not null) — the date of the entry (defaults to today)
  - `created_at` (timestamptz, default now())
2. Security
- Enable RLS on `journal_entries`.
- Allow anon + authenticated full CRUD (single-tenant, no sign-in).
*/

CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  mood text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_journal" ON journal_entries;
CREATE POLICY "anon_select_journal" ON journal_entries FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_journal" ON journal_entries;
CREATE POLICY "anon_insert_journal" ON journal_entries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_journal" ON journal_entries;
CREATE POLICY "anon_update_journal" ON journal_entries FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_journal" ON journal_entries;
CREATE POLICY "anon_delete_journal" ON journal_entries FOR DELETE
  TO anon, authenticated USING (true);
