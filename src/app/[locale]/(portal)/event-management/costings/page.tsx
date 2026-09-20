import type { Metadata } from 'next';

import { CostingsFeature } from '@/features/events';

export const metadata: Metadata = {
  title: 'Pooja Costings',
};

export default function CostingsPage() {
  return <CostingsFeature />;
}
