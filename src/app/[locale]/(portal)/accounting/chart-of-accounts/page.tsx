import type { Metadata } from 'next';

import { ChartOfAccountsFeature } from '@/features/accounting';

export const metadata: Metadata = {
  title: 'Chart of Accounts',
};

export default function ChartOfAccountsPage() {
  return <ChartOfAccountsFeature />;
}
