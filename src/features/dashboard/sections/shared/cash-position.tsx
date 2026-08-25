import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { Card, CardHeader } from '../../components';
import { CASH_POSITION } from '../../constants/mock-data';
import { formatCurrency } from '../../lib/dashboard-data';

import { cn } from '@/lib/utils';

interface CashPositionProps {
  title?: string;
  closingLabel?: string;
}

export function CashPosition({
  title = "Today's Cash Position",
  closingLabel = 'Closing Balance',
}: CashPositionProps) {
  const rows = [
    { label: 'Opening Balance', value: formatCurrency(CASH_POSITION.opening), tone: 'text-text-primary' },
    { label: 'Receipts', value: `+${formatCurrency(CASH_POSITION.receipts)}`, tone: 'text-success' },
    { label: 'Payments', value: `−${formatCurrency(CASH_POSITION.payments)}`, tone: 'text-danger' },
  ];

  return (
    <Card>
      <CardHeader title={title} />

      <div className="p-5">
        <dl className="space-y-2.5">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3">
              <dt className="text-[13px] text-text-secondary">{row.label}</dt>
              <dd className={`text-[13px] font-medium tabular ${row.tone}`}>
                {row.value}
              </dd>
            </div>
          ))}

          <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
            <dt className="text-[13px] font-semibold text-text-primary">
              {closingLabel}
            </dt>
            <dd className="text-xl font-semibold tracking-[-0.02em] text-text-primary tabular">
              {formatCurrency(CASH_POSITION.closing)}
            </dd>
          </div>
        </dl>

        <Link
          href="/accounting/cash-book"
          className={cn(
            'mt-4 flex h-8 w-full items-center justify-center gap-1 rounded-lg',
            'border border-border bg-surface-2 text-xs font-medium text-text-secondary',
            'transition-colors hover:bg-interactive-hover hover:text-text-primary',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          )}
        >
          View Cash Book
          <ChevronRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </Card>
  );
}
