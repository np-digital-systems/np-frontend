import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

export interface CalendarDay {
    readonly iso: string;
  readonly day: number;
    readonly inMonth: boolean;
}

export function buildMonthGrid(
  year: number,
  month: number,
): readonly (readonly CalendarDay[])[] {
  const anchor = parseISO(`${year}-${String(month).padStart(2, '0')}-01`);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(anchor)),
    end: endOfWeek(endOfMonth(anchor)),
  }).map((date) => ({
    iso: format(date, 'yyyy-MM-dd'),
    day: date.getDate(),
    inMonth: date.getMonth() === anchor.getMonth(),
  }));

  // A month can span five or six weeks; padding to six keeps the height fixed.
  while (days.length < 42) {
    const last = parseISO(days[days.length - 1].iso);
    const next = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);

    days.push({
      iso: format(next, 'yyyy-MM-dd'),
      day: next.getDate(),
      inMonth: false,
    });
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
  const shifted = addMonths(
    parseISO(`${year}-${String(month).padStart(2, '0')}-01`),
    delta,
  );

  return { year: shifted.getFullYear(), month: shifted.getMonth() + 1 };
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
