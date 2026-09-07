import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface GratitudeEntry {
  id: string;
  text: string;
  created_at: string;
}

function getMonthRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export function useGratitude() {
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { start, end } = getMonthRange();
    const { data, error: fetchError } = await supabase
      .from('gratitude_entries')
      .select('*')
      .gte('created_at', start)
      .lt('created_at', end)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setEntries((data ?? []) as GratitudeEntry[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addEntry = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return null;
    const { data, error: insertError } = await supabase
      .from('gratitude_entries')
      .insert({ text: trimmed })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      return null;
    }
    const created = data as GratitudeEntry;
    setEntries((prev) => [created, ...prev]);
    return created;
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    const { error: deleteError } = await supabase
      .from('gratitude_entries')
      .delete()
      .eq('id', id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const updateEntry = useCallback(async (id: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return null;
    const { data, error: updateError } = await supabase
      .from('gratitude_entries')
      .update({ text: trimmed })
      .eq('id', id)
      .select()
      .single();
    if (updateError) {
      setError(updateError.message);
      return null;
    }
    const updated = data as GratitudeEntry;
    setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
    return updated;
  }, []);

  return { entries, loading, error, addEntry, deleteEntry, updateEntry, refetch: fetchEntries };
}
