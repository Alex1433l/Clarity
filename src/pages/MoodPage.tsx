import { useState, useEffect } from 'react';
import {
  Brain, Zap, Smile, AlertCircle, Trash2, Loader2,
  Heart, Send, BookOpen, Pencil, X,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Card, { CardHeader } from '@/components/Card';
import { useMood } from '@/hooks/useMood';
import { useGratitude } from '@/hooks/useGratitude';
import { useJournal, type JournalEntry } from '@/hooks/useJournal';
import { useLanguage, formatDateShortByLang } from '@/hooks/useLanguage';
import { cn } from '@/utils';

const scaleConfig = [
  { key: 'anxiety' as const, labelKey: 'anxiety' as const, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20', bar: 'bg-rose-500' },
  { key: 'energy' as const, labelKey: 'energy' as const, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', bar: 'bg-amber-500' },
  { key: 'mood' as const, labelKey: 'moodScale' as const, icon: Smile, color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20', bar: 'bg-brand-500' },
];

export default function MoodPage() {
  const { t, lang } = useLanguage();
  const { today, loading, error, save, deleteToday } = useMood();
  const { entries: gratitudeEntries, addEntry: addGratitude, deleteEntry: deleteGratitude, error: gratitudeError } = useGratitude();
  const { entries: journalEntries, createEntry: createJournal, updateEntry: updateJournal, deleteEntry: deleteJournal, error: journalError } = useJournal();

  const [values, setValues] = useState<{ anxiety: number | null; energy: number | null; mood: number | null }>({ anxiety: null, energy: null, mood: null });

  // Gratitude state
  const [gratitudeText, setGratitudeText] = useState('');
  const [savingGratitude, setSavingGratitude] = useState(false);

  // Journal state
  const [journalText, setJournalText] = useState('');
  const [journalMood, setJournalMood] = useState('');
  const [savingJournal, setSavingJournal] = useState(false);
  const [editingJournal, setEditingJournal] = useState<JournalEntry | null>(null);

  useEffect(() => {
    if (today) setValues({ anxiety: today.anxiety, energy: today.energy, mood: today.mood });
  }, [today]);

  const setScale = (key: 'anxiety' | 'energy' | 'mood', n: number) => setValues((prev) => ({ ...prev, [key]: n }));
  const handleSave = () => {
    if (values.anxiety === null || values.energy === null || values.mood === null) return;
    save(values as { anxiety: number; energy: number; mood: number });
  };
  const allSelected = values.anxiety !== null && values.energy !== null && values.mood !== null;

  // Gratitude handlers
  const handleAddGratitude = async () => {
    if (!gratitudeText.trim()) return;
    setSavingGratitude(true);
    await addGratitude(gratitudeText);
    setGratitudeText('');
    setSavingGratitude(false);
  };
  const handleDeleteGratitude = (id: string) => {
    if (confirm(t('confirmDeleteGratitude'))) deleteGratitude(id);
  };

  // Journal handlers
  const handleSaveJournal = async () => {
    if (!journalText.trim()) return;
    setSavingJournal(true);
    if (editingJournal) {
      await updateJournal(editingJournal.id, { text: journalText, mood: journalMood || null });
      setEditingJournal(null);
    } else {
      await createJournal({ text: journalText, mood: journalMood || null });
    }
    setJournalText('');
    setJournalMood('');
    setSavingJournal(false);
  };
  const handleEditJournal = (entry: JournalEntry) => {
    setEditingJournal(entry);
    setJournalText(entry.text);
    setJournalMood(entry.mood ?? '');
  };
  const handleCancelEdit = () => {
    setEditingJournal(null);
    setJournalText('');
    setJournalMood('');
  };
  const handleDeleteJournal = (id: string) => {
    if (confirm(t('confirmDeleteJournal'))) deleteJournal(id);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title={t('moodTitle')} subtitle={t('moodSubtitle')} icon={Brain}
        action={
          <div className="flex gap-2">
            {today && <button onClick={deleteToday} className="btn-outline text-xs sm:text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4" /> {t('delete')}</button>}
            <button onClick={handleSave} disabled={!allSelected} className={cn('btn-primary text-xs sm:text-sm', !allSelected && 'opacity-50 cursor-not-allowed')}>{today ? t('update') : t('save')}</button>
          </div>
        } />

      <p className="text-xs text-sand-400 dark:text-sand-500 mb-6 italic">{t('moodDisclaimer')}</p>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {/* Mood scales */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-brand-500 animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          {scaleConfig.map((scale) => {
            const val = values[scale.key];
            return (
              <Card key={scale.key} className="p-5" hover>
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', scale.bg)}><scale.icon className={cn('w-5 h-5', scale.color)} /></div>
                  <div><h3 className="text-sm font-semibold text-sand-800 dark:text-sand-100">{t(scale.labelKey)}</h3><p className="text-xs text-sand-400">{t('scale1to5')}</p></div>
                  <span className="ml-auto text-2xl font-bold text-sand-800 dark:text-sand-100">{val ?? '—'}</span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setScale(scale.key, n)}
                      className={cn('flex-1 h-10 rounded-xl text-sm font-medium transition-all', n === val ? cn(scale.bar, 'text-white shadow-sm') : 'bg-sand-100 dark:bg-sand-800 text-sand-400 hover:bg-sand-200 dark:hover:bg-sand-700')}>{n}</button>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Gratitude section */}
      <Card className="mt-6" hover>
        <CardHeader title={t('gratitudeTitle')} icon={Heart} />
        <div className="px-5 pb-4">
          <div className="flex gap-2 mb-4">
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
              disabled={!gratitudeText.trim() || savingGratitude}
              className={cn('btn-primary self-end px-3.5 py-2.5', (!gratitudeText.trim() || savingGratitude) && 'opacity-50 cursor-not-allowed')}
            >
              {savingGratitude ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>

          {gratitudeError && (
            <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />{gratitudeError}
            </div>
          )}

          {gratitudeEntries.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <Heart className="w-8 h-8 text-sand-200 dark:text-sand-700" />
              <p className="text-sm text-sand-400">{t('gratitudeEmpty')}</p>
            </div>
          ) : (
            <>
              <p className="text-xs font-medium text-sand-400 mb-3">{t('gratitudeThisMonth')} · {gratitudeEntries.length}</p>
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {gratitudeEntries.map((entry) => (
                  <div key={entry.id} className="group flex items-start gap-2.5 p-3 rounded-xl bg-sand-50 dark:bg-sand-800/40 hover:bg-sand-100 dark:hover:bg-sand-800/70 transition-colors">
                    <Heart className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" fill="currentColor" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-sand-600 dark:text-sand-300 leading-relaxed">{entry.text}</p>
                      <p className="text-[11px] text-sand-400 mt-1">{formatDateShortByLang(entry.created_at.slice(0, 10), lang)}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteGratitude(entry.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg text-sand-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Journal section */}
      <Card className="mt-6" hover>
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
                <button onClick={handleCancelEdit} className="btn-outline px-3">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleSaveJournal}
                disabled={!journalText.trim() || savingJournal}
                className={cn('btn-primary px-3.5 py-2.5', (!journalText.trim() || savingJournal) && 'opacity-50 cursor-not-allowed')}
              >
                {savingJournal ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {journalError && (
            <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />{journalError}
            </div>
          )}

          {journalEntries.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <BookOpen className="w-8 h-8 text-sand-200 dark:text-sand-700" />
              <p className="text-sm text-sand-400">{t('noJournalEntries')}</p>
            </div>
          ) : (
            <>
              <p className="text-xs font-medium text-sand-400 mb-3">{t('journalEntriesTitle')}</p>
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {journalEntries.map((entry) => (
                  <div key={entry.id} className="group p-3 rounded-xl bg-sand-50 dark:bg-sand-800/40 hover:bg-sand-100 dark:hover:bg-sand-800/70 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] text-sand-400">{formatDateShortByLang(entry.date, lang)}</span>
                          {entry.mood && <span className="text-[11px] text-sand-400">· {t('moodLabel')}: {entry.mood}</span>}
                        </div>
                        <p className="text-sm text-sand-600 dark:text-sand-300 leading-relaxed whitespace-pre-wrap">{entry.text}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => handleEditJournal(entry)}
                          className="p-1 rounded-lg text-sand-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteJournal(entry.id)}
                          className="p-1 rounded-lg text-sand-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
