import type { MemberStatus, SubscriptionFrequency } from '../types';

/** Money notation and dates are shared portal-wide — see `@/lib/format`. */
export {
  formatCurrency,
  formatCompact,
  formatLongDate,
  formatShortDate,
  monthName,
  getToday,
  getActiveYear,
} from '@/lib/format';

export const FREQUENCIES: readonly SubscriptionFrequency[] = [
  'monthly',
  'annual',
];

export const FREQUENCY_LABELS: Record<SubscriptionFrequency, string> = {
  monthly: 'Monthly',
  annual: 'Annual',
};

export const MEMBER_STATUSES: readonly MemberStatus[] = [
  'active',
  'lapsed',
  'inactive',
];

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  active: 'Active',
  lapsed: 'Lapsed',
  inactive: 'Inactive',
};

/** How many times a subscription falls due in a full year. */
export function periodsInYear(frequency: SubscriptionFrequency): number {
  return frequency === 'monthly' ? 12 : 1;
}

/**
 * The periods a member is expected to have paid by now.
 *
 * A monthly subscriber is not in arrears for December in August, so dues are
 * counted to the current month rather than to the end of the year — which is
 * the difference between a register that flags real arrears and one that
 * flags everybody.
 */
export function periodsDueSoFar(
  frequency: SubscriptionFrequency,
  today: string,
  year: number,
  joinedOn: string,
): number {
  const joinedYear = Number(joinedOn.slice(0, 4));

  // Someone who joined mid-year owes only from the month they joined.
  const startMonth = joinedYear === year ? Number(joinedOn.slice(5, 7)) : 1;

  if (frequency === 'annual') {
    return joinedYear > year ? 0 : 1;
  }

  const currentMonth =
    Number(today.slice(0, 4)) > year ? 12 : Number(today.slice(5, 7));

  return Math.max(currentMonth - startMonth + 1, 0);
}

/** The period label a payment covers: `2026` or `2026-08`. */
export function periodLabel(
  frequency: SubscriptionFrequency,
  year: number,
  month: number,
): string {
  return frequency === 'annual'
    ? String(year)
    : `${year}-${String(month).padStart(2, '0')}`;
}

/** `2026-08` → `August 2026`; `2026` → `Year 2026`. */
export function formatPeriod(period: string): string {
  if (!period.includes('-')) return `Year ${period}`;

  const [year, month] = period.split('-').map(Number);

  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return `${MONTHS[month - 1]} ${year}`;
}
