import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Goal, GoalInput } from '@/types';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('goals')
      .select('*')
      .order('sort_order', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setGoals((data ?? []) as Goal[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const createGoal = useCallback(async (input: GoalInput) => {
    const { data, error: insertError } = await supabase
      .from('goals')
      .insert({
        title: input.title,
        description: input.description ?? null,
        life_area_id: input.life_area_id ?? null,
        deadline: input.deadline,
        progress: input.progress ?? 0,
        sort_order: input.sort_order ?? goals.length,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      return null;
    }
    const newGoal = data as Goal;
    setGoals((prev) => [...prev, newGoal]);
    return newGoal;
  }, []);

  const updateGoal = useCallback(async (id: string, updates: Partial<GoalInput>) => {
    const { data, error: updateError } = await supabase
      .from('goals')
      .update({
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.life_area_id !== undefined && { life_area_id: updates.life_area_id }),
        ...(updates.deadline !== undefined && { deadline: updates.deadline }),
        ...(updates.progress !== undefined && { progress: updates.progress }),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      setError(updateError.message);
      return null;
    }
    const updated = data as Goal;
    setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    return updated;
  }, []);

  const deleteGoal = useCallback(async (id: string) => {
    const prev = goals;
    setGoals((prevGoals) => prevGoals.filter((g) => g.id !== id));
    const { error: deleteError } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (deleteError) {
      setGoals(prev);
      setError(deleteError.message);
    }
  }, [goals]);

  const reorderGoals = useCallback(async (reordered: Goal[]) => {
    const prev = goals;
    setGoals(reordered);
    const updates = reordered.map((g, i) => ({ id: g.id, sort_order: i }));
    const { error: updateError } = await supabase
      .from('goals')
      .upsert(updates, { onConflict: 'id' });
    if (updateError) {
      setGoals(prev);
      setError(updateError.message);
    }
  }, [goals]);

  return { goals, loading, error, createGoal, updateGoal, deleteGoal, reorderGoals, refetch: fetchGoals };
}
