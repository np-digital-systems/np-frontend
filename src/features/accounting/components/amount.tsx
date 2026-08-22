import { cn } from '@/lib/utils';

import { formatCurrency } from '../lib/accounting-data';

interface AmountProps {
  value: number | null;
    tone?: 'in' | 'out' | 'neutral' | 'muted';
    dashIfEmpty?: boolean;
  className?: string;
}

const TONES = {
  in: 'text-success',
  out: 'text-danger',
  neutral: 'text-text-primary',
  muted: 'text-text-secondary',
} as const;

export function Amount({
  value,
  tone = 'neutral',
  dashIfEmpty = false,
  className,
}: AmountProps) {
  if (value === null || (dashIfEmpty && value === 0)) {
    return <span className="text-text-disabled">—</span>;
  }

  return (
    <span className={cn('tabular', TONES[tone], className)}>
      {formatCurrency(value)}
    </span>
  );
}
