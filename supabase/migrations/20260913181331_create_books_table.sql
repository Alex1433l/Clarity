/*
# Create books table and storage bucket for EPUB library

1. New Tables
- `books`
  - `id` (uuid, primary key)
  - `title` (text, not null) — book title extracted from EPUB metadata
  - `author` (text, nullable) — author from EPUB metadata
  - `cover_url` (text, nullable) — cover image URL from Supabase Storage
  - `file_path` (text, not null) — storage path to the EPUB file
  - `file_size` (bigint, nullable) — file size in bytes
  - `last_read_chapter` (text, nullable) — bookmark for last read position
  - `sort_order` (int, default 0) — manual ordering
  - `user_id` (uuid, not null, defaults to auth.uid()) — owner
  - `created_at` (timestamptz, default now())

2. Storage
- Create private bucket "books" for EPUB files
- Policies: authenticated users can CRUD their own files under user_id/ prefix

3. Security
- RLS enabled on books
- Owner-scoped CRUD: each authenticated user sees only their own books
- Storage policies scoped to authenticated users for their own folder
*/

CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text,
  cover_url text,
  file_path text NOT NULL,
  file_size bigint,
  last_read_chapter text,
  sort_order int NOT NULL DEFAULT 0,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_books" ON books;
CREATE POLICY "select_own_books" ON books
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_books" ON books;
CREATE POLICY "insert_own_books" ON books
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_books" ON books;
CREATE POLICY "update_own_books" ON books
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_books" ON books;
CREATE POLICY "delete_own_books" ON books
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Storage bucket for EPUB files
INSERT INTO storage.buckets (id, name, public)
VALUES ('books', 'books', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: users manage their own files
DROP POLICY IF EXISTS "users_upload_own_books" ON storage.objects;
CREATE POLICY "users_upload_own_books" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'books' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "users_read_own_books" ON storage.objects;
CREATE POLICY "users_read_own_books" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'books' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "users_delete_own_books" ON storage.objects;
CREATE POLICY "users_delete_own_books" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'books' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "users_update_own_books" ON storage.objects;
CREATE POLICY "users_update_own_books" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'books' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'books' AND (storage.foldername(name))[1] = auth.uid()::text);
