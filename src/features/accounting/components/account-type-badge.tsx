import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

import { ACCOUNT_TYPE_LABELS } from '../lib/accounting-data';
import type { AccountType } from '../types';

const chip = cva(
  'inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap',
  {
    variants: {
      tone: {
        asset: 'bg-info-subtle text-info',
        liability: 'bg-warning-subtle text-warning',
        equity: 'bg-primary-subtle text-primary',
        income: 'bg-success-subtle text-success',
        expense: 'bg-danger-subtle text-danger',
      },
    },
    defaultVariants: { tone: 'asset' },
  },
);

export function AccountTypeBadge({
  type,
  className,
}: {
  type: AccountType;
  className?: string;
}) {
  return (
    <span className={cn(chip({ tone: type }), className)}>
      {ACCOUNT_TYPE_LABELS[type]}
    </span>
  );
}
