-- Add sort_order to tasks, habits, and goals for drag-to-reorder
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sort_order int4 NOT NULL DEFAULT 0;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS sort_order int4 NOT NULL DEFAULT 0;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS sort_order int4 NOT NULL DEFAULT 0;

-- Backfill existing rows with incrementing order based on created_at
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 AS new_order FROM tasks
)
UPDATE tasks SET sort_order = ranked.new_order FROM ranked WHERE tasks.id = ranked.id;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 AS new_order FROM habits
)
UPDATE habits SET sort_order = ranked.new_order FROM ranked WHERE habits.id = ranked.id;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 AS new_order FROM goals
)
UPDATE goals SET sort_order = ranked.new_order FROM ranked WHERE goals.id = ranked.id;
