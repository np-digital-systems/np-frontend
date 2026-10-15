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

const ALSO_UPCOMING_COUNT = 3;

interface EventPageProps {
  params: Promise<{ id: string }>;
}

// Invalid and missing ids both render not-found rather than an error.
export default async function EventPage({ params }: EventPageProps) {
  const event = await readEvent(params);

  if (!event) notFound();

  const today = getToday();

  // A failed related-events read must not fail the page.
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

// Called by both the page and generateMetadata; Next dedupes the fetch.
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
