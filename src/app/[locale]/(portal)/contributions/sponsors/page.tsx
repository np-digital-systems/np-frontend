import type { Metadata } from 'next';

import { SponsorsFeature } from '@/features/contributions';

export const metadata: Metadata = {
  title: 'Sponsors',
};

export default function SponsorsPage() {
  return <SponsorsFeature />;
}
