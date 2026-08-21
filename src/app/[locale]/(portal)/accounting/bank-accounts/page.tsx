import type { Metadata } from 'next';

import { BankAccountsFeature } from '@/features/accounting';

export const metadata: Metadata = {
  title: 'Bank Accounts',
};

export default function BankAccountsPage() {
  return <BankAccountsFeature />;
}
