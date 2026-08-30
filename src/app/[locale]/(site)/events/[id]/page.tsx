import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';

import { getToday } from '@/features/events/lib/event-data';
import { eventName } from '@/features/events/lib/public-event-presentation';
import {
  getPublicEvent,
  getUpcomingPublicEvents,
} from '@/features/events/lib/public-event-service';
import { EventDetail } from '@/features/events/sections/site/event-detail';
import type { PublicEvent } from '@/features/events/types';
import type { Locale } from '@/i18n/routing';
import { isApiError } from '@/lib/api';

/** How many other occurrences the foot of the page offers. */
const ALSO_UPCOMING_COUNT = 3;

interface EventPageProps {
  params: Promise<{ id: string }>;
}

/**
 * One occurrence's own page.
 *
 * A bad id and a missing occurrence both land on the site's not-found page
 * rather than an error: `/events/banana` is a wrong address, not a fault.
 */
export default async function EventPage({ params }: EventPageProps) {
  const event = await readEvent(params);

  if (!event) notFound();

  const today = getToday();

  // A companion list is a nicety; losing it must not lose the page with it.
  const alsoUpcoming = await getUpcomingPublicEvents(
    ALSO_UPCOMING_COUNT + 1,
  ).catch(() => [] as readonly PublicEvent[]);

  return (
    <EventDetail
      event={event}
      today={today}
      alsoUpcoming={alsoUpcoming
        .filter((other) => other.id !== event.id)
        .slice(0, ALSO_UPCOMING_COUNT)}
    />
  );
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const [event, locale, t] = await Promise.all([
    readEvent(params),
    getLocale(),
    getTranslations('Events'),
  ]);

  if (!event) return { title: t('title') };

  const title = eventName(event, locale as Locale);

  return {
    title,
    description: event.notes ?? t('section1.description'),
    openGraph: { title, description: event.notes ?? t('subtitle') },
  };
}

/**
 * The occurrence behind the URL, or null when there is none.
 *
 * Called once by the page and once by `generateMetadata`; Next dedupes the two
 * fetches, so this costs one request rather than two.
 */
async function readEvent(
  params: EventPageProps['params'],
): Promise<PublicEvent | null> {
  const { id } = await params;
  const numeric = Number(id);

  if (!Number.isInteger(numeric) || numeric < 1) return null;

  try {
    return await getPublicEvent(numeric);
  } catch (error) {
    if (isApiError(error) && error.isNotFound) return null;

    throw error;
  }
}
