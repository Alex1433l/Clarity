import { useState } from 'react';
import {
  Flame, Plus, CheckCircle2, Circle, TrendingUp, Pencil, Trash2,
  Calendar, AlertCircle, Loader2,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';
import ProgressRing from '@/components/ProgressRing';
import HabitModal from '@/components/HabitModal';
import HabitCalendar from '@/components/HabitCalendar';
import { useHabits } from '@/hooks/useHabits';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/utils';
import type { Habit, HabitInput, HabitLog } from '@/types';

const colorMap: Record<string, { bg: string; text: string }> = {
  brand: { bg: 'bg-brand-100 dark:bg-brand-900/40', text: 'text-brand-600 dark:text-brand-400' },
  amber: { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-600 dark:text-amber-400' },
  sky: { bg: 'bg-sky-100 dark:bg-sky-900/40', text: 'text-sky-600 dark:text-sky-400' },
  rose: { bg: 'bg-rose-100 dark:bg-rose-900/40', text: 'text-rose-600 dark:text-rose-400' },
  violet: { bg: 'bg-violet-100 dark:bg-violet-900/40', text: 'text-violet-600 dark:text-violet-400' },
};

function getColorClasses(color: string | null) {
  return colorMap[color ?? 'brand'] ?? colorMap.brand;
}

export default function HabitsPage() {
  const { t } = useLanguage();
  const { habits, loading, error, createHabit, updateHabit, deleteHabit, toggleToday, getHabitLogs } = useHabits();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [calendarHabit, setCalendarHabit] = useState<{ id: string; name: string; logs: HabitLog[] } | null>(null);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (habit: Habit) => { setEditing(habit); setModalOpen(true); };

  const handleSave = (input: HabitInput) => {
    if (editing) updateHabit(editing.id, input);
    else createHabit(input);
  };

  const handleDelete = (habit: Habit) => {
    if (confirm(`${habit.name}? ${t('confirmDeleteHabit')}`)) deleteHabit(habit.id);
  };

  const openCalendar = async (habit: Habit) => {
    const logs = await getHabitLogs(habit.id);
    setCalendarHabit({ id: habit.id, name: habit.name, logs });
  };

  const doneCount = habits.filter((h) => h.doneToday).length;
  const maxStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.streak)) : 0;
  const avgCompletion = habits.length > 0 ? Math.round(habits.reduce((a, h) => a + h.completionRate, 0) / habits.length) : 0;

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('habitsTitle')} subtitle={t('habitsSubtitle')} icon={Flame}
        action={<button onClick={openCreate} className="btn-primary text-xs sm:text-sm"><Plus className="w-4 h-4" /> {t('newHabit')}</button>} />

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4"><p className="text-xs text-sand-400 mb-1">{t('completedToday')}</p><p className="text-2xl font-bold text-sand-800 dark:text-sand-100">{doneCount}/{habits.length}</p></Card>
        <Card className="p-4"><p className="text-xs text-sand-400 mb-1">{t('maxStreak')}</p><p className="text-2xl font-bold text-sand-800 dark:text-sand-100">{maxStreak} {t('streak')}</p></Card>
        <Card className="p-4"><p className="text-xs text-sand-400 mb-1">{t('avgCompletion')}</p><p className="text-2xl font-bold text-sand-800 dark:text-sand-100">{avgCompletion}%</p></Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-brand-500 animate-spin" /></div>
      ) : habits.length === 0 ? (
        <Card><EmptyState icon={Flame} title={t('noHabits')} description={t('noHabitsDesc')}
          action={<button onClick={openCreate} className="btn-primary text-sm"><Plus className="w-4 h-4" /> {t('createHabit')}</button>} /></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {habits.map((habit) => {
            const colors = getColorClasses(habit.color);
            return (
              <Card key={habit.id} className="p-4 group" hover>
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors', habit.doneToday ? colors.bg : 'bg-sand-100 dark:bg-sand-800 text-sand-400')}>
                    <Flame className={cn('w-5 h-5', habit.doneToday ? colors.text : '')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-sand-800 dark:text-sand-100 truncate">{habit.name}</p>
                    <p className="text-xs text-sand-400">{habit.frequency === 'daily' ? t('daily') : t('weekly')}{habit.description ? ` · ${habit.description}` : ''}</p>
                  </div>
                  <button onClick={() => toggleToday(habit.id)} aria-label={t('markToday')}>
                    {habit.doneToday ? <CheckCircle2 className="w-6 h-6 text-brand-500" /> : <Circle className="w-6 h-6 text-sand-300 dark:text-sand-600" />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-sand-500 dark:text-sand-400"><TrendingUp className="w-3.5 h-3.5" /><span>{habit.streak} {t('streak')}</span></div>
                    <div className="flex items-center gap-1.5 text-xs text-sand-500 dark:text-sand-400"><CheckCircle2 className="w-3.5 h-3.5" /><span>{habit.totalCheckins} {t('total')}</span></div>
                  </div>
                  <ProgressRing value={habit.completionRate} size={40} strokeWidth={3} />
                </div>
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-sand-100 dark:border-sand-800 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openCalendar(habit)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-sand-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20"><Calendar className="w-3.5 h-3.5" />{t('history')}</button>
                  <button onClick={() => openEdit(habit)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-sand-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20"><Pencil className="w-3.5 h-3.5" />{t('edit')}</button>
                  <button onClick={() => handleDelete(habit)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-sand-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-3.5 h-3.5" />{t('delete')}</button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <HabitModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} habit={editing} />
      {calendarHabit && <HabitCalendar open={!!calendarHabit} onClose={() => setCalendarHabit(null)} habitName={calendarHabit.name} habitId={calendarHabit.id} logs={calendarHabit.logs} />}
    </div>
  );
}
