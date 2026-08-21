import { cn } from '@/lib/utils';

import { formatCurrency } from '../lib/accounting-data';

interface AmountProps {
  value: number | null;
  /**
   * How the figure reads in context: money in, money out, or a position
   * that is simply what it is.
   */
  tone?: 'in' | 'out' | 'neutral' | 'muted';
  /** Renders an em dash instead of a zero, for an empty ledger column. */
  dashIfEmpty?: boolean;
  className?: string;
}

const TONES = {
  in: 'text-success',
  out: 'text-danger',
  neutral: 'text-text-primary',
  muted: 'text-text-secondary',
} as const;

/**
 * A figure in a column.
 *
 * Always tabular so decimal places line up down the page — the entire point
 * of a ledger view — and always right-aligned by the cell that holds it.
 */
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
