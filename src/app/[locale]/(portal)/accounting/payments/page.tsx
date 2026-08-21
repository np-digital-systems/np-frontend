import type { Metadata } from 'next';

import { PaymentVouchersFeature } from '@/features/accounting';

export const metadata: Metadata = {
  title: 'Payment Vouchers',
};

export default function PaymentVouchersPage() {
  return <PaymentVouchersFeature />;
}
