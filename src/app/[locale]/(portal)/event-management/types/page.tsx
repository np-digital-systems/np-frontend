import type { Metadata } from 'next';

import { EventTypesFeature } from '@/features/events';

export const metadata: Metadata = {
  title: 'Event Types',
};

export default function EventTypesPage() {
  return <EventTypesFeature />;
}
