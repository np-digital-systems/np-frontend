export interface CalendarDay {
  /** ISO `yyyy-mm-dd` — the key events are matched on. */
  readonly iso: string;
  readonly day: number;
  /** False for the leading and trailing days borrowed from adjacent months. */
  readonly inMonth: boolean;
}

function iso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Six weeks of days covering the given month, Sunday-first.
 *
 * Built with `Date.UTC` throughout: a local `Date` would shift the grid by a
 * day for viewers west of Greenwich, which silently files an event under
 * the wrong square.
 *
 * The row count is fixed at six so the grid does not change height as the
 * user pages through months.
 */
export function buildMonthGrid(
  year: number,
  month: number,
): readonly (readonly CalendarDay[])[] {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const daysInPrevMonth = new Date(Date.UTC(year, month - 1, 0)).getUTCDate();

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  const days: CalendarDay[] = [];

  for (let index = firstWeekday - 1; index >= 0; index -= 1) {
    const day = daysInPrevMonth - index;
    days.push({ iso: iso(prevYear, prevMonth, day), day, inMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push({ iso: iso(year, month, day), day, inMonth: true });
  }

  for (let day = 1; days.length < 42; day += 1) {
    days.push({ iso: iso(nextYear, nextMonth, day), day, inMonth: false });
  }

  return Array.from({ length: 6 }, (_, week) =>
    days.slice(week * 7, week * 7 + 7),
  );
}

export function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const zeroBased = month - 1 + delta;

  return {
    year: year + Math.floor(zeroBased / 12),
    month: ((zeroBased % 12) + 12) % 12 + 1,
  };
}

export const WEEKDAY_INITIALS = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
] as const;
