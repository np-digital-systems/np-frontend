'use client';

import { useMemo, useState } from 'react';
import { Printer } from 'lucide-react';

import { PortalPageHeader, ReadOnlyNotice } from '@/components/portal/ui';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { BookSummaryCards, BookTable } from '../../components/book-view';
import type { AccountingAccess } from '../../lib/accounting-access';
import { formatCurrency, formatMonthLabel } from '../../lib/accounting-data';
import { bookMonths, sliceBook } from '../../lib/book';
import type { BookRow, BookSummary } from '../../types';

interface CashBookScreenProps {
  rows: readonly BookRow[];
  summary: BookSummary;
  access: AccountingAccess;
  year: number;
}

export function CashBookScreen({
  rows,
  summary,
  access,
  year,
}: CashBookScreenProps) {
  const [month, setMonth] = useState<string | 'all'>('all');

  const months = useMemo(() => bookMonths(rows), [rows]);

  const slice = useMemo(
    () => sliceBook(rows, month, summary.opening),
    [rows, month, summary.opening],
  );

  const periodLabel =
    month === 'all' ? `FY ${year}` : formatMonthLabel(month);

  return (
    <>
      <PortalPageHeader
        title="Cash Book"
        description="Physical cash held by the temple — hundial collections, counter receipts and cash payments."
        meta={[
          <span key="period" className="tabular">
            {periodLabel}
          </span>,
          <span key="balance" className="tabular">
            Cash in hand {formatCurrency(summary.closing)}
          </span>,
        ]}
        actions={
          <>
            <Select
              value={month}
              onValueChange={(value) => setMonth(value)}
            >
              <SelectTrigger aria-label="Cash book period">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Full year {year}</SelectItem>

                {months.map((entry) => (
                  <SelectItem key={entry} value={entry}>
                    {formatMonthLabel(entry)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {access.canExportTransactions && (
              <Button variant="outline">
                <Printer />
                Print
              </Button>
            )}
          </>
        }
      />

      {!access.canCreateVouchers && (
        <ReadOnlyNotice message="The cash book is a record of what has posted. Entries are made through receipt and payment vouchers." />
      )}

      <BookSummaryCards
        summary={slice.summary}
        inflowLabel="Cash Receipts"
        outflowLabel="Cash Payments"
        periodLabel={periodLabel}
      />

      <BookTable
        rows={slice.rows}
        summary={slice.summary}
        inflowLabel="Receipts"
        outflowLabel="Payments"
        emptyTitle="No cash movements in this period"
        emptyDescription="Cash receipts and payments appear here once their vouchers are posted."
      />
    </>
  );
}
