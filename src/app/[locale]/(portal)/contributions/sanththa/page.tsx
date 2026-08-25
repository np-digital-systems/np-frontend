import type { Metadata } from 'next';

import { SanththaFeature } from '@/features/contributions';

export const metadata: Metadata = {
  title: 'Sanththa',
};

interface SanththaPageProps {
  searchParams: Promise<{ year?: string }>;
}

export default async function SanththaPage({
  searchParams,
}: SanththaPageProps) {
  const { year } = await searchParams;

  return <SanththaFeature year={year} />;
}
