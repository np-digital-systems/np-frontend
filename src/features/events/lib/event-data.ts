import type { BadgeStatus } from '@/components/portal/ui';
import { formatMonthLabel, monthKey } from '@/lib/format';

import type {
  EventRecord,
  EventsSummary,
  EventType,
  FrequencyType,
  TempleEvent,
} from '../types';

/* -------------------------------------------------------------------------
   Dates and times

   Formatting is shared portal-wide — see `@/lib/format`. Re-exported here so
   the events screens keep importing everything they need from one module.
   ------------------------------------------------------------------------- */

export {
  formatLongDate as formatEventDate,
  formatShortDate,
  formatTime,
  formatTimeRange,
  formatWeekday,
  formatMonthLabel,
  monthKey,
  monthName,
  getToday,
  getActiveYear,
} from '@/lib/format';

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
      return (
        LUNAR_OCCURRENCE[instanceIdentifier] ??
        `Occurrence ${instanceIdentifier}`
      );
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
   Derived state
   ------------------------------------------------------------------------- */

/**
 * An event's status is derived, never stored.
 *
 * The table carries `is_completed` and a date; everything the UI shows —
 * completed, happening today, still ahead — follows from those two, so a
 * status can never drift out of step with the calendar.
 */
export function deriveStatus(event: TempleEvent, today: string): BadgeStatus {
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
