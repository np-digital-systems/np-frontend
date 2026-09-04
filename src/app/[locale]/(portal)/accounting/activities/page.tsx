import type { Metadata } from 'next';

import { ActivitiesFeature } from '@/features/accounting';

export const metadata: Metadata = {
  title: 'Activities',
};

export default function ActivitiesPage() {
  return <ActivitiesFeature />;
}
