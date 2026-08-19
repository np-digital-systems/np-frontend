import type { FinancialYear } from '../types';

/**
 * Presentation-time values that would otherwise be computed during render.
 *
 * Computing `new Date()` inside a component makes the server and client
 * disagree at hydration; resolving it once at the feature boundary keeps a
 * single value for the whole tree.
 */

const TIME_ZONE = 'Asia/Colombo';

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

export function getFinancialYear(): FinancialYear {
  // TODO: source from the financial-year service once the API exists.
  return { label: '2026', status: 'Open' };
}

/** Indian-format currency, the notation every figure in the portal uses. */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompact(value: number): string {
  if (Math.abs(value) >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }

  if (Math.abs(value) >= 1000) {
    return `₹${Math.round(value / 1000)}k`;
  }

  return `₹${value}`;
}
