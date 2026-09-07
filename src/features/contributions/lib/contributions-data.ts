import type { MemberRecord, SanththaSummary } from '../types';

export {
  formatCurrency,
  formatLongDate,
  formatShortDate,
  getToday,
  getActiveYear,
} from '@/lib/format';

import type { PaymentMode } from '../types';

/**
 * Where a subscription lands in the books.
 *
 * Every sanththa payment is income to this head, against the general fund —
 * it is membership, not a donation to any particular work.
 */
export const SANTHTHA_ACCOUNT_CODE = '4009';
export const SANTHTHA_ACCOUNT_ID = 409;
export const SANTHTHA_FUND_ID = 1;
export const SANTHTHA_ACCOUNT_NAME = 'Sanththa Subscriptions';
export const SANTHTHA_FUND_NAME = 'General Temple Fund';

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

