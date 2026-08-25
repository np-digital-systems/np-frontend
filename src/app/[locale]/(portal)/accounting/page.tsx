import type { Metadata } from 'next';

import { AccountOverviewFeature } from '@/features/accounting';

export const metadata: Metadata = {
  title: 'Account Overview',
};

export default function AccountingOverviewPage() {
  return <AccountOverviewFeature />;
}
