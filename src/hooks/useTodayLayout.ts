import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export type SectionId = 'mood' | 'tasks' | 'habits' | 'goals' | 'gratitude' | 'journal' | 'links';

const STORAGE_KEY = 'clarity-today-layout';
const ALL_SECTIONS: SectionId[] = ['mood', 'tasks', 'habits', 'goals', 'gratitude', 'journal', 'links'];

function normalizeLayout(value: unknown): SectionId[] | null {
  if (!Array.isArray(value)) return null;
  const valid = value.filter((section): section is SectionId => ALL_SECTIONS.includes(section));
  const unique = [...new Set(valid)];
  for (const section of ALL_SECTIONS) if (!unique.includes(section)) unique.push(section);
  return unique;
}

function isDefaultLayout(layout: SectionId[]) {
  return layout.every((section, index) => section === ALL_SECTIONS[index]);
}

function getInitialLayout(): SectionId[] {
  if (typeof window === 'undefined') return ALL_SECTIONS;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as SectionId[];
      const valid = parsed.filter((section): section is SectionId => ALL_SECTIONS.includes(section));
      const unique = [...new Set(valid)];
      for (const section of ALL_SECTIONS) {
        if (!unique.includes(section)) unique.push(section);
      }
      return unique;
    } catch {
      return ALL_SECTIONS;
    }
  }
  return ALL_SECTIONS;
}

export function useTodayLayout() {
  const { user } = useAuth();
  const [sections, setSections] = useState<SectionId[]>(getInitialLayout);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoadedUserId(null);
      return;
    }

    let active = true;
    supabase.from('profiles').select('today_layout').eq('user_id', user.id).maybeSingle().then(({ data }) => {
      if (!active) return;
      const saved = normalizeLayout(data?.today_layout);
      const localLayout = getInitialLayout();
      const layout = saved && isDefaultLayout(saved) && !isDefaultLayout(localLayout) ? localLayout : saved;
      if (layout) setSections(layout);
      setLoadedUserId(user.id);
    });

    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
    if (user && loadedUserId === user.id) void supabase.from('profiles').update({ today_layout: sections, updated_at: new Date().toISOString() }).eq('user_id', user.id);
  }, [loadedUserId, sections, user]);

  const removeSection = useCallback((id: SectionId) => {
    setSections((prev) => prev.filter((s) => s !== id));
  }, []);

  const addSection = useCallback((id: SectionId) => {
    setSections((prev) => {
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  }, []);

  const reorderSections = useCallback((reordered: SectionId[]) => {
    setSections(reordered);
  }, []);

  const hiddenSections = ALL_SECTIONS.filter((s) => !sections.includes(s));

  return { sections, hiddenSections, removeSection, addSection, reorderSections };
}
