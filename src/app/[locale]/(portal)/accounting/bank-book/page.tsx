import type { Metadata } from 'next';

import { BankBookFeature } from '@/features/accounting';

export const metadata: Metadata = {
  title: 'Bank Book',
};

export default function BankBookPage() {
  return <BankBookFeature />;
}
