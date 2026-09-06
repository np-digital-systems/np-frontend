import type { Metadata } from 'next';

import { CollectionSheetFeature } from '@/features/contributions';

export const metadata: Metadata = {
  title: 'Collection sheet',
};

interface CollectionSheetPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function CollectionSheetPage({
  params,
}: CollectionSheetPageProps) {
  const { eventId } = await params;

  return <CollectionSheetFeature eventId={Number(eventId)} />;
}
