import type { BadgeStatus } from '@/components/portal/ui';
import { formatMonthLabel, monthKey } from '@/lib/format';

import type {
  EventRecord,
  EventsSummary,
  EventType,
  FrequencyType,
  TempleEvent,
} from '../types';

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

export const INSTANCE_MEANING: Record<FrequencyType, string> = {
  weekly: 'Week of the year (1–52)',
  monthly_twice: 'Lunar occurrence (1 = Valarpirai, 2 = Theipirai)',
  monthly_once: 'Always 1 — the single monthly occurrence',
  multi_day: 'Festival day (1 – number of days)',
  annual: 'Always 1 — the single yearly occurrence',
};

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

export function deriveStatus(event: TempleEvent, today: string): BadgeStatus {
  if (event.isCompleted) return 'Completed';
  if (event.scheduledDate === today) return 'Today';
  if (event.scheduledDate < today) return 'Pending Approval';

  return 'Scheduled';
}

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

export function eventTitle(event: {
  eventType: EventType;
  instanceLabel: string;
}): string {
  return `${event.eventType.name} — ${event.instanceLabel}`;
}
