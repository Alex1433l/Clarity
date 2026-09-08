/*
# Create learning_documents table (single-tenant, no auth)

1. New Tables
- `learning_documents`: hierarchical documents for the "Aprendizado" section
  - `id` (uuid, primary key)
  - `title` (text, not null)
  - `content` (text, nullable, stores HTML rich text content)
  - `parent_id` (uuid, nullable, self-reference for nesting, cascade on delete)
  - `sort_order` (int, default 0)
  - `created_at` (timestamp)
  - `updated_at` (timestamp, auto-updated on modification)

2. Security
- Enable RLS on `learning_documents`.
- Allow anon + authenticated CRUD (single-tenant, no sign-in).
*/

CREATE TABLE IF NOT EXISTS learning_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  parent_id uuid REFERENCES learning_documents(id) ON DELETE CASCADE,
  sort_order int4 NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE learning_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_learning_documents" ON learning_documents;
CREATE POLICY "anon_select_learning_documents" ON learning_documents FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_learning_documents" ON learning_documents;
CREATE POLICY "anon_insert_learning_documents" ON learning_documents FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_learning_documents" ON learning_documents;
CREATE POLICY "anon_update_learning_documents" ON learning_documents FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_learning_documents" ON learning_documents;
CREATE POLICY "anon_delete_learning_documents" ON learning_documents FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_learning_documents_parent_id ON learning_documents(parent_id);
