import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Habit, HabitInput, HabitLog, HabitWithStats } from '@/types';

const todayStr = () => new Date().toISOString().slice(0, 10);

function computeStreak(logs: HabitLog[]): number {
  if (logs.length === 0) return 0;
  const dates = new Set(logs.map((l) => l.date));
  let streak = 0;
  const d = new Date();
  // If today not done, start from yesterday so streak doesn't break before end of day
  if (!dates.has(d.toISOString().slice(0, 10))) {
    d.setDate(d.getDate() - 1);
  }
  while (dates.has(d.toISOString().slice(0, 10))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function computeCompletionRate(logs: HabitLog[]): number {
  if (logs.length === 0) return 0;
  const dates = new Set(logs.map((l) => l.date));
  const days = 30;
  let count = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (dates.has(d.toISOString().slice(0, 10))) count++;
  }
  return Math.round((count / days) * 100);
}

export function useHabits() {
  const [habits, setHabits] = useState<HabitWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: habitData, error: habitError } = await supabase
      .from('habits')
      .select('*')
      .order('sort_order', { ascending: true });

    if (habitError) {
      setError(habitError.message);
      setLoading(false);
      return;
    }

    const rawHabits = (habitData ?? []) as Habit[];
    if (rawHabits.length === 0) {
      setHabits([]);
      setLoading(false);
      return;
    }

    const { data: logData, error: logError } = await supabase
      .from('habit_logs')
      .select('*');

    if (logError) {
      setError(logError.message);
      setLoading(false);
      return;
    }

    const allLogs = (logData ?? []) as HabitLog[];
    const today = todayStr();

    const habitsWithStats: HabitWithStats[] = rawHabits.map((h) => {
      const habitLogs = allLogs.filter((l) => l.habit_id === h.id);
      return {
        ...h,
        doneToday: habitLogs.some((l) => l.date === today),
        streak: computeStreak(habitLogs),
        completionRate: computeCompletionRate(habitLogs),
        totalCheckins: habitLogs.length,
      };
    });

    setHabits(habitsWithStats);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const createHabit = useCallback(async (input: HabitInput) => {
    const { data, error: insertError } = await supabase
      .from('habits')
      .insert({
        name: input.name,
        description: input.description ?? null,
        frequency: input.frequency,
        days_of_week: input.days_of_week ?? null,
        color: input.color ?? null,
        sort_order: input.sort_order ?? habits.length,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      return null;
    }
    const newHabit = data as Habit;
    const newWithStats: HabitWithStats = {
      ...newHabit,
      doneToday: false,
      streak: 0,
      completionRate: 0,
      totalCheckins: 0,
    };
    setHabits((prev) => [...prev, newWithStats]);
    return newWithStats;
  }, []);

  const updateHabit = useCallback(async (id: string, updates: Partial<HabitInput>) => {
    const { data, error: updateError } = await supabase
      .from('habits')
      .update({
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.frequency !== undefined && { frequency: updates.frequency }),
        ...(updates.days_of_week !== undefined && { days_of_week: updates.days_of_week }),
        ...(updates.color !== undefined && { color: updates.color }),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      setError(updateError.message);
      return null;
    }
    const updated = data as Habit;
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updated } : h))
    );
    return updated;
  }, []);

  const deleteHabit = useCallback(async (id: string) => {
    const prev = habits;
    setHabits((prevHabits) => prevHabits.filter((h) => h.id !== id));

    const { error: deleteError } = await supabase
      .from('habits')
      .delete()
      .eq('id', id);

    if (deleteError) {
      setHabits(prev);
      setError(deleteError.message);
    }
  }, [habits]);

  const reorderHabits = useCallback(async (reordered: HabitWithStats[]) => {
    const prev = habits;
    setHabits(reordered);
    const updates = reordered.map((h, i) => ({ id: h.id, sort_order: i }));
    const { error: updateError } = await supabase
      .from('habits')
      .upsert(updates, { onConflict: 'id' });
    if (updateError) {
      setHabits(prev);
      setError(updateError.message);
    }
  }, [habits]);

  const toggleToday = useCallback(async (id: string) => {
    const today = todayStr();
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    if (habit.doneToday) {
      // Check out — remove today's log
      setHabits((prev) =>
        prev.map((h) => (h.id === id ? { ...h, doneToday: false } : h))
      );
      const { error: deleteError } = await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', id)
        .eq('date', today);

      if (deleteError) {
        setHabits((prev) =>
          prev.map((h) => (h.id === id ? { ...h, doneToday: true } : h))
        );
        setError(deleteError.message);
        return;
      }
      // Recompute streak and rate
      const { data: remainingLogs } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('habit_id', id);
      const logs = (remainingLogs ?? []) as HabitLog[];
      setHabits((prev) =>
        prev.map((h) =>
          h.id === id
            ? { ...h, doneToday: false, streak: computeStreak(logs), completionRate: computeCompletionRate(logs), totalCheckins: logs.length }
            : h
        )
      );
    } else {
      // Check in — add today's log
      setHabits((prev) =>
        prev.map((h) => (h.id === id ? { ...h, doneToday: true } : h))
      );
      const { error: insertError } = await supabase
        .from('habit_logs')
        .insert({ habit_id: id, date: today });

      if (insertError) {
        setHabits((prev) =>
          prev.map((h) => (h.id === id ? { ...h, doneToday: false } : h))
        );
        setError(insertError.message);
        return;
      }
      // Recompute streak and rate
      const { data: allLogs } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('habit_id', id);
      const logs = (allLogs ?? []) as HabitLog[];
      setHabits((prev) =>
        prev.map((h) =>
          h.id === id
            ? { ...h, doneToday: true, streak: computeStreak(logs), completionRate: computeCompletionRate(logs), totalCheckins: logs.length }
            : h
        )
      );
    }
  }, [habits]);

  const getHabitLogs = useCallback(async (habitId: string): Promise<HabitLog[]> => {
    const { data, error: logError } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('habit_id', habitId)
      .order('date', { ascending: true });

    if (logError) {
      setError(logError.message);
      return [];
    }
    return (data ?? []) as HabitLog[];
  }, []);

  return {
    habits,
    loading,
    error,
    createHabit,
    updateHabit,
    deleteHabit,
    reorderHabits,
    toggleToday,
    getHabitLogs,
    refetch: fetchHabits,
  };
}
