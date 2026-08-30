import { useTranslations } from 'next-intl';

import { PageContainer } from '@/components/site/page-container';
import { SectionHeader } from '@/components/site/section-header';

import type { PublicEvent } from '../../types';

import { EventsCalendarView } from './events-calendar-view';

interface EventsCalendarSectionProps {
  events: readonly PublicEvent[];
  today: string;
}

export function EventsCalendarSection({
  events,
  today,
}: EventsCalendarSectionProps) {
  const t = useTranslations('Events.calendar');

  return (
    <PageContainer id="calendar" className="bg-white">
      <SectionHeader
        subtitle={t('subtitle')}
        title={t('title')}
        description={t('description')}
      />

      <EventsCalendarView events={events} today={today} />
    </PageContainer>
  );
}
