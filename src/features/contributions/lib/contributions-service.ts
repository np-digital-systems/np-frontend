import { getActiveYear, getToday } from '@/lib/format';

import { SANTHTHA_MEMBERS, SANTHTHA_PAYMENTS } from '../constants/mock-data';
import type {
  CollectionPoint,
  MemberRecord,
  SanththaMember,
  SanththaSummary,
} from '../types';

import { periodsDueSoFar, periodsInYear } from './contributions-data';

/**
 * The read layer for the Sanththa register.
 *
 * A member's standing — what they owe, whether they are behind — is derived
 * from their pledge and their payments every time it is asked for. Storing
 * it would mean a member could be marked square while owing eight months.
 *
 * TODO: replace the module-level constants with calls to the contributions
 * API.
 */

const MONTH_ABBR = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

function resolve(
  member: SanththaMember,
  year: number,
  today: string,
): MemberRecord {
  const payments = SANTHTHA_PAYMENTS.filter(
    (payment) =>
      payment.memberId === member.id && payment.period.startsWith(String(year)),
  ).sort((a, b) => (a.period < b.period ? -1 : 1));

  const periodsExpected = periodsDueSoFar(
    member.frequency,
    today,
    year,
    member.joinedOn,
  );

  // An inactive member is not accruing dues — the temple has agreed to hold
  // their place, not to keep billing them.
  const accruing = member.status !== 'inactive';

  const dueForYear = accruing ? member.subscriptionAmount * periodsExpected : 0;
  const paidForYear = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );

  const outstanding = Math.max(dueForYear - paidForYear, 0);

  return {
    ...member,
    dueForYear,
    paidForYear,
    outstanding,
    periodsPaid: payments.length,
    periodsExpected,
    lastPaidOn:
      payments.length > 0 ? payments[payments.length - 1].paidOn : null,
    isFullyPaid: accruing && outstanding === 0 && periodsExpected > 0,
    isInArrears: member.status === 'active' && outstanding > 0,
    payments,
  };
}

export function getMemberRecords(
  today: string = getToday(),
): readonly MemberRecord[] {
  const year = getActiveYear(today);

  return SANTHTHA_MEMBERS.map((member) => resolve(member, year, today)).sort(
    (a, b) => a.memberNo.localeCompare(b.memberNo),
  );
}

export function getSanththaSummary(
  today: string = getToday(),
): SanththaSummary {
  const members = getMemberRecords(today);
  const active = members.filter((member) => member.status === 'active');

  const expected = members.reduce((sum, member) => sum + member.dueForYear, 0);
  const collected = members.reduce(
    (sum, member) => sum + member.paidForYear,
    0,
  );

  return {
    members: members.length,
    activeMembers: active.length,
    expected,
    collected,
    outstanding: members.reduce((sum, member) => sum + member.outstanding, 0),
    inArrears: members.filter((member) => member.isInArrears).length,
    fullyPaid: members.filter((member) => member.isFullyPaid).length,
    collectionRate: expected === 0 ? 0 : collected / expected,
  };
}

/** What was collected each month of the active year, for the trend strip. */
export function getCollectionTrend(
  today: string = getToday(),
): readonly CollectionPoint[] {
  const year = getActiveYear(today);
  const throughMonth =
    Number(today.slice(0, 4)) > year ? 12 : Number(today.slice(5, 7));

  const payments = SANTHTHA_PAYMENTS.filter((payment) =>
    payment.paidOn.startsWith(String(year)),
  );

  return Array.from({ length: throughMonth }, (_, index) => {
    const month = String(index + 1).padStart(2, '0');
    const inMonth = payments.filter((payment) =>
      payment.paidOn.startsWith(`${year}-${month}`),
    );

    return {
      label: MONTH_ABBR[index],
      amount: inMonth.reduce((sum, payment) => sum + payment.amount, 0),
      count: inMonth.length,
    };
  });
}

/** The subscription periods of the year a member has not yet paid for. */
export function getUnpaidPeriods(
  member: MemberRecord,
  year: number,
): readonly string[] {
  const paid = new Set(member.payments.map((payment) => payment.period));

  if (member.frequency === 'annual') {
    return paid.has(String(year)) ? [] : [String(year)];
  }

  return Array.from({ length: periodsInYear('monthly') }, (_, index) =>
    `${year}-${String(index + 1).padStart(2, '0')}`,
  ).filter((period) => !paid.has(period));
}
