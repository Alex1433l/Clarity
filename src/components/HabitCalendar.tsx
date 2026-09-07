import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import type { HabitLog } from '@/types';
import { useLanguage, getMonthNames } from '@/hooks/useLanguage';
import { cn } from '@/utils';

interface HabitCalendarProps {
  open: boolean;
  onClose: () => void;
  habitName: string;
  habitId: string;
  logs: HabitLog[];
}

export default function HabitCalendar({ open, onClose, habitName, logs: initialLogs }: HabitCalendarProps) {
  const { t, lang } = useLanguage();
  const [viewDate, setViewDate] = useState(new Date());
  const [logs, setLogs] = useState<HabitLog[]>(initialLogs);

  useEffect(() => { setLogs(initialLogs); }, [initialLogs]);

  if (!open) return null;

  const weekDays = lang === 'pt' ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] : lang === 'es' ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = getMonthNames(lang);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const today = new Date().toISOString().slice(0, 10);
  const logDates = new Set(logs.map((l) => l.date));

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthCheckins = logs.filter((l) => {
    const ld = new Date(l.date + 'T00:00:00');
    return ld.getFullYear() === year && ld.getMonth() === month;
  }).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-sand-950/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white dark:bg-sand-900 rounded-t-2xl sm:rounded-2xl shadow-elevated animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-sand-200 dark:border-sand-800 sticky top-0 bg-white dark:bg-sand-900 z-10">
          <div><h2 className="font-display text-lg font-bold text-sand-900 dark:text-white">{t('history')}</h2><p className="text-xs text-sand-400 truncate max-w-[200px]">{habitName}</p></div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-sand-400 hover:bg-sand-100 dark:hover:bg-sand-800"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 rounded-lg text-sand-500 hover:bg-sand-100 dark:hover:bg-sand-800"><ChevronLeft className="w-5 h-5" /></button>
            <p className="text-sm font-semibold text-sand-800 dark:text-sand-100">{monthNames[month]} {year}</p>
            <button onClick={nextMonth} className="p-2 rounded-lg text-sand-500 hover:bg-sand-100 dark:hover:bg-sand-800"><ChevronRight className="w-5 h-5" /></button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (<div key={day} className="text-center text-[11px] font-medium text-sand-400 py-1">{day}</div>))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) return <div key={i} />;
              const dateStr = new Date(year, month, day).toISOString().slice(0, 10);
              const isChecked = logDates.has(dateStr);
              const isToday = dateStr === today;
              const isFuture = dateStr > today;
              return (
                <div key={i} className={cn('aspect-square rounded-lg flex items-center justify-center text-xs transition-all', isChecked ? 'bg-brand-500 text-white font-semibold' : isFuture ? 'text-sand-300 dark:text-sand-700' : 'text-sand-600 dark:text-sand-300 hover:bg-sand-100 dark:hover:bg-sand-800', isToday && !isChecked && 'ring-2 ring-brand-400/50')}>
                  {isChecked ? <Check className="w-4 h-4" /> : day}
                </div>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-sand-50 dark:bg-sand-800/50"><p className="text-lg font-bold text-brand-600 dark:text-brand-400">{monthCheckins}</p><p className="text-[11px] text-sand-400">{t('thisMonth')}</p></div>
            <div className="text-center p-3 rounded-xl bg-sand-50 dark:bg-sand-800/50"><p className="text-lg font-bold text-sand-800 dark:text-sand-100">{logs.length}</p><p className="text-[11px] text-sand-400">{t('totalCheckins')}</p></div>
            <div className="text-center p-3 rounded-xl bg-sand-50 dark:bg-sand-800/50"><p className="text-lg font-bold text-sand-800 dark:text-sand-100">{Math.round((monthCheckins / daysInMonth) * 100)}%</p><p className="text-[11px] text-sand-400">{t('thisMonth')}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
