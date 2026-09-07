import { useEffect, useState } from 'react';
import { X, Plus, Trash2, Folder } from 'lucide-react';
import type { Goal, GoalInput, LifeArea } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/utils';

interface GoalModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (input: GoalInput) => void;
  goal?: Goal | null;
  areas: LifeArea[];
  onCreateArea: (name: string) => void;
  onDeleteArea: (id: string) => void;
}

const colorOptions = [
  { value: 'brand', className: 'bg-brand-500' },
  { value: 'amber', className: 'bg-amber-500' },
  { value: 'sky', className: 'bg-sky-500' },
  { value: 'rose', className: 'bg-rose-500' },
  { value: 'violet', className: 'bg-violet-500' },
];

export default function GoalModal({ open, onClose, onSave, goal, areas, onCreateArea, onDeleteArea }: GoalModalProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lifeAreaId, setLifeAreaId] = useState<string | null>(null);
  const [deadline, setDeadline] = useState(new Date(Date.now() + 7776000000).toISOString().slice(0, 10));
  const [progress, setProgress] = useState(0);
  const [showAreaInput, setShowAreaInput] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description ?? '');
      setLifeAreaId(goal.life_area_id);
      setDeadline(goal.deadline);
      setProgress(goal.progress);
    } else {
      setTitle('');
      setDescription('');
      setLifeAreaId(null);
      setDeadline(new Date(Date.now() + 7776000000).toISOString().slice(0, 10));
      setProgress(0);
    }
    setShowAreaInput(false);
    setNewAreaName('');
  }, [goal, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim() || null,
      life_area_id: lifeAreaId,
      deadline,
      progress,
    });
    onClose();
  };

  const handleCreateArea = () => {
    if (!newAreaName.trim()) return;
    onCreateArea(newAreaName.trim());
    setNewAreaName('');
    setShowAreaInput(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-sand-950/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white dark:bg-sand-900 rounded-t-2xl sm:rounded-2xl shadow-elevated animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-sand-200 dark:border-sand-800 sticky top-0 bg-white dark:bg-sand-900 z-10">
          <h2 className="font-display text-lg font-bold text-sand-900 dark:text-white">
            {goal ? t('editGoal') : t('newGoal')}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-sand-400 hover:bg-sand-100 dark:hover:bg-sand-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-sand-500 dark:text-sand-400 mb-1.5">{t('title')}</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('goalTitle')} autoFocus className="input-field" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-sand-500 dark:text-sand-400 mb-1.5">{t('description')}</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('goalDescription')} rows={2} className="input-field resize-none" />
          </div>

          {/* Life Area selector */}
          <div>
            <label className="block text-xs font-semibold text-sand-500 dark:text-sand-400 mb-1.5">{t('lifeArea')}</label>
            {showAreaInput ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAreaName}
                  onChange={(e) => setNewAreaName(e.target.value)}
                  placeholder={t('lifeAreaName')}
                  className="input-field"
                  autoFocus
                />
                <button type="button" onClick={handleCreateArea} className="btn-primary px-3">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <select
                  value={lifeAreaId ?? ''}
                  onChange={(e) => setLifeAreaId(e.target.value || null)}
                  className="input-field flex-1"
                >
                  <option value="">{t('selectLifeArea')}</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>{area.name}</option>
                  ))}
                </select>
                <button type="button" onClick={() => setShowAreaInput(true)} className="btn-outline px-3">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
            {areas.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {areas.map((area) => (
                  <div key={area.id} className="flex items-center gap-1 chip bg-sand-100 dark:bg-sand-800 text-sand-600 dark:text-sand-400">
                    <Folder className="w-3 h-3" />
                    {area.name}
                    <button type="button" onClick={() => onDeleteArea(area.id)} className="text-sand-400 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-sand-500 dark:text-sand-400 mb-1.5">{t('deadline')}</label>
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-sand-500 dark:text-sand-400 mb-1.5">{t('progress')}: {progress}%</label>
              <input type="range" min={0} max={100} step={5} value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="w-full mt-3 accent-brand-500" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1">{t('cancel')}</button>
            <button type="submit" className="btn-primary flex-1">{goal ? t('save') : t('create')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
