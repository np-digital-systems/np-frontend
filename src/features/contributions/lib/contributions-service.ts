import 'server-only';

import { api, getAll } from '@/lib/api';
import { getActiveYear, getToday } from '@/lib/format';

import type {
  MemberRecord,
  PaymentMode,
  SanththaPosting,
  SanththaSummary,
} from '../types';


/** A row of `GET /sanththa/register` — every active sponsor. */
interface ApiRegisterRow {
  readonly partyId: number;
  readonly sponsorNo: string;
  readonly name: string;
  readonly nameTa: string;
  readonly phone: string | null;
  readonly address: string | null;
  readonly sponsorSince: string | null;
  readonly subscribes: boolean;
  readonly paidYears: readonly number[];
  readonly totalPaid: number;
  readonly paidThisYear: boolean;
}

interface ApiPayment {
  readonly id: number;
  readonly sponsorId: number;
  readonly year: number;
  readonly amount: number;
  readonly paidOn: string;
  readonly receiptVoucherRef: string | null;
  readonly mode: PaymentMode;
  readonly collectedBy: string;
}

export async function getMemberRecords(
  year: number = getActiveYear(getToday()),
): Promise<readonly MemberRecord[]> {
  const [register, payments] = await Promise.all([
    getAll<ApiRegisterRow>('/sanththa/register', { year }),
    getAll<ApiPayment>('/sanththa/payments', { year }),
  ]);

  const byMember = new Map(payments.map((payment) => [payment.sponsorId, payment]));

  return register.map((member) => {
    const payment = byMember.get(member.partyId) ?? null;

    return {
      id: String(member.partyId),
      memberNo: member.sponsorNo,
      fullName: member.name,
      nameTa: member.nameTa,
      phone: member.phone ?? '',
      address: member.address ?? '',
      joinedOn: member.sponsorSince ?? '',
      subscribes: member.subscribes,
      notes: null,
      hasPaid: member.paidThisYear,
      payment: payment
        ? {
            id: payment.id,
            memberId: String(payment.sponsorId),
            year: payment.year,
            amount: payment.amount,
            paidOn: payment.paidOn,
            receiptRef: payment.receiptVoucherRef,
            mode: payment.mode,
            collectedBy: payment.collectedBy,
          }
        : null,
    };
  });
}

interface ApiSummary {
  readonly year: number;
  readonly rate: number | null;
  readonly sponsors: number;
  readonly subscribing: number;
  readonly paid: number;
  readonly outstanding: number;
  readonly collected: number;
}

export async function getSanththaSummary(
  year: number = getActiveYear(getToday()),
): Promise<SanththaSummary> {
  const summary = await api.get<ApiSummary>('/sanththa/summary', { query: { year } });

  return {
    rate: summary.rate,
    members: summary.sponsors,
    subscribing: summary.subscribing,
    paid: summary.paid,
    unpaid: summary.outstanding,
    collected: summary.collected,
    // At the rate set for the year, not a figure compiled into the bundle.
    outstanding: summary.outstanding * (summary.rate ?? 0),
  };
}

/**
 * Where a subscription will be receipted, as the server resolves it.
 *
 * Read rather than assumed, so the counter is told the truth before money
 * changes hands — including when the answer is "nothing is configured yet".
 */
export async function getSanththaPosting(): Promise<SanththaPosting> {
  return api.get<SanththaPosting>('/sanththa/posting');
}

/** Years that have any payment, newest first, always including this one. */
export async function getYears(): Promise<readonly number[]> {
  const current = getActiveYear(getToday());
  const register = await getAll<ApiRegisterRow>('/sanththa/register');

  const years = new Set(register.flatMap((member) => member.paidYears));
  years.add(current);

  return [...years].sort((a, b) => b - a);
}
