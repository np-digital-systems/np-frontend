import type { Metadata } from 'next';

import { EventsCalendarFeature } from '@/features/events';

export const metadata: Metadata = {
  title: 'Event Calendar',
};

export default function EventsPage() {
  return <EventsCalendarFeature />;
}
