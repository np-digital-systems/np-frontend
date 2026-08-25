import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { Card, CardHeader } from '../../components';
import { BANK_ACCOUNTS, TOTAL_BANK_BALANCE } from '../../constants/mock-data';
import { formatCurrency } from '../../lib/dashboard-data';

import { cn } from '@/lib/utils';

interface BankPositionProps {
  title?: string;
  showLink?: boolean;
}

export function BankPosition({
  title = 'Bank Position',
  showLink = false,
}: BankPositionProps) {
  return (
    <Card>
      <CardHeader title={title} />

      <div className="p-5">
        <dl className="space-y-2.5">
          {BANK_ACCOUNTS.map((account) => (
            <div key={account.name} className="flex items-center justify-between gap-3">
              <dt className="text-[13px] text-text-secondary">{account.name}</dt>
              <dd className="text-[13px] font-medium text-text-primary tabular">
                {formatCurrency(account.balance)}
              </dd>
            </div>
          ))}

          <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
            <dt className="text-[13px] font-semibold text-text-primary">Total</dt>
            <dd className="text-base font-semibold text-text-primary tabular">
              {formatCurrency(TOTAL_BANK_BALANCE)}
            </dd>
          </div>
        </dl>

        {showLink && (
          <Link
            href="/accounting/bank-book"
            className={cn(
              'mt-4 flex h-8 w-full items-center justify-center gap-1 rounded-lg',
              'border border-border bg-surface-2 text-xs font-medium text-text-secondary',
              'transition-colors hover:bg-interactive-hover hover:text-text-primary',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
            )}
          >
            Open Bank Book
            <ChevronRight className="size-3.5" aria-hidden />
          </Link>
        )}
      </div>
    </Card>
  );
}
