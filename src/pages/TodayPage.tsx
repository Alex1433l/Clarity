import { useState, type DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Circle, Flame, Target, Heart, BookOpen,
  Plus, Sparkles, Loader2, Pencil, Trash2, GripVertical, X, Check,
  LayoutGrid, Link2, ExternalLink,
} from 'lucide-react';
import Card, { CardHeader } from '@/components/Card';
import ProgressRing from '@/components/ProgressRing';
import ProgressBar from '@/components/ProgressBar';
import { PriorityBadge } from '@/components/Badges';
import { useTasks } from '@/hooks/useTasks';
import { useHabits } from '@/hooks/useHabits';
import { useMood } from '@/hooks/useMood';
import { useGoals } from '@/hooks/useGoals';
import { useLifeAreas } from '@/hooks/useLifeAreas';
import { useGratitude } from '@/hooks/useGratitude';
import { useJournal, type JournalEntry } from '@/hooks/useJournal';
import { useLinks } from '@/hooks/useLinks';
import { useLanguage, getGreeting, formatDateByLang, formatDateShortByLang } from '@/hooks/useLanguage';
import { useTodayLayout, type SectionId } from '@/hooks/useTodayLayout';
import TaskModal from '@/components/TaskModal';
import GoalModal from '@/components/GoalModal';
import HabitModal from '@/components/HabitModal';
import type { Task, Goal, Habit, HabitInput, TaskInput, GoalInput, HabitWithStats } from '@/types';
import { cn } from '@/utils';

const SECTION_META: Record<SectionId, { icon: typeof Flame; label: string }> = {
  mood: { icon: Sparkles, label: 'howAmI' },
  tasks: { icon: CheckCircle2, label: 'todayTasks' },
  habits: { icon: Flame, label: 'todayHabits' },
  goals: { icon: Target, label: 'goalsInProgress' },
  gratitude: { icon: Heart, label: 'gratitudeTitle' },
  journal: { icon: BookOpen, label: 'journalSection' },
  links: { icon: Link2, label: 'linksTitle' },
};

