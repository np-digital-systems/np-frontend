import type { Metadata } from 'next';

import { VersionHistoryFeature } from '@/features/events';

export const metadata: Metadata = {
  title: 'Version history',
};

interface VersionHistoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function VersionHistoryPage({ params }: VersionHistoryPageProps) {
  const { id } = await params;

  return <VersionHistoryFeature costingId={Number(id)} />;
}
