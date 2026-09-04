import type { BadgeStatus } from '@/components/portal/ui';

import type {
  AccountType,
  ActivityKind,
  PartyKind,
  BankAccountType,
  PaymentMode,
  VoucherKind,
  VoucherStatus,
} from '../types';

export {
  formatCurrency,
  formatCompact,
  formatSigned,
  formatLongDate,
  formatShortDate,
  formatMonthLabel,
  monthKey,
  monthName,
  getToday,
  getActiveYear,
} from '@/lib/format';

/** Pooja sponsorship drives the pooja picker in the voucher form. */
export const POOJA_SPONSORSHIP_CODE = '4001';

export const ACCOUNT_TYPES: readonly AccountType[] = [
  'asset',
  'liability',
  'equity',
  'income',
  'expense',
];

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  asset: 'Asset',
  liability: 'Liability',
  equity: 'Equity',
  income: 'Income',
  expense: 'Expenditure',
};

/**
 * Income and expenditure heads measure a year's flow rather than a position,
 * so they always start at nil — the API refuses an opening balance on them.
 */
export function opensAtZero(type: AccountType): boolean {
  return type === 'income' || type === 'expense';
}

/**
 * The side a head's balance naturally sits on. An opening balance is entered
 * as a positive figure on this side, which is how the API stores and reads it.
 */
export const ACCOUNT_NATURAL_SIDE: Record<AccountType, 'debit' | 'credit'> = {
  asset: 'debit',
  liability: 'credit',
  equity: 'credit',
  income: 'credit',
  expense: 'debit',
};

export const ACTIVITY_KINDS: readonly ActivityKind[] = [
  'pooja',
  'service',
  'facility',
  'general',
];

export const ACTIVITY_KIND_LABELS: Record<ActivityKind, string> = {
  pooja: 'Pooja',
  service: 'Service',
  facility: 'Facility',
  general: 'General',
};

export const PARTY_KINDS: readonly PartyKind[] = [
  'sponsor',
  'staff',
  'vendor',
  'devotee',
];

export const PARTY_KIND_LABELS: Record<PartyKind, string> = {
  sponsor: 'Sponsor',
  staff: 'Staff',
  vendor: 'Vendor',
  devotee: 'Devotee',
};

export const PAYMENT_MODES: readonly PaymentMode[] = [
  'cash',
  'bank',
  'cheque',
  'online',
];

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  cash: 'Cash',
  bank: 'Bank Transfer',
  cheque: 'Cheque',
  online: 'Online',
};

export function isBankMode(mode: PaymentMode): boolean {
  return mode !== 'cash';
}

export const BANK_ACCOUNT_TYPE_LABELS: Record<BankAccountType, string> = {
  current: 'Current',
  savings: 'Savings',
  'fixed-deposit': 'Fixed Deposit',
};

export const VOUCHER_STATUSES: readonly VoucherStatus[] = [
  'Draft',
  'Pending Approval',
  'Approved',
  'Rejected',
  'Posted',
  'Cancelled',
];

export function statusToBadge(status: VoucherStatus): BadgeStatus {
  return status;
}

export const VOUCHER_KIND_LABELS: Record<VoucherKind, string> = {
  receipt: 'Receipt Voucher',
  payment: 'Payment Voucher',
};

export function partyLabel(kind: VoucherKind): string {
  return kind === 'receipt' ? 'Received From' : 'Paid To';
}

export function referencePrefix(kind: VoucherKind): string {
  return kind === 'receipt' ? 'RV' : 'PV';
}

export function nextReference(
  kind: VoucherKind,
  year: number,
  existing: readonly { ref: string }[],
): string {
  const prefix = `${referencePrefix(kind)}-${year}-`;

  const highest = existing
    .filter((entry) => entry.ref.startsWith(prefix))
    .reduce((max, entry) => Math.max(max, Number(entry.ref.slice(prefix.length)) || 0), 0);

  return `${prefix}${String(highest + 1).padStart(4, '0')}`;
}

/**
 * How a voucher's coding reads in one line.
 *
 * A split voucher names its first head and counts the rest, so a list stays a
 * list. Everything is on the voucher itself for anyone who opens it.
 */
export function codingSummary(voucher: {
  lines: readonly { account: { name: string }; fund: { name: string } }[];
}): { account: string; fund: string } {
  const [first, ...rest] = voucher.lines;
  const more = rest.length > 0 ? ` +${rest.length}` : '';

  return {
    account: first ? `${first.account.name}${more}` : '—',
    fund: first ? `${first.fund.name}${more}` : '—',
  };
}
