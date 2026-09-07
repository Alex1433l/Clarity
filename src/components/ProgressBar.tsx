import { cn } from '@/utils';

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  color?: 'brand' | 'amber' | 'sky' | 'rose';
}

const colorMap = {
  brand: 'bg-brand-500',
  amber: 'bg-amber-500',
  sky: 'bg-sky-500',
  rose: 'bg-rose-500',
};

export default function ProgressBar({ value, className, color = 'brand' }: ProgressBarProps) {
  return (
    <div className={cn('h-2 bg-sand-200 dark:bg-sand-800 rounded-full overflow-hidden', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500 ease-out', colorMap[color])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
