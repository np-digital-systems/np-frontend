import { CalendarX2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { PageContainer } from '@/components/site/page-container';
import { SectionHeader } from '@/components/site/section-header';

import type { PublicEvent } from '../../types';

import { SiteEventCard } from './site-event-card';

interface UpcomingEventsProps {
  events: readonly PublicEvent[];
  /** True when the calendar could not be reached, as opposed to being empty. */
  unavailable?: boolean;
}

/**
 * The next handful of occurrences, straight off the temple calendar.
 *
 * An empty calendar and an unreachable API are told apart deliberately: the
 * first is a fact about the temple, the second is a fault, and a visitor
 * deserves the right sentence for each.
 */
export function UpcomingEvents({ events, unavailable }: UpcomingEventsProps) {
  const t = useTranslations('Events.upcoming');

  return (
    <PageContainer className="bg-[#FAF9F6]">
      <SectionHeader
        subtitle={t('subtitle')}
        title={t('title')}
        description={t('description')}
      />

      {events.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {events.map((event) => (
            <SiteEventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-[#E8E0CC] bg-white px-6 py-14 text-center shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          <CalendarX2 className="h-10 w-10 text-[#D4AF37]/50" />
          <p className="text-base text-[#4D4635]">
            {unavailable ? t('unavailable') : t('empty')}
          </p>
        </div>
      )}
    </PageContainer>
  );
}
