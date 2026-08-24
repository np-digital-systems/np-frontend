import { VOUCHERS } from '../constants/mock-data';
import type { Voucher } from '../types';

/**
 * In-memory vouchers raised while the app is running.
 *
 * Seed data is a frozen constant, so anything created through the portal is
 * held here and concatenated on read. Exists only until the API does the
 * writing, at which point the store and its callers go away.
 */
const created: Voucher[] = [];

export function addVoucher(voucher: Voucher): void {
  created.push(voucher);
}

export function allVouchers(): readonly Voucher[] {
  return [...VOUCHERS, ...created];
}

/** Next free number in a kind's series, across seed and created alike. */
export function nextVoucherRef(
  kind: 'receipt' | 'payment',
  year: number,
): string {
  const prefix = `${kind === 'receipt' ? 'RV' : 'PV'}-${year}-`;

  const highest = allVouchers()
    .filter((entry) => entry.ref.startsWith(prefix))
    .reduce(
      (max, entry) => Math.max(max, Number(entry.ref.slice(prefix.length)) || 0),
      0,
    );

  return `${prefix}${String(highest + 1).padStart(4, '0')}`;
}

export function nextVoucherId(): number {
  return allVouchers().reduce((max, entry) => Math.max(max, entry.id), 0) + 1;
}
