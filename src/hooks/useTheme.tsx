import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

type Theme = 'light' | 'dark';
export type ColorScheme = 'teal' | 'orange' | 'gray';

interface ThemeContextValue {
  theme: Theme;
  colorScheme: ColorScheme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  setColorScheme: (c: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_KEY = 'clarity-theme';
const COLOR_KEY = 'clarity-color';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(THEME_KEY) as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialColor(): ColorScheme {
  if (typeof window === 'undefined') return 'teal';
  const stored = localStorage.getItem(COLOR_KEY) as ColorScheme | null;
  if (stored === 'teal' || stored === 'orange' || stored === 'gray') return stored;
  return 'teal';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(getInitialColor);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoadedUserId(null);
      return;
    }

    let active = true;
    supabase.from('profiles').select('theme, color_scheme').eq('user_id', user.id).maybeSingle().then(({ data }) => {
      if (!active) return;
      if (data?.theme === 'light' || data?.theme === 'dark') setThemeState(data.theme);
      if (data?.color_scheme === 'teal' || data?.color_scheme === 'orange' || data?.color_scheme === 'gray') setColorSchemeState(data.color_scheme);
      setLoadedUserId(user.id);
    });

    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem(THEME_KEY, theme);
    if (user && loadedUserId === user.id) void supabase.from('profiles').update({ theme, updated_at: new Date().toISOString() }).eq('user_id', user.id);
  }, [loadedUserId, theme, user]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('scheme-teal', 'scheme-orange', 'scheme-gray');
    root.classList.add(`scheme-${colorScheme}`);
    localStorage.setItem(COLOR_KEY, colorScheme);
    if (user && loadedUserId === user.id) void supabase.from('profiles').update({ color_scheme: colorScheme, updated_at: new Date().toISOString() }).eq('user_id', user.id);
  }, [colorScheme, loadedUserId, user]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggleTheme = () => setThemeState((p) => (p === 'light' ? 'dark' : 'light'));
  const setColorScheme = (c: ColorScheme) => setColorSchemeState(c);

  return (
    <ThemeContext.Provider value={{ theme, colorScheme, toggleTheme, setTheme, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
