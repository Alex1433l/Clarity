import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className, hover }: CardProps) {
  return (
    <div className={cn('card', hover && 'card-hover', className)}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  icon: Icon,
  action,
}: {
  title: string;
  icon?: LucideIcon;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 pt-4 pb-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-sand-400 dark:text-sand-500" strokeWidth={2} />}
        <h3 className="text-sm font-semibold text-sand-800 dark:text-sand-100">{title}</h3>
      </div>
      {action}
    </div>
  );
}
