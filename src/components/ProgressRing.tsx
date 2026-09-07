import { cn } from '@/utils';

interface ProgressRingProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
}

export default function ProgressRing({
  value,
  size = 56,
  strokeWidth = 4,
  className,
  showLabel = true,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-sand-200 dark:stroke-sand-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="stroke-brand-500 transition-all duration-500 ease-out"
        />
      </svg>
      {showLabel && (
        <span className="absolute text-xs font-semibold text-sand-700 dark:text-sand-200">
          {Math.round(value)}%
        </span>
      )}
    </div>
  );
}
