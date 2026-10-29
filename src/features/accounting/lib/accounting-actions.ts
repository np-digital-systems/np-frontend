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

// Checks the capability server-side (never trusted from the screen) and surfaces the API's error message.
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

export interface VoucherLineInput {
  accountId: number;
  amount: number;
  fundId: number;
  projectId: number | null;
  activityId: number | null;
  eventId: number | null;
  fixedDepositId: number | null;
}

export interface VoucherInput {
  kind: VoucherKind;
  date: string;
  description: string;
  /** The total is their sum. */
  lines: readonly VoucherLineInput[];
  mode: PaymentMode;
  bankAccountId: number | null;
  chequeNo: string | null;
  partyId?: number | null;
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
    lines: input.lines.map((line) => ({
      accountId: line.accountId,
      amount: line.amount,
      fundId: line.fundId,
      projectId: line.projectId ?? undefined,
      activityId: line.activityId ?? undefined,
      eventId: line.eventId ?? undefined,
      fixedDepositId: line.fixedDepositId ?? undefined,
    })),
    mode: input.mode,
    bankAccountId: input.bankAccountId ?? undefined,
    chequeNo: input.chequeNo || undefined,
    partyId: input.partyId ?? undefined,
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

export interface AccountInput {
  code: string;
  nameTa: string;
  nameEn?: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  parentId?: number | null;
  isPostable?: boolean;
  openingBalance?: number;
  defaultPartyId?: number | null;
}

export async function createAccount(input: AccountInput): Promise<ActionResult> {
  return guarded((access) => access.canManageAccounts, 'You cannot change the chart of accounts.', () =>
    api.post('/accounts', {
      ...input,
      nameEn: input.nameEn || undefined,
      parentId: input.parentId ?? undefined,
      defaultPartyId: input.defaultPartyId ?? undefined,
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
      defaultPartyId: input.defaultPartyId,
    }),
  );
}

export async function deactivateAccount(id: number): Promise<ActionResult> {
  return guarded((access) => access.canManageAccounts, 'You cannot change the chart of accounts.', () =>
    api.delete(`/accounts/${id}`),
  );
}

export interface ActivityInput {
  nameTa: string;
  nameEn?: string;
  kind?: 'pooja' | 'service' | 'facility' | 'general';
  defaultFundId?: number | null;
  defaultProjectId?: number | null;
  defaultPartyId?: number | null;
  defaultAccountId?: number | null;
}

export async function createActivity(input: ActivityInput): Promise<ActionResult> {
  return guarded(
    (access) => access.canManageActivities,
    'You cannot change the list of activities.',
    () =>
      api.post('/activities', {
        ...input,
        nameEn: input.nameEn || undefined,
        defaultFundId: input.defaultFundId ?? undefined,
        defaultProjectId: input.defaultProjectId ?? undefined,
        defaultPartyId: input.defaultPartyId ?? undefined,
        defaultAccountId: input.defaultAccountId ?? undefined,
      }),
  );
}

export async function updateActivity(
  id: number,
  input: Partial<ActivityInput> & { isActive?: boolean },
): Promise<ActionResult> {
  return guarded(
    (access) => access.canManageActivities,
    'You cannot change the list of activities.',
    () =>
      api.patch(`/activities/${id}`, {
        nameTa: input.nameTa,
        nameEn: input.nameEn || undefined,
        kind: input.kind,
        defaultFundId: input.defaultFundId,
        defaultProjectId: input.defaultProjectId,
        defaultPartyId: input.defaultPartyId,
        defaultAccountId: input.defaultAccountId,
        isActive: input.isActive,
      }),
  );
}

export async function deactivateActivity(id: number): Promise<ActionResult> {
  return guarded(
    (access) => access.canManageActivities,
    'You cannot change the list of activities.',
    () => api.delete(`/activities/${id}`),
  );
}

export interface PartyInput {
  type?: 'person' | 'organisation';
  nameTa: string;
  nameEn?: string;
  /** May be empty. */
  roles?: readonly ('devotee' | 'vendor' | 'staff')[];
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  /** Their account number with us, or ours with them. */
  referenceNo?: string | null;
  notes?: string | null;
}

/** Returns the new party so a picker can select it immediately. */
export async function createParty(
  input: PartyInput,
): Promise<ActionResult<{ id: number }>> {
  return guarded(
    (access) => access.canManageParties,
    'You cannot change the list of parties.',
    () =>
      api.post<{ id: number }>('/parties', {
        type: input.type,
        nameTa: input.nameTa,
        nameEn: input.nameEn || undefined,
        roles: input.roles,
        phone: input.phone || undefined,
        email: input.email || undefined,
        address: input.address || undefined,
        referenceNo: input.referenceNo || undefined,
        notes: input.notes || undefined,
      }),
  );
}

export async function updateParty(
  id: number,
  input: Partial<PartyInput> & { isActive?: boolean },
): Promise<ActionResult> {
  return guarded(
    (access) => access.canManageParties,
    'You cannot change the list of parties.',
    () =>
      api.patch(`/parties/${id}`, {
        type: input.type,
        nameTa: input.nameTa,
        nameEn: input.nameEn || undefined,
        roles: input.roles,
        phone: input.phone,
        email: input.email,
        address: input.address,
        referenceNo: input.referenceNo,
        notes: input.notes,
        isActive: input.isActive,
      }),
  );
}

export async function deactivateParty(id: number): Promise<ActionResult> {
  return guarded(
    (access) => access.canManageParties,
    'You cannot change the list of parties.',
    () => api.delete(`/parties/${id}`),
  );
}

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
