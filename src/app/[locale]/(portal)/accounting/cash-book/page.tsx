import type { Metadata } from 'next';

import { CashBookFeature } from '@/features/accounting';

export const metadata: Metadata = {
  title: 'Cash Book',
};

export default function CashBookPage() {
  return <CashBookFeature />;
}
