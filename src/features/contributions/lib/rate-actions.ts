'use server';

import { revalidatePath } from 'next/cache';

import { requireSession } from '@/features/auth/lib/session';
import { api, ApiError } from '@/lib/api';

import { getContributionAccess } from './contributions-access';
import { CONTRIBUTION_ROUTES } from './routes';

export type SetRateResult = { ok: true } | { ok: false; message: string };

// Changing the rate doesn't affect payments already taken; it only changes the default for new ones.
export async function setSanththaRate(year: number, amount: number): Promise<SetRateResult> {
  const { permissions } = await requireSession();

  if (!getContributionAccess(permissions).canManage) {
    return { ok: false, message: 'You cannot set the sanththa.' };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, message: 'Enter an amount greater than zero.' };
  }

  try {
    await api.put('/sanththa/rates', { year, amount });
  } catch (error) {
    return {
      ok: false,
      message: error instanceof ApiError ? error.message : 'The portal could not reach the server.',
    };
  }

  revalidatePath(CONTRIBUTION_ROUTES.sanththa);
  revalidatePath(CONTRIBUTION_ROUTES.sponsors);

  return { ok: true };
}
