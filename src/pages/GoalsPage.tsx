import { useState } from 'react';
import { Target, Plus, Calendar, Pencil, Trash2, AlertCircle, Loader2, Folder } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import EmptyState from '@/components/EmptyState';
import ProgressRing from '@/components/ProgressRing';
import ProgressBar from '@/components/ProgressBar';
import GoalModal from '@/components/GoalModal';
import { useGoals } from '@/hooks/useGoals';
import { useLifeAreas } from '@/hooks/useLifeAreas';
import { useLanguage, formatDateShortByLang } from '@/hooks/useLanguage';
import type { Goal, GoalInput } from '@/types';

export default function GoalsPage() {
  const { t, lang } = useLanguage();
  const { goals, loading, error, createGoal, updateGoal, deleteGoal } = useGoals();
  const { areas, createArea, deleteArea } = useLifeAreas();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (goal: Goal) => { setEditing(goal); setModalOpen(true); };

  const handleSave = (input: GoalInput) => {
    if (editing) updateGoal(editing.id, input);
    else createGoal(input);
  };

  const handleDelete = (goal: Goal) => {
    if (confirm(t('confirmDeleteGoal'))) {
      deleteGoal(goal.id);
    }
  };

  const areaName = (id: string | null) => areas.find((a) => a.id === id)?.name ?? t('noLifeArea');

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={t('goalsTitle')}
        subtitle={t('goalsSubtitle')}
        icon={Target}
        action={
          <button onClick={openCreate} className="btn-primary text-xs sm:text-sm">
            <Plus className="w-4 h-4" /> {t('newGoal')}
          </button>
        }
      />

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
        </div>
      ) : goals.length === 0 ? (
        <Card>
          <EmptyState
            icon={Target}
            title={t('noGoals')}
            description={t('noGoalsDesc')}
            action={<button onClick={openCreate} className="btn-primary text-sm"><Plus className="w-4 h-4" /> {t('createGoal')}</button>}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <Card key={goal.id} className="p-5 group" hover>
              <div className="flex items-start gap-4">
                <ProgressRing value={goal.progress} size={64} strokeWidth={5} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-sand-800 dark:text-sand-100">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-sm text-sand-500 dark:text-sand-400 mt-1 leading-relaxed">{goal.description}</p>
                      )}
                    </div>
                    <span className="chip bg-sand-100 dark:bg-sand-800 text-sand-600 dark:text-sand-400 shrink-0">
                      <Folder className="w-3 h-3" />{areaName(goal.life_area_id)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-xs text-sand-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> {formatDateShortByLang(goal.deadline, lang)}
                    </span>
                  </div>
                  <ProgressBar value={goal.progress} className="mt-3" />
                  <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(goal)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-sand-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20">
                      <Pencil className="w-3.5 h-3.5" /> {t('edit')}
                    </button>
                    <button onClick={() => handleDelete(goal)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-sand-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 className="w-3.5 h-3.5" /> {t('delete')}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <GoalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        goal={editing}
        areas={areas}
        onCreateArea={(name) => createArea({ name })}
        onDeleteArea={(id) => deleteArea(id)}
      />
    </div>
  );
}
