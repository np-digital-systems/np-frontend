import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

import { FREQUENCY_LABELS } from '../lib/event-data';
import type { FrequencyType } from '../types';

const chip = cva(
  'inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap',
  {
    variants: {
      tone: {
        recurring: 'bg-info-subtle text-info',
        lunar: 'bg-warning-subtle text-warning',
        festival: 'bg-primary-subtle text-primary',
        annual: 'bg-neutral-subtle text-text-secondary',
      },
    },
    defaultVariants: { tone: 'recurring' },
  },
);

const FREQUENCY_TONE = {
  weekly: 'recurring',
  monthly_once: 'recurring',
  monthly_twice: 'lunar',
  multi_day: 'festival',
  annual: 'annual',
} as const;

interface FrequencyBadgeProps {
  frequency: FrequencyType;
  className?: string;
}

export function FrequencyBadge({ frequency, className }: FrequencyBadgeProps) {
  return (
    <span className={cn(chip({ tone: FREQUENCY_TONE[frequency] }), className)}>
      {FREQUENCY_LABELS[frequency]}
    </span>
  );
}
