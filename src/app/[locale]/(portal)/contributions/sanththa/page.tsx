import type { Metadata } from 'next';

import { SanththaFeature } from '@/features/contributions';

export const metadata: Metadata = {
  title: 'Sanththa',
};

export default function SanththaPage() {
  return <SanththaFeature />;
}
