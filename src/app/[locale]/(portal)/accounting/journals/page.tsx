import type { Metadata } from 'next';

import { JournalVouchersFeature } from '@/features/accounting';

export const metadata: Metadata = {
  title: 'Journal Vouchers',
};

export default function JournalVouchersPage() {
  return <JournalVouchersFeature />;
}
