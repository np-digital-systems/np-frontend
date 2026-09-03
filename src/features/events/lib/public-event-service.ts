import 'server-only';

import { env } from '@/config/env';
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

export interface CalendarRead {
  readonly events: readonly PublicEvent[];
  /** True when the read failed, as opposed to the calendar being empty. */
  readonly unavailable: boolean;
}

/**
 * A calendar read that cannot take the page down with it.
 *
 * The events section is one part of a page that is mostly hand-written
 * content, so a calendar the API cannot serve should cost the visitor that
 * section and nothing else.
 *
 * The reason is logged rather than swallowed. Silently degrading to "cannot be
 * reached" tells a visitor enough and tells whoever deployed it nothing, and
 * the likeliest cause by far is configuration — `API_URL` unset on the host, so
 * `env.apiUrl` falls back to localhost and the fetch is refused. Naming the URL
 * it actually tried turns that from a mystery into a one-line answer.
 */
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
