// Separate from the portal's calendar-grid, which uses local time. This one is UTC-only
// so server and browser renders agree across timezones (avoids hydration mismatch).

const DAY_MS = 86_400_000;

export interface CalendarDay {
  readonly iso: string;
  readonly day: number;
  readonly inMonth: boolean;
}

function toIso(time: number): string {
  return new Date(time).toISOString().slice(0, 10);
}

// Always six weeks so the grid height doesn't change between months.
export function buildMonthGrid(
  year: number,
  month: number,
): readonly (readonly CalendarDay[])[] {
  const first = Date.UTC(year, month - 1, 1);
  const start = first - new Date(first).getUTCDay() * DAY_MS;

  const days = Array.from({ length: 42 }, (_, index) => {
    const time = start + index * DAY_MS;
    const date = new Date(time);

    return {
      iso: toIso(time),
      day: date.getUTCDate(),
      inMonth: date.getUTCMonth() === month - 1 && date.getUTCFullYear() === year,
    };
  });

  return Array.from({ length: 6 }, (_, week) =>
    days.slice(week * 7, week * 7 + 7),
  );
}

export function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const shifted = new Date(Date.UTC(year, month - 1 + delta, 1));

  return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1 };
}

export function monthPrefix(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}
