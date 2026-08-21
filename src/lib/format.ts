/**
 * Portal-wide formatting.
 *
 * One definition per notation, shared by every feature. A figure formatted
 * two different ways in two different screens is a bug the reader has to
 * resolve, so currency, dates and times all resolve through here.
 */

export const TIME_ZONE = 'Asia/Colombo';

/* -------------------------------------------------------------------------
   Money
   ------------------------------------------------------------------------- */

/** The notation every figure in the portal uses. */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

/** Axis labels and dense chips, where the full figure would not fit. */
export function formatCompact(value: number): string {
  if (Math.abs(value) >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }

  if (Math.abs(value) >= 1000) {
    return `₹${Math.round(value / 1000)}k`;
  }

  return `₹${value}`;
}

/**
 * A movement rather than a position.
 *
 * The sign is carried by an explicit + / − because a bare negative reads as
 * a typo in a column of positives — and the minus is U+2212, which lines up
 * with digits in a tabular column where a hyphen does not.
 */
export function formatSigned(value: number): string {
  if (value === 0) return formatCurrency(0);

  return value > 0
    ? `+${formatCurrency(value)}`
    : `−${formatCurrency(Math.abs(value))}`;
}

/* -------------------------------------------------------------------------
   Dates

   Never construct a local `Date` from an ISO date string: `new
   Date('2026-06-25')` parses as UTC midnight and renders a day earlier west
   of Greenwich, which silently files a record under the wrong day. Splitting
   the string keeps the calendar date that was actually entered.
   ------------------------------------------------------------------------- */

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export function isoParts(iso: string): {
  year: number;
  month: number;
  day: number;
} {
  const [year, month, day] = iso.split('-').map(Number);
  return { year, month, day };
}

/** Today in Colombo as `yyyy-mm-dd`. */
export function getToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function getActiveYear(today: string = getToday()): number {
  return Number(today.slice(0, 4));
}

/** `25 June 2026` */
export function formatLongDate(iso: string): string {
  const { year, month, day } = isoParts(iso);
  return `${day} ${MONTH_NAMES[month - 1]} ${year}`;
}

/** `25 Jun` — for a column where the year is already established. */
export function formatShortDate(iso: string): string {
  const { month, day } = isoParts(iso);
  return `${String(day).padStart(2, '0')} ${MONTH_NAMES[month - 1].slice(0, 3)}`;
}

export function formatWeekday(iso: string): string {
  const { year, month, day } = isoParts(iso);
  return WEEKDAY_NAMES[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function formatMonthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function monthName(month: number): string {
  return MONTH_NAMES[month - 1];
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/* -------------------------------------------------------------------------
   Times
   ------------------------------------------------------------------------- */

/** `18:30` → `6:30 PM`, the notation the printed temple calendar uses. */
export function formatTime(time: string): string {
  const [rawHour, minute] = time.split(':').map(Number);
  const suffix = rawHour >= 12 ? 'PM' : 'AM';
  const hour = rawHour % 12 === 0 ? 12 : rawHour % 12;

  return `${hour}:${String(minute).padStart(2, '0')} ${suffix}`;
}

export function formatTimeRange(start: string, end: string | null): string {
  return end ? `${formatTime(start)} – ${formatTime(end)}` : formatTime(start);
}
