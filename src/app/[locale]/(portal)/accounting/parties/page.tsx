import type { Metadata } from 'next';

import { PartiesFeature } from '@/features/accounting';

export const metadata: Metadata = {
  title: 'Parties',
};

export default function PartiesPage() {
  return <PartiesFeature />;
}
