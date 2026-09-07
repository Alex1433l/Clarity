import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Task, TaskInput } from '@/types';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .order('sort_order', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setTasks((data ?? []) as Task[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(async (input: TaskInput) => {
    const { data, error: insertError } = await supabase
      .from('tasks')
      .insert({
        title: input.title,
        priority: input.priority,
        date: input.date,
        time: input.time ?? null,
        category: input.category ?? null,
        sort_order: input.sort_order ?? tasks.length,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      return null;
    }
    const newTask = data as Task;
    setTasks((prev) => [...prev, newTask]);
    return newTask;
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<TaskInput>) => {
    const { data, error: updateError } = await supabase
      .from('tasks')
      .update({
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.priority !== undefined && { priority: updates.priority }),
        ...(updates.date !== undefined && { date: updates.date }),
        ...(updates.time !== undefined && { time: updates.time }),
        ...(updates.category !== undefined && { category: updates.category }),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      setError(updateError.message);
      return null;
    }
    const updated = data as Task;
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }, []);

  const toggleTask = useCallback(async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newDone = !task.done;

    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: newDone } : t)));

    const { error: updateError } = await supabase
      .from('tasks')
      .update({ done: newDone })
      .eq('id', id);

    if (updateError) {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !newDone } : t)));
      setError(updateError.message);
    }
  }, [tasks]);

  const deleteTask = useCallback(async (id: string) => {
    const prev = tasks;
    setTasks((prevTasks) => prevTasks.filter((t) => t.id !== id));

    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (deleteError) {
      setTasks(prev);
      setError(deleteError.message);
    }
  }, [tasks]);

  const reorderTasks = useCallback(async (reordered: Task[]) => {
    const prev = tasks;
    setTasks(reordered);
    const updates = reordered.map((t, i) => ({ id: t.id, sort_order: i }));
    const { error: updateError } = await supabase
      .from('tasks')
      .upsert(updates, { onConflict: 'id' });
    if (updateError) {
      setTasks(prev);
      setError(updateError.message);
    }
  }, [tasks]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    reorderTasks,
    refetch: fetchTasks,
  };
}
