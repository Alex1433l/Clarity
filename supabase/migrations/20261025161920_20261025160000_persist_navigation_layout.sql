/*
# Persist sidebar navigation layout

1. Modified Tables
- `profiles`
- Add `navigation_layout` (jsonb): the authenticated user's visible navigation item order.

2. Data Safety
- The new column has the current navigation order as its default.
- Existing profile data and application records are unchanged.
- Missing items are restored by the application when new navigation entries are added later.

3. Security
- Existing owner-scoped profile RLS policies remain unchanged.
- Only the authenticated owner can read or update this preference.
*/

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS navigation_layout jsonb NOT NULL
    DEFAULT '["today", "tasks", "habits", "mood", "goals", "reports", "links", "learning", "settings"]'::jsonb;
