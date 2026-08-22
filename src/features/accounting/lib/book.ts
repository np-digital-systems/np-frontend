import { monthKey } from '@/lib/format';

import type { BookRow, BookSummary } from '../types';

export function sliceBook(
  rows: readonly BookRow[],
  month: string | 'all',
  yearOpening: number,
): { rows: readonly BookRow[]; summary: BookSummary } {
  const selected =
    month === 'all'
      ? rows
      : rows.filter((row) => monthKey(row.date) === month);

  const inflow = selected.reduce((sum, row) => sum + row.inflow, 0);
  const outflow = selected.reduce((sum, row) => sum + row.outflow, 0);

  if (selected.length === 0) {
    // Nothing moved in this month, so the closing balance is whatever the
    // last row before it left behind.
    const priorRows =
      month === 'all'
        ? []
        : rows.filter((row) => monthKey(row.date) < month);

    const carried = priorRows[0]?.balance ?? yearOpening;

    return {
      rows: selected,
      summary: { opening: carried, inflow: 0, outflow: 0, closing: carried },
    };
  }

  // Rows arrive newest-first, so the oldest of the slice is the last one.
  const oldest = selected[selected.length - 1];
  const newest = selected[0];

  const opening = oldest.balance - oldest.inflow + oldest.outflow;

  return {
    rows: selected,
    summary: {
      opening,
      inflow,
      outflow,
      closing: newest.balance,
    },
  };
}

export function bookMonths(rows: readonly BookRow[]): readonly string[] {
  return [...new Set(rows.map((row) => monthKey(row.date)))].sort().reverse();
}
