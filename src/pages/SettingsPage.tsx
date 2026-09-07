import { Settings, Moon, Sun, Bell, Globe, Database, Info, Palette } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import { useTheme, type ColorScheme } from '@/hooks/useTheme';
import { useLanguage, type Language } from '@/hooks/useLanguage';
import { cn } from '@/utils';

export default function SettingsPage() {
  const { theme, setTheme, colorScheme, setColorScheme } = useTheme();
  const { lang, setLang, t } = useLanguage();

  const colorSchemes: { value: ColorScheme; label: string; color: string }[] = [
    { value: 'teal', label: 'Teal', color: '#0d9488' },
    { value: 'orange', label: 'Laranja', color: '#ea580c' },
    { value: 'gray', label: 'Cinza', color: '#475569' },
  ];

  const languages: { value: Language; label: string; flag: string }[] = [
    { value: 'pt', label: 'Português', flag: '🇧🇷' },
    { value: 'es', label: 'Español', flag: '🇪🇸' },
    { value: 'en', label: 'English', flag: '🇬🇧' },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('settingsTitle')} subtitle={t('settingsSubtitle')} icon={Settings} />

      <div className="space-y-6">
        {/* Appearance */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-sand-800 dark:text-sand-100 mb-4">{t('appearance')}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sand-100 dark:bg-sand-800 flex items-center justify-center">
                {theme === 'light' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-brand-400" />}
              </div>
              <div><p className="text-sm font-medium text-sand-700 dark:text-sand-200">{t('theme')}</p><p className="text-xs text-sand-400">{t('themeDesc')}</p></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setTheme('light')} className={cn('px-3.5 py-2 rounded-xl text-xs font-medium transition-all', theme === 'light' ? 'bg-brand-600 text-white shadow-sm' : 'bg-sand-100 dark:bg-sand-800 text-sand-500 hover:bg-sand-200 dark:hover:bg-sand-700')}>
                <Sun className="w-3.5 h-3.5 inline mr-1.5" />{t('light')}
              </button>
              <button onClick={() => setTheme('dark')} className={cn('px-3.5 py-2 rounded-xl text-xs font-medium transition-all', theme === 'dark' ? 'bg-brand-600 text-white shadow-sm' : 'bg-sand-100 dark:bg-sand-800 text-sand-500 hover:bg-sand-200 dark:hover:bg-sand-700')}>
                <Moon className="w-3.5 h-3.5 inline mr-1.5" />{t('dark')}
              </button>
            </div>
          </div>
        </Card>

        {/* Color scheme */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-sand-800 dark:text-sand-100 mb-4">Cor do sistema</h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-sand-100 dark:bg-sand-800 flex items-center justify-center">
              <Palette className="w-5 h-5 text-sand-400" />
            </div>
            <div><p className="text-sm font-medium text-sand-700 dark:text-sand-200">Escolha a cor principal</p><p className="text-xs text-sand-400">Teal, Laranja ou Cinza</p></div>
          </div>
          <div className="flex gap-2">
            {colorSchemes.map((s) => (
              <button key={s.value} onClick={() => setColorScheme(s.value)}
                className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all',
                  colorScheme === s.value ? 'bg-brand-600 text-white shadow-sm' : 'bg-sand-100 dark:bg-sand-800 text-sand-500 hover:bg-sand-200 dark:hover:bg-sand-700')}>
                <span className="w-3.5 h-3.5 rounded-full border border-sand-300 dark:border-sand-700" style={{ backgroundColor: s.color }} />
                {s.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Language */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-sand-800 dark:text-sand-100 mb-4">{t('language')}</h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-sand-100 dark:bg-sand-800 flex items-center justify-center">
              <Globe className="w-5 h-5 text-sand-400" />
            </div>
            <div><p className="text-sm font-medium text-sand-700 dark:text-sand-200">{t('language')}</p><p className="text-xs text-sand-400">{t('languageDesc')}</p></div>
          </div>
          <div className="flex gap-2">
            {languages.map((l) => (
              <button key={l.value} onClick={() => setLang(l.value)}
                className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all',
                  lang === l.value ? 'bg-brand-600 text-white shadow-sm' : 'bg-sand-100 dark:bg-sand-800 text-sand-500 hover:bg-sand-200 dark:hover:bg-sand-700')}>
                <span className="text-base">{l.flag}</span>{l.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Preferences */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-sand-800 dark:text-sand-100 mb-4">{t('preferences')}</h3>
          <div className="space-y-1">
            {[
              { icon: Bell, label: t('notifications'), desc: t('notificationsDesc') },
              { icon: Database, label: t('backup'), desc: t('backupDesc') },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 py-2.5">
                <div className="w-10 h-10 rounded-xl bg-sand-100 dark:bg-sand-800 flex items-center justify-center"><item.icon className="w-5 h-5 text-sand-400" /></div>
                <div className="flex-1"><p className="text-sm font-medium text-sand-700 dark:text-sand-200">{item.label}</p><p className="text-xs text-sand-400">{item.desc}</p></div>
                <span className="chip bg-sand-100 dark:bg-sand-800 text-sand-400 text-[11px]">{t('soon')}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* About */}
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center"><Info className="w-5 h-5 text-brand-600 dark:text-brand-400" /></div>
            <div><p className="text-sm font-semibold text-sand-800 dark:text-sand-100">{t('aboutClarity')}</p><p className="text-xs text-sand-400">{t('version')}</p></div>
          </div>
          <p className="text-sm text-sand-500 dark:text-sand-400 leading-relaxed">{t('aboutDesc')}</p>
        </Card>
      </div>
    </div>
  );
}
