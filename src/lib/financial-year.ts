import 'server-only';

import { cookies } from 'next/headers';

import { api } from '@/lib/api';

import type { FinancialYearStatus } from './financial-year-display';

/**
 * Which financial year the portal is reading.
 *
 * The books are kept year by year, so almost every figure on every screen is
 * "as at" some year. That choice belongs to the person, not the page — it has
 * to survive navigation and reload — so it lives in a cookie rather than a
 * search param, and the server resolves it once per render.
 */

export const FINANCIAL_YEAR_COOKIE = 'np_fy';

export type { FinancialYearStatus };

/** A year, cut down to what the header needs to draw a menu. */
export interface FinancialYearOption {
  readonly id: number;
  readonly label: string;
  readonly status: FinancialYearStatus;
  readonly isCurrent: boolean;
}

interface ApiFinancialYear {
  readonly id: number;
  readonly label: string;
  readonly status: FinancialYearStatus;
  readonly isCurrent: boolean;
}

/**
 * Every year the temple keeps books for, newest first.
 *
 * The API returns them in its own order; the header reads as a history, so the
 * most recent belongs at the top of the menu.
 */
export async function getFinancialYearOptions(): Promise<
  readonly FinancialYearOption[]
> {
  const years = await api.get<readonly ApiFinancialYear[]>('/financial-years', {
    revalidate: 60,
    tags: ['financial-years'],
  });

  return [...years]
    .map(({ id, label, status, isCurrent }) => ({ id, label, status, isCurrent }))
    .sort((a, b) => b.label.localeCompare(a.label));
}

/**
 * The year the portal should read, and the list to offer instead.
 *
 * A cookie naming a year that no longer exists — deleted, or set against a
 * different database — is ignored rather than trusted, so a stale browser
 * cannot pin the whole portal to a year the books do not have.
 */
export async function getFinancialYearContext(): Promise<{
  years: readonly FinancialYearOption[];
  active: FinancialYearOption | null;
}> {
  const years = await getFinancialYearOptions().catch(
    () => [] as readonly FinancialYearOption[],
  );

  if (years.length === 0) return { years, active: null };

  const chosen = Number((await cookies()).get(FINANCIAL_YEAR_COOKIE)?.value);

  const active =
    years.find((year) => year.id === chosen) ??
    years.find((year) => year.isCurrent) ??
    years[0];

  return { years, active };
}

/** The active year's id, for the many endpoints that take one. */
export async function getActiveFinancialYearId(): Promise<number | undefined> {
  return (await getFinancialYearContext()).active?.id;
}
