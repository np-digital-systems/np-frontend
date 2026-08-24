'use server';

import { revalidatePath } from 'next/cache';

import { ACCOUNTING_ROUTES } from '@/features/accounting';
import {
  addVoucher,
  nextVoucherId,
  nextVoucherRef,
} from '@/features/accounting/lib/voucher-store';
import { getCurrentUser } from '@/features/auth/lib/session';
import { getActiveYear, getToday } from '@/lib/format';

import { SANTHTHA_MEMBERS } from '../constants/mock-data';
import type { PaymentMode } from '../types';

import { getContributionAccess } from './contributions-access';
import {
  SANTHTHA_ACCOUNT_ID,
  SANTHTHA_FUND_ID,
} from './contributions-data';
import { addPayment, allPayments, nextPaymentId } from './sanththa-store';
import { CONTRIBUTION_ROUTES } from './routes';

export interface RecordPaymentInput {
  memberId: number;
  year: number;
  amount: number;
  paidOn: string;
  mode: PaymentMode;
}

export type RecordPaymentResult =
  | { ok: true; receiptRef: string }
  | { ok: false; message: string };

/**
 * Records a subscription and raises the receipt voucher for it.
 *
 * The two are written together on purpose: a subscription that exists only
 * in the register is money the accounts cannot see, which is exactly the gap
 * this replaces. The voucher is posted straight away — a counter receipt for
 * a fixed membership fee has nothing to approve.
 */
export async function recordSanththaPayment(
  input: RecordPaymentInput,
): Promise<RecordPaymentResult> {
  const user = await getCurrentUser();
  const access = getContributionAccess(user.role);

  // The action is the boundary a typed URL cannot get around, so it checks
  // the capability itself rather than trusting the screen that called it.
  if (!access.canRecord) {
    return { ok: false, message: 'You cannot record subscription payments.' };
  }

  const member = SANTHTHA_MEMBERS.find((entry) => entry.id === input.memberId);

  if (!member) {
    return { ok: false, message: 'That member is no longer on the register.' };
  }

  const alreadyPaid = allPayments().some(
    (entry) => entry.memberId === input.memberId && entry.year === input.year,
  );

  if (alreadyPaid) {
    return {
      ok: false,
      message: `${member.fullName} has already paid the ${input.year} subscription.`,
    };
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, message: 'Enter an amount greater than zero.' };
  }

  const receiptRef = nextVoucherRef('receipt', getActiveYear(getToday()));
  const now = new Date().toISOString();

  addVoucher({
    id: nextVoucherId(),
    ref: receiptRef,
    kind: 'receipt',
    date: input.paidOn,
    description: `Sanththa subscription ${input.year} — ${member.memberNo}`,
    amount: input.amount,
    accountId: SANTHTHA_ACCOUNT_ID,
    fundId: SANTHTHA_FUND_ID,
    projectId: null,
    mode: input.mode,
    bankAccountId: input.mode === 'cash' ? null : 1,
    chequeNo: null,
    party: member.fullName,
    manualVoucherNo: null,
    eventRef: null,
    eventTypeId: null,
    eventId: null,
    status: 'Posted',
    notes: null,
    createdBy: { id: user.id, name: user.name },
    createdAt: now,
    submittedAt: now,
    decidedBy: { id: user.id, name: user.name },
    decidedAt: now,
    rejectionReason: null,
    postedAt: now,
  });

  addPayment({
    id: nextPaymentId(),
    memberId: input.memberId,
    year: input.year,
    amount: input.amount,
    paidOn: input.paidOn,
    receiptRef,
    mode: input.mode,
    collectedBy: user.name,
  });

  revalidatePath(CONTRIBUTION_ROUTES.sanththa);
  revalidatePath(ACCOUNTING_ROUTES.receipts);
  revalidatePath(ACCOUNTING_ROUTES.transactions);
  revalidatePath(ACCOUNTING_ROUTES.chartOfAccounts);

  return { ok: true, receiptRef };
}
