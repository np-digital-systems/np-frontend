import 'server-only';

import { api } from '@/lib/api';

import type { PublicEvent } from '../types';

import { getActiveYear, getToday } from './event-data';

/**
 * The temple calendar, read anonymously.
 *
 * The public website has no session, so every call here goes to the API's
 * `public/events` routes with `anonymous: true` — a bearer token would neither
 * exist nor be wanted. Responses are cached briefly rather than fetched fresh
 * on every visit: the calendar changes when somebody schedules an occurrence,
 * not between two page loads a second apart.
 */

const CACHE_SECONDS = 300;
const EVENTS_TAG = 'public-events';

/** How many months of calendar the site lets a visitor page through. */
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

/**
 * Every occurrence the calendar can show, in one request.
 *
 * A temple year is a few dozen rows, so the whole window is fetched on the
 * server and the month navigation runs in the browser against what it already
 * has. That keeps paging between months instant and spares the site a
 * client-side API route it would otherwise need just to change month.
 */
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
