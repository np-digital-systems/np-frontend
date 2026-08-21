import type { Metadata } from 'next';

import { ReportsFeature } from '@/features/accounting';

export const metadata: Metadata = {
  title: 'Reports',
};

export default function ReportsPage() {
  return <ReportsFeature />;
}
