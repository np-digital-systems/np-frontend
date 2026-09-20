import type { Metadata } from 'next';

import { CostingEditorFeature } from '@/features/events';

export const metadata: Metadata = {
  title: 'Costing',
};

interface CostingPageProps {
  params: Promise<{ id: string }>;
}

export default async function CostingPage({ params }: CostingPageProps) {
  const { id } = await params;

  return <CostingEditorFeature costingId={Number(id)} />;
}
