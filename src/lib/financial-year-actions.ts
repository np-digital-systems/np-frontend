'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { requireSession } from '@/features/auth/lib/session';

import { FINANCIAL_YEAR_COOKIE, getFinancialYearOptions } from './financial-year';

/** A year outlives a session; the choice should outlive the browser being closed. */
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

/**
 * Point the portal at a different financial year.
 *
 * The id is checked against the years the API actually returns before it is
 * stored — a cookie is client-supplied, and this one goes on to filter ledger
 * reads. Every portal route is revalidated afterwards because the choice
 * changes figures on all of them, not just the page it was made from.
 */
export async function selectFinancialYear(id: number): Promise<void> {
  await requireSession();

  const years = await getFinancialYearOptions();

  if (!years.some((year) => year.id === id)) return;

  (await cookies()).set(FINANCIAL_YEAR_COOKIE, String(id), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ONE_YEAR_SECONDS,
  });

  revalidatePath('/', 'layout');
}
