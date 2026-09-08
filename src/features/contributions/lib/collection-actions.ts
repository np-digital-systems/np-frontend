'use server';

import { revalidatePath } from 'next/cache';

import { ACCOUNTING_ROUTES } from '@/features/accounting';
import { requireSession } from '@/features/auth/lib/session';
import { can } from '@/features/auth/lib/permissions';
import { api, ApiError } from '@/lib/api';

import { CONTRIBUTION_ROUTES } from './routes';

export interface CollectionLine {
  partyId: number;
  name: string;
  amount: number;
}

export interface CollectionInput {
  eventId: number;
  eventLabel: string;
  paidOn: string;
  accountId: number;
  fundId: number;
  activityId: number | null;
  lines: readonly CollectionLine[];
}

export interface CollectionResult {
  ok: boolean;
  /** One reference per contributor collected from. */
  receipts: readonly { name: string; ref: string }[];
  /** Names whose receipt could not be raised, with the reason. */
  failures: readonly { name: string; message: string }[];
  message?: string;
}

interface VoucherResponse {
  readonly id: number;
  readonly ref: string;
}

/**
 * Raise one receipt per contributor.
 *
 * Separate documents, not one voucher with many lines: each person is handed a
 * numbered receipt at the counter, and that number has to mean their gift
 * rather than the whole sheet's.
 *
 * Each is taken all the way to posted — a counter receipt for a collection has
 * nothing to approve — and a failure part-way leaves the ones already raised
 * standing. They are real receipts; rolling them back would void paper that is
 * already in somebody's hand.
 */
export async function recordCollection(input: CollectionInput): Promise<CollectionResult> {
  const { permissions } = await requireSession();

  if (!can(permissions, 'transaction:create')) {
    return { ok: false, receipts: [], failures: [], message: 'You cannot record collections.' };
  }

  const payable = input.lines.filter((line) => line.amount > 0);

  if (payable.length === 0) {
    return { ok: false, receipts: [], failures: [], message: 'Enter at least one amount.' };
  }

  const receipts: { name: string; ref: string }[] = [];
  const failures: { name: string; message: string }[] = [];

  for (const line of payable) {
    try {
      const voucher = await api.post<VoucherResponse>('/vouchers', {
        kind: 'receipt',
        date: input.paidOn,
        description: `${input.eventLabel} — collection`,
        mode: 'cash',
        party: line.name,
        partyId: line.partyId,
        lines: [
          {
            accountId: input.accountId,
            amount: line.amount,
            fundId: input.fundId,
            activityId: input.activityId ?? undefined,
            eventId: input.eventId,
          },
        ],
      });

      await api.post(`/vouchers/${voucher.id}/submit`);
      await api.post(`/vouchers/${voucher.id}/approve`);
      await api.post(`/vouchers/${voucher.id}/post`);

      receipts.push({ name: line.name, ref: voucher.ref });
    } catch (error) {
      failures.push({
        name: line.name,
        message:
          error instanceof ApiError ? error.message : 'The portal could not reach the server.',
      });
    }
  }

  revalidatePath(CONTRIBUTION_ROUTES.collections);
  revalidatePath(ACCOUNTING_ROUTES.receipts);
  revalidatePath(ACCOUNTING_ROUTES.transactions);

  return { ok: failures.length === 0, receipts, failures };
}
