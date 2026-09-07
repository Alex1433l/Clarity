import { useState } from 'react';
import {
  CheckSquare, Plus, Circle, CheckCircle2, Calendar, Clock,
  Pencil, Trash2, AlertCircle, Loader2,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';
import TaskModal from '@/components/TaskModal';
import { PriorityBadge, CategoryBadge } from '@/components/Badges';
import { useTasks } from '@/hooks/useTasks';
import { useLanguage, formatDateShortByLang } from '@/hooks/useLanguage';
import { cn } from '@/utils';
import type { Task, TaskInput } from '@/types';

type Filter = 'all' | 'pending' | 'done';

export default function TasksPage() {
  const { t, lang } = useLanguage();
  const { tasks, loading, error, createTask, updateTask, toggleTask, deleteTask } = useTasks();
  const [filter, setFilter] = useState<Filter>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (task: Task) => { setEditing(task); setModalOpen(true); };

  const handleSave = (input: TaskInput) => {
    if (editing) updateTask(editing.id, input);
    else createTask(input);
  };

  const handleDelete = (task: Task) => {
    if (confirm(`"${task.title}"?`)) deleteTask(task.id);
  };

  const filtered = tasks.filter((t) => filter === 'all' ? true : filter === 'pending' ? !t.done : t.done);
  const filterLabels: Record<Filter, string> = { all: t('all'), pending: t('pending'), done: t('done') };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('tasksTitle')}
        subtitle={t('tasksSubtitle')}
        icon={CheckSquare}
        action={<button onClick={openCreate} className="btn-primary text-xs sm:text-sm"><Plus className="w-4 h-4" /> {t('newTask')}</button>}
      />

      <div className="flex items-center gap-2 mb-4">
        {(['all', 'pending', 'done'] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors',
              filter === f ? 'bg-brand-600 text-white' : 'bg-white dark:bg-sand-900 text-sand-500 dark:text-sand-400 border border-sand-200 dark:border-sand-800 hover:border-sand-300')}>
            {filterLabels[f]}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-brand-500 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={CheckSquare} title={filter === 'done' ? t('noTasksDone') : t('noTasks')} description={t('noTasksDesc')}
            action={<button onClick={openCreate} className="btn-primary text-sm"><Plus className="w-4 h-4" /> {t('createTask')}</button>} />
        ) : (
          <div className="p-2">
            {filtered.map((task) => (
              <div key={task.id} className="group flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-sand-50 dark:hover:bg-sand-800/50 transition-colors">
                <button onClick={() => toggleTask(task.id)} className="shrink-0" aria-label={task.done ? t('unmark') : t('complete')}>
                  {task.done ? <CheckCircle2 className="w-5 h-5 text-brand-500" /> : <Circle className="w-5 h-5 text-sand-300 dark:text-sand-600 group-hover:text-sand-400" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm', task.done ? 'text-sand-400 line-through dark:text-sand-600' : 'text-sand-700 dark:text-sand-200')}>{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {task.category && <CategoryBadge>{task.category}</CategoryBadge>}
                    <span className="text-xs text-sand-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDateShortByLang(task.date, lang)}</span>
                    {task.time && <span className="text-xs text-sand-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {task.time}</span>}
                  </div>
                </div>
                <PriorityBadge priority={task.priority} />
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(task)} className="p-1.5 rounded-lg text-sand-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20" aria-label={t('edit')}><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(task)} className="p-1.5 rounded-lg text-sand-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" aria-label={t('delete')}><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <TaskModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} task={editing} />
    </div>
  );
}