export default function TodayPage() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { tasks, loading: tasksLoading, toggleTask, deleteTask, updateTask, createTask, reorderTasks } = useTasks();
  const { habits, loading: habitsLoading, toggleToday: toggleHabit, deleteHabit, updateHabit, createHabit, reorderHabits } = useHabits();
  const { today: moodToday, loading: moodLoading, deleteToday } = useMood();
  const { goals, loading: goalsLoading, deleteGoal, updateGoal, createGoal, reorderGoals } = useGoals();
  const { areas, createArea, deleteArea } = useLifeAreas();
  const { entries: gratitudeEntries, addEntry: addGratitude, deleteEntry: deleteGratitude, updateEntry: updateGratitude } = useGratitude();
  const { entries: journalEntries, createEntry: createJournal, updateEntry: updateJournal, deleteEntry: deleteJournal } = useJournal();
  const { links, folders } = useLinks();
  const { sections, hiddenSections, removeSection, addSection, reorderSections } = useTodayLayout();

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [habitModalOpen, setHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editingJournal, setEditingJournal] = useState<JournalEntry | null>(null);
  const [journalText, setJournalText] = useState('');
  const [journalMood, setJournalMood] = useState('');
  const [gratitudeText, setGratitudeText] = useState('');
  const [editingGratitudeId, setEditingGratitudeId] = useState<string | null>(null);
  const [editingGratitudeText, setEditingGratitudeText] = useState('');
  const [showAddSection, setShowAddSection] = useState(false);

  // Drag state for items
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [draggedHabitId, setDraggedHabitId] = useState<string | null>(null);
  const [draggedGoalId, setDraggedGoalId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Drag state for sections
  const [draggedSection, setDraggedSection] = useState<SectionId | null>(null);
  const [dragOverSection, setDragOverSection] = useState<SectionId | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter((t) => t.date === todayStr);
  const tasksDone = todayTasks.filter((t) => t.done).length;
  const habitsDone = habits.filter((h) => h.doneToday).length;
  const todayGoals = goals.slice(0, 3);
  const areaName = (id: string | null) => areas.find((a) => a.id === id)?.name ?? t('noLifeArea');

  // Task handlers
  const openCreateTask = () => { setEditingTask(null); setTaskModalOpen(true); };
  const openEditTask = (task: Task) => { setEditingTask(task); setTaskModalOpen(true); };
  const handleSaveTask = (input: TaskInput) => {
    if (editingTask) updateTask(editingTask.id, input);
    else createTask(input);
  };
  const handleDeleteTask = (id: string) => {
    if (confirm(t('confirmDeleteTask'))) deleteTask(id);
  };

  // Goal handlers
  const openCreateGoal = () => { setEditingGoal(null); setGoalModalOpen(true); };
  const openEditGoal = (goal: Goal) => { setEditingGoal(goal); setGoalModalOpen(true); };
  const handleSaveGoal = (input: GoalInput) => {
    if (editingGoal) updateGoal(editingGoal.id, input);
    else createGoal(input);
  };
  const handleDeleteGoal = (id: string) => {
    if (confirm(t('confirmDeleteGoal'))) deleteGoal(id);
  };

  // Habit handlers
  const openCreateHabit = () => { setEditingHabit(null); setHabitModalOpen(true); };
  const openEditHabit = (habit: Habit) => { setEditingHabit(habit); setHabitModalOpen(true); };
  const handleSaveHabit = (input: HabitInput) => {
    if (editingHabit) updateHabit(editingHabit.id, input);
    else createHabit(input);
  };
  const handleDeleteHabit = (id: string) => {
    if (confirm(t('confirmDeleteHabit'))) deleteHabit(id);
  };

  // Gratitude handlers
  const handleAddGratitude = async () => {
    if (!gratitudeText.trim()) return;
    await addGratitude(gratitudeText);
    setGratitudeText('');
  };
  const handleDeleteGratitude = (id: string) => {
    if (confirm(t('confirmDeleteGratitude'))) deleteGratitude(id);
  };
  const handleSaveGratitudeEdit = async () => {
    if (!editingGratitudeText.trim() || !editingGratitudeId) return;
    await updateGratitude(editingGratitudeId, editingGratitudeText);
    setEditingGratitudeId(null);
    setEditingGratitudeText('');
  };

  // Journal handlers
  const handleSaveJournal = async () => {
    if (!journalText.trim()) return;
    if (editingJournal) {
      await updateJournal(editingJournal.id, { text: journalText, mood: journalMood || null });
      setEditingJournal(null);
    } else {
      await createJournal({ text: journalText, mood: journalMood || null });
    }
    setJournalText('');
    setJournalMood('');
  };
  const handleEditJournal = (entry: JournalEntry) => {
    setEditingJournal(entry);
    setJournalText(entry.text);
    setJournalMood(entry.mood ?? '');
  };
  const handleCancelEditJournal = () => {
    setEditingJournal(null);
    setJournalText('');
    setJournalMood('');
  };
  const handleDeleteJournal = (id: string) => {
    if (confirm(t('confirmDeleteJournal'))) deleteJournal(id);
  };

  // Section drag reorder
  const handleSectionDragStart = (e: DragEvent, id: SectionId) => {
    setDraggedSection(id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleSectionDragOver = (e: DragEvent, id: SectionId) => {
    e.preventDefault();
    if (draggedSection && draggedSection !== id) setDragOverSection(id);
  };
  const handleSectionDrop = (e: DragEvent, targetId: SectionId) => {
    e.preventDefault();
    if (!draggedSection || draggedSection === targetId) return;
    const fromIdx = sections.indexOf(draggedSection);
    const toIdx = sections.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const reordered = [...sections];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    reorderSections(reordered);
    setDraggedSection(null);
    setDragOverSection(null);
  };

  // Item drag reorder helpers
  const handleTaskDragStart = (e: DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleTaskDragOver = (e: DragEvent, id: string) => {
    e.preventDefault();
    if (draggedTaskId && draggedTaskId !== id) setDragOverId(id);
  };
  const handleTaskDrop = (e: DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedTaskId || draggedTaskId === targetId) return;
    const fromIdx = todayTasks.findIndex((t) => t.id === draggedTaskId);
    const toIdx = todayTasks.findIndex((t) => t.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const reordered = [...todayTasks];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const newOrder = [...tasks];
    const reorderedIds = reordered.map((t) => t.id);
    let ri = 0;
    const newSorted: Task[] = [];
    for (const t of newOrder) {
      if (reorderedIds.includes(t.id)) {
        newSorted.push(reordered[ri]);
        ri++;
      } else {
        newSorted.push(t);
      }
    }
    reorderTasks(newSorted);
    setDraggedTaskId(null);
    setDragOverId(null);
  };

  const handleHabitDragStart = (e: DragEvent, id: string) => {
    setDraggedHabitId(id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleHabitDragOver = (e: DragEvent, id: string) => {
    e.preventDefault();
    if (draggedHabitId && draggedHabitId !== id) setDragOverId(id);
  };
  const handleHabitDrop = (e: DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedHabitId || draggedHabitId === targetId) return;
    const fromIdx = habits.findIndex((h) => h.id === draggedHabitId);
    const toIdx = habits.findIndex((h) => h.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const reordered = [...habits];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    reorderHabits(reordered);
    setDraggedHabitId(null);
    setDragOverId(null);
  };

  const handleGoalDragStart = (e: DragEvent, id: string) => {
    setDraggedGoalId(id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleGoalDragOver = (e: DragEvent, id: string) => {
    e.preventDefault();
    if (draggedGoalId && draggedGoalId !== id) setDragOverId(id);
  };
  const handleGoalDrop = (e: DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedGoalId || draggedGoalId === targetId) return;
    const fromIdx = goals.findIndex((g) => g.id === draggedGoalId);
    const toIdx = goals.findIndex((g) => g.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const reordered = [...goals];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    reorderGoals(reordered);
    setDraggedGoalId(null);
    setDragOverId(null);
  };

  // Section wrapper with drag handle and remove button
  const sectionWrapper = (id: SectionId, children: React.ReactNode, isFullWidth?: boolean) => (
    <div
      key={id}
      draggable
      onDragStart={(e) => handleSectionDragStart(e, id)}
      onDragOver={(e) => handleSectionDragOver(e, id)}
      onDrop={(e) => handleSectionDrop(e, id)}
      onDragEnd={() => { setDraggedSection(null); setDragOverSection(null); }}
      className={cn(
        'group/section relative rounded-2xl transition-all',
        isFullWidth ? 'col-span-full' : '',
        dragOverSection === id && draggedSection ? 'ring-2 ring-brand-400 dark:ring-brand-600 rounded-2xl' : ''
      )}
    >
      {/* Drag handle bar - appears on hover */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 opacity-0 group-hover/section:opacity-100 transition-opacity">
        <div className="flex items-center gap-1 bg-white dark:bg-sand-900 border border-sand-200 dark:border-sand-800 rounded-full shadow-soft px-2 py-1">
          <GripVertical className="w-3.5 h-3.5 text-sand-400 cursor-grab active:cursor-grabbing" />
          <button
            onClick={() => removeSection(id)}
            className="p-0.5 rounded-full text-sand-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            aria-label="Remover seção"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {children}
    </div>
  );

  const renderSection = (id: SectionId): React.ReactNode => {
    switch (id) {
      case 'mood':
        return sectionWrapper('mood', (
          <Card className="p-5 animate-slide-up" hover>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center"><Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" /></div>
                <div><h3 className="text-sm font-semibold text-sand-800 dark:text-sand-100">{t('howAmI')}</h3><p className="text-xs text-sand-400">{t('moodToday')}</p></div>
              </div>
              <div className="flex items-center gap-1">
                {moodToday && (
                  <button onClick={() => { if (confirm(t('confirmDeleteTask'))) deleteToday(); }} className="p-1.5 rounded-lg text-sand-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => navigate('/meu-estado')} className="btn-ghost text-xs">{t('update')}</button>
              </div>
            </div>
            {moodLoading ? (
              <div className="flex items-center justify-center py-4"><Loader2 className="w-5 h-5 text-brand-500 animate-spin" /></div>
            ) : moodToday ? (
              <div className="grid grid-cols-3 gap-4">
                {([['anxiety', moodToday.anxiety], ['energy', moodToday.energy], ['moodScale', moodToday.mood]] as const).map(([key, val]) => (
                  <div key={key} className="flex flex-col items-center gap-1.5">
                    <div className={cn('w-2.5 h-2.5 rounded-full', key === 'anxiety' ? 'bg-rose-500' : key === 'energy' ? 'bg-amber-500' : 'bg-brand-500')} />
                    <span className="text-xs text-sand-500 dark:text-sand-400">{t(key)}</span>
                    <span className="text-lg font-bold text-sand-800 dark:text-sand-100">{val}</span>
                  </div>
                ))}
              </div>
            ) : (
              <button onClick={() => navigate('/meu-estado')} className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sand-400 hover:text-brand-600 hover:bg-brand-50/50 dark:hover:bg-brand-900/20 transition-colors text-sm">
                <Plus className="w-4 h-4" />{t('registerMood')}
              </button>
            )}
          </Card>
        ));

      case 'tasks':
        return sectionWrapper('tasks', (
          <Card className="animate-slide-up" hover>
            <CardHeader title={t('todayTasks')} icon={CheckCircle2} action={<span className="text-xs font-medium text-sand-400">{tasksDone}/{todayTasks.length}</span>} />
            <div className="px-2 pb-2">
              {tasksLoading ? (
                <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 text-brand-500 animate-spin" /></div>
              ) : todayTasks.length === 0 ? (
                <button onClick={openCreateTask} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sand-400 hover:text-brand-600 hover:bg-brand-50/50 dark:hover:bg-brand-900/20 transition-colors text-sm"><Plus className="w-4 h-4" />{t('noTasksToday')}</button>
              ) : (
                todayTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleTaskDragStart(e, task.id)}
                    onDragOver={(e) => handleTaskDragOver(e, task.id)}
                    onDrop={(e) => handleTaskDrop(e, task.id)}
                    onDragEnd={() => { setDraggedTaskId(null); setDragOverId(null); }}
                    className={cn(
                      'group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
                      dragOverId === task.id && draggedTaskId ? 'bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-300 dark:ring-brand-700' : 'hover:bg-sand-50 dark:hover:bg-sand-800/50'
                    )}
                  >
                    <GripVertical className="w-4 h-4 text-sand-300 dark:text-sand-700 shrink-0 cursor-grab active:cursor-grabbing" />
                    <button onClick={() => toggleTask(task.id)} className="shrink-0">
                      {task.done ? <CheckCircle2 className="w-5 h-5 text-brand-500" /> : <Circle className="w-5 h-5 text-sand-300 dark:text-sand-600 group-hover:text-sand-400" />}
                    </button>
                    <span className={cn('flex-1 text-sm transition-all', task.done ? 'text-sand-400 line-through dark:text-sand-600' : 'text-sand-700 dark:text-sand-200')}>{task.title}</span>
                    <PriorityBadge priority={task.priority} />
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditTask(task)} className="p-1 rounded-lg text-sand-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteTask(task.id)} className="p-1 rounded-lg text-sand-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))
              )}
              <button onClick={openCreateTask} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sand-400 hover:text-brand-600 hover:bg-brand-50/50 dark:hover:bg-brand-900/20 transition-colors text-sm"><Plus className="w-4 h-4" />{t('addTask')}</button>
            </div>
          </Card>
        ));

      case 'habits':
        return sectionWrapper('habits', (
          <Card className="animate-slide-up" hover>
            <CardHeader title={t('todayHabits')} icon={Flame} action={<span className="text-xs font-medium text-sand-400">{habitsDone}/{habits.length}</span>} />
            <div className="px-3 pb-3 space-y-1">
              {habitsLoading ? (
                <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 text-brand-500 animate-spin" /></div>
              ) : habits.length === 0 ? (
                <button onClick={openCreateHabit} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sand-400 hover:text-brand-600 hover:bg-brand-50/50 dark:hover:bg-brand-900/20 transition-colors text-sm"><Plus className="w-4 h-4" />{t('noHabitsCreated')}</button>
              ) : (
                habits.map((habit: HabitWithStats) => (
                  <div
                    key={habit.id}
                    draggable
                    onDragStart={(e) => handleHabitDragStart(e, habit.id)}
                    onDragOver={(e) => handleHabitDragOver(e, habit.id)}
                    onDrop={(e) => handleHabitDrop(e, habit.id)}
                    onDragEnd={() => { setDraggedHabitId(null); setDragOverId(null); }}
                    className={cn(
                      'group flex items-center gap-3 py-2 rounded-xl transition-colors',
                      dragOverId === habit.id && draggedHabitId ? 'bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-300 dark:ring-brand-700' : 'hover:bg-sand-50 dark:hover:bg-sand-800/50'
                    )}
                  >
                    <GripVertical className="w-4 h-4 text-sand-300 dark:text-sand-700 shrink-0 cursor-grab active:cursor-grabbing" />
                    <button onClick={() => toggleHabit(habit.id)} className="shrink-0">
                      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center transition-colors', habit.doneToday ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400' : 'bg-sand-100 dark:bg-sand-800 text-sand-400')}><Flame className="w-4 h-4" /></div>
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium truncate', habit.doneToday ? 'text-sand-800 dark:text-sand-100' : 'text-sand-600 dark:text-sand-300')}>{habit.name}</p>
                      <p className="text-xs text-sand-400">{habit.frequency === 'daily' ? t('daily') : t('weekly')} · {habit.streak} {t('streak')}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditHabit(habit)} className="p-1 rounded-lg text-sand-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteHabit(habit.id)} className="p-1 rounded-lg text-sand-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))
              )}
              <button onClick={openCreateHabit} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sand-400 hover:text-brand-600 hover:bg-brand-50/50 dark:hover:bg-brand-900/20 transition-colors text-sm"><Plus className="w-4 h-4" />{t('addHabit')}</button>
            </div>
          </Card>
        ));

      case 'goals':
        return sectionWrapper('goals', (
          <Card className="animate-slide-up" hover>
            <CardHeader title={t('goalsInProgress')} icon={Target} action={<button onClick={openCreateGoal} className="text-xs text-brand-600 dark:text-brand-400 font-medium flex items-center gap-1 hover:gap-1.5 transition-all"><Plus className="w-3.5 h-3.5" />{t('newGoal')}</button>} />
            <div className="px-5 pb-4 space-y-4">
              {goalsLoading ? (
                <div className="flex items-center justify-center py-4"><Loader2 className="w-5 h-5 text-brand-500 animate-spin" /></div>
              ) : todayGoals.length === 0 ? (
                <p className="text-sm text-sand-400 text-center py-4">{t('noGoals')}</p>
              ) : (
                todayGoals.map((goal) => (
                  <div
                    key={goal.id}
                    draggable
                    onDragStart={(e) => handleGoalDragStart(e, goal.id)}
                    onDragOver={(e) => handleGoalDragOver(e, goal.id)}
                    onDrop={(e) => handleGoalDrop(e, goal.id)}
                    onDragEnd={() => { setDraggedGoalId(null); setDragOverId(null); }}
                    className={cn(
                      'group rounded-xl px-2 py-1 transition-colors',
                      dragOverId === goal.id && draggedGoalId ? 'bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-300 dark:ring-brand-700' : ''
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <GripVertical className="w-4 h-4 text-sand-300 dark:text-sand-700 shrink-0 cursor-grab active:cursor-grabbing" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-sand-800 dark:text-sand-100 truncate">{goal.title}</p>
                          <p className="text-xs text-sand-400 mt-0.5">{areaName(goal.life_area_id)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditGoal(goal)} className="p-1 rounded-lg text-sand-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteGoal(goal.id)} className="p-1 rounded-lg text-sand-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                        <ProgressRing value={goal.progress} size={44} strokeWidth={3.5} />
                      </div>
                    </div>
                    <ProgressBar value={goal.progress} className="mt-1" />
                  </div>
                ))
              )}
            </div>
          </Card>
        ));

      case 'gratitude':
        return sectionWrapper('gratitude', (
          <Card className="animate-slide-up" hover>
            <CardHeader title={t('gratitudeTitle')} icon={Heart} />
            <div className="px-5 pb-4">
              <div className="flex gap-2 mb-3">
                <textarea
                  value={gratitudeText}
                  onChange={(e) => setGratitudeText(e.target.value)}
                  placeholder={t('gratitudePlaceholder')}
                  rows={2}
                  className="input-field resize-none flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleAddGratitude();
                    }
                  }}
                />
                <button
                  onClick={handleAddGratitude}
                  disabled={!gratitudeText.trim()}
                  className={cn('btn-primary self-end px-3.5 py-2.5', !gratitudeText.trim() && 'opacity-50 cursor-not-allowed')}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {gratitudeEntries.length === 0 ? (
                <p className="text-sm text-sand-400 text-center py-4">{t('gratitudeEmpty')}</p>
              ) : (
                <div className="space-y-2">
                  {gratitudeEntries.slice(0, 3).map((g) => (
                    <div key={g.id} className="group flex items-start gap-2.5">
                      <Heart className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" fill="currentColor" />
                      {editingGratitudeId === g.id ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={editingGratitudeText}
                            onChange={(e) => setEditingGratitudeText(e.target.value)}
                            className="input-field flex-1 text-sm py-1.5"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') { e.preventDefault(); handleSaveGratitudeEdit(); }
                              if (e.key === 'Escape') { setEditingGratitudeId(null); setEditingGratitudeText(''); }
                            }}
                          />
                          <button onClick={handleSaveGratitudeEdit} className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20"><Check className="w-4 h-4" /></button>
                          <button onClick={() => { setEditingGratitudeId(null); setEditingGratitudeText(''); }} className="p-1.5 rounded-lg text-sand-400 hover:bg-sand-100 dark:hover:bg-sand-800"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-sand-600 dark:text-sand-300 leading-relaxed flex-1">{g.text}</p>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button onClick={() => { setEditingGratitudeId(g.id); setEditingGratitudeText(g.text); }} className="p-1 rounded-lg text-sand-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20"><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDeleteGratitude(g.id)} className="p-1 rounded-lg text-sand-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ));

      case 'journal':
        return sectionWrapper('journal', (
          <Card className="animate-slide-up" hover>
            <CardHeader title={t('journalSection')} icon={BookOpen} />
            <div className="px-5 pb-4">
              <div className="space-y-2 mb-4">
                <textarea
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  placeholder={t('journalWriteHere')}
                  rows={3}
                  className="input-field resize-none"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={journalMood}
                    onChange={(e) => setJournalMood(e.target.value)}
                    placeholder={t('journalMoodOptional')}
                    className="input-field flex-1"
                  />
                  {editingJournal && (
                    <button onClick={handleCancelEditJournal} className="btn-outline px-3 text-xs">{t('cancel')}</button>
                  )}
                  <button
                    onClick={handleSaveJournal}
                    disabled={!journalText.trim()}
                    className={cn('btn-primary px-3.5 py-2.5 text-xs', !journalText.trim() && 'opacity-50 cursor-not-allowed')}
                  >
                    {editingJournal ? t('save') : t('create')}
                  </button>
                </div>
              </div>
              {journalEntries.length === 0 ? (
                <p className="text-sm text-sand-400 text-center py-4">{t('noJournalEntries')}</p>
              ) : (
                <div className="space-y-2.5">
                  {journalEntries.slice(0, 3).map((entry) => (
                    <div key={entry.id} className="group p-3 rounded-xl bg-sand-50 dark:bg-sand-800/40 hover:bg-sand-100 dark:hover:bg-sand-800/70 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] text-sand-400">{formatDateShortByLang(entry.date, lang)}</span>
                            {entry.mood && <span className="text-[11px] text-sand-400">· {t('moodLabel')}: {entry.mood}</span>}
                          </div>
                          <p className="text-sm text-sand-600 dark:text-sand-300 leading-relaxed whitespace-pre-wrap line-clamp-3">{entry.text}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button onClick={() => handleEditJournal(entry)} className="p-1 rounded-lg text-sand-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDeleteJournal(entry.id)} className="p-1 rounded-lg text-sand-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ));

      case 'links':
        return sectionWrapper('links', (
          <Card className="animate-slide-up" hover>
            <CardHeader title={t('linksTitle')} icon={Link2} action={<button onClick={() => navigate('/links')} className="text-xs text-brand-600 dark:text-brand-400 font-medium flex items-center gap-1 hover:gap-1.5 transition-all">{t('seeAll')}<ExternalLink className="w-3 h-3" /></button>} />
            <div className="px-5 pb-4">
              {links.length === 0 ? (
                <button onClick={() => navigate('/links')} className="w-full flex items-center gap-2 py-3 rounded-xl text-sand-400 hover:text-brand-600 hover:bg-brand-50/50 dark:hover:bg-brand-900/20 transition-colors text-sm">
                  <Plus className="w-4 h-4" />{t('newLink')}
                </button>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {links.slice(0, 6).map((link) => {
                    const folder = folders.find((f) => f.id === link.folder_id);
                    let domain = '';
                    try { domain = new URL(link.url).hostname; } catch { domain = link.url.replace(/^https?:\/\//, '').split('/')[0]; }
                    return (
                      <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-1.5 p-3 rounded-xl bg-sand-50 dark:bg-sand-800/40 hover:bg-sand-100 dark:hover:bg-sand-800/70 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-sand-800 flex items-center justify-center shrink-0 overflow-hidden border border-sand-200 dark:border-sand-700">
                          <img src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} alt="" className="w-6 h-6 object-contain" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        </div>
                        <p className="text-xs font-medium text-sand-700 dark:text-sand-200 truncate w-full text-center">{link.name}</p>
                        {folder && <p className="text-[10px] text-sand-400 truncate w-full text-center">{folder.name}</p>}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        ));
    }
  };

  // Determine if tasks and habits are adjacent for grid layout
  const sectionsIdx = sections.indexOf('tasks');
  const habitsIdx = sections.indexOf('habits');
  const tasksHabitsPaired = sectionsIdx !== -1 && habitsIdx !== -1 && Math.abs(sectionsIdx - habitsIdx) === 1;

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <p className="text-sm text-sand-400 dark:text-sand-500 capitalize">{formatDateByLang(new Date(), lang)}</p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-sand-900 dark:text-white mt-1">{getGreeting(lang)}</h1>
        <p className="text-sand-500 dark:text-sand-400 mt-2 text-balance">{t('todaySubtitle')}</p>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((id) => {
          // Pair tasks+habits side by side when adjacent
          if (id === 'tasks' && tasksHabitsPaired && sectionsIdx < habitsIdx) {
            return (
              <div key="tasks-habits-pair" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderSection('tasks')}
                {renderSection('habits')}
              </div>
            );
          }
          if (id === 'habits' && tasksHabitsPaired && sectionsIdx < habitsIdx) {
            return null; // already rendered in the pair
          }
          return <div key={id}>{renderSection(id)}</div>;
        })}
      </div>

      {/* Add section bar */}
      {hiddenSections.length > 0 && (
        <div className="relative">
          {showAddSection ? (
            <div className="rounded-2xl border-2 border-dashed border-sand-200 dark:border-sand-800 p-4 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sand-500 dark:text-sand-400">
                  <LayoutGrid className="w-4 h-4" />
                  <span className="text-sm font-medium">Adicionar seção</span>
                </div>
                <button onClick={() => setShowAddSection(false)} className="p-1 rounded-lg text-sand-400 hover:bg-sand-100 dark:hover:bg-sand-800"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {hiddenSections.map((id) => {
                  const meta = SECTION_META[id];
                  const Icon = meta.icon;
                  return (
                    <button
                      key={id}
                      onClick={() => { addSection(id); setShowAddSection(false); }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-sand-50 dark:bg-sand-800/50 hover:bg-brand-50 dark:hover:bg-brand-900/20 text-sand-600 dark:text-sand-300 hover:text-brand-600 dark:hover:text-brand-400 text-sm font-medium transition-colors border border-sand-200 dark:border-sand-800"
                    >
                      <Icon className="w-4 h-4" />
                      {t(meta.label as never)}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddSection(true)}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-sand-200 dark:border-sand-800 text-sand-400 hover:text-brand-600 hover:border-brand-300 dark:hover:border-brand-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Adicionar seção
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <TaskModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} onSave={handleSaveTask} task={editingTask} />
      <GoalModal open={goalModalOpen} onClose={() => setGoalModalOpen(false)} onSave={handleSaveGoal} goal={editingGoal} areas={areas} onCreateArea={createArea} onDeleteArea={deleteArea} />
      <HabitModal open={habitModalOpen} onClose={() => setHabitModalOpen(false)} onSave={handleSaveHabit} habit={editingHabit} />
    </div>
  );
}
