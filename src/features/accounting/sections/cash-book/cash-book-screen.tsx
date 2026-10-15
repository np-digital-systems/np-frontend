'use client';

import { useMemo, useState } from 'react';
import { Printer } from 'lucide-react';

import {
  PortalPageHeader,
  ReadOnlyNotice,
  SegmentedControl,
} from '@/components/portal/ui';
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
import {
  formatCurrency,
  formatLongDate,
  formatMonthLabel,
} from '../../lib/accounting-data';
import { bookDays, bookMonths, sliceBook } from '../../lib/book';
import type { BookRow, BookSummary } from '../../types';

const GRAINS = ['Year', 'Month', 'Day'] as const;
type Grain = (typeof GRAINS)[number];

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
  const [grain, setGrain] = useState<Grain>('Year');
  const [month, setMonth] = useState<string>('');
  const [day, setDay] = useState<string>('');

  const months = useMemo(() => bookMonths(rows), [rows]);
  const days = useMemo(() => bookDays(rows), [rows]);

  // Fall back to the latest month or day so switching grain never selects an empty period.
  const period =
    grain === 'Year'
      ? 'all'
      : grain === 'Month'
        ? month || months[0] || 'all'
        : day || days[0] || 'all';

  const slice = useMemo(
    () => sliceBook(rows, period, summary.opening),
    [rows, period, summary.opening],
  );

  const periodLabel =
    period === 'all'
      ? `FY ${year}`
      : period.length === 10
        ? formatLongDate(period)
        : formatMonthLabel(period);

  return (
    <>
      <PortalPageHeader
        title="Cash Book"
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
            <SegmentedControl
              label="Cash book granularity"
              options={GRAINS}
              value={grain}
              onChange={setGrain}
            />

            {grain === 'Month' && (
              <Select value={period} onValueChange={setMonth}>
                <SelectTrigger aria-label="Cash book month">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {months.map((entry) => (
                    <SelectItem key={entry} value={entry}>
                      {formatMonthLabel(entry)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {grain === 'Day' && (
              <Select value={period} onValueChange={setDay}>
                <SelectTrigger aria-label="Cash book day">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {days.map((entry) => (
                    <SelectItem key={entry} value={entry}>
                      {formatLongDate(entry)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

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
        <ReadOnlyNotice message="Entries are made through receipt and payment vouchers." />
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
        emptyDescription="Entries appear once vouchers are posted."
      />
    </>
  );
}
