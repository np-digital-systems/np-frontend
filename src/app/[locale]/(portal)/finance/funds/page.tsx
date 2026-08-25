import type { Metadata } from 'next';

import { FundsFeature } from '@/features/finance';

export const metadata: Metadata = {
  title: 'Funds',
};

export default function FundsPage() {
  return <FundsFeature />;
}
