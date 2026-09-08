import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { TaskCategory, TaskCategoryInput } from '@/types';

export function useTaskCategories() {
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('task_categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (err) setError(err.message);
    else setCategories((data ?? []) as TaskCategory[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const createCategory = useCallback(async (input: TaskCategoryInput) => {
    const { data, error: err } = await supabase
      .from('task_categories')
      .insert({ name: input.name.trim(), color: input.color ?? null, sort_order: input.sort_order ?? 0 })
      .select()
      .single();
    if (err) { setError(err.message); return null; }
    const created = data as TaskCategory;
    setCategories((prev) => [...prev, created]);
    return created;
  }, []);

  const updateCategory = useCallback(async (id: string, input: Partial<TaskCategoryInput>) => {
    const { data, error: err } = await supabase
      .from('task_categories')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (err) { setError(err.message); return; }
    const updated = data as TaskCategory;
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    const prev = categories;
    setCategories((prevC) => prevC.filter((c) => c.id !== id));
    const { error: err } = await supabase.from('task_categories').delete().eq('id', id);
    if (err) { setCategories(prev); setError(err.message); }
  }, [categories]);

  return { categories, loading, error, createCategory, updateCategory, deleteCategory, refetch: fetchCategories };
}
