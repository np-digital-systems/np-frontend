import type { Metadata } from 'next';

import { EventBudgetFeature } from '@/features/events';

export const metadata: Metadata = {
  title: 'Event budget',
};

interface EventBudgetPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function EventBudgetPage({ params }: EventBudgetPageProps) {
  const { eventId } = await params;

  return <EventBudgetFeature eventId={Number(eventId)} />;
}
