'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { requireSession } from '@/features/auth/lib/session';

import { FINANCIAL_YEAR_COOKIE, getFinancialYearOptions } from './financial-year';

const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

// Validates the id against the API's years before storing (the cookie filters ledger reads),
// then revalidates every portal route.
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
