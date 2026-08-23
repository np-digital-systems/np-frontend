export {
  formatCurrency,
  formatLongDate,
  formatShortDate,
  getToday,
  getActiveYear,
} from '@/lib/format';

import type { PaymentMode } from '../types';

/**
 * The yearly subscription every member pays.
 *
 * TODO: move to portal settings once the API exists, so the committee can
 * change the rate without a deploy.
 */
export const YEARLY_SUBSCRIPTION = 1_500;

export const PAYMENT_MODES: readonly PaymentMode[] = ['cash', 'bank', 'online'];

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  cash: 'Cash',
  bank: 'Bank Transfer',
  online: 'Online',
};
