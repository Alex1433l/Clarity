/*
# Add user profiles and private avatars

1. New Tables
- `profiles`
- `user_id` (uuid, primary key): the authenticated account owner.
- `username` (text, unique case-insensitively): the name shown in the app.
- `avatar_path` (text, nullable): the private Storage object path for the profile image.
- `created_at` and `updated_at` (timestamptz): profile timestamps.

2. Storage
- Create the private `avatars` bucket.
- Limit avatar uploads to JPEG, PNG, and WebP files up to 5 MB.
- Store each image under the owning user's UUID folder.

3. Security
- Enable RLS on `profiles`.
- Authenticated users can only read and edit their own profile.
- Grant only the profile CRUD operations needed by the signed-in app.
- Add Storage policies so users can only read, upload, replace, and delete files inside their own avatar folder.
- Anonymous users cannot access profiles or avatars.

4. Important Notes
- Existing accounts receive a profile the first time the app saves their display name.
- The avatar path is stored rather than a public URL; the app generates a short-lived signed URL when displaying it.
*/

CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL CHECK (char_length(trim(username)) BETWEEN 2 AND 40),
  avatar_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_key
  ON public.profiles (lower(trim(username)));

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
CREATE POLICY "select_own_profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_profile" ON public.profiles;
CREATE POLICY "insert_own_profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_profile" ON public.profiles;
CREATE POLICY "delete_own_profile" ON public.profiles
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']::text[];

DROP POLICY IF EXISTS "select_own_avatar" ON storage.objects;
CREATE POLICY "select_own_avatar" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "insert_own_avatar" ON storage.objects;
CREATE POLICY "insert_own_avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "update_own_avatar" ON storage.objects;
CREATE POLICY "update_own_avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "delete_own_avatar" ON storage.objects;
CREATE POLICY "delete_own_avatar" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
