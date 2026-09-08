import { useEffect, useState } from 'react';
import { X, Clock, Plus, Check, Trash2 } from 'lucide-react';
import type { Task, TaskInput, Priority, TaskCategory } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { useTaskCategories } from '@/hooks/useTaskCategories';
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
  const { categories, createCategory, deleteCategory } = useTaskCategories();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('');
  const [category, setCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

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
    setShowNewCategory(false);
    setNewCategoryName('');
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
      category: category || null,
    });
    onClose();
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    const created = await createCategory({ name: newCategoryName.trim() });
    if (created) {
      setCategory(created.name);
      setNewCategoryName('');
      setShowNewCategory(false);
    }
  };

  const handleDeleteCategory = async (cat: TaskCategory) => {
    if (confirm(`Excluir categoria "${cat.name}"?`)) {
      await deleteCategory(cat.id);
      if (category === cat.name) setCategory('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-sand-950/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white dark:bg-sand-900 rounded-t-2xl sm:rounded-2xl shadow-elevated animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-sand-200 dark:border-sand-800 sticky top-0 bg-white dark:bg-sand-900 z-10">
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
            {showNewCategory ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nome da categoria"
                  className="input-field flex-1"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateCategory(); } }}
                />
                <button type="button" onClick={handleCreateCategory} disabled={!newCategoryName.trim()} className={cn('btn-primary px-3', !newCategoryName.trim() && 'opacity-50 cursor-not-allowed')}>
                  <Check className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => { setShowNewCategory(false); setNewCategoryName(''); }} className="btn-outline px-3">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setCategory('')}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      category === ''
                        ? 'bg-brand-600 text-white'
                        : 'bg-sand-50 dark:bg-sand-800/50 text-sand-500 dark:text-sand-400 hover:bg-sand-100 dark:hover:bg-sand-800 border border-sand-200 dark:border-sand-800'
                    )}
                  >
                    Sem categoria
                  </button>
                  {categories.map((cat) => (
                    <div key={cat.id} className="group/cat relative">
                      <button
                        type="button"
                        onClick={() => setCategory(cat.name)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-medium transition-all pr-8',
                          category === cat.name
                            ? 'bg-brand-600 text-white'
                            : 'bg-sand-50 dark:bg-sand-800/50 text-sand-500 dark:text-sand-400 hover:bg-sand-100 dark:hover:bg-sand-800 border border-sand-200 dark:border-sand-800'
                        )}
                      >
                        {cat.name}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded text-sand-300 dark:text-sand-600 hover:text-red-500 opacity-0 group-hover/cat:opacity-100 transition-opacity"
                        aria-label="Excluir categoria"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-sand-50 dark:bg-sand-800/50 text-sand-500 dark:text-sand-400 hover:bg-sand-100 dark:hover:bg-sand-800 border border-dashed border-sand-300 dark:border-sand-700 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Nova
                  </button>
                </div>
              </div>
            )}
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
