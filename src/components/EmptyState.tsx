import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-12 px-6', className)}>
      <div className="w-14 h-14 rounded-2xl bg-sand-100 dark:bg-sand-800 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-sand-400 dark:text-sand-500" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-semibold text-sand-700 dark:text-sand-200 mb-1">{title}</p>
      {description && (
        <p className="text-xs text-sand-400 dark:text-sand-500 max-w-xs leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
