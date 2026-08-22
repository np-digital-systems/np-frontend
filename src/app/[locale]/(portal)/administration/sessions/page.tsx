import type { Metadata } from 'next';

import { SessionsFeature } from '@/features/administration';

export const metadata: Metadata = {
  title: 'My Sessions',
};

export default function SessionsPage() {
  return <SessionsFeature />;
}
