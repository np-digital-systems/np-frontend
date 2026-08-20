import type { BadgeStatus } from '@/components/portal/ui';

import type {
  EventRecord,
  EventType,
  EventsSummary,
  FrequencyType,
  TempleEvent,
} from '../types';

const TIME_ZONE = 'Asia/Colombo';

/* -------------------------------------------------------------------------
   Frequency vocabulary
   ------------------------------------------------------------------------- */

export const FREQUENCY_TYPES: readonly FrequencyType[] = [
  'weekly',
  'monthly_twice',
  'monthly_once',
  'multi_day',
  'annual',
];

export const FREQUENCY_LABELS: Record<FrequencyType, string> = {
  weekly: 'Weekly',
  monthly_twice: 'Twice Monthly',
  monthly_once: 'Monthly',
  multi_day: 'Multi-day Festival',
  annual: 'Annual',
};

/**
 * What `instance_identifier` counts for each frequency.
 *
 * The column is deliberately adaptive in the schema, which means the UI has
 * to say out loud what a number means before an admin types one in.
 */
export const INSTANCE_MEANING: Record<FrequencyType, string> = {
  weekly: 'Week of the year (1–52)',
  monthly_twice: 'Lunar occurrence (1 = Valarpirai, 2 = Theipirai)',
  monthly_once: 'Always 1 — the single monthly occurrence',
  multi_day: 'Festival day (1 – number of days)',
  annual: 'Always 1 — the single yearly occurrence',
};

/** Instances a full year of this frequency contains, before overrides. */
export const DEFAULT_INSTANCE_COUNT: Record<FrequencyType, number> = {
  weekly: 52,
  monthly_twice: 2,
  monthly_once: 1,
  multi_day: 1,
  annual: 1,
};

const LUNAR_OCCURRENCE: Record<number, string> = {
  1: 'Valarpirai',
  2: 'Theipirai',
};

/**
 * Human name for one instance of an event type.
 *
 * A custom name always wins — the temple's own name for the day ("ஆபரணம்",
 * "தேர்") is what people recognise. The derived label is the fallback.
 */
export function describeInstance(
  frequencyType: FrequencyType,
  instanceIdentifier: number,
  customInstanceName?: string | null,
): string {
  if (customInstanceName) {
    return customInstanceName;
  }

  switch (frequencyType) {
    case 'weekly':
      return `Week ${instanceIdentifier}`;
    case 'monthly_twice':
      return LUNAR_OCCURRENCE[instanceIdentifier] ?? `Occurrence ${instanceIdentifier}`;
    case 'multi_day':
      return `Day ${instanceIdentifier}`;
    case 'monthly_once':
      return 'Monthly occurrence';
    case 'annual':
      return 'Annual occurrence';
  }
}

/** Short form for a dense table cell, where the frequency is already shown. */
export function shortInstance(
  frequencyType: FrequencyType,
  instanceIdentifier: number,
): string {
  switch (frequencyType) {
    case 'weekly':
      return `W${instanceIdentifier}`;
    case 'multi_day':
      return `D${instanceIdentifier}`;
    case 'monthly_twice':
      return LUNAR_OCCURRENCE[instanceIdentifier] ?? `#${instanceIdentifier}`;
    default:
      return '—';
  }
}

/* -------------------------------------------------------------------------
   Dates and times
   ------------------------------------------------------------------------- */

/** Today in Colombo as `yyyy-mm-dd`, resolved on the server. */
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

/**
 * Formats an ISO date without ever constructing a local `Date`.
 *
 * `new Date('2026-06-25')` is parsed as UTC midnight and then rendered in
 * the viewer's zone, which slides the date back a day west of Greenwich.
 * Splitting the string keeps the calendar date the admin actually typed.
 */
function parts(iso: string) {
  const [year, month, day] = iso.split('-').map(Number);
  return { year, month, day };
}

const MONTH_NAMES = [
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

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export function formatEventDate(iso: string): string {
  const { year, month, day } = parts(iso);
  return `${day} ${MONTH_NAMES[month - 1]} ${year}`;
}

export function formatShortDate(iso: string): string {
  const { month, day } = parts(iso);
  return `${String(day).padStart(2, '0')} ${MONTH_NAMES[month - 1].slice(0, 3)}`;
}

export function formatWeekday(iso: string): string {
  const { year, month, day } = parts(iso);
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

/* -------------------------------------------------------------------------
   Derived state
   ------------------------------------------------------------------------- */

/**
 * An event's status is derived, never stored.
 *
 * The table carries `is_completed` and a date; everything the UI shows —
 * completed, happening today, still ahead — follows from those two, so a
 * status can never drift out of step with the calendar.
 */
export function deriveStatus(
  event: TempleEvent,
  today: string,
): BadgeStatus {
  if (event.isCompleted) return 'Completed';
  if (event.scheduledDate === today) return 'Today';
  if (event.scheduledDate < today) return 'Pending Approval';

  return 'Scheduled';
}

/**
 * A past event nobody marked done is the one thing this screen should nag
 * about, so it borrows the warning tone rather than reading as "Scheduled".
 */
export function isOverdue(event: TempleEvent, today: string): boolean {
  return !event.isCompleted && event.scheduledDate < today;
}

export function summarise(
  events: readonly EventRecord[],
  today: string,
): EventsSummary {
  return {
    total: events.length,
    upcoming: events.filter(
      (event) => !event.isCompleted && event.scheduledDate >= today,
    ).length,
    completed: events.filter((event) => event.isCompleted).length,
    unsponsored: events.filter((event) => event.sponsorId === null).length,
  };
}

export function sortByDate(
  events: readonly EventRecord[],
): readonly EventRecord[] {
  return [...events].sort((a, b) => {
    if (a.scheduledDate !== b.scheduledDate) {
      return a.scheduledDate < b.scheduledDate ? -1 : 1;
    }

    return a.startTime < b.startTime ? -1 : 1;
  });
}

export interface EventMonth {
  readonly key: string;
  readonly label: string;
  readonly events: readonly EventRecord[];
}

/** Groups a sorted list into calendar months, preserving order. */
export function groupByMonth(
  events: readonly EventRecord[],
): readonly EventMonth[] {
  const months = new Map<string, EventRecord[]>();

  for (const event of sortByDate(events)) {
    const key = monthKey(event.scheduledDate);
    const bucket = months.get(key);

    if (bucket) {
      bucket.push(event);
    } else {
      months.set(key, [event]);
    }
  }

  return [...months.entries()].map(([key, monthEvents]) => ({
    key,
    label: formatMonthLabel(key),
    events: monthEvents,
  }));
}

/** Full name of an event: the type, plus the instance it is. */
export function eventTitle(event: {
  eventType: EventType;
  instanceLabel: string;
}): string {
  return `${event.eventType.name} — ${event.instanceLabel}`;
}
