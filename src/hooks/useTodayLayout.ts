import { useState, useEffect, useCallback } from 'react';

export type SectionId = 'mood' | 'tasks' | 'habits' | 'goals' | 'gratitude' | 'journal' | 'links';

const STORAGE_KEY = 'clarity-today-layout';
const ALL_SECTIONS: SectionId[] = ['mood', 'tasks', 'habits', 'goals', 'gratitude', 'journal', 'links'];

function getInitialLayout(): SectionId[] {
  if (typeof window === 'undefined') return ALL_SECTIONS;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as SectionId[];
      const known = new Set(parsed);
      for (const s of ALL_SECTIONS) {
        if (!known.has(s)) parsed.push(s);
      }
      return parsed;
    } catch {
      return ALL_SECTIONS;
    }
  }
  return ALL_SECTIONS;
}

export function useTodayLayout() {
  const [sections, setSections] = useState<SectionId[]>(getInitialLayout);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
  }, [sections]);

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
