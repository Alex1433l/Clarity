import { cn } from '@/utils';
import { useLanguage } from '@/hooks/useLanguage';
import type { Priority } from '@/types';

const priorityConfig: Record<Priority, { labelKey: 'high' | 'medium' | 'low'; className: string; dot: string }> = {
  high: { labelKey: 'high', className: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400', dot: 'bg-red-500' },
  medium: { labelKey: 'medium', className: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-500' },
  low: { labelKey: 'low', className: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400', dot: 'bg-sky-500' },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { t } = useLanguage();
  const cfg = priorityConfig[priority];
  return (
    <span className={cn('chip', cfg.className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {t(cfg.labelKey)}
    </span>
  );
}

export function CategoryBadge({ children }: { children: React.ReactNode }) {
  return <span className="chip bg-sand-100 text-sand-600 dark:bg-sand-800 dark:text-sand-400">{children}</span>;
}
