'use client';

import { cn } from '@/lib/utils';

interface SegmentedControlProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  /** Describes the control for assistive tech, e.g. "Chart period". */
  label: string;
}

/**
 * Apple-style segmented control.
 *
 * A `radiogroup` rather than a row of buttons: the options are mutually
 * exclusive choices of one setting, so arrow-key semantics and the selected
 * state both come for free.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex items-center gap-0.5 rounded-lg bg-surface-2 p-0.5"
    >
      {options.map((option) => {
        const isSelected = option === value;

        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option)}
            className={cn(
              'rounded-[6px] px-2.5 py-1 text-xs font-medium transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring',
              isSelected
                ? 'bg-surface text-text-primary shadow-xs'
                : 'text-text-muted hover:text-text-secondary',
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
