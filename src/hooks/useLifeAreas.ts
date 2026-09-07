import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { LifeArea, LifeAreaInput } from '@/types';

export function useLifeAreas() {
  const [areas, setAreas] = useState<LifeArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAreas = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('life_areas')
      .select('*')
      .order('created_at', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setAreas((data ?? []) as LifeArea[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  const createArea = useCallback(async (input: LifeAreaInput) => {
    const { data, error: insertError } = await supabase
      .from('life_areas')
      .insert({ name: input.name, color: input.color ?? 'brand' })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      return null;
    }
    const newArea = data as LifeArea;
    setAreas((prev) => [...prev, newArea]);
    return newArea;
  }, []);

  const updateArea = useCallback(async (id: string, updates: Partial<LifeAreaInput>) => {
    const { data, error: updateError } = await supabase
      .from('life_areas')
      .update({
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.color !== undefined && { color: updates.color }),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      setError(updateError.message);
      return null;
    }
    const updated = data as LifeArea;
    setAreas((prev) => prev.map((a) => (a.id === id ? updated : a)));
    return updated;
  }, []);

  const deleteArea = useCallback(async (id: string) => {
    const prev = areas;
    setAreas((prevAreas) => prevAreas.filter((a) => a.id !== id));
    const { error: deleteError } = await supabase
      .from('life_areas')
      .delete()
      .eq('id', id);

    if (deleteError) {
      setAreas(prev);
      setError(deleteError.message);
    }
  }, [areas]);

  return { areas, loading, error, createArea, updateArea, deleteArea, refetch: fetchAreas };
}
