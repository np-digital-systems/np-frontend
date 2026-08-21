import type { Metadata } from 'next';

import { TransactionsFeature } from '@/features/accounting';

export const metadata: Metadata = {
  title: 'Transactions',
};

export default function TransactionsPage() {
  return <TransactionsFeature />;
}
