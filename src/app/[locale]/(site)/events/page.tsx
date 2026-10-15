import type { Metadata } from 'next';
import Image from 'next/image';
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
      <section className="relative flex h-[50vh] min-h-[400px] items-center justify-center overflow-hidden">
        <Image
          src="/images/festival-navaratri.png"
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#8B0000]/60 to-black/50" />
        <div className="relative z-10 px-4 text-center">
          <h1 className="font-heading mb-4 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            {t('title')}
          </h1>
          <p className="font-sans mx-auto max-w-xl text-lg text-white/80">
            {t('subtitle')}
          </p>
        </div>
      </section>

      <UpcomingEvents
        events={upcoming.events}
        unavailable={upcoming.unavailable}
      />

      <EventsCalendarSection events={calendar.events} today={today} />
    </>
  );
}
