import { cn } from '@/lib/utils';

interface EventNameProps {
  /** Tamil name — the one the temple's own calendar is printed in. */
  name: string;
  /** English rendering, kept secondary. */
  nameEn?: string;
  /** "Day 3", "Week 24", "ஆபரணம்" — which instance this row is. */
  instanceLabel?: string;
  className?: string;
}

/**
 * The two-line name cell used by every events table.
 *
 * The temple names its poojas in Tamil and the portal chrome is in English,
 * so both are shown: the Tamil name carries the identity, the English line
 * and the instance sit under it as support.
 */
export function EventName({
  name,
  nameEn,
  instanceLabel,
  className,
}: EventNameProps) {
  return (
    <div className={cn('min-w-0', className)}>
      <p className="truncate text-[13px] font-medium text-text-primary">
        {name}
      </p>

      {(nameEn || instanceLabel) && (
        <p className="mt-0.5 truncate text-xs text-text-muted">
          {[nameEn, instanceLabel].filter(Boolean).join(' · ')}
        </p>
      )}
    </div>
  );
}
