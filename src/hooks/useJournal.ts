import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface JournalEntry {
  id: string;
  text: string;
  mood: string | null;
  date: string;
  created_at?: string;
}

export type JournalInput = {
  text: string;
  mood?: string | null;
  date?: string;
};

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('journal_entries')
      .select('*')
      .order('date', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setEntries((data ?? []) as JournalEntry[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const createEntry = useCallback(async (input: JournalInput) => {
    const trimmed = input.text.trim();
    if (!trimmed) return null;
    const { data, error: insertError } = await supabase
      .from('journal_entries')
      .insert({
        text: trimmed,
        mood: input.mood ?? null,
        date: input.date ?? new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      return null;
    }
    const created = data as JournalEntry;
    setEntries((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateEntry = useCallback(async (id: string, updates: Partial<JournalInput>) => {
    const { data, error: updateError } = await supabase
      .from('journal_entries')
      .update({
        ...(updates.text !== undefined && { text: updates.text.trim() }),
        ...(updates.mood !== undefined && { mood: updates.mood }),
        ...(updates.date !== undefined && { date: updates.date }),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      setError(updateError.message);
      return null;
    }
    const updated = data as JournalEntry;
    setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
    return updated;
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    const prev = entries;
    setEntries((prevEntries) => prevEntries.filter((e) => e.id !== id));
    const { error: deleteError } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id);

    if (deleteError) {
      setEntries(prev);
      setError(deleteError.message);
    }
  }, [entries]);

  return { entries, loading, error, createEntry, updateEntry, deleteEntry, refetch: fetchEntries };
}
