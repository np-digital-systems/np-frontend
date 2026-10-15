import 'server-only';

import { cookies } from 'next/headers';

import { api } from '@/lib/api';

import type { FinancialYearStatus } from './financial-year-display';

// The selected financial year is kept in a cookie so it survives navigation and reloads.

export const FINANCIAL_YEAR_COOKIE = 'np_fy';

export type { FinancialYearStatus };

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

/** Newest first. */
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

// A cookie naming a year that no longer exists is ignored.
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

export async function getActiveFinancialYearId(): Promise<number | undefined> {
  return (await getFinancialYearContext()).active?.id;
}

// Events use calendar years; read the opening year from the label ("2026" or "2026/27").
export async function getActiveCalendarYear(): Promise<number> {
  const { active } = await getFinancialYearContext();
  const opening = Number(active?.label.slice(0, 4));

  return Number.isFinite(opening) && opening > 0
    ? opening
    : new Date().getFullYear();
}
