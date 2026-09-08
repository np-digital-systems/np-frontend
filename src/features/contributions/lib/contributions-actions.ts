'use server';

import { revalidatePath } from 'next/cache';

import { ACCOUNTING_ROUTES } from '@/features/accounting';
import { requireSession } from '@/features/auth/lib/session';
import { api, ApiError } from '@/lib/api';

import type { PaymentMode } from '../types';

import { getContributionAccess } from './contributions-access';
import { CONTRIBUTION_ROUTES } from './routes';

export interface RecordPaymentInput {
  memberId: string;
  memberNo: string;
  memberName: string;
  year: number;
  amount: number;
  paidOn: string;
  mode: PaymentMode;
  /** The number off the paper receipt book, where the temple keeps one. */
  manualVoucherNo: string;
}

export type RecordPaymentResult =
  | { ok: true; receiptRef: string | null }
  | { ok: false; message: string };

interface PaymentResponse {
  /** Null only where a subscription was linked to a receipt raised elsewhere. */
  readonly receiptVoucherRef: string | null;
}

/**
 * Records a subscription and raises the receipt voucher for it.
 *
 * The two are written together on purpose: a subscription that exists only in
 * the register is money the accounts cannot see, which is exactly the gap this
 * closes. The receipt is raised for approval, not posted — taking the money and
 * accounting for it are two acts by two people, and the queue is where the
 * second one happens.
 */
export async function recordSanththaPayment(
  input: RecordPaymentInput,
): Promise<RecordPaymentResult> {
  const { permissions } = await requireSession();
  const access = getContributionAccess(permissions);

  // The action is the boundary a typed URL cannot get around, so it checks the
  // capability itself rather than trusting the screen that called it.
  if (!access.canRecord) {
    return { ok: false, message: 'You cannot record subscription payments.' };
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, message: 'Enter an amount greater than zero.' };
  }

  let payment: PaymentResponse;

  /*
   * One call, because it is one act.
   *
   * This used to raise the voucher here and walk it through submit, approve
   * and post before recording the subscription — five requests, each able to
   * fail on its own, with a hard-coded account and fund chosen in the browser.
   * A failure halfway left a receipt no subscription pointed at, and the
   * account id it named had drifted out of the chart entirely.
   *
   * The server owns all of it now: it reads the head from the accounting
   * settings, takes the fund and activity from the activity that head belongs
   * to, and names the sponsor as the party.
   */
  try {
    payment = await api.post<PaymentResponse>('/sanththa/payments', {
      sponsorId: Number(input.memberId),
      year: input.year,
      amount: input.amount,
      paidOn: input.paidOn,
      mode: input.mode,
      manualVoucherNo: input.manualVoucherNo.trim(),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message };
    }

    return { ok: false, message: 'The portal could not reach the server.' };
  }

  revalidatePath(CONTRIBUTION_ROUTES.sanththa);
  revalidatePath(ACCOUNTING_ROUTES.receipts);
  revalidatePath(ACCOUNTING_ROUTES.transactions);
  revalidatePath(ACCOUNTING_ROUTES.chartOfAccounts);

  return { ok: true, receiptRef: payment.receiptVoucherRef };
}

export interface UpdatePaymentInput {
  amount: number;
  paidOn: string;
  mode: PaymentMode;
  manualVoucherNo: string;
}

/**
 * Correct a subscription already taken.
 *
 * The server refuses once the receipt has been approved or posted, so this
 * does not re-check it: a rule enforced in two places is a rule that will
 * disagree with itself. The message it returns is the one to show.
 */
export async function updateSanththaPayment(
  paymentId: number,
  input: UpdatePaymentInput,
): Promise<RecordPaymentResult> {
  const { permissions } = await requireSession();

  if (!getContributionAccess(permissions).canRecord) {
    return { ok: false, message: 'You cannot change subscription payments.' };
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, message: 'Enter an amount greater than zero.' };
  }

  let payment: PaymentResponse;

  try {
    payment = await api.patch<PaymentResponse>(`/sanththa/payments/${paymentId}`, {
      amount: input.amount,
      paidOn: input.paidOn,
      mode: input.mode,
      manualVoucherNo: input.manualVoucherNo.trim(),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, message: error.message };
    }

    return { ok: false, message: 'The portal could not reach the server.' };
  }

  revalidatePath(CONTRIBUTION_ROUTES.sanththa);
  revalidatePath(ACCOUNTING_ROUTES.receipts);
  revalidatePath(ACCOUNTING_ROUTES.transactions);

  return { ok: true, receiptRef: payment.receiptVoucherRef };
}

export interface MemberInput {
  fullName: string;
  nameTa: string;
  phone: string;
  address: string;
  notes: string;
  isActive: boolean;
}

export type MemberResult =
  | { ok: true; memberNo: string }
  | { ok: false; message: string };

interface SponsorResponse {
  readonly partyId: number;
  readonly sponsorNo: string;
}

/**
 * Enrol a sponsor.
 *
 * The sponsor number is not supplied: the database allocates the next `S-00n`
 * in the same statement, so two cashiers enrolling at once cannot be handed
 * the same one. Registering also creates the party, so a sponsor is on the
 * directory from the moment they are enrolled.
 */
export async function enrolMember(input: MemberInput): Promise<MemberResult> {
  const { permissions } = await requireSession();

  if (!getContributionAccess(permissions).canManage) {
    return { ok: false, message: 'You cannot change the register.' };
  }

  try {
    const sponsor = await api.post<SponsorResponse>('/sponsors', {
      nameTa: input.nameTa || input.fullName,
      nameEn: input.fullName || undefined,
      phone: input.phone || undefined,
      address: input.address || undefined,
      notes: input.notes || undefined,
      subscribes: input.isActive,
    });

    revalidatePath(CONTRIBUTION_ROUTES.sanththa);

    return { ok: true, memberNo: sponsor.sponsorNo };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof ApiError ? error.message : 'The portal could not reach the server.',
    };
  }
}

export async function updateMember(id: string, input: MemberInput): Promise<MemberResult> {
  const { permissions } = await requireSession();

  if (!getContributionAccess(permissions).canManage) {
    return { ok: false, message: 'You cannot change the register.' };
  }

  try {
    // One call: the name and contact details are written to the party behind
    // the sponsor, and the subscription flag to the profile.
    const sponsor = await api.patch<SponsorResponse>(`/sponsors/${id}`, {
      nameTa: input.nameTa || input.fullName,
      nameEn: input.fullName || undefined,
      phone: input.phone || undefined,
      address: input.address || undefined,
      notes: input.notes || undefined,
      subscribes: input.isActive,
    });

    revalidatePath(CONTRIBUTION_ROUTES.sanththa);

    return { ok: true, memberNo: sponsor.sponsorNo };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof ApiError ? error.message : 'The portal could not reach the server.',
    };
  }
}
