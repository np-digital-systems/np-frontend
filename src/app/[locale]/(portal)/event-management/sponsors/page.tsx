import type { Metadata } from 'next';

import { SponsorsFeature } from '@/features/events';

export const metadata: Metadata = {
  title: 'Sponsors',
};

export default function SponsorsPage() {
  return <SponsorsFeature />;
}
