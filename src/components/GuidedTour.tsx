import { useState } from 'react';
import {
  ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ExternalLink, FileText,
  Heart, Lightbulb, ListChecks, Moon, Settings, Sparkles, Target, X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLanguage, type TranslationKey } from '@/hooks/useLanguage';

interface GuidedTourProps {
  onClose: () => void;
  onComplete: () => Promise<string | null>;
}

type TourStep = {
  title: TranslationKey;
  description: TranslationKey;
  icon: LucideIcon;
};

const steps: TourStep[] = [
  { title: 'today', description: 'onboardingToday', icon: Sparkles },
  { title: 'tasks', description: 'onboardingTasks', icon: ListChecks },
  { title: 'habits', description: 'onboardingHabits', icon: CheckCircle2 },
  { title: 'mood', description: 'onboardingMood', icon: Heart },
  { title: 'goals', description: 'onboardingGoals', icon: Target },
  { title: 'reports', description: 'onboardingReports', icon: FileText },
  { title: 'links', description: 'onboardingLinks', icon: ExternalLink },
  { title: 'notes', description: 'onboardingNotes', icon: BookOpen },
  { title: 'settings', description: 'onboardingSettings', icon: Settings },
];

export default function GuidedTour({ onClose, onComplete }: GuidedTourProps) {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const step = steps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === steps.length - 1;

  const finish = async () => {
    setSaving(true);
    setSaveError(null);
    const error = await onComplete();
    setSaving(false);
    if (error) {
      setSaveError(t('tutorialSaveError'));
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-sand-950/55 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[min(680px,calc(100vh-32px))] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-elevated dark:bg-sand-900">
        <button
          type="button"
          onClick={finish}
          disabled={saving}
          aria-label={t('skip')}
          className="absolute right-4 top-4 z-10 rounded-xl p-2 text-sand-400 transition-colors hover:bg-sand-100 hover:text-sand-700 dark:hover:bg-sand-800 dark:hover:text-sand-200"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="bg-brand-600 px-6 pb-8 pt-10 text-white sm:px-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">CLARITY</p>
              <h2 className="font-display text-xl font-bold">{t('onboardingTitle')}</h2>
            </div>
          </div>
          <div className="flex items-end justify-between gap-4">
            <p className="max-w-xs text-sm leading-relaxed text-white/80">{t('onboardingWelcome')}</p>
            <span className="shrink-0 text-xs font-medium text-white/75">
              {t('onboardingStepOf').replace('{current}', String(currentStep + 1)).replace('{total}', String(steps.length))}
            </span>
          </div>
          <div className="mt-5 flex gap-1.5" aria-label={t('onboardingStepOf')}>
            {steps.map((tourStep, index) => (
              <span key={tourStep.title} className={`h-1.5 flex-1 rounded-full transition-colors ${index <= currentStep ? 'bg-white' : 'bg-white/25'}`} />
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-50 dark:bg-brand-900/30">
              <Icon className="h-9 w-9 text-brand-600 dark:text-brand-400" strokeWidth={1.8} />
            </div>
            <h3 className="font-display text-2xl font-bold text-sand-900 dark:text-white">{t(step.title)}</h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-sand-500 dark:text-sand-400">{t(step.description)}</p>
            {saveError && <p className="mt-5 text-xs font-medium text-red-600 dark:text-red-400">{saveError}</p>}
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={finish} disabled={saving} className="btn-outline text-sm disabled:opacity-50">{t('skip')}</button>
            <div className="flex gap-2 sm:ml-auto">
              <button type="button" onClick={() => setCurrentStep((stepIndex) => stepIndex - 1)} disabled={currentStep === 0 || saving} className="btn-outline inline-flex items-center gap-2 text-sm disabled:invisible">
                <ArrowLeft className="h-4 w-4" />{t('previous')}
              </button>
              {isLastStep ? (
                <button type="button" onClick={finish} disabled={saving} className="btn-primary inline-flex items-center gap-2 text-sm disabled:opacity-50">{t('startUsing')}<CheckCircle2 className="h-4 w-4" /></button>
              ) : (
                <button type="button" onClick={() => setCurrentStep((stepIndex) => stepIndex + 1)} disabled={saving} className="btn-primary inline-flex items-center gap-2 text-sm disabled:opacity-50">{t('next')}<ArrowRight className="h-4 w-4" /></button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
