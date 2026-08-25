import { cn } from '@/lib/utils';

interface UtilisationBarProps {
  /** 0–1. Values above 1 mean the ceiling has been passed. */
  value: number;
  /** Read out to assistive tech in place of the bar. */
  label: string;
  /** Above this share the bar warns rather than simply reporting. */
  warnAt?: number;
  className?: string;
}

/**
 * How much of something has been used up.
 *
 * A balance alone does not say whether a fund is spending faster than it
 * receives, or whether a project is about to run past its budget — which is
 * the question both of those screens exist to answer.
 *
 * Over-budget is drawn as a full bar in the danger tone rather than as an
 * overflowing one: past the ceiling the exact overshoot is the number's job,
 * not the bar's.
 */
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
