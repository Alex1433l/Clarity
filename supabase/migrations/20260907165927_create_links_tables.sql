/*
# Create link_folders and links tables (single-tenant, no auth)

1. New Tables
- `link_folders`: folders for organizing links
  - `id` (uuid, primary key)
  - `name` (text, not null)
  - `sort_order` (int, default 0)
  - `created_at` (timestamp)
- `links`: saved links/shortcuts
  - `id` (uuid, primary key)
  - `name` (text, not null)
  - `url` (text, not null)
  - `folder_id` (uuid, nullable, references link_folders, cascade on delete)
  - `sort_order` (int, default 0)
  - `created_at` (timestamp)

2. Security
- Enable RLS on both tables.
- Allow anon + authenticated CRUD on both (single-tenant, no sign-in).
*/

CREATE TABLE IF NOT EXISTS link_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order int4 NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE link_folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_link_folders" ON link_folders;
CREATE POLICY "anon_select_link_folders" ON link_folders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_link_folders" ON link_folders;
CREATE POLICY "anon_insert_link_folders" ON link_folders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_link_folders" ON link_folders;
CREATE POLICY "anon_update_link_folders" ON link_folders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_link_folders" ON link_folders;
CREATE POLICY "anon_delete_link_folders" ON link_folders FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  folder_id uuid REFERENCES link_folders(id) ON DELETE CASCADE,
  sort_order int4 NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_links" ON links;
CREATE POLICY "anon_select_links" ON links FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_links" ON links;
CREATE POLICY "anon_insert_links" ON links FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_links" ON links;
CREATE POLICY "anon_update_links" ON links FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_links" ON links;
CREATE POLICY "anon_delete_links" ON links FOR DELETE
  TO anon, authenticated USING (true);
