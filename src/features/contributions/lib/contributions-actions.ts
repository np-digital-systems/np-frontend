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
  /** Number from the paper receipt book. */
  manualVoucherNo: string;
}

export type RecordPaymentResult =
  | { ok: true; receiptRef: string | null }
  | { ok: false; message: string };

interface PaymentResponse {
  /** Null only where a subscription was linked to a receipt raised elsewhere. */
  readonly receiptVoucherRef: string | null;
}

// Records the subscription and raises its receipt for approval (not posted), so collecting
// and accounting stay with two different people.
export async function recordSanththaPayment(
  input: RecordPaymentInput,
): Promise<RecordPaymentResult> {
  const { permissions } = await requireSession();
  const access = getContributionAccess(permissions);

  // Checked server-side; never trust the calling screen.
  if (!access.canRecord) {
    return { ok: false, message: 'You cannot record subscription payments.' };
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, message: 'Enter an amount greater than zero.' };
  }

  let payment: PaymentResponse;

  // One call: the server resolves the head, fund, activity and party from accounting settings.
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

// The server rejects edits once the receipt is approved or posted; its message is shown as-is.
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

// The database allocates the sponsor number atomically and creates the party in the same step.
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
    // Name and contact go to the party; the subscription flag to the sponsor profile.
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
