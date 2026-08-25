import { monthKey } from '@/lib/format';

import type { BookRow, BookSummary } from '../types';

/** `all` is the whole year, `yyyy-mm` a month, `yyyy-mm-dd` a single day. */
export type BookPeriod = string | 'all';

function periodKeyOf(date: string, period: BookPeriod): string {
  return period.length === 10 ? date : monthKey(date);
}

export function sliceBook(
  rows: readonly BookRow[],
  month: BookPeriod,
  yearOpening: number,
): { rows: readonly BookRow[]; summary: BookSummary } {
  const selected =
    month === 'all'
      ? rows
      : rows.filter((row) => periodKeyOf(row.date, month) === month);

  const inflow = selected.reduce((sum, row) => sum + row.inflow, 0);
  const outflow = selected.reduce((sum, row) => sum + row.outflow, 0);

  if (selected.length === 0) {
    // Nothing moved in this month, so the closing balance is whatever the
    // last row before it left behind.
    const priorRows =
      month === 'all'
        ? []
        : rows.filter((row) => periodKeyOf(row.date, month) < month);

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

/** Days that actually carry movement — an empty day is not worth offering. */
export function bookDays(
  rows: readonly BookRow[],
  month?: string,
): readonly string[] {
  const dates = rows
    .map((row) => row.date)
    .filter((date) => !month || monthKey(date) === month);

  return [...new Set(dates)].sort().reverse();
}
