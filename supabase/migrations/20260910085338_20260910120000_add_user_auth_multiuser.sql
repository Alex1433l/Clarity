/*
# Add multi-user authentication support

## Purpose
Convert the app from single-tenant (everyone shares all data) to multi-user
(each authenticated user sees only their own data).

## Changes

### 1. Add `user_id` column to all 11 data tables (habit_logs uses parent ownership)
Tables: tasks, habits, mood_readings, goals, life_areas, gratitude_entries,
journal_entries, learning_documents, task_categories, link_folders, links

Each gets: `user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE`
Column is nullable so existing rows (with no owner) are preserved but invisible.
New inserts automatically get the authenticated user's ID via DEFAULT.

### 2. Replace all RLS policies
- Drop all existing `anon_*` policies (which used `USING (true)` — open to everyone)
- Create owner-scoped policies: `TO authenticated USING (auth.uid() = user_id)`
- habit_logs: ownership checked via EXISTS subquery on parent habit

### 3. Add indexes on user_id
*/

-- ============================================================
-- Step 1: Add user_id columns (nullable, default auth.uid())
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'user_id') THEN
    ALTER TABLE tasks ADD COLUMN user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'habits' AND column_name = 'user_id') THEN
    ALTER TABLE habits ADD COLUMN user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mood_readings' AND column_name = 'user_id') THEN
    ALTER TABLE mood_readings ADD COLUMN user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'goals' AND column_name = 'user_id') THEN
    ALTER TABLE goals ADD COLUMN user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'life_areas' AND column_name = 'user_id') THEN
    ALTER TABLE life_areas ADD COLUMN user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gratitude_entries' AND column_name = 'user_id') THEN
    ALTER TABLE gratitude_entries ADD COLUMN user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'user_id') THEN
    ALTER TABLE journal_entries ADD COLUMN user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'learning_documents' AND column_name = 'user_id') THEN
    ALTER TABLE learning_documents ADD COLUMN user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_categories' AND column_name = 'user_id') THEN
    ALTER TABLE task_categories ADD COLUMN user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'link_folders' AND column_name = 'user_id') THEN
    ALTER TABLE link_folders ADD COLUMN user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'user_id') THEN
    ALTER TABLE links ADD COLUMN user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================
-- Step 2: Replace RLS policies
-- ============================================================

-- ---- tasks ----
DROP POLICY IF EXISTS "anon_select_tasks" ON tasks;
DROP POLICY IF EXISTS "anon_insert_tasks" ON tasks;
DROP POLICY IF EXISTS "anon_update_tasks" ON tasks;
DROP POLICY IF EXISTS "anon_delete_tasks" ON tasks;
CREATE POLICY "auth_select_tasks" ON tasks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "auth_insert_tasks" ON tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_update_tasks" ON tasks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_delete_tasks" ON tasks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ---- habits ----
DROP POLICY IF EXISTS "anon_select_habits" ON habits;
DROP POLICY IF EXISTS "anon_insert_habits" ON habits;
DROP POLICY IF EXISTS "anon_update_habits" ON habits;
DROP POLICY IF EXISTS "anon_delete_habits" ON habits;
CREATE POLICY "auth_select_habits" ON habits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "auth_insert_habits" ON habits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_update_habits" ON habits FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_delete_habits" ON habits FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ---- habit_logs (ownership via parent habit) ----
DROP POLICY IF EXISTS "anon_select_habit_logs" ON habit_logs;
DROP POLICY IF EXISTS "anon_insert_habit_logs" ON habit_logs;
DROP POLICY IF EXISTS "anon_update_habit_logs" ON habit_logs;
DROP POLICY IF EXISTS "anon_delete_habit_logs" ON habit_logs;
CREATE POLICY "auth_select_habit_logs" ON habit_logs FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_logs.habit_id AND habits.user_id = auth.uid()));
CREATE POLICY "auth_insert_habit_logs" ON habit_logs FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_logs.habit_id AND habits.user_id = auth.uid()));
CREATE POLICY "auth_update_habit_logs" ON habit_logs FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_logs.habit_id AND habits.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_logs.habit_id AND habits.user_id = auth.uid()));
CREATE POLICY "auth_delete_habit_logs" ON habit_logs FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_logs.habit_id AND habits.user_id = auth.uid()));

