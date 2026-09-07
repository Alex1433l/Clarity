import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Habit, HabitInput } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/utils';

interface HabitModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (input: HabitInput) => void;
  habit?: Habit | null;
}

const daysOfWeekByLang = {
  pt: [{ value: 0, label: 'D' }, { value: 1, label: 'S' }, { value: 2, label: 'T' }, { value: 3, label: 'Q' }, { value: 4, label: 'Q' }, { value: 5, label: 'S' }, { value: 6, label: 'S' }],
  es: [{ value: 0, label: 'D' }, { value: 1, label: 'L' }, { value: 2, label: 'M' }, { value: 3, label: 'X' }, { value: 4, label: 'J' }, { value: 5, label: 'V' }, { value: 6, label: 'S' }],
  en: [{ value: 0, label: 'S' }, { value: 1, label: 'M' }, { value: 2, label: 'T' }, { value: 3, label: 'W' }, { value: 4, label: 'T' }, { value: 5, label: 'F' }, { value: 6, label: 'S' }],
};

const colorOptions = [
  { value: 'brand', className: 'bg-brand-500' },
  { value: 'amber', className: 'bg-amber-500' },
  { value: 'sky', className: 'bg-sky-500' },
  { value: 'rose', className: 'bg-rose-500' },
  { value: 'violet', className: 'bg-violet-500' },
];

export default function HabitModal({ open, onClose, onSave, habit }: HabitModalProps) {
  const { t, lang } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setDescription(habit.description ?? '');
      setFrequency(habit.frequency);
      setSelectedDays(habit.days_of_week ?? []);
      setColor(habit.color);
    } else {
      setName('');
      setDescription('');
      setFrequency('daily');
      setSelectedDays([]);
      setColor(null);
    }
  }, [habit, open]);

  if (!open) return null;

  const daysOfWeek = daysOfWeekByLang[lang];
  const toggleDay = (day: number) => setSelectedDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim() || null, frequency, days_of_week: frequency === 'weekly' ? selectedDays : null, color });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-sand-950/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white dark:bg-sand-900 rounded-t-2xl sm:rounded-2xl shadow-elevated animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-sand-200 dark:border-sand-800 sticky top-0 bg-white dark:bg-sand-900 z-10">
          <h2 className="font-display text-lg font-bold text-sand-900 dark:text-white">{habit ? t('editHabit') : t('newHabit')}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-sand-400 hover:bg-sand-100 dark:hover:bg-sand-800"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-sand-500 dark:text-sand-400 mb-1.5">{t('habitName')}</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('habitPlaceholder')} autoFocus className="input-field" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-sand-500 dark:text-sand-400 mb-1.5">{t('description')}</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('descriptionPlaceholder')} rows={2} className="input-field resize-none" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-sand-500 dark:text-sand-400 mb-1.5">{t('frequency')}</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setFrequency('daily')} className={cn('flex-1 py-2.5 rounded-xl text-sm font-medium transition-all', frequency === 'daily' ? 'bg-sand-100 dark:bg-sand-800 text-sand-800 dark:text-sand-100 ring-2 ring-brand-400/60' : 'bg-sand-50 dark:bg-sand-800/50 text-sand-400 hover:bg-sand-100 dark:hover:bg-sand-800')}>{t('daily')}</button>
              <button type="button" onClick={() => setFrequency('weekly')} className={cn('flex-1 py-2.5 rounded-xl text-sm font-medium transition-all', frequency === 'weekly' ? 'bg-sand-100 dark:bg-sand-800 text-sand-800 dark:text-sand-100 ring-2 ring-brand-400/60' : 'bg-sand-50 dark:bg-sand-800/50 text-sand-400 hover:bg-sand-100 dark:hover:bg-sand-800')}>{t('weekly')}</button>
            </div>
          </div>

          {frequency === 'weekly' && (
            <div>
              <label className="block text-xs font-semibold text-sand-500 dark:text-sand-400 mb-1.5">{t('daysOfWeek')}</label>
              <div className="flex gap-1.5">
                {daysOfWeek.map((day) => (
                  <button key={day.value} type="button" onClick={() => toggleDay(day.value)} className={cn('w-9 h-9 rounded-lg text-sm font-medium transition-all', selectedDays.includes(day.value) ? 'bg-brand-600 text-white' : 'bg-sand-100 dark:bg-sand-800 text-sand-400 hover:bg-sand-200 dark:hover:bg-sand-700')}>{day.label}</button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-sand-500 dark:text-sand-400 mb-1.5">{t('color')}</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setColor(null)} className={cn('w-9 h-9 rounded-lg border-2 transition-all', color === null ? 'border-brand-400 ring-2 ring-brand-400/30' : 'border-sand-200 dark:border-sand-700')}><span className="text-xs text-sand-400">—</span></button>
              {colorOptions.map((c) => (
                <button key={c.value} type="button" onClick={() => setColor(c.value)} className={cn('w-9 h-9 rounded-lg transition-all', c.className, color === c.value ? 'ring-2 ring-offset-2 ring-brand-400 dark:ring-offset-sand-900' : '')} />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1">{t('cancel')}</button>
            <button type="submit" className="btn-primary flex-1">{habit ? t('save') : t('create')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
