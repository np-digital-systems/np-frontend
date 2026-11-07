import type { Metadata } from 'next';

import { SponsorsFeature } from '@/features/contributions';

export const metadata: Metadata = {
  title: 'Members',
};

export default function MembersPage() {
  return <SponsorsFeature />;
}
