import 'server-only';

import { api, type Page } from '@/lib/api';
import { getActiveYear, getToday } from '@/lib/format';

import type { MemberRecord, PaymentMode, SanththaSummary } from '../types';

import { YEARLY_SUBSCRIPTION } from './contributions-data';

/** A row of `GET /sanththa/register`. */
interface ApiRegisterRow {
  readonly id: string;
  readonly memberNo: string;
  readonly name: string;
  readonly nameTa: string;
  readonly phone: string | null;
  readonly address: string;
  readonly joinedOn: string | null;
  readonly subscribes: boolean;
  readonly paidYears: readonly number[];
  readonly totalPaid: number;
  readonly paidThisYear: boolean;
}

interface ApiPayment {
  readonly id: number;
  readonly userId: string;
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
    api.get<Page<ApiRegisterRow>>('/sanththa/register', { query: { year, limit: 100 } }),
    api.get<Page<ApiPayment>>('/sanththa/payments', { query: { year, limit: 100 } }),
  ]);

  const byMember = new Map(payments.data.map((payment) => [payment.userId, payment]));

  return register.data.map((member) => {
    const payment = byMember.get(member.id) ?? null;

    return {
      id: member.id,
      memberNo: member.memberNo,
      fullName: member.name,
      nameTa: member.nameTa,
      phone: member.phone ?? '',
      address: member.address,
      joinedOn: member.joinedOn ?? '',
      // "Active" on this screen means still owing the yearly subscription.
      isActive: member.subscribes,
      notes: null,
      hasPaid: member.paidThisYear,
      payment: payment
        ? {
            id: payment.id,
            memberId: payment.userId,
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
  readonly members: number;
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
    members: summary.members,
    paid: summary.paid,
    unpaid: summary.outstanding,
    collected: summary.collected,
    outstanding: summary.outstanding * YEARLY_SUBSCRIPTION,
  };
}

/** Years that have any payment, newest first, always including this one. */
export async function getYears(): Promise<readonly number[]> {
  const current = getActiveYear(getToday());
  const register = await api.get<Page<ApiRegisterRow>>('/sanththa/register', {
    query: { limit: 100 },
  });

  const years = new Set(register.data.flatMap((member) => member.paidYears));
  years.add(current);

  return [...years].sort((a, b) => b - a);
}
