import { TrendingUp, BarChart3, AlertCircle, Loader2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';
import { useMood } from '@/hooks/useMood';
import { useLanguage, getWeekDays } from '@/hooks/useLanguage';
import { cn } from '@/utils';

const scaleConfig = [
  { key: 'mood' as const, labelKey: 'moodScale' as const, bar: 'bg-brand-500' },
  { key: 'energy' as const, labelKey: 'energy' as const, bar: 'bg-amber-500' },
  { key: 'anxiety' as const, labelKey: 'anxiety' as const, bar: 'bg-rose-500' },
];

export default function ReportsPage() {
  const { t, lang } = useLanguage();
  const { readings, loading, error } = useMood();
  const last7 = [...readings].slice(-7);
  const last30 = [...readings].slice(-30);
  const weekDays = getWeekDays(lang);

  const avg = (key: 'mood' | 'energy' | 'anxiety') => {
    if (last30.length === 0) return 0;
    return (last30.reduce((a, r) => a + r[key], 0) / last30.length).toFixed(1);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('reportsTitle')} subtitle={t('reportsSubtitle')} icon={TrendingUp} />

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-brand-500 animate-spin" /></div>
      ) : readings.length === 0 ? (
        <Card><EmptyState icon={TrendingUp} title={t('noReportData')} description={t('noReportDataDesc')} /></Card>
      ) : (
        <>
          <Card className="mb-6 p-5">
            <div className="flex items-center gap-2 mb-4"><BarChart3 className="w-4 h-4 text-sand-400" /><h3 className="text-sm font-semibold text-sand-800 dark:text-sand-100">{t('avg30days')}</h3></div>
            <div className="grid grid-cols-3 gap-3">
              {scaleConfig.map((s) => (
                <div key={s.key} className="p-3 rounded-xl bg-sand-50 dark:bg-sand-800/50">
                  <p className="text-xs text-sand-400">{t(s.labelKey)}</p>
                  <p className="text-xl font-bold text-sand-800 dark:text-sand-100 mt-1">{avg(s.key)}</p>
                  <p className="text-[11px] text-sand-400 mt-0.5">{last30.length} {t('records')}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-sand-800 dark:text-sand-100 mb-4">{t('last7days')}</h3>
            <div className="space-y-4">
              {scaleConfig.map((scale) => (
                <div key={scale.key}>
                  <p className="text-xs text-sand-400 mb-1.5">{t(scale.labelKey)}</p>
                  <div className="flex items-end justify-between gap-2 h-20">
                    {weekDays.map((day, i) => {
                      const reading = last7[i];
                      const val = reading ? reading[scale.key] : 0;
                      return (
                        <div key={day} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full flex items-end h-16">
                            {reading ? <div className={cn('w-full rounded-t-lg transition-all hover:opacity-80', scale.bar)} style={{ height: `${(val / 5) * 100}%` }} /> : <div className="w-full h-px bg-sand-200 dark:bg-sand-800" />}
                          </div>
                          <span className="text-[11px] text-sand-400">{day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
