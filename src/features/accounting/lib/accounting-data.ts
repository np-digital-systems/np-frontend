import type { BadgeStatus } from '@/components/portal/ui';

import type {
  AccountRef,
  AccountType,
  ActivityKind,
  PartyKind,
  PartyType,
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

// Income and expense heads measure flow, not position, so they always open at nil (the API enforces this).
export function opensAtZero(type: AccountType): boolean {
  return type === 'income' || type === 'expense';
}

// Opening balances are entered as positive figures on this side, matching how the API stores them.
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

// Sponsorship is a profile, not a role, so it isn't listed.
export const PARTY_KINDS: readonly PartyKind[] = ['devotee', 'vendor', 'staff'];

export const PARTY_KIND_LABELS: Record<PartyKind, string> = {
  devotee: 'Devotee',
  vendor: 'Vendor',
  staff: 'Staff',
};

export const PARTY_TYPE_LABELS: Record<PartyType, string> = {
  person: 'Person',
  organisation: 'Organisation',
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

export const VOUCHER_KIND_LABELS = {
  receipt: 'Receipt Voucher',
  payment: 'Payment Voucher',
  contra: 'Contra Voucher',
  journal: 'Journal Voucher',
} as const satisfies Record<VoucherKind, string>;

const PARTY_LABELS: Record<VoucherKind, string> = {
  receipt: 'Received From',
  payment: 'Paid To',
  contra: 'Particulars',
  journal: 'Particulars',
};

export function partyLabel(kind: VoucherKind): string {
  return PARTY_LABELS[kind];
}

const REFERENCE_PREFIXES: Record<VoucherKind, string> = {
  receipt: 'RV',
  payment: 'PV',
  contra: 'CV',
  journal: 'JV',
};

export function referencePrefix(kind: VoucherKind): string {
  return REFERENCE_PREFIXES[kind];
}

// Mirrors the API's rule so the form only offers heads it will accept; cash and bank heads are never
// offered because they move through the voucher's cash/bank side or a contra.
const HEAD_TYPES: Record<'receipt' | 'payment', readonly AccountType[]> = {
  receipt: ['income', 'asset', 'liability', 'equity'],
  payment: ['expense', 'asset', 'liability', 'equity'],
};

export function headsFor(
  kind: 'receipt' | 'payment',
  accounts: readonly AccountRef[],
): AccountRef[] {
  return accounts.filter(
    (account) => account.moneyHead === null && HEAD_TYPES[kind].includes(account.type),
  );
}

// Contras and journals move no money into or out of the temple.
export function kindTone(kind: VoucherKind): 'in' | 'out' | 'neutral' {
  if (kind === 'receipt') return 'in';
  if (kind === 'payment') return 'out';
  return 'neutral';
}

export function modeLabel(mode: PaymentMode | null): string {
  return mode === null ? '—' : PAYMENT_MODE_LABELS[mode];
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

// Split vouchers show the first head plus a count of the rest.
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
