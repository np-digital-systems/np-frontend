'use client';

import { useMemo, useState } from 'react';
import { Printer } from 'lucide-react';

import { Card, CardBody, PortalPageHeader } from '@/components/portal/ui';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { BookSummaryCards, BookTable } from '../../components/book-view';
import type { AccountingAccess } from '../../lib/accounting-access';
import {
  BANK_ACCOUNT_TYPE_LABELS,
  formatCurrency,
  formatMonthLabel,
} from '../../lib/accounting-data';
import { bookMonths, sliceBook } from '../../lib/book';
import type { BankAccountRecord, BookRow, BookSummary } from '../../types';

/** One bank account's book, pre-built on the server. */
export interface BankBookEntry {
  readonly bankAccountId: number;
  readonly rows: readonly BookRow[];
  readonly summary: BookSummary;
}

interface BankBookScreenProps {
  banks: readonly BankAccountRecord[];
  books: readonly BankBookEntry[];
  access: AccountingAccess;
  year: number;
}

/**
 * The bank book — one statement per account.
 *
 * Which account is being read is the first decision, so it is a control at
 * the top rather than a filter buried in a toolbar, and the chosen account's
 * identity stays on screen while its rows are read.
 */
export function BankBookScreen({
  banks,
  books,
  access,
  year,
}: BankBookScreenProps) {
  const active = banks.filter((bank) => bank.isActive);

  const [bankId, setBankId] = useState<number>(active[0]?.id ?? 0);
  const [month, setMonth] = useState<string | 'all'>('all');

  const bank = banks.find((entry) => entry.id === bankId) ?? null;
  const book = books.find((entry) => entry.bankAccountId === bankId);

  const rows = useMemo(() => book?.rows ?? [], [book]);
  const months = useMemo(() => bookMonths(rows), [rows]);

  const slice = useMemo(
    () => sliceBook(rows, month, book?.summary.opening ?? 0),
    [rows, month, book?.summary.opening],
  );

  const periodLabel = month === 'all' ? `FY ${year}` : formatMonthLabel(month);

  return (
    <>
      <PortalPageHeader
        title="Bank Book"
        description="Movements through each of the temple’s bank accounts, with the running balance."
        meta={[
          <span key="period" className="tabular">
            {periodLabel}
          </span>,
          bank ? (
            <span key="balance" className="tabular">
              {bank.label} · {formatCurrency(bank.balance)}
            </span>
          ) : null,
        ].filter(Boolean)}
        actions={
          <>
            <Select
              value={String(bankId)}
              onValueChange={(value) => {
                setBankId(Number(value));
                // Months differ per account; carrying the old selection
                // would land on a month this account has no rows in.
                setMonth('all');
              }}
            >
              <SelectTrigger aria-label="Bank account">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {active.map((entry) => (
                  <SelectItem key={entry.id} value={String(entry.id)}>
                    {entry.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={month} onValueChange={(value) => setMonth(value)}>
              <SelectTrigger aria-label="Bank book period">
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

      {bank && (
        <Card>
          <CardBody className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <Field label="Account" value={bank.label} />
            <Field label="Bank" value={`${bank.bankName}, ${bank.branch}`} />
            <Field label="Account Number" value={bank.accountNumber} mono />
            <Field
              label="Type"
              value={BANK_ACCOUNT_TYPE_LABELS[bank.type]}
            />
            <Field
              label="Current Balance"
              value={formatCurrency(bank.balance)}
              emphasis
            />
          </CardBody>
        </Card>
      )}

      <BookSummaryCards
        summary={slice.summary}
        inflowLabel="Deposits"
        outflowLabel="Withdrawals"
        periodLabel={periodLabel}
      />

      <BookTable
        rows={slice.rows}
        summary={slice.summary}
        inflowLabel="Deposits"
        outflowLabel="Withdrawals"
        showCheque
        emptyTitle="No movements in this period"
        emptyDescription="Bank deposits and withdrawals appear here once their vouchers are posted."
      />
    </>
  );
}

function Field({
  label,
  value,
  mono,
  emphasis,
}: {
  label: string;
  value: string;
  mono?: boolean;
  emphasis?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-text-muted">{label}</p>
      <p
        className={cn(
          'mt-0.5 truncate text-[13px]',
          emphasis
            ? 'font-semibold text-text-primary tabular'
            : 'text-text-secondary',
          mono && 'ref',
        )}
      >
        {value}
      </p>
    </div>
  );
}
