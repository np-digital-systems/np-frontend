import { CalendarX2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { PageContainer } from '@/components/site/page-container';
import { SectionHeader } from '@/components/site/section-header';
import { KolamMandala } from '@/components/site/kolam';

import type { PublicEvent } from '../../types';

import { SiteEventCard } from './site-event-card';

interface UpcomingEventsProps {
  events: readonly PublicEvent[];
  /** The calendar could not be reached (distinct from empty). */
  unavailable?: boolean;
}

export function UpcomingEvents({ events, unavailable }: UpcomingEventsProps) {
  const t = useTranslations('Events.upcoming');

  return (
    <PageContainer className="relative isolate overflow-hidden bg-temple-paper">
      <KolamMandala className="temple-spin-reverse absolute -right-48 -top-48 -z-10 w-[520px] text-temple-gold/20" />
      <KolamMandala className="temple-spin-slow absolute -bottom-56 -left-56 -z-10 w-[560px] text-temple-gold/15" />
      <SectionHeader
        subtitle={t('subtitle')}
        title={t('title')}
        description={t('description')}
      />

      {events.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3 reveal">
          {events.map((event) => (
            <SiteEventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-temple-sand bg-temple-card px-6 py-14 text-center shadow-[0_4px_24px_rgba(74,16,22,0.05)]">
          <CalendarX2 className="h-10 w-10 text-temple-gold/50" />
          <p className="text-base text-temple-soft">
            {unavailable ? t('unavailable') : t('empty')}
          </p>
        </div>
      )}
    </PageContainer>
  );
}
