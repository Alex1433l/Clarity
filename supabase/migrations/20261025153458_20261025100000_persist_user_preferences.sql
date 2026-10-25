/*
# Persist user preferences in profiles

1. Modified Tables
- `profiles`
- Add `theme` (text): the user's light or dark appearance choice.
- Add `color_scheme` (text): the user's selected brand color.
- Add `language` (text): the user's selected interface language.
- Add `today_layout` (jsonb): the user's order and visibility of Today sections.

2. Data Safety
- New columns use defaults and do not change or remove existing profile data.
- Existing users receive the current app defaults until they save or load another preference.

3. Security
- Existing owner-scoped profile RLS remains in place.
- Authenticated users can only read and update preferences on their own profile.
*/

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS theme text NOT NULL DEFAULT 'light'
    CHECK (theme IN ('light', 'dark'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS color_scheme text NOT NULL DEFAULT 'teal'
    CHECK (color_scheme IN ('teal', 'orange', 'gray'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'pt'
    CHECK (language IN ('pt', 'es', 'en'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS today_layout jsonb NOT NULL
    DEFAULT '["mood", "tasks", "habits", "goals", "gratitude", "journal", "links"]'::jsonb;
