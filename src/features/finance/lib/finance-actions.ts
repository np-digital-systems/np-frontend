'use server';

import { revalidatePath } from 'next/cache';

import { requireSession } from '@/features/auth/lib/session';
import { api, ApiError } from '@/lib/api';

import { getFinanceAccess } from './finance-access';
import { FINANCE_ROUTES } from './routes';

export type ActionResult = { ok: true } | { ok: false; message: string };

async function guarded(
  capability: (access: ReturnType<typeof getFinanceAccess>) => boolean,
  refused: string,
  write: () => Promise<unknown>,
): Promise<ActionResult> {
  const { permissions } = await requireSession();

  if (!capability(getFinanceAccess(permissions))) {
    return { ok: false, message: refused };
  }

  try {
    await write();

    for (const route of Object.values(FINANCE_ROUTES)) revalidatePath(route);

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof ApiError ? error.message : 'The portal could not reach the server.',
    };
  }
}

export interface FundInput {
  nameTa: string;
  nameEn?: string;
  openingBalance?: number;
}

export async function createFund(input: FundInput): Promise<ActionResult> {
  return guarded((a) => a.canManageFunds, 'You cannot maintain funds.', () =>
    api.post('/funds', { ...input, nameEn: input.nameEn || undefined }),
  );
}

export async function updateFund(
  id: number,
  input: Partial<FundInput> & { isActive?: boolean },
): Promise<ActionResult> {
  return guarded((a) => a.canManageFunds, 'You cannot maintain funds.', () =>
    api.patch(`/funds/${id}`, { ...input, nameEn: input.nameEn || undefined }),
  );
}

export interface ProjectInput {
  nameTa: string;
  nameEn?: string;
  fundId: number;
  budget?: number | null;
  startDate: string;
  targetDate?: string | null;
  status?: 'planning' | 'active' | 'on-hold' | 'completed';
  description?: string;
}

export async function createProject(input: ProjectInput): Promise<ActionResult> {
  return guarded((a) => a.canManageProjects, 'You cannot maintain projects.', () =>
    api.post('/projects', {
      ...input,
      nameEn: input.nameEn || undefined,
      budget: input.budget ?? undefined,
      targetDate: input.targetDate || undefined,
    }),
  );
}

export async function updateProject(
  id: number,
  input: Partial<ProjectInput> & { isActive?: boolean },
): Promise<ActionResult> {
  return guarded((a) => a.canManageProjects, 'You cannot maintain projects.', () =>
    api.patch(`/projects/${id}`, {
      ...input,
      nameEn: input.nameEn || undefined,
      budget: input.budget ?? undefined,
      targetDate: input.targetDate || undefined,
    }),
  );
}

export interface DepositInput {
  certificateNo: string;
  bankName: string;
  branch: string;
  principal: number;
  interestRate: number;
  placedOn: string;
  maturesOn: string;
  tenureMonths: number;
  interestPayout: 'monthly' | 'quarterly' | 'on-maturity';
  fundId: number;
  notes?: string;
}

export async function createDeposit(input: DepositInput): Promise<ActionResult> {
  return guarded((a) => a.canManageDeposits, 'You cannot place fixed deposits.', () =>
    api.post('/fixed-deposits', { ...input, notes: input.notes || undefined }),
  );
}

export async function updateDeposit(
  id: number,
  input: Partial<DepositInput>,
): Promise<ActionResult> {
  return guarded((a) => a.canManageDeposits, 'You cannot change fixed deposits.', () =>
    api.patch(`/fixed-deposits/${id}`, { ...input, notes: input.notes || undefined }),
  );
}

/** Roll a matured certificate into a new one; the old row is marked renewed. */
export async function renewDeposit(
  id: number,
  input: Omit<DepositInput, 'fundId'>,
): Promise<ActionResult> {
  return guarded((a) => a.canManageDeposits, 'You cannot renew fixed deposits.', () =>
    api.post(`/fixed-deposits/${id}/renew`, { ...input, notes: input.notes || undefined }),
  );
}

export async function matureDeposit(id: number): Promise<ActionResult> {
  return guarded((a) => a.canManageDeposits, 'You cannot change fixed deposits.', () =>
    api.post(`/fixed-deposits/${id}/mature`),
  );
}

export async function closeDeposit(id: number): Promise<ActionResult> {
  return guarded((a) => a.canManageDeposits, 'You cannot close fixed deposits.', () =>
    api.post(`/fixed-deposits/${id}/close`),
  );
}

export interface AssetInput {
  tag: string;
  nameTa: string;
  nameEn?: string;
  category: string;
  acquiredOn: string;
  cost: number;
  depreciationRate?: number;
  location: string;
  condition?: string;
  status?: string;
  fundId: number;
  notes?: string;
}

export async function createAsset(input: AssetInput): Promise<ActionResult> {
  return guarded((a) => a.canManageAssets, 'You cannot maintain the asset register.', () =>
    api.post('/assets', { ...input, nameEn: input.nameEn || undefined, notes: input.notes || undefined }),
  );
}

export async function updateAsset(
  id: number,
  input: Partial<AssetInput>,
): Promise<ActionResult> {
  return guarded((a) => a.canManageAssets, 'You cannot maintain the asset register.', () =>
    api.patch(`/assets/${id}`, { ...input, nameEn: input.nameEn || undefined, notes: input.notes || undefined }),
  );
}

/**
 * Part the temple from something it owns.
 *
 * Behind its own capability, and a distinct call rather than a status change,
 * because dating the disposal is what stops depreciation.
 */
export async function disposeAsset(
  id: number,
  input: { disposedOn: string; disposalValue?: number; notes?: string },
): Promise<ActionResult> {
  return guarded((a) => a.canDisposeAssets, 'You cannot dispose of assets.', () =>
    api.post(`/assets/${id}/dispose`, { ...input, notes: input.notes || undefined }),
  );
}
