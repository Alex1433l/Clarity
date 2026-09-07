import { useEffect, useState } from 'react';
import { X, Clock } from 'lucide-react';
import type { Task, TaskInput, Priority } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/utils';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (input: TaskInput) => void;
  task?: Task | null;
}

const priorities: { value: Priority; labelKey: 'high' | 'medium' | 'low'; color: string }[] = [
  { value: 'high', labelKey: 'high', color: 'bg-red-500' },
  { value: 'medium', labelKey: 'medium', color: 'bg-amber-500' },
  { value: 'low', labelKey: 'low', color: 'bg-sky-500' },
];

export default function TaskModal({ open, onClose, onSave, task }: TaskModalProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setPriority(task.priority);
      setDate(task.date);
      setTime(task.time ?? '');
      setCategory(task.category ?? '');
    } else {
      setTitle('');
      setPriority('medium');
      setDate(new Date().toISOString().slice(0, 10));
      setTime('');
      setCategory('');
    }
  }, [task, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      priority,
      date,
      time: time || null,
      category: category.trim() || null,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-sand-950/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white dark:bg-sand-900 rounded-t-2xl sm:rounded-2xl shadow-elevated animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-sand-200 dark:border-sand-800">
          <h2 className="font-display text-lg font-bold text-sand-900 dark:text-white">
            {task ? t('editTask') : t('newTask')}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-sand-400 hover:bg-sand-100 dark:hover:bg-sand-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-sand-500 dark:text-sand-400 mb-1.5">{t('title')}</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('taskPlaceholder')} autoFocus className="input-field" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-sand-500 dark:text-sand-400 mb-1.5">{t('priority')}</label>
            <div className="flex gap-2">
              {priorities.map((p) => (
                <button key={p.value} type="button" onClick={() => setPriority(p.value)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all',
                    priority === p.value
                      ? 'bg-sand-100 dark:bg-sand-800 text-sand-800 dark:text-sand-100 ring-2 ring-brand-400/60'
                      : 'bg-sand-50 dark:bg-sand-800/50 text-sand-400 hover:bg-sand-100 dark:hover:bg-sand-800'
                  )}>
                  <span className={cn('w-2 h-2 rounded-full', p.color)} />
                  {t(p.labelKey)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-sand-500 dark:text-sand-400 mb-1.5">{t('date')}</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-sand-500 dark:text-sand-400 mb-1.5">{t('time')}</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-400 pointer-events-none" />
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="input-field pl-9" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-sand-500 dark:text-sand-400 mb-1.5">{t('category')}</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder={t('categoryPlaceholder')} className="input-field" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1">{t('cancel')}</button>
            <button type="submit" className="btn-primary flex-1">{task ? t('save') : t('create')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
