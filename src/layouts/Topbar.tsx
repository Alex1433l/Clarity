import { useState } from 'react';
import { Menu, Moon, Sun, Globe, Palette, PanelLeftOpen } from 'lucide-react';
import { useTheme, type ColorScheme } from '@/hooks/useTheme';
import { useLanguage, type Language } from '@/hooks/useLanguage';
import MusicPlayer from '@/layouts/MusicPlayer';
import { cn } from '@/utils';

interface TopbarProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
}

export default function Topbar({ onMenuClick, sidebarCollapsed }: TopbarProps) {
  const { theme, toggleTheme, colorScheme, setColorScheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);

  const languages: { value: Language; label: string; flag: string }[] = [
    { value: 'pt', label: 'Português', flag: '🇧🇷' },
    { value: 'es', label: 'Español', flag: '🇪🇸' },
    { value: 'en', label: 'English', flag: '🇬🇧' },
  ];

  const colorSchemes: { value: ColorScheme; label: string; sub: string; color: string; dot: string }[] = [
    { value: 'teal',   label: 'GAMER',  sub: 'Neon & Dark',    color: '#00a889', dot: 'linear-gradient(135deg,#00dcc0,#006b57)' },
    { value: 'orange', label: 'OUSADO', sub: 'Bold & Warm',    color: '#f4690a', dot: 'linear-gradient(135deg,#ffaa2d,#dc5200)' },
    { value: 'gray',   label: 'CLEAN',  sub: 'Ultra-minimal',  color: '#46464e', dot: 'linear-gradient(135deg,#c8c8d0,#383840)' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-sand-50/80 dark:bg-sand-950/80 backdrop-blur-lg border-b border-sand-200/70 dark:border-sand-800/70">
      <div className="flex items-center gap-2 px-2 sm:px-3 h-12">
        {sidebarCollapsed ? (
          <button onClick={onMenuClick} className="hidden lg:flex p-2 -ml-1 rounded-lg text-sand-600 dark:text-sand-300 hover:bg-sand-100 dark:hover:bg-sand-800 transition-colors" aria-label="Mostrar menu">
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        ) : null}
        <button onClick={onMenuClick} className="lg:hidden p-2 -ml-1 rounded-lg text-sand-600 dark:text-sand-300 hover:bg-sand-100 dark:hover:bg-sand-800" aria-label="Open menu">
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex-1" />

        {/* Music player */}
        <MusicPlayer />

        {/* Color scheme selector */}
        <div className="relative">
          <button
            onClick={() => setShowColorMenu(!showColorMenu)}
            className="p-2.5 rounded-xl text-sand-600 dark:text-sand-300 hover:bg-sand-100 dark:hover:bg-sand-800 transition-colors flex items-center gap-1.5"
            aria-label="Color scheme"
          >
            <Palette className="w-5 h-5" />
          </button>
          {showColorMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowColorMenu(false)} />
              <div className="absolute right-0 mt-2 z-50 w-40 rounded-xl bg-white dark:bg-sand-900 border border-sand-200 dark:border-sand-800 shadow-elevated py-1">
                {colorSchemes.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => { setColorScheme(s.value); setShowColorMenu(false); }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors',
                      colorScheme === s.value
                        ? 'text-brand-600 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/20'
                        : 'text-sand-600 dark:text-sand-300 hover:bg-sand-100 dark:hover:bg-sand-800'
                    )}
                  >
                    <span
                      className="w-5 h-5 rounded-full shrink-0 shadow-sm border border-white/20"
                      style={{ background: s.dot }}
                    />
                    <span className="flex flex-col items-start leading-tight">
                      <span className="font-semibold tracking-wide" style={{ fontSize: '0.72rem' }}>{s.label}</span>
                      <span className="text-[10px] text-sand-400">{s.sub}</span>
                    </span>
                    {colorScheme === s.value && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="p-2.5 rounded-xl text-sand-600 dark:text-sand-300 hover:bg-sand-100 dark:hover:bg-sand-800 transition-colors"
            aria-label="Language"
          >
            <Globe className="w-5 h-5" />
          </button>
          {showLangMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
              <div className="absolute right-0 mt-2 z-50 w-40 rounded-xl bg-white dark:bg-sand-900 border border-sand-200 dark:border-sand-800 shadow-elevated py-1">
                {languages.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => { setLang(l.value); setShowLangMenu(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      lang === l.value ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20' : 'text-sand-600 dark:text-sand-300 hover:bg-sand-100 dark:hover:bg-sand-800'
                    }`}
                  >
                    <span className="text-base">{l.flag}</span>
                    {l.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button onClick={toggleTheme} className="p-2.5 rounded-xl text-sand-600 dark:text-sand-300 hover:bg-sand-100 dark:hover:bg-sand-800 transition-colors" aria-label="Toggle theme">
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
