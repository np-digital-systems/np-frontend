import { SANTHTHA_PAYMENTS } from '../constants/mock-data';
import type { SanththaPayment } from '../types';

/** Subscriptions recorded while the app is running. See `voucher-store`. */
const recorded: SanththaPayment[] = [];

export function addPayment(payment: SanththaPayment): void {
  recorded.push(payment);
}

export function allPayments(): readonly SanththaPayment[] {
  return [...SANTHTHA_PAYMENTS, ...recorded];
}

export function nextPaymentId(): number {
  return allPayments().reduce((max, entry) => Math.max(max, entry.id), 0) + 1;
}
