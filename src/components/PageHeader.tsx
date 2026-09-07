import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}

export default function PageHeader({ title, subtitle, icon: Icon, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6 animate-fade-in">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-11 h-11 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-brand-600 dark:text-brand-400" strokeWidth={2} />
          </div>
        )}
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-sand-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-sand-500 dark:text-sand-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
