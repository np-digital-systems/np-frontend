import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import {
  EventsCalendarSection,
  UpcomingEvents,
} from '@/features/events/sections/site';
import { getToday } from '@/features/events/lib/event-data';
import {
  getPublicCalendarEvents,
  getUpcomingPublicEvents,
  readPublicEvents,
} from '@/features/events/lib/public-event-service';
import { PageHero } from '@/components/site/page-hero';
import { ScrollReveal } from '@/features/home/components/scroll-reveal';

const UPCOMING_COUNT = 6;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Events');

  return {
    title: t('title'),
    description: t('section1.description'),
  };
}

export default async function EventsPage() {
  const t = await getTranslations('Events');
  const today = getToday();

  const [upcoming, calendar] = await Promise.all([
    readPublicEvents(() => getUpcomingPublicEvents(UPCOMING_COUNT), 'upcoming events'),
    readPublicEvents(getPublicCalendarEvents, 'the calendar'),
  ]);

  return (
    <>
      <ScrollReveal />
      <PageHero
        title={t('title')}
        subtitle={t('subtitle')}
        image="/images/festival-navaratri.png"
        archImage="/images/ceremony-puja.png"
      />

      <UpcomingEvents
        events={upcoming.events}
        unavailable={upcoming.unavailable}
      />

      <EventsCalendarSection events={calendar.events} today={today} />
    </>
  );
}
