import 'server-only';

import { env } from '@/config/env';
import { api } from '@/lib/api';

import type { PublicEvent } from '../types';

import { getActiveYear, getToday } from './event-data';

const CACHE_SECONDS = 300;
const EVENTS_TAG = 'public-events';

const CALENDAR_MONTHS_AHEAD = 24;

export async function getUpcomingPublicEvents(
  limit = 6,
): Promise<readonly PublicEvent[]> {
  return api.get<readonly PublicEvent[]>('/public/events/upcoming', {
    query: { limit },
    revalidate: CACHE_SECONDS,
    tags: [EVENTS_TAG],
  });
}

// Fetches the whole window at once (a few dozen rows) so month paging runs client-side.
export async function getPublicCalendarEvents(): Promise<readonly PublicEvent[]> {
  const from = `${getActiveYear(getToday())}-01-01`;
  const to = isoMonthsAfter(from, CALENDAR_MONTHS_AHEAD);

  return api.get<readonly PublicEvent[]>('/public/events', {
    query: { from, to },
    revalidate: CACHE_SECONDS,
    tags: [EVENTS_TAG],
  });
}

export async function getPublicEvent(id: number): Promise<PublicEvent> {
  return api.get<PublicEvent>(`/public/events/${id}`, {
    revalidate: CACHE_SECONDS,
    tags: [EVENTS_TAG],
  });
}

function isoMonthsAfter(iso: string, months: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1 + months, day));

  return shifted.toISOString().slice(0, 10);
}

export interface CalendarRead {
  readonly events: readonly PublicEvent[];
  /** True when the read failed, as opposed to the calendar being empty. */
  readonly unavailable: boolean;
}

// A failed read hides the events section instead of failing the page. The URL is
// logged because the usual cause is API_URL unset on the host.
export async function readPublicEvents(
  read: () => Promise<readonly PublicEvent[]>,
  description: string,
): Promise<CalendarRead> {
  try {
    return { events: await read(), unavailable: false };
  } catch (error) {
    console.error(
      `[events] could not read ${description} from ${env.apiUrl} —`,
      error instanceof Error ? error.message : error,
    );

    return { events: [], unavailable: true };
  }
}
