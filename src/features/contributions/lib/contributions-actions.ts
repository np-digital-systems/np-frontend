'use server';

import { revalidatePath } from 'next/cache';

import { ACCOUNTING_ROUTES } from '@/features/accounting';
import { requireSession } from '@/features/auth/lib/session';
import { api, ApiError } from '@/lib/api';

import type { PaymentMode } from '../types';

import { getContributionAccess } from './contributions-access';
import { SANTHTHA_ACCOUNT_ID, SANTHTHA_FUND_ID } from './contributions-data';
import { CONTRIBUTION_ROUTES } from './routes';

export interface RecordPaymentInput {
  memberId: string;
  memberNo: string;
  memberName: string;
  year: number;
  amount: number;
  paidOn: string;
  mode: PaymentMode;
}

export type RecordPaymentResult =
  | { ok: true; receiptRef: string }
  | { ok: false; message: string };

interface VoucherResponse {
  readonly id: number;
  readonly ref: string;
}

/**
 * Records a subscription and raises the receipt voucher for it.
 *
 * The two are written together on purpose: a subscription that exists only in
 * the register is money the accounts cannot see, which is exactly the gap this
 * closes. The voucher is taken all the way to posted — a counter receipt for a
 * fixed membership fee has nothing to approve — and the subscription then
 * points at it, so the register and the ledger name the same rupees.
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

  let voucher: VoucherResponse;

  try {
    voucher = await api.post<VoucherResponse>('/vouchers', {
      kind: 'receipt',
      date: input.paidOn,
      description: `Sanththa subscription ${input.year} — ${input.memberNo}`,
      mode: input.mode,
      party: input.memberName,
      partyId: Number(input.memberId),
      lines: [
        {
          accountId: SANTHTHA_ACCOUNT_ID,
          amount: input.amount,
          fundId: SANTHTHA_FUND_ID,
        },
      ],
    });

    await api.post(`/vouchers/${voucher.id}/submit`);
    await api.post(`/vouchers/${voucher.id}/approve`);
    await api.post(`/vouchers/${voucher.id}/post`);

    await api.post('/sanththa/payments', {
      sponsorId: Number(input.memberId),
      year: input.year,
      amount: input.amount,
      paidOn: input.paidOn,
      mode: input.mode,
      receiptVoucherId: voucher.id,
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

  return { ok: true, receiptRef: voucher.ref };
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
