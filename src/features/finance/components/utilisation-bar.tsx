import { cn } from '@/lib/utils';

interface UtilisationBarProps {
    value: number;
    label: string;
    warnAt?: number;
  className?: string;
}

export function UtilisationBar({
  value,
  label,
  warnAt = 0.85,
  className,
}: UtilisationBarProps) {
  const clamped = Math.min(Math.max(value, 0), 1);
  const isOver = value > 1;

  return (
    <div
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-surface-2', className)}
      role="img"
      aria-label={`${label}: ${Math.round(value * 100)} percent`}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width]',
          isOver
            ? 'bg-danger'
            : value >= warnAt
              ? 'bg-warning'
              : 'bg-primary',
        )}
        style={{ width: `${Math.max(clamped * 100, 2)}%` }}
      />
    </div>
  );
}
