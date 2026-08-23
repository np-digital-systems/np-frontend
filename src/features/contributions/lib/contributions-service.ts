import { getActiveYear, getToday } from '@/lib/format';

import { SANTHTHA_MEMBERS, SANTHTHA_PAYMENTS } from '../constants/mock-data';
import type { MemberRecord, SanththaSummary } from '../types';

import { YEARLY_SUBSCRIPTION } from './contributions-data';

/** TODO: replace the constants with calls to the sanththa API. */

export function getMemberRecords(
  year: number = getActiveYear(getToday()),
): readonly MemberRecord[] {
  return SANTHTHA_MEMBERS.map((member) => {
    const payment =
      SANTHTHA_PAYMENTS.find(
        (entry) => entry.memberId === member.id && entry.year === year,
      ) ?? null;

    return { ...member, payment, hasPaid: payment !== null };
  });
}

export function summarise(
  records: readonly MemberRecord[],
): SanththaSummary {
  // Only active members are expected to pay, so only they can be outstanding.
  const expected = records.filter((member) => member.isActive);
  const paid = records.filter((member) => member.hasPaid);

  return {
    members: records.length,
    paid: paid.length,
    unpaid: expected.filter((member) => !member.hasPaid).length,
    collected: paid.reduce(
      (sum, member) => sum + (member.payment?.amount ?? 0),
      0,
    ),
    outstanding:
      expected.filter((member) => !member.hasPaid).length * YEARLY_SUBSCRIPTION,
  };
}

/** Years that have any payment, newest first, always including this one. */
export function getYears(): readonly number[] {
  const current = getActiveYear(getToday());
  const years = new Set(SANTHTHA_PAYMENTS.map((entry) => entry.year));

  years.add(current);

  return [...years].sort((a, b) => b - a);
}
