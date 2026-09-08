'use server';

import { revalidatePath } from 'next/cache';

import { requireSession } from '@/features/auth/lib/session';
import { api, ApiError } from '@/lib/api';

import { getContributionAccess } from './contributions-access';
import { CONTRIBUTION_ROUTES } from './routes';

export type SetRateResult = { ok: true } | { ok: false; message: string };

/**
 * Set the year's sanththa.
 *
 * One amount for everyone, held per year. Payments already taken keep the
 * amount they were taken at, so raising the rate never restates what an
 * earlier year charged — this only changes what the form offers next.
 */
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
