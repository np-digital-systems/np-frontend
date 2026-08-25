import type { Metadata } from 'next';

import { ReceiptVouchersFeature } from '@/features/accounting';

export const metadata: Metadata = {
  title: 'Receipt Vouchers',
};

export default function ReceiptVouchersPage() {
  return <ReceiptVouchersFeature />;
}
