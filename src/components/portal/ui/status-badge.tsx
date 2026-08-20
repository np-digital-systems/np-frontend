import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

import type { BadgeStatus } from './types';

const badge = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap',
  {
    variants: {
      tone: {
        neutral: 'bg-neutral-subtle text-text-secondary',
        info: 'bg-info-subtle text-info',
        success: 'bg-success-subtle text-success',
        warning: 'bg-warning-subtle text-warning',
        danger: 'bg-danger-subtle text-danger',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

type Tone = NonNullable<VariantProps<typeof badge>['tone']>;

/**
 * Status is carried by tone, but tone alone is not an accessible signal —
 * the label always spells the status out, and the dot is decorative.
 */
const STATUS_TONE: Record<BadgeStatus, Tone> = {
  Draft: 'neutral',
  Cancelled: 'neutral',
  Submitted: 'info',
  Scheduled: 'info',
  Posted: 'info',
  'Pending Approval': 'warning',
  Approved: 'success',
  Active: 'success',
  Completed: 'success',
  Today: 'warning',
  Unassigned: 'neutral',
  Rejected: 'danger',
};

interface StatusBadgeProps {
  status: BadgeStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(badge({ tone: STATUS_TONE[status] }), className)}>
      <span
        className="size-1.5 shrink-0 rounded-full bg-current"
        aria-hidden
      />
      {status}
    </span>
  );
}
