import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { MoodReading } from '@/types';

const todayStr = () => new Date().toISOString().slice(0, 10);

export function useMood() {
  const [readings, setReadings] = useState<MoodReading[]>([]);
  const [today, setToday] = useState<MoodReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('mood_readings')
      .select('*')
      .order('date', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      const all = (data ?? []) as MoodReading[];
      setReadings(all);
      setToday(all.find((r) => r.date === todayStr()) ?? null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const save = useCallback(async (values: { anxiety: number; energy: number; mood: number }) => {
    const date = todayStr();
    if (today) {
      const { data, error: updateError } = await supabase
        .from('mood_readings')
        .update({ anxiety: values.anxiety, energy: values.energy, mood: values.mood })
        .eq('date', date)
        .select()
        .single();
      if (updateError) { setError(updateError.message); return null; }
      const updated = data as MoodReading;
      setToday(updated);
      setReadings((prev) => prev.map((r) => (r.date === date ? updated : r)));
      return updated;
    } else {
      const { data, error: insertError } = await supabase
        .from('mood_readings')
        .insert({ date, ...values })
        .select()
        .single();
      if (insertError) { setError(insertError.message); return null; }
      const created = data as MoodReading;
      setToday(created);
      setReadings((prev) => [...prev, created]);
      return created;
    }
  }, [today]);

  const deleteToday = useCallback(async () => {
    const date = todayStr();
    const { error: deleteError } = await supabase
      .from('mood_readings')
      .delete()
      .eq('date', date);
    if (deleteError) { setError(deleteError.message); return; }
    setToday(null);
    setReadings((prev) => prev.filter((r) => r.date !== date));
  }, []);

  return { readings, today, loading, error, save, deleteToday, refetch: fetchAll };
}
