'use client';

import { BookOpen } from 'lucide-react';

import {
  Card,
  DataCell,
  DataRow,
  DataTable,
  DataTableEmpty,
  EmptyState,
  StatCard,
  type DataColumn,
} from '@/components/portal/ui';

import { formatCurrency, formatShortDate } from '../lib/accounting-data';
import type { BookRow, BookSummary } from '../types';

import { Amount } from './amount';

interface BookSummaryCardsProps {
  summary: BookSummary;
  inflowLabel: string;
  outflowLabel: string;
  /** What the period the figures cover is — a month, or the whole year. */
  periodLabel: string;
}

/**
 * Opening, movement, closing — the four figures a book exists to state.
 *
 * Ordered as they are read in a physical book, so the closing balance is the
 * last thing on the row rather than buried in the middle.
 */
export function BookSummaryCards({
  summary,
  inflowLabel,
  outflowLabel,
  periodLabel,
}: BookSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        label="Opening Balance"
        value={formatCurrency(summary.opening)}
        caption={`Start of ${periodLabel}`}
      />
      <StatCard
        label={inflowLabel}
        value={formatCurrency(summary.inflow)}
        caption={periodLabel}
        trend={
          summary.inflow > 0
            ? { value: 'in', direction: 'up', isPositive: true }
            : undefined
        }
      />
      <StatCard
        label={outflowLabel}
        value={formatCurrency(summary.outflow)}
        caption={periodLabel}
        trend={
          summary.outflow > 0
            ? { value: 'out', direction: 'down', isPositive: false }
            : undefined
        }
      />
      <StatCard
        label="Closing Balance"
        value={formatCurrency(summary.closing)}
        caption={`End of ${periodLabel}`}
      />
    </div>
  );
}

interface BookTableProps {
  rows: readonly BookRow[];
  summary: BookSummary;
  inflowLabel: string;
  outflowLabel: string;
  /** Bank books carry a cheque number; the cash book has nowhere to put one. */
  showCheque?: boolean;
  emptyTitle: string;
  emptyDescription: string;
}

/**
 * A book: movements in date order with the balance each one left behind.
 *
 * Rows read newest-first like every other register in the portal, and the
 * opening balance is pinned as the last row so the column of balances still
 * resolves to something the reader can follow to its origin.
 */
export function BookTable({
  rows,
  summary,
  inflowLabel,
  outflowLabel,
  showCheque = false,
  emptyTitle,
  emptyDescription,
}: BookTableProps) {
  const columns: DataColumn[] = [
    { key: 'date', label: 'Date' },
    { key: 'ref', label: 'Reference' },
    { key: 'particulars', label: 'Particulars' },
    ...(showCheque ? [{ key: 'cheque', label: 'Cheque No' } as const] : []),
    { key: 'account', label: 'Account' },
    { key: 'in', label: inflowLabel, align: 'right' },
    { key: 'out', label: outflowLabel, align: 'right' },
    { key: 'balance', label: 'Balance', align: 'right' },
  ];

  return (
    <Card>
      <DataTable columns={columns} minWidth={showCheque ? 1040 : 940}>
        {rows.length === 0 ? (
          <DataTableEmpty colSpan={columns.length}>
            <EmptyState
              icon={BookOpen}
              title={emptyTitle}
              description={emptyDescription}
            />
          </DataTableEmpty>
        ) : (
          <>
            {rows.map((row) => (
              <DataRow key={row.id}>
                <DataCell nowrap className="text-xs text-text-muted tabular">
                  {formatShortDate(row.date)}
                </DataCell>

                <DataCell nowrap className="ref text-xs font-medium text-primary">
                  {row.ref}
                </DataCell>

                <DataCell>
                  <p className="truncate text-[13px] text-text-primary">
                    {row.description}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-text-muted">
                    {row.fund.name}
                    {row.project ? ` · ${row.project.name}` : ''}
                  </p>
                </DataCell>

                {showCheque && (
                  <DataCell nowrap className="ref text-xs text-text-secondary">
                    {row.chequeNo ?? '—'}
                  </DataCell>
                )}

                <DataCell nowrap className="text-xs text-text-secondary">
                  {row.account.code} · {row.account.name}
                </DataCell>

                <DataCell align="right" nowrap>
                  <Amount value={row.inflow} tone="in" dashIfEmpty />
                </DataCell>

                <DataCell align="right" nowrap>
                  <Amount value={row.outflow} tone="out" dashIfEmpty />
                </DataCell>

                <DataCell
                  align="right"
                  nowrap
                  className="text-[13px] font-medium text-text-primary tabular"
                >
                  {formatCurrency(row.balance)}
                </DataCell>
              </DataRow>
            ))}

            <tr className="border-t border-border-strong bg-surface-2">
              <td
                colSpan={showCheque ? 5 : 4}
                className="px-4 py-2.5 text-[11px] font-medium text-text-muted"
              >
                Opening balance {formatCurrency(summary.opening)} · {rows.length}{' '}
                {rows.length === 1 ? 'movement' : 'movements'}
              </td>
              <td className="px-4 py-2.5 text-right text-[13px] font-semibold text-success tabular">
                {formatCurrency(summary.inflow)}
              </td>
              <td className="px-4 py-2.5 text-right text-[13px] font-semibold text-danger tabular">
                {formatCurrency(summary.outflow)}
              </td>
              <td className="px-4 py-2.5 text-right text-[13px] font-semibold text-text-primary tabular">
                {formatCurrency(summary.closing)}
              </td>
            </tr>
          </>
        )}
      </DataTable>
    </Card>
  );
}
