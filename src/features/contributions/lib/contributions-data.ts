import type { MemberRecord, SanththaSummary } from '../types';

export {
  formatCurrency,
  formatLongDate,
  formatShortDate,
  getToday,
  getActiveYear,
} from '@/lib/format';

import type { PaymentMode } from '../types';

export const PAYMENT_MODES: readonly PaymentMode[] = ['cash', 'bank', 'online'];

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  cash: 'Cash',
  bank: 'Bank Transfer',
  online: 'Online',
};

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

