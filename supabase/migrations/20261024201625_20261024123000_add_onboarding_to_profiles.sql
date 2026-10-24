/*
# Track onboarding completion per user

1. Modified Tables
- `profiles`
- Add `onboarding_completed` (boolean, not null, default false) to record whether this account has completed or dismissed the guided introduction.

2. Security
- Keep the existing owner-scoped RLS policies unchanged.
- The existing authenticated profile read and update privileges cover this per-user setting.

3. Important Notes
- Existing accounts start with the introduction available once.
- The value belongs to the authenticated user's profile and is not shared between accounts.
- The column is additive and does not remove or alter existing profile data.
*/

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;
