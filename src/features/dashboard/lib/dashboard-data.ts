import { getFinancialYearContext } from '@/lib/financial-year';
import { TIME_ZONE } from '@/lib/format';

import type { FinancialYear } from '../types';

export function getGreeting(now: Date = new Date()): string {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', {
      hour: 'numeric',
      hour12: false,
      timeZone: TIME_ZONE,
    }).format(now),
  );

  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';

  return 'Good evening';
}

export function formatToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TIME_ZONE,
  }).format(now);
}

// Uses the header's selected year so captions always match it; a dash when there are no years.
export async function getFinancialYear(): Promise<FinancialYear> {
  const { active } = await getFinancialYearContext();

  return {
    label: active?.label ?? '—',
    status: active?.status ?? 'upcoming',
  };
}

export { formatCurrency, formatCompact } from '@/lib/format';
