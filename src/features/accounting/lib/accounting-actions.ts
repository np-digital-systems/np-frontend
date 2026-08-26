'use server';

import { revalidatePath } from 'next/cache';

import { requireSession } from '@/features/auth/lib/session';
import { api, ApiError } from '@/lib/api';

import type { PaymentMode, VoucherKind } from '../types';

import { getAccountingAccess } from './accounting-access';
import { ACCOUNTING_ROUTES } from './routes';

export type ActionResult<T = void> =
  | ({ ok: true } & (T extends void ? object : { data: T }))
  | { ok: false; message: string };

/**
 * One place every write in this module funnels through.
 *
 * The capability is checked here rather than trusted from the screen, because
 * a server action is the boundary a typed request cannot get around; and an
 * ApiError is turned into the message the API itself chose, which for a
 * business rule is the database's own words.
 */
async function guarded<T>(
  capability: (access: ReturnType<typeof getAccountingAccess>) => boolean,
  refused: string,
  write: () => Promise<T>,
): Promise<ActionResult<T>> {
  const { permissions } = await requireSession();

  if (!capability(getAccountingAccess(permissions))) {
    return { ok: false, message: refused };
  }

  try {
    const data = await write();

    for (const route of Object.values(ACCOUNTING_ROUTES)) revalidatePath(route);

    return { ok: true, data } as ActionResult<T>;
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof ApiError
          ? error.message
          : 'The portal could not reach the server.',
    };
  }
}

/* -------------------------------------------------------------------------
   Vouchers
   ------------------------------------------------------------------------- */

export interface VoucherInput {
  kind: VoucherKind;
  date: string;
  description: string;
  amount: number;
  accountId: number;
  fundId: number;
  projectId: number | null;
  mode: PaymentMode;
  bankAccountId: number | null;
  chequeNo: string | null;
  party: string;
  manualVoucherNo?: string | null;
  eventRef?: string | null;
  eventTypeId?: number | null;
  eventId?: number | null;
  notes?: string | null;
}

function voucherBody(input: VoucherInput) {
  return {
    kind: input.kind,
    date: input.date,
    description: input.description,
    amount: input.amount,
    accountId: input.accountId,
    fundId: input.fundId,
    projectId: input.projectId ?? undefined,
    mode: input.mode,
    bankAccountId: input.bankAccountId ?? undefined,
    chequeNo: input.chequeNo || undefined,
    party: input.party,
    manualVoucherNo: input.manualVoucherNo || undefined,
    eventRef: input.eventRef || undefined,
    eventTypeId: input.eventTypeId ?? undefined,
    eventId: input.eventId ?? undefined,
    notes: input.notes || undefined,
  };
}

export async function createVoucher(
  input: VoucherInput,
  thenSubmit = false,
): Promise<ActionResult<{ id: number; ref: string }>> {
  return guarded(
    (access) => (input.kind === 'receipt' ? access.canCreateReceipts : access.canCreatePayments),
    `You cannot raise ${input.kind} vouchers.`,
    async () => {
      const voucher = await api.post<{ id: number; ref: string }>('/vouchers', voucherBody(input));

      if (thenSubmit) await api.post(`/vouchers/${voucher.id}/submit`);

      return voucher;
    },
  );
}

export async function updateVoucher(
  id: number,
  input: VoucherInput,
  thenSubmit = false,
): Promise<ActionResult<{ id: number; ref: string }>> {
  return guarded(
    (access) => access.canCreateVouchers,
    'You cannot edit vouchers.',
    async () => {
      const voucher = await api.patch<{ id: number; ref: string }>(
        `/vouchers/${id}`,
        voucherBody(input),
      );

      if (thenSubmit) await api.post(`/vouchers/${id}/submit`);

      return voucher;
    },
  );
}

export async function submitVoucher(id: number): Promise<ActionResult> {
  return guarded((access) => access.canSubmit, 'You cannot submit vouchers.', () =>
    api.post(`/vouchers/${id}/submit`),
  );
}

export async function approveVoucher(id: number): Promise<ActionResult> {
  return guarded((access) => access.canApprove, 'You cannot approve vouchers.', () =>
    api.post(`/vouchers/${id}/approve`),
  );
}

export async function rejectVoucher(id: number, reason: string): Promise<ActionResult> {
  return guarded((access) => access.canApprove, 'You cannot reject vouchers.', () =>
    api.post(`/vouchers/${id}/reject`, { reason }),
  );
}

export async function postVoucher(id: number): Promise<ActionResult> {
  return guarded((access) => access.canPost, 'You cannot post vouchers to the ledger.', () =>
    api.post(`/vouchers/${id}/post`),
  );
}

export async function cancelVoucher(id: number): Promise<ActionResult> {
  return guarded((access) => access.canCreateVouchers, 'You cannot cancel vouchers.', () =>
    api.post(`/vouchers/${id}/cancel`),
  );
}

/* -------------------------------------------------------------------------
   Chart of accounts
   ------------------------------------------------------------------------- */

export interface AccountInput {
  code: string;
  nameTa: string;
  nameEn?: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  parentId?: number | null;
  isPostable?: boolean;
  openingBalance?: number;
}

export async function createAccount(input: AccountInput): Promise<ActionResult> {
  return guarded((access) => access.canManageAccounts, 'You cannot change the chart of accounts.', () =>
    api.post('/accounts', {
      ...input,
      nameEn: input.nameEn || undefined,
      parentId: input.parentId ?? undefined,
    }),
  );
}

export async function updateAccount(
  id: number,
  input: Partial<AccountInput> & { isActive?: boolean },
): Promise<ActionResult> {
  return guarded((access) => access.canManageAccounts, 'You cannot change the chart of accounts.', () =>
    api.patch(`/accounts/${id}`, {
      nameTa: input.nameTa,
      nameEn: input.nameEn || undefined,
      parentId: input.parentId ?? undefined,
      isPostable: input.isPostable,
      isActive: input.isActive,
      openingBalance: input.openingBalance,
    }),
  );
}

export async function deactivateAccount(id: number): Promise<ActionResult> {
  return guarded((access) => access.canManageAccounts, 'You cannot change the chart of accounts.', () =>
    api.delete(`/accounts/${id}`),
  );
}

/* -------------------------------------------------------------------------
   Bank accounts
   ------------------------------------------------------------------------- */

export interface BankAccountInput {
  label: string;
  bankName: string;
  branch: string;
  accountNumber: string;
  type: 'current' | 'savings' | 'fixed-deposit';
  openingBalance?: number;
  openedOn: string;
  ledgerAccountId: number;
}

export async function createBankAccount(input: BankAccountInput): Promise<ActionResult> {
  return guarded((access) => access.canManageBankAccounts, 'You cannot open bank accounts.', () =>
    api.post('/bank-accounts', input),
  );
}

export async function updateBankAccount(
  id: number,
  input: Partial<Omit<BankAccountInput, 'ledgerAccountId' | 'accountNumber'>> & { isActive?: boolean },
): Promise<ActionResult> {
  return guarded((access) => access.canManageBankAccounts, 'You cannot change bank accounts.', () =>
    api.patch(`/bank-accounts/${id}`, input),
  );
}

export async function closeBankAccount(id: number): Promise<ActionResult> {
  return guarded((access) => access.canManageBankAccounts, 'You cannot close bank accounts.', () =>
    api.delete(`/bank-accounts/${id}`),
  );
}
