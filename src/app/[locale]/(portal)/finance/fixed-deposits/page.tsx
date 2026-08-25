import type { Metadata } from 'next';

import { FixedDepositsFeature } from '@/features/finance';

export const metadata: Metadata = {
  title: 'Fixed Deposits',
};

export default function FixedDepositsPage() {
  return <FixedDepositsFeature />;
}