-- ---- mood_readings ----
DROP POLICY IF EXISTS "anon_select_mood" ON mood_readings;
DROP POLICY IF EXISTS "anon_insert_mood" ON mood_readings;
DROP POLICY IF EXISTS "anon_update_mood" ON mood_readings;
DROP POLICY IF EXISTS "anon_delete_mood" ON mood_readings;
CREATE POLICY "auth_select_mood_readings" ON mood_readings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "auth_insert_mood_readings" ON mood_readings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_update_mood_readings" ON mood_readings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_delete_mood_readings" ON mood_readings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ---- goals ----
DROP POLICY IF EXISTS "anon_select_goals" ON goals;
DROP POLICY IF EXISTS "anon_insert_goals" ON goals;
DROP POLICY IF EXISTS "anon_update_goals" ON goals;
DROP POLICY IF EXISTS "anon_delete_goals" ON goals;
CREATE POLICY "auth_select_goals" ON goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "auth_insert_goals" ON goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_update_goals" ON goals FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_delete_goals" ON goals FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ---- life_areas ----
DROP POLICY IF EXISTS "anon_select_life_areas" ON life_areas;
DROP POLICY IF EXISTS "anon_insert_life_areas" ON life_areas;
DROP POLICY IF EXISTS "anon_update_life_areas" ON life_areas;
DROP POLICY IF EXISTS "anon_delete_life_areas" ON life_areas;
CREATE POLICY "auth_select_life_areas" ON life_areas FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "auth_insert_life_areas" ON life_areas FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_update_life_areas" ON life_areas FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_delete_life_areas" ON life_areas FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ---- gratitude_entries ----
DROP POLICY IF EXISTS "anon_select_gratitude" ON gratitude_entries;
DROP POLICY IF EXISTS "anon_insert_gratitude" ON gratitude_entries;
DROP POLICY IF EXISTS "anon_delete_gratitude" ON gratitude_entries;
CREATE POLICY "auth_select_gratitude" ON gratitude_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "auth_insert_gratitude" ON gratitude_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_update_gratitude" ON gratitude_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_delete_gratitude" ON gratitude_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ---- journal_entries ----
DROP POLICY IF EXISTS "anon_select_journal" ON journal_entries;
DROP POLICY IF EXISTS "anon_insert_journal" ON journal_entries;
DROP POLICY IF EXISTS "anon_update_journal" ON journal_entries;
DROP POLICY IF EXISTS "anon_delete_journal" ON journal_entries;
CREATE POLICY "auth_select_journal_entries" ON journal_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "auth_insert_journal_entries" ON journal_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_update_journal_entries" ON journal_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_delete_journal_entries" ON journal_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ---- learning_documents ----
DROP POLICY IF EXISTS "anon_select_learning_documents" ON learning_documents;
DROP POLICY IF EXISTS "anon_insert_learning_documents" ON learning_documents;
DROP POLICY IF EXISTS "anon_update_learning_documents" ON learning_documents;
DROP POLICY IF EXISTS "anon_delete_learning_documents" ON learning_documents;
CREATE POLICY "auth_select_learning_documents" ON learning_documents FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "auth_insert_learning_documents" ON learning_documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_update_learning_documents" ON learning_documents FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_delete_learning_documents" ON learning_documents FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ---- task_categories ----
DROP POLICY IF EXISTS "anon_select_task_categories" ON task_categories;
DROP POLICY IF EXISTS "anon_insert_task_categories" ON task_categories;
DROP POLICY IF EXISTS "anon_update_task_categories" ON task_categories;
DROP POLICY IF EXISTS "anon_delete_task_categories" ON task_categories;
CREATE POLICY "auth_select_task_categories" ON task_categories FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "auth_insert_task_categories" ON task_categories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_update_task_categories" ON task_categories FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_delete_task_categories" ON task_categories FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ---- link_folders ----
DROP POLICY IF EXISTS "anon_select_link_folders" ON link_folders;
DROP POLICY IF EXISTS "anon_insert_link_folders" ON link_folders;
DROP POLICY IF EXISTS "anon_update_link_folders" ON link_folders;
DROP POLICY IF EXISTS "anon_delete_link_folders" ON link_folders;
CREATE POLICY "auth_select_link_folders" ON link_folders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "auth_insert_link_folders" ON link_folders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_update_link_folders" ON link_folders FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_delete_link_folders" ON link_folders FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ---- links ----
DROP POLICY IF EXISTS "anon_select_links" ON links;
DROP POLICY IF EXISTS "anon_insert_links" ON links;
DROP POLICY IF EXISTS "anon_update_links" ON links;
DROP POLICY IF EXISTS "anon_delete_links" ON links;
CREATE POLICY "auth_select_links" ON links FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "auth_insert_links" ON links FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_update_links" ON links FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_delete_links" ON links FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- Step 3: Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_readings_user_id ON mood_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_life_areas_user_id ON life_areas(user_id);
CREATE INDEX IF NOT EXISTS idx_gratitude_entries_user_id ON gratitude_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_documents_user_id ON learning_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_task_categories_user_id ON task_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_link_folders_user_id ON link_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);