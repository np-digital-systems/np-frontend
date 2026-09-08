import type { MemberRecord, SanththaSummary } from '../types';

export {
  formatCurrency,
  formatLongDate,
  formatShortDate,
  getToday,
  getActiveYear,
} from '@/lib/format';

import type { PaymentMode } from '../types';

/*
 * Where a subscription lands in the books is not written here any more.
 *
 * It was: an account id, a fund id and two display names, none of which the
 * chart of accounts knew about. The id had drifted out of the chart and every
 * receipt was failing on it, while the names beside it still read plausibly.
 *
 * The head is configured once in the accounting settings and the rest follows
 * it on the server — see `GET /sanththa/posting`, which is what the record
 * dialog shows so the counter reads the real coding rather than a constant.
 */

export const PAYMENT_MODES: readonly PaymentMode[] = ['cash', 'bank', 'online'];

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  cash: 'Cash',
  bank: 'Bank Transfer',
  online: 'Online',
};

/**
 * Totals for a set of rows the caller already holds.
 *
 * Pure arithmetic, so both the server page and the client screen can use it —
 * the screen recomputes as its filters change without another round trip.
 */
export function summarise(
  records: readonly MemberRecord[],
  rate: number | null,
): SanththaSummary {
  const expected = records.filter((member) => member.subscribes);
  const paid = records.filter((member) => member.hasPaid);
  const unpaid = expected.filter((member) => !member.hasPaid).length;

  return {
    rate,
    members: records.length,
    subscribing: expected.length,
    paid: paid.length,
    unpaid,
    collected: paid.reduce((sum, member) => sum + (member.payment?.amount ?? 0), 0),
    outstanding: unpaid * (rate ?? 0),
  };
}

