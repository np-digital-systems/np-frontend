import type { Metadata } from 'next';

import { DepositDetailFeature } from '@/features/finance';

export const metadata: Metadata = {
  title: 'Fixed Deposit',
};

interface DepositDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DepositDetailPage({ params }: DepositDetailPageProps) {
  const { id } = await params;

  return <DepositDetailFeature depositId={Number(id)} />;
}
